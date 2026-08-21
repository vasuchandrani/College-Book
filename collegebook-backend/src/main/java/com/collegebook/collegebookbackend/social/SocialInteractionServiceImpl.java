package com.collegebook.collegebookbackend.social;

import com.collegebook.collegebookbackend.auth.entity.User;
import com.collegebook.collegebookbackend.auth.repository.UserRepository;
import com.collegebook.collegebookbackend.collab.entity.Team;
import com.collegebook.collegebookbackend.collab.entity.TeamStar;
import com.collegebook.collegebookbackend.collab.repository.TeamRepository;
import com.collegebook.collegebookbackend.collab.repository.TeamStarRepository;
import com.collegebook.collegebookbackend.common.AppException;
import com.collegebook.collegebookbackend.common.ErrorCode;
import com.collegebook.collegebookbackend.post.entity.Post;
import com.collegebook.collegebookbackend.post.entity.PostLike;
import com.collegebook.collegebookbackend.post.entity.PostSave;
import com.collegebook.collegebookbackend.post.repository.PostLikeRepository;
import com.collegebook.collegebookbackend.post.repository.PostRepository;
import com.collegebook.collegebookbackend.post.repository.PostSaveRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class SocialInteractionServiceImpl implements SocialInteractionService {

    private final PostRepository postRepository;
    private final PostLikeRepository postLikeRepository;
    private final PostSaveRepository postSaveRepository;
    private final TeamRepository teamRepository;
    private final TeamStarRepository teamStarRepository;
    private final UserRepository userRepository;

    @Autowired(required = false)
    private StringRedisTemplate redisTemplate;

    @Value("${app.social.interaction-ttl-hours:168}")
    private long interactionTtlHours;

    private static final String KEY_PREFIX_POST_LIKES = "post:%s:likes";
    private static final String KEY_PREFIX_POST_LIKES_COUNT = "post:%s:likes_count";
    private static final String KEY_PREFIX_POST_SAVES = "post:%s:saves";
    private static final String KEY_PREFIX_POST_SAVES_COUNT = "post:%s:saves_count";
    private static final String KEY_PREFIX_TEAM_STARS = "team:%s:stars";
    private static final String KEY_PREFIX_TEAM_STARS_COUNT = "team:%s:stars_count";

    private static final String DIRTY_SET_POST_LIKES = "dirty:post_likes";
    private static final String DIRTY_SET_POST_SAVES = "dirty:post_saves";
    private static final String DIRTY_SET_TEAM_STARS = "dirty:team_stars";

    private void touchTtl(String... keys) {
        if (redisTemplate == null || keys == null) return;
        Duration ttl = Duration.ofHours(interactionTtlHours > 0 ? interactionTtlHours : 168);
        for (String key : keys) {
            if (key != null) {
                try {
                    redisTemplate.expire(key, ttl);
                } catch (Exception ignored) {}
            }
        }
    }

    // -------------------------------------------------------------------------
    // Toggle Post Like
    // -------------------------------------------------------------------------
    @Override
    public Map<String, Object> togglePostLike(UUID userId, UUID postId) {
        if (userId == null || postId == null) {
            throw new AppException(ErrorCode.BAD_REQUEST, "User ID and Post ID cannot be null");
        }

        if (redisTemplate != null) {
            try {
                String likesKey = String.format(KEY_PREFIX_POST_LIKES, postId);
                String countKey = String.format(KEY_PREFIX_POST_LIKES_COUNT, postId);

                ensurePostLikesInitialized(postId);

                Boolean isMember = redisTemplate.opsForSet().isMember(likesKey, userId.toString());
                boolean liked;
                long newCount;

                if (Boolean.TRUE.equals(isMember)) {
                    redisTemplate.opsForSet().remove(likesKey, userId.toString());
                    Long decr = redisTemplate.opsForValue().decrement(countKey);
                    newCount = Math.max(0, decr != null ? decr : 0);
                    if (newCount == 0 && decr != null && decr < 0) {
                        redisTemplate.opsForValue().set(countKey, "0");
                    }
                    liked = false;
                } else {
                    redisTemplate.opsForSet().add(likesKey, userId.toString());
                    Long incr = redisTemplate.opsForValue().increment(countKey);
                    newCount = incr != null ? incr : 1;
                    liked = true;
                }

                redisTemplate.opsForSet().add(DIRTY_SET_POST_LIKES, postId.toString());
                touchTtl(likesKey, countKey);
                return Map.of("id", postId, "liked", liked, "likesCount", (int) newCount);
            } catch (Exception e) {
                log.warn("Redis togglePostLike error, falling back to DB: {}", e.getMessage());
            }
        }

        return fallbackTogglePostLikeInDb(userId, postId);
    }

    // -------------------------------------------------------------------------
    // Toggle Post Save
    // -------------------------------------------------------------------------
    @Override
    public Map<String, Object> togglePostSave(UUID userId, UUID postId) {
        if (userId == null || postId == null) {
            throw new AppException(ErrorCode.BAD_REQUEST, "User ID and Post ID cannot be null");
        }

        if (redisTemplate != null) {
            try {
                String savesKey = String.format(KEY_PREFIX_POST_SAVES, postId);
                String countKey = String.format(KEY_PREFIX_POST_SAVES_COUNT, postId);

                ensurePostSavesInitialized(postId);

                Boolean isMember = redisTemplate.opsForSet().isMember(savesKey, userId.toString());
                boolean saved;
                long newCount;

                if (Boolean.TRUE.equals(isMember)) {
                    redisTemplate.opsForSet().remove(savesKey, userId.toString());
                    Long decr = redisTemplate.opsForValue().decrement(countKey);
                    newCount = Math.max(0, decr != null ? decr : 0);
                    if (newCount == 0 && decr != null && decr < 0) {
                        redisTemplate.opsForValue().set(countKey, "0");
                    }
                    saved = false;
                } else {
                    redisTemplate.opsForSet().add(savesKey, userId.toString());
                    Long incr = redisTemplate.opsForValue().increment(countKey);
                    newCount = incr != null ? incr : 1;
                    saved = true;
                }

                redisTemplate.opsForSet().add(DIRTY_SET_POST_SAVES, postId.toString());
                touchTtl(savesKey, countKey);
                return Map.of("id", postId, "saved", saved, "savesCount", (int) newCount);
            } catch (Exception e) {
                log.warn("Redis togglePostSave error, falling back to DB: {}", e.getMessage());
            }
        }

        return fallbackTogglePostSaveInDb(userId, postId);
    }

    // -------------------------------------------------------------------------
    // Toggle Team Star
    // -------------------------------------------------------------------------
    @Override
    public Map<String, Object> toggleTeamStar(UUID userId, UUID teamId) {
        if (userId == null || teamId == null) {
            throw new AppException(ErrorCode.BAD_REQUEST, "User ID and Team ID cannot be null");
        }

        if (redisTemplate != null) {
            try {
                String starsKey = String.format(KEY_PREFIX_TEAM_STARS, teamId);
                String countKey = String.format(KEY_PREFIX_TEAM_STARS_COUNT, teamId);

                ensureTeamStarsInitialized(teamId);

                Boolean isMember = redisTemplate.opsForSet().isMember(starsKey, userId.toString());
                boolean starred;
                long newCount;

                if (Boolean.TRUE.equals(isMember)) {
                    redisTemplate.opsForSet().remove(starsKey, userId.toString());
                    Long decr = redisTemplate.opsForValue().decrement(countKey);
                    newCount = Math.max(0, decr != null ? decr : 0);
                    if (newCount == 0 && decr != null && decr < 0) {
                        redisTemplate.opsForValue().set(countKey, "0");
                    }
                    starred = false;
                } else {
                    redisTemplate.opsForSet().add(starsKey, userId.toString());
                    Long incr = redisTemplate.opsForValue().increment(countKey);
                    newCount = incr != null ? incr : 1;
                    starred = true;
                }

                redisTemplate.opsForSet().add(DIRTY_SET_TEAM_STARS, teamId.toString());
                touchTtl(starsKey, countKey);
                return Map.of("id", teamId, "starred", starred, "starsCount", (int) newCount);
            } catch (Exception e) {
                log.warn("Redis toggleTeamStar error, falling back to DB: {}", e.getMessage());
            }
        }

        return fallbackToggleTeamStarInDb(userId, teamId);
    }

    // -------------------------------------------------------------------------
    // Read Status Queries
    // -------------------------------------------------------------------------
    @Override
    public boolean isPostLikedByUser(UUID postId, UUID userId) {
        if (postId == null || userId == null) return false;
        if (redisTemplate != null) {
            try {
                String likesKey = String.format(KEY_PREFIX_POST_LIKES, postId);
                if (Boolean.TRUE.equals(redisTemplate.hasKey(likesKey))) {
                    return Boolean.TRUE.equals(redisTemplate.opsForSet().isMember(likesKey, userId.toString()));
                }
            } catch (Exception e) {
                // Ignore and fallback
            }
        }
        return postLikeRepository.existsByIdPostIdAndIdUserId(postId, userId);
    }

    @Override
    public boolean isPostSavedByUser(UUID postId, UUID userId) {
        if (postId == null || userId == null) return false;
        if (redisTemplate != null) {
            try {
                String savesKey = String.format(KEY_PREFIX_POST_SAVES, postId);
                if (Boolean.TRUE.equals(redisTemplate.hasKey(savesKey))) {
                    return Boolean.TRUE.equals(redisTemplate.opsForSet().isMember(savesKey, userId.toString()));
                }
            } catch (Exception e) {
                // Ignore and fallback
            }
        }
        return postSaveRepository.existsByIdPostIdAndIdUserId(postId, userId);
    }

    @Override
    public boolean isTeamStarredByUser(UUID teamId, UUID userId) {
        if (teamId == null || userId == null) return false;
        if (redisTemplate != null) {
            try {
                String starsKey = String.format(KEY_PREFIX_TEAM_STARS, teamId);
                if (Boolean.TRUE.equals(redisTemplate.hasKey(starsKey))) {
                    return Boolean.TRUE.equals(redisTemplate.opsForSet().isMember(starsKey, userId.toString()));
                }
            } catch (Exception e) {
                // Ignore and fallback
            }
        }
        return teamStarRepository.existsByIdTeamIdAndIdUserId(teamId, userId);
    }

    @Override
    public long getPostLikesCount(UUID postId, long fallbackCount) {
        if (postId == null) return fallbackCount;
        if (redisTemplate != null) {
            try {
                String countKey = String.format(KEY_PREFIX_POST_LIKES_COUNT, postId);
                String val = redisTemplate.opsForValue().get(countKey);
                if (val != null) {
                    return Math.max(0, Long.parseLong(val));
                }
            } catch (Exception e) {
                // Ignore
            }
        }
        return fallbackCount;
    }

    @Override
    public long getPostSavesCount(UUID postId, long fallbackCount) {
        if (postId == null) return fallbackCount;
        if (redisTemplate != null) {
            try {
                String countKey = String.format(KEY_PREFIX_POST_SAVES_COUNT, postId);
                String val = redisTemplate.opsForValue().get(countKey);
                if (val != null) {
                    return Math.max(0, Long.parseLong(val));
                }
            } catch (Exception e) {
                // Ignore
            }
        }
        return fallbackCount;
    }

    @Override
    public long getTeamStarsCount(UUID teamId, long fallbackCount) {
        if (teamId == null) return fallbackCount;
        if (redisTemplate != null) {
            try {
                String countKey = String.format(KEY_PREFIX_TEAM_STARS_COUNT, teamId);
                String val = redisTemplate.opsForValue().get(countKey);
                if (val != null) {
                    return Math.max(0, Long.parseLong(val));
                }
            } catch (Exception e) {
                // Ignore
            }
        }
        return fallbackCount;
    }

    @Override
    public void evictPost(UUID postId) {
        if (postId == null || redisTemplate == null) return;
        try {
            String likesKey = String.format(KEY_PREFIX_POST_LIKES, postId);
            String likesCountKey = String.format(KEY_PREFIX_POST_LIKES_COUNT, postId);
            String savesKey = String.format(KEY_PREFIX_POST_SAVES, postId);
            String savesCountKey = String.format(KEY_PREFIX_POST_SAVES_COUNT, postId);

            redisTemplate.delete(List.of(likesKey, likesCountKey, savesKey, savesCountKey));
            redisTemplate.opsForSet().remove(DIRTY_SET_POST_LIKES, postId.toString());
            redisTemplate.opsForSet().remove(DIRTY_SET_POST_SAVES, postId.toString());
        } catch (Exception e) {
            log.warn("Failed to evict post from Redis: {}", e.getMessage());
        }
    }

    @Override
    public void evictTeam(UUID teamId) {
        if (teamId == null || redisTemplate == null) return;
        try {
            String starsKey = String.format(KEY_PREFIX_TEAM_STARS, teamId);
            String starsCountKey = String.format(KEY_PREFIX_TEAM_STARS_COUNT, teamId);

            redisTemplate.delete(List.of(starsKey, starsCountKey));
            redisTemplate.opsForSet().remove(DIRTY_SET_TEAM_STARS, teamId.toString());
        } catch (Exception e) {
            log.warn("Failed to evict team from Redis: {}", e.getMessage());
        }
    }

    // -------------------------------------------------------------------------
    // Scheduled Batch Sync to PostgreSQL
    // -------------------------------------------------------------------------
    @Override
    @Transactional
    public void syncAllDirtyToDatabase() {
        if (redisTemplate == null) return;

        try {
            syncDirtyPostLikes();
            syncDirtyPostSaves();
            syncDirtyTeamStars();
        } catch (Exception e) {
            log.error("Error during scheduled batch sync to database: {}", e.getMessage(), e);
        }
    }

    private void syncDirtyPostLikes() {
        Set<String> dirtyPostIds = redisTemplate.opsForSet().members(DIRTY_SET_POST_LIKES);
        if (dirtyPostIds == null || dirtyPostIds.isEmpty()) return;

        for (String postIdStr : dirtyPostIds) {
            try {
                UUID postId = UUID.fromString(postIdStr);
                String likesKey = String.format(KEY_PREFIX_POST_LIKES, postId);
                String countKey = String.format(KEY_PREFIX_POST_LIKES_COUNT, postId);

                Set<String> redisUserIdsStr = redisTemplate.opsForSet().members(likesKey);
                Set<UUID> redisUserIds = redisUserIdsStr != null ?
                        redisUserIdsStr.stream().map(UUID::fromString).collect(Collectors.toSet()) :
                        Collections.emptySet();

                Post post = postRepository.findById(postId).orElse(null);
                if (post != null) {
                    List<UUID> dbUserIdsList = postLikeRepository.findUserIdsByPostId(postId);
                    Set<UUID> dbUserIds = new HashSet<>(dbUserIdsList);

                    // Add missing in DB
                    for (UUID uId : redisUserIds) {
                        if (!dbUserIds.contains(uId)) {
                            userRepository.findById(uId).ifPresent(user -> {
                                postLikeRepository.save(new PostLike(post, user));
                            });
                        }
                    }

                    // Remove unliked in DB
                    for (UUID uId : dbUserIds) {
                        if (!redisUserIds.contains(uId)) {
                            postLikeRepository.deleteByIdPostIdAndIdUserId(postId, uId);
                        }
                    }

                    String countVal = redisTemplate.opsForValue().get(countKey);
                    int finalCount = countVal != null ? (int) Math.max(0, Long.parseLong(countVal)) : redisUserIds.size();
                    post.setLikesCount(finalCount);
                    postRepository.save(post);
                }

                redisTemplate.opsForSet().remove(DIRTY_SET_POST_LIKES, postIdStr);
            } catch (Exception e) {
                log.warn("Failed to sync dirty post like for id {}: {}", postIdStr, e.getMessage());
            }
        }
    }

    private void syncDirtyPostSaves() {
        Set<String> dirtyPostIds = redisTemplate.opsForSet().members(DIRTY_SET_POST_SAVES);
        if (dirtyPostIds == null || dirtyPostIds.isEmpty()) return;

        for (String postIdStr : dirtyPostIds) {
            try {
                UUID postId = UUID.fromString(postIdStr);
                String savesKey = String.format(KEY_PREFIX_POST_SAVES, postId);
                String countKey = String.format(KEY_PREFIX_POST_SAVES_COUNT, postId);

                Set<String> redisUserIdsStr = redisTemplate.opsForSet().members(savesKey);
                Set<UUID> redisUserIds = redisUserIdsStr != null ?
                        redisUserIdsStr.stream().map(UUID::fromString).collect(Collectors.toSet()) :
                        Collections.emptySet();

                Post post = postRepository.findById(postId).orElse(null);
                if (post != null) {
                    List<UUID> dbUserIdsList = postSaveRepository.findUserIdsByPostId(postId);
                    Set<UUID> dbUserIds = new HashSet<>(dbUserIdsList);

                    // Add missing in DB
                    for (UUID uId : redisUserIds) {
                        if (!dbUserIds.contains(uId)) {
                            userRepository.findById(uId).ifPresent(user -> {
                                postSaveRepository.save(new PostSave(post, user));
                            });
                        }
                    }

                    // Remove unsaved in DB
                    for (UUID uId : dbUserIds) {
                        if (!redisUserIds.contains(uId)) {
                            postSaveRepository.deleteByIdPostIdAndIdUserId(postId, uId);
                        }
                    }

                    String countVal = redisTemplate.opsForValue().get(countKey);
                    int finalCount = countVal != null ? (int) Math.max(0, Long.parseLong(countVal)) : redisUserIds.size();
                    post.setSavesCount(finalCount);
                    postRepository.save(post);
                }

                redisTemplate.opsForSet().remove(DIRTY_SET_POST_SAVES, postIdStr);
            } catch (Exception e) {
                log.warn("Failed to sync dirty post save for id {}: {}", postIdStr, e.getMessage());
            }
        }
    }

    private void syncDirtyTeamStars() {
        Set<String> dirtyTeamIds = redisTemplate.opsForSet().members(DIRTY_SET_TEAM_STARS);
        if (dirtyTeamIds == null || dirtyTeamIds.isEmpty()) return;

        for (String teamIdStr : dirtyTeamIds) {
            try {
                UUID teamId = UUID.fromString(teamIdStr);
                String starsKey = String.format(KEY_PREFIX_TEAM_STARS, teamId);
                String countKey = String.format(KEY_PREFIX_TEAM_STARS_COUNT, teamId);

                Set<String> redisUserIdsStr = redisTemplate.opsForSet().members(starsKey);
                Set<UUID> redisUserIds = redisUserIdsStr != null ?
                        redisUserIdsStr.stream().map(UUID::fromString).collect(Collectors.toSet()) :
                        Collections.emptySet();

                Team team = teamRepository.findById(teamId).orElse(null);
                if (team != null) {
                    List<UUID> dbUserIdsList = teamStarRepository.findUserIdsByTeamId(teamId);
                    Set<UUID> dbUserIds = new HashSet<>(dbUserIdsList);

                    // Add missing in DB
                    for (UUID uId : redisUserIds) {
                        if (!dbUserIds.contains(uId)) {
                            userRepository.findById(uId).ifPresent(user -> {
                                teamStarRepository.save(new TeamStar(team, user));
                            });
                        }
                    }

                    // Remove unstarred in DB
                    for (UUID uId : dbUserIds) {
                        if (!redisUserIds.contains(uId)) {
                            teamStarRepository.deleteByIdTeamIdAndIdUserId(teamId, uId);
                        }
                    }

                    String countVal = redisTemplate.opsForValue().get(countKey);
                    int finalCount = countVal != null ? (int) Math.max(0, Long.parseLong(countVal)) : redisUserIds.size();
                    team.setStarsCount(finalCount);
                    teamRepository.save(team);
                }

                redisTemplate.opsForSet().remove(DIRTY_SET_TEAM_STARS, teamIdStr);
            } catch (Exception e) {
                log.warn("Failed to sync dirty team star for id {}: {}", teamIdStr, e.getMessage());
            }
        }
    }

    // -------------------------------------------------------------------------
    // Lazy Initialization Helpers
    // -------------------------------------------------------------------------
    private void ensurePostLikesInitialized(UUID postId) {
        String likesKey = String.format(KEY_PREFIX_POST_LIKES, postId);
        if (Boolean.FALSE.equals(redisTemplate.hasKey(likesKey))) {
            List<UUID> userIds = postLikeRepository.findUserIdsByPostId(postId);
            if (!userIds.isEmpty()) {
                String[] strIds = userIds.stream().map(UUID::toString).toArray(String[]::new);
                redisTemplate.opsForSet().add(likesKey, strIds);
            } else {
                // Marker to distinguish between empty set and non-initialized
                redisTemplate.opsForSet().add(likesKey, "__EMPTY__");
                redisTemplate.opsForSet().remove(likesKey, "__EMPTY__");
            }
            int baseCount = postRepository.findById(postId).map(Post::getLikesCount).orElse(userIds.size());
            String countKey = String.format(KEY_PREFIX_POST_LIKES_COUNT, postId);
            redisTemplate.opsForValue().set(countKey, String.valueOf(baseCount));
            touchTtl(likesKey, countKey);
        }
    }

    private void ensurePostSavesInitialized(UUID postId) {
        String savesKey = String.format(KEY_PREFIX_POST_SAVES, postId);
        if (Boolean.FALSE.equals(redisTemplate.hasKey(savesKey))) {
            List<UUID> userIds = postSaveRepository.findUserIdsByPostId(postId);
            if (!userIds.isEmpty()) {
                String[] strIds = userIds.stream().map(UUID::toString).toArray(String[]::new);
                redisTemplate.opsForSet().add(savesKey, strIds);
            } else {
                redisTemplate.opsForSet().add(savesKey, "__EMPTY__");
                redisTemplate.opsForSet().remove(savesKey, "__EMPTY__");
            }
            int baseCount = postRepository.findById(postId).map(Post::getSavesCount).orElse(userIds.size());
            String countKey = String.format(KEY_PREFIX_POST_SAVES_COUNT, postId);
            redisTemplate.opsForValue().set(countKey, String.valueOf(baseCount));
            touchTtl(savesKey, countKey);
        }
    }

    private void ensureTeamStarsInitialized(UUID teamId) {
        String starsKey = String.format(KEY_PREFIX_TEAM_STARS, teamId);
        if (Boolean.FALSE.equals(redisTemplate.hasKey(starsKey))) {
            List<UUID> userIds = teamStarRepository.findUserIdsByTeamId(teamId);
            if (!userIds.isEmpty()) {
                String[] strIds = userIds.stream().map(UUID::toString).toArray(String[]::new);
                redisTemplate.opsForSet().add(starsKey, strIds);
            } else {
                redisTemplate.opsForSet().add(starsKey, "__EMPTY__");
                redisTemplate.opsForSet().remove(starsKey, "__EMPTY__");
            }
            int baseCount = teamRepository.findById(teamId).map(Team::getStarsCount).orElse(userIds.size());
            String countKey = String.format(KEY_PREFIX_TEAM_STARS_COUNT, teamId);
            redisTemplate.opsForValue().set(countKey, String.valueOf(baseCount));
            touchTtl(starsKey, countKey);
        }
    }

    // -------------------------------------------------------------------------
    // Fallback DB Methods
    // -------------------------------------------------------------------------
    @Transactional
    protected Map<String, Object> fallbackTogglePostLikeInDb(UUID userId, UUID postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "Post not found"));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND, "User not found"));

        boolean liked;
        if (postLikeRepository.existsByIdPostIdAndIdUserId(postId, userId)) {
            postLikeRepository.deleteByIdPostIdAndIdUserId(postId, userId);
            post.setLikesCount(Math.max(0, post.getLikesCount() - 1));
            liked = false;
        } else {
            postLikeRepository.save(new PostLike(post, user));
            post.setLikesCount(post.getLikesCount() + 1);
            liked = true;
        }
        postRepository.save(post);
        return Map.of("id", postId, "liked", liked, "likesCount", post.getLikesCount());
    }

    @Transactional
    protected Map<String, Object> fallbackTogglePostSaveInDb(UUID userId, UUID postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "Post not found"));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND, "User not found"));

        boolean saved;
        if (postSaveRepository.existsByIdPostIdAndIdUserId(postId, userId)) {
            postSaveRepository.deleteByIdPostIdAndIdUserId(postId, userId);
            post.setSavesCount(Math.max(0, post.getSavesCount() - 1));
            saved = false;
        } else {
            postSaveRepository.save(new PostSave(post, user));
            post.setSavesCount(post.getSavesCount() + 1);
            saved = true;
        }
        postRepository.save(post);
        return Map.of("id", postId, "saved", saved, "savesCount", post.getSavesCount());
    }

    @Transactional
    protected Map<String, Object> fallbackToggleTeamStarInDb(UUID userId, UUID teamId) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new AppException(ErrorCode.TEAM_NOT_FOUND, "Team not found"));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND, "User not found"));

        boolean starred;
        if (teamStarRepository.existsByIdTeamIdAndIdUserId(teamId, userId)) {
            teamStarRepository.deleteByIdTeamIdAndIdUserId(teamId, userId);
            team.setStarsCount(Math.max(0, team.getStarsCount() - 1));
            starred = false;
        } else {
            teamStarRepository.save(new TeamStar(team, user));
            team.setStarsCount(team.getStarsCount() + 1);
            starred = true;
        }
        teamRepository.save(team);
        return Map.of("id", teamId, "starred", starred, "starsCount", team.getStarsCount());
    }
}
