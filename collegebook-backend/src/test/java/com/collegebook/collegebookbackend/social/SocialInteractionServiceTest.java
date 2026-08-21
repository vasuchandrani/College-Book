package com.collegebook.collegebookbackend.social;

import com.collegebook.collegebookbackend.auth.entity.User;
import com.collegebook.collegebookbackend.auth.repository.UserRepository;
import com.collegebook.collegebookbackend.collab.entity.Team;
import com.collegebook.collegebookbackend.collab.entity.TeamStar;
import com.collegebook.collegebookbackend.collab.repository.TeamRepository;
import com.collegebook.collegebookbackend.collab.repository.TeamStarRepository;
import com.collegebook.collegebookbackend.post.entity.Post;
import com.collegebook.collegebookbackend.post.entity.PostLike;
import com.collegebook.collegebookbackend.post.entity.PostSave;
import com.collegebook.collegebookbackend.post.repository.PostLikeRepository;
import com.collegebook.collegebookbackend.post.repository.PostRepository;
import com.collegebook.collegebookbackend.post.repository.PostSaveRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.SetOperations;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class SocialInteractionServiceTest {

    @Mock
    private PostRepository postRepository;
    @Mock
    private PostLikeRepository postLikeRepository;
    @Mock
    private PostSaveRepository postSaveRepository;
    @Mock
    private TeamRepository teamRepository;
    @Mock
    private TeamStarRepository teamStarRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private StringRedisTemplate redisTemplate;
    @Mock
    private SetOperations<String, String> setOperations;
    @Mock
    private ValueOperations<String, String> valueOperations;

    private SocialInteractionServiceImpl socialService;

    @BeforeEach
    void setUp() {
        socialService = new SocialInteractionServiceImpl(
                postRepository,
                postLikeRepository,
                postSaveRepository,
                teamRepository,
                teamStarRepository,
                userRepository
        );
    }

    @Test
    void testTogglePostLikeInDbFallback() {
        UUID userId = UUID.randomUUID();
        UUID postId = UUID.randomUUID();

        Post post = new Post();
        post.setId(postId);
        post.setLikesCount(0);

        User user = new User();
        user.setId(userId);

        when(postRepository.findById(postId)).thenReturn(Optional.of(post));
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(postLikeRepository.existsByIdPostIdAndIdUserId(postId, userId)).thenReturn(false);

        Map<String, Object> result = socialService.togglePostLike(userId, postId);

        assertNotNull(result);
        assertTrue((Boolean) result.get("liked"));
        assertEquals(1, result.get("likesCount"));
        verify(postLikeRepository).save(any(PostLike.class));
        verify(postRepository).save(post);
    }

    @Test
    void testTogglePostLikeUnlikeInDbFallback() {
        UUID userId = UUID.randomUUID();
        UUID postId = UUID.randomUUID();

        Post post = new Post();
        post.setId(postId);
        post.setLikesCount(5);

        User user = new User();
        user.setId(userId);

        when(postRepository.findById(postId)).thenReturn(Optional.of(post));
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(postLikeRepository.existsByIdPostIdAndIdUserId(postId, userId)).thenReturn(true);

        Map<String, Object> result = socialService.togglePostLike(userId, postId);

        assertNotNull(result);
        assertFalse((Boolean) result.get("liked"));
        assertEquals(4, result.get("likesCount"));
        verify(postLikeRepository).deleteByIdPostIdAndIdUserId(postId, userId);
        verify(postRepository).save(post);
    }

    @Test
    void testTogglePostSaveInDbFallback() {
        UUID userId = UUID.randomUUID();
        UUID postId = UUID.randomUUID();

        Post post = new Post();
        post.setId(postId);
        post.setSavesCount(2);

        User user = new User();
        user.setId(userId);

        when(postRepository.findById(postId)).thenReturn(Optional.of(post));
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(postSaveRepository.existsByIdPostIdAndIdUserId(postId, userId)).thenReturn(false);

        Map<String, Object> result = socialService.togglePostSave(userId, postId);

        assertNotNull(result);
        assertTrue((Boolean) result.get("saved"));
        assertEquals(3, result.get("savesCount"));
        verify(postSaveRepository).save(any(PostSave.class));
        verify(postRepository).save(post);
    }

    @Test
    void testToggleTeamStarInDbFallback() {
        UUID userId = UUID.randomUUID();
        UUID teamId = UUID.randomUUID();

        Team team = new Team();
        team.setId(teamId);
        team.setStarsCount(0);

        User user = new User();
        user.setId(userId);

        when(teamRepository.findById(teamId)).thenReturn(Optional.of(team));
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(teamStarRepository.existsByIdTeamIdAndIdUserId(teamId, userId)).thenReturn(false);

        Map<String, Object> result = socialService.toggleTeamStar(userId, teamId);

        assertNotNull(result);
        assertTrue((Boolean) result.get("starred"));
        assertEquals(1, result.get("starsCount"));
        verify(teamStarRepository).save(any(TeamStar.class));
        verify(teamRepository).save(team);
    }

    @Test
    void testTogglePostLikeWithRedis() {
        ReflectionTestUtils.setField(socialService, "redisTemplate", redisTemplate);

        UUID userId = UUID.randomUUID();
        UUID postId = UUID.randomUUID();
        String likesKey = "post:" + postId + ":likes";
        String countKey = "post:" + postId + ":likes_count";

        when(redisTemplate.opsForSet()).thenReturn(setOperations);
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        when(redisTemplate.hasKey(likesKey)).thenReturn(true);
        when(setOperations.isMember(likesKey, userId.toString())).thenReturn(false);
        when(valueOperations.increment(countKey)).thenReturn(10L);

        Map<String, Object> result = socialService.togglePostLike(userId, postId);

        assertNotNull(result);
        assertTrue((Boolean) result.get("liked"));
        assertEquals(10, result.get("likesCount"));
        verify(setOperations).add(likesKey, userId.toString());
        verify(setOperations).add("dirty:post_likes", postId.toString());
    }

    @Test
    void testSyncAllDirtyToDatabase() {
        ReflectionTestUtils.setField(socialService, "redisTemplate", redisTemplate);

        UUID postId = UUID.randomUUID();
        UUID userId1 = UUID.randomUUID();
        UUID userId2 = UUID.randomUUID();

        when(redisTemplate.opsForSet()).thenReturn(setOperations);
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);

        when(setOperations.members("dirty:post_likes")).thenReturn(Set.of(postId.toString()));
        when(setOperations.members("dirty:post_saves")).thenReturn(Set.of());
        when(setOperations.members("dirty:team_stars")).thenReturn(Set.of());

        String likesKey = "post:" + postId + ":likes";
        String countKey = "post:" + postId + ":likes_count";

        when(setOperations.members(likesKey)).thenReturn(Set.of(userId1.toString(), userId2.toString()));
        when(valueOperations.get(countKey)).thenReturn("2");

        Post post = new Post();
        post.setId(postId);
        post.setLikesCount(0);

        User user1 = new User();
        user1.setId(userId1);
        User user2 = new User();
        user2.setId(userId2);

        when(postRepository.findById(postId)).thenReturn(Optional.of(post));
        when(postLikeRepository.findUserIdsByPostId(postId)).thenReturn(List.of()); // Empty in DB
        when(userRepository.findById(userId1)).thenReturn(Optional.of(user1));
        when(userRepository.findById(userId2)).thenReturn(Optional.of(user2));

        socialService.syncAllDirtyToDatabase();

        verify(postLikeRepository, org.mockito.Mockito.times(2)).save(any(PostLike.class));
        verify(postRepository).save(post);
        assertEquals(2, post.getLikesCount());
        verify(setOperations).remove("dirty:post_likes", postId.toString());
    }
}
