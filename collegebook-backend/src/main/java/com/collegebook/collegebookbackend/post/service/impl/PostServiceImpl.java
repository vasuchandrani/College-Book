package com.collegebook.collegebookbackend.post.service.impl;

import com.collegebook.collegebookbackend.auth.entity.User;
import com.collegebook.collegebookbackend.auth.repository.UserRepository;
import com.collegebook.collegebookbackend.common.AppException;
import com.collegebook.collegebookbackend.common.ErrorCode;
import com.collegebook.collegebookbackend.common.PageResponse;
import com.collegebook.collegebookbackend.post.dto.CommentResponseDto;
import com.collegebook.collegebookbackend.post.dto.CreateCommentRequest;
import com.collegebook.collegebookbackend.post.dto.CreatePostRequest;
import com.collegebook.collegebookbackend.post.dto.PostResponseDto;
import com.collegebook.collegebookbackend.post.entity.Comment;
import com.collegebook.collegebookbackend.post.entity.MediaType;
import com.collegebook.collegebookbackend.post.entity.Post;
import com.collegebook.collegebookbackend.post.entity.PostLike;
import com.collegebook.collegebookbackend.post.entity.PostMedia;
import com.collegebook.collegebookbackend.post.entity.PostSave;
import com.collegebook.collegebookbackend.post.entity.StorageProvider;
import com.collegebook.collegebookbackend.post.entity.Tag;
import com.collegebook.collegebookbackend.post.repository.CommentRepository;
import com.collegebook.collegebookbackend.post.repository.PostLikeRepository;
import com.collegebook.collegebookbackend.post.repository.PostMediaRepository;
import com.collegebook.collegebookbackend.post.repository.PostRepository;
import com.collegebook.collegebookbackend.post.repository.PostSaveRepository;
import com.collegebook.collegebookbackend.post.repository.TagRepository;
import com.collegebook.collegebookbackend.post.service.PostService;
import com.collegebook.collegebookbackend.profile.entity.Profile;
import com.collegebook.collegebookbackend.profile.repository.ProfileRepository;
import com.collegebook.collegebookbackend.storage.dto.MediaDto;
import com.collegebook.collegebookbackend.storage.dto.MediaKeyDto;
import com.collegebook.collegebookbackend.storage.service.MediaService;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PostServiceImpl implements PostService {

    private final PostRepository postRepository;
    private final PostLikeRepository postLikeRepository;
    private final PostSaveRepository postSaveRepository;
    private final CommentRepository commentRepository;
    private final TagRepository tagRepository;
    private final UserRepository userRepository;
    private final ProfileRepository profileRepository;
    private final PostMediaRepository postMediaRepository;
    private final MediaService mediaService;
    private final com.collegebook.collegebookbackend.social.SocialInteractionService socialInteractionService;

    @Lazy
    @Autowired
    private PostService self;

    @Override
    public PageResponse<PostResponseDto> getFeed(UUID userId, UUID collegeId, String tag, int page, int size) {
        PageResponse<PostResponseDto> publicPage = (self != null ? self : this).getPublicFeed(collegeId, tag, page, size);
        return overlayUserPersonalization(publicPage, userId);
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(
            value = "feed",
            key = "(#collegeId != null ? #collegeId.toString() : 'global') + ':' + (#tag != null && !#tag.isBlank() ? #tag.toLowerCase().trim() : 'all') + ':' + #page + ':' + #size"
    )
    public PageResponse<PostResponseDto> getPublicFeed(UUID collegeId, String tag, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Post> postsPage;

        if (collegeId != null) {
            if (tag != null && !tag.isBlank()) {
                postsPage = postRepository.findByCollegeIdAndTagName(collegeId, tag, pageable);
            } else {
                postsPage = postRepository.findByCollegeId(collegeId, pageable);
            }
        } else {
            if (tag != null && !tag.isBlank()) {
                postsPage = postRepository.findByIsGlobalTrueAndTagName(tag, pageable);
            } else {
                postsPage = postRepository.findByIsGlobalTrue(pageable);
            }
        }

        List<PostResponseDto> content = postsPage.getContent().stream()
                .map(this::mapToPublicDto)
                .collect(Collectors.toList());

        return PageResponse.of(content, postsPage.getNumber(), postsPage.getSize(), postsPage.getTotalElements());
    }

    @Override
    public PageResponse<PostResponseDto> getExplore(UUID userId, String tag, int page, int size) {
        PageResponse<PostResponseDto> publicPage = (self != null ? self : this).getPublicExplore(tag, page, size);
        return overlayUserPersonalization(publicPage, userId);
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(
            value = "explore",
            key = "(#tag != null && !#tag.isBlank() ? #tag.toLowerCase().trim() : 'all') + ':' + #page + ':' + #size"
    )
    public PageResponse<PostResponseDto> getPublicExplore(String tag, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Post> postsPage;

        if (tag != null && !tag.isBlank()) {
            postsPage = postRepository.findByIsGlobalTrueAndTagName(tag, pageable);
        } else {
            postsPage = postRepository.findByIsGlobalTrue(pageable);
        }

        List<PostResponseDto> content = postsPage.getContent().stream()
                .map(this::mapToPublicDto)
                .collect(Collectors.toList());

        return PageResponse.of(content, postsPage.getNumber(), postsPage.getSize(), postsPage.getTotalElements());
    }

    private PageResponse<PostResponseDto> overlayUserPersonalization(PageResponse<PostResponseDto> publicPage, UUID userId) {
        if (publicPage == null || publicPage.getItems() == null) {
            return publicPage;
        }

        List<PostResponseDto> personalized = publicPage.getItems().stream()
                .map(dto -> {
                    int effectiveLikes = (int) socialInteractionService.getPostLikesCount(dto.getId(), dto.getLikes());
                    boolean liked = userId != null && socialInteractionService.isPostLikedByUser(dto.getId(), userId);
                    boolean saved = userId != null && socialInteractionService.isPostSavedByUser(dto.getId(), userId);
                    return dto.toBuilder()
                            .likes(effectiveLikes)
                            .liked(liked)
                            .saved(saved)
                            .build();
                })
                .collect(Collectors.toList());

        return PageResponse.of(personalized, publicPage.getPage(), publicPage.getSize(), publicPage.getTotalItems());
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<PostResponseDto> getSavedPosts(UUID userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Post> postsPage = postRepository.findSavedPostsByUserId(userId, pageable);
        return mapPostPage(postsPage, userId);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<PostResponseDto> getMyPosts(UUID userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Post> postsPage = postRepository.findByAuthorId(userId, pageable);
        return mapPostPage(postsPage, userId);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<PostResponseDto> getStudentPosts(UUID currentUserId, String slug, int page, int size) {
        if (slug == null || slug.isBlank()) {
            return PageResponse.of(Collections.emptyList(), page, size, 0);
        }
        String clean = slug.trim();
        Optional<com.collegebook.collegebookbackend.profile.entity.Profile> profileOpt = profileRepository.findByHandleIgnoreCase(clean);
        if (profileOpt.isEmpty()) {
            profileOpt = profileRepository.findFirstByFullNameIgnoreCase(clean);
        }
        if (profileOpt.isEmpty()) {
            try {
                UUID userId = UUID.fromString(clean);
                profileOpt = profileRepository.findByUserId(userId);
            } catch (IllegalArgumentException ignored) {
            }
        }

        if (profileOpt.isEmpty()) {
            return PageResponse.of(Collections.emptyList(), page, size, 0);
        }

        UUID studentUserId = profileOpt.get().getUserId();
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Post> postsPage = postRepository.findByAuthorId(studentUserId, pageable);
        return mapPostPage(postsPage, currentUserId);
    }

    @Override
    @Transactional(readOnly = true)
    public PostResponseDto getPostById(UUID userId, UUID postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "Post not found"));
        return mapToDto(post, userId);
    }

    @Override
    @Transactional
    @CacheEvict(value = {"feed", "explore"}, allEntries = true)
    public PostResponseDto createPost(UUID userId, CreatePostRequest request) {
        User author = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND, "User not found"));

        boolean hasContent = request.getContent() != null && !request.getContent().trim().isBlank();
        boolean hasImages = request.getImages() != null && !request.getImages().isEmpty();
        boolean hasMediaKeys = request.getMediaKeys() != null && !request.getMediaKeys().isEmpty();

        if (!hasContent && !hasImages && !hasMediaKeys) {
            throw new AppException(ErrorCode.VALIDATION_ERROR, "Post must have either text content or an attached media file");
        }

        Post post = new Post();
        post.setAuthor(author);
        post.setCollege(author.getCollege());
        post.setContent(hasContent ? request.getContent().trim() : "");
        post.setGlobal(request.getIsGlobal() != null ? request.getIsGlobal() : true);
        post.setCommentsEnabled(request.getCommentsEnabled() == null || request.getCommentsEnabled());
        post.setImages(request.getImages() != null ? request.getImages() : Collections.emptyList());

        if (request.getTags() != null && !request.getTags().isEmpty()) {
            List<Tag> tagEntities = new ArrayList<>();
            for (String tagName : request.getTags()) {
                Tag tag = tagRepository.findByNameIgnoreCase(tagName)
                        .orElseGet(() -> {
                            Tag newTag = new Tag();
                            newTag.setName(tagName);
                            newTag.setUsageCount(1);
                            return tagRepository.save(newTag);
                        });
                tagEntities.add(tag);
            }
            post.setTags(tagEntities);
        }

        Post savedPost = postRepository.save(post);

        // Process media keys (S3 / R2 images or Cloudflare Stream videos)
        if (request.getMediaKeys() != null && !request.getMediaKeys().isEmpty()) {
            List<PostMedia> postMediaList = new ArrayList<>();
            for (short i = 0; i < request.getMediaKeys().size(); i++) {
                MediaKeyDto mediaKey = request.getMediaKeys().get(i);
                boolean isVideo = "VIDEO".equalsIgnoreCase(mediaKey.getMediaType());
                MediaType mediaType = isVideo ? MediaType.VIDEO : MediaType.IMAGE;
                String storageProvider = mediaKey.getStorageProvider();
                if (storageProvider == null || storageProvider.isBlank()) {
                    storageProvider = isVideo
                            ? StorageProvider.CLOUDFLARE_STREAM.name()
                            : StorageProvider.S3.name();
                }

                String objectKey = mediaKey.getObjectKey() != null ? mediaKey.getObjectKey() : (mediaKey.getVideoId() != null ? mediaKey.getVideoId() : "");
                String url = mediaKey.getUrl();
                if (url == null || url.isBlank()) {
                    url = mediaService.resolveAccessUrl(objectKey, storageProvider);
                }

                PostMedia postMedia = PostMedia.builder()
                        .post(savedPost)
                        .type(mediaType)
                        .objectKey(objectKey)
                        .url(url != null ? url : "")
                        .position(i)
                        .storageProvider(storageProvider)
                        .videoId(mediaKey.getVideoId())
                        .build();

                postMediaList.add(postMedia);

                // Also persist to central media metadata table
                mediaService.createMediaRecord(
                        author,
                        "POST",
                        savedPost.getId(),
                        objectKey,
                        storageProvider,
                        mediaType.name(),
                        isVideo ? "video/mp4" : "image/jpeg",
                        null,
                        null,
                        url,
                        mediaKey.getVideoId(),
                        i
                );
            }
            postMediaRepository.saveAll(postMediaList);
            savedPost.setMedia(postMediaList);
        }

        return mapToDto(savedPost, userId);
    }

    @Override
    @Transactional
    @CacheEvict(value = {"feed", "explore"}, allEntries = true)
    public void deletePost(UUID userId, UUID postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "Post not found"));

        if (!post.getAuthor().getId().equals(userId)) {
            throw new AppException(ErrorCode.FORBIDDEN, "You are not authorized to delete this post");
        }

        mediaService.deleteAllMediaForEntity("POST", postId);
        postRepository.delete(post);
        socialInteractionService.evictPost(postId);
    }

    @Override
    public Map<String, Object> toggleLike(UUID userId, UUID postId) {
        return socialInteractionService.togglePostLike(userId, postId);
    }

    @Override
    public Map<String, Object> toggleSave(UUID userId, UUID postId) {
        return socialInteractionService.togglePostSave(userId, postId);
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "post_comments", key = "#postId.toString() + ':' + #page + ':' + #size")
    public PageResponse<CommentResponseDto> getComments(UUID postId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Comment> commentsPage = commentRepository.findByPostIdAndDeletedAtIsNullOrderByCreatedAtAsc(postId, pageable);

        List<CommentResponseDto> content = commentsPage.getContent().stream()
                .map(this::mapCommentToDto)
                .collect(Collectors.toList());

        return PageResponse.of(content, commentsPage.getNumber(), commentsPage.getSize(), commentsPage.getTotalElements());
    }

    @Override
    @Transactional
    @CacheEvict(value = {"post_comments", "feed", "explore"}, allEntries = true)
    public CommentResponseDto addComment(UUID userId, UUID postId, CreateCommentRequest request) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "Post not found"));

        if (!post.isCommentsEnabled()) {
            throw new AppException(ErrorCode.COMMENTS_DISABLED, "Comments are disabled for this post");
        }

        User author = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND, "User not found"));

        Comment comment = new Comment();
        comment.setPost(post);
        comment.setAuthor(author);
        comment.setContent(request.getBody());

        Comment saved = commentRepository.save(comment);

        post.setCommentsCount(post.getCommentsCount() + 1);
        postRepository.save(post);

        return mapCommentToDto(saved);
    }

    @Override
    @Transactional
    @CacheEvict(value = {"post_comments", "feed", "explore"}, allEntries = true)
    public void deleteComment(UUID userId, UUID postId, UUID commentId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "Post not found"));

        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "Comment not found"));

        if (comment.getDeletedAt() != null) {
            throw new AppException(ErrorCode.NOT_FOUND, "Comment not found or already deleted");
        }

        if (!comment.getAuthor().getId().equals(userId)) {
            throw new AppException(ErrorCode.FORBIDDEN, "Only the author can delete this comment");
        }

        comment.setDeletedAt(Instant.now());
        commentRepository.save(comment);

        post.setCommentsCount(Math.max(0, post.getCommentsCount() - 1));
        postRepository.save(post);
    }

    @Override
    @Transactional(readOnly = true)
    public List<String> getTrendingTags() {
        return tagRepository.findAll().stream()
                .map(Tag::getName)
                .limit(10)
                .collect(Collectors.toList());
    }

    private PageResponse<PostResponseDto> mapPostPage(Page<Post> postsPage, UUID userId) {
        List<PostResponseDto> content = postsPage.getContent().stream()
                .map(p -> mapToDto(p, userId))
                .collect(Collectors.toList());

        return PageResponse.of(content, postsPage.getNumber(), postsPage.getSize(), postsPage.getTotalElements());
    }

    private PostResponseDto mapToPublicDto(Post post) {
        return mapToDto(post, null);
    }

    private PostResponseDto mapToDto(Post post, UUID userId) {
        PostResponseDto dto = new PostResponseDto();
        dto.setId(post.getId());
        dto.setAuthorId(post.getAuthor().getId());

        Optional<Profile> profileOpt = profileRepository.findByUserId(post.getAuthor().getId());
        dto.setAuthorName(profileOpt.map(Profile::getFullName).orElse(post.getAuthor().getEmail()));
        dto.setAuthorHandle(profileOpt.map(Profile::getHandle).orElse(null));
        dto.setInitials(profileOpt.map(Profile::getInitials).orElse("U"));
        dto.setCourseName(profileOpt.map(p -> p.getCourse() != null ? p.getCourse().getName() : null).orElse("Student"));
        dto.setCollegeName(post.getCollege() != null ? post.getCollege().getName() : null);

        dto.setTime(formatRelativeTime(post.getCreatedAt()));
        dto.setContent(post.getContent());

        // Fetch media items
        List<PostMedia> mediaList = postMediaRepository.findByPostIdOrderByPositionAsc(post.getId());
        List<MediaDto> mediaDtos = new ArrayList<>();
        List<String> imageUrls = new ArrayList<>();

        for (PostMedia pm : mediaList) {
            String url = mediaService.resolveAccessUrl(pm.getObjectKey(), pm.getStorageProvider());
            if (url == null || url.isBlank()) {
                url = pm.getUrl();
            }

            mediaDtos.add(MediaDto.builder()
                    .id(pm.getId())
                    .mediaType(pm.getType() != null ? pm.getType().name() : "IMAGE")
                    .url(url)
                    .thumbnailUrl(pm.getThumbnailUrl())
                    .videoId(pm.getVideoId())
                    .width(pm.getWidth())
                    .height(pm.getHeight())
                    .durationSeconds(pm.getDurationSeconds())
                    .position(pm.getPosition())
                    .build());

            if (pm.getType() == MediaType.IMAGE && url != null && !url.isBlank()) {
                imageUrls.add(url);
            }
        }

        // If post_media had images, use them; otherwise fallback to post.getImages()
        if (!imageUrls.isEmpty()) {
            dto.setImages(imageUrls);
        } else {
            dto.setImages(post.getImages() != null ? post.getImages() : Collections.emptyList());
        }

        dto.setMedia(mediaDtos);
        int effectiveLikes = (int) socialInteractionService.getPostLikesCount(post.getId(), post.getLikesCount());
        dto.setLikes(effectiveLikes);
        dto.setCommentsCount(post.getCommentsCount());
        dto.setCommentsEnabled(post.isCommentsEnabled());

        if (userId != null) {
            dto.setLiked(socialInteractionService.isPostLikedByUser(post.getId(), userId));
            dto.setSaved(socialInteractionService.isPostSavedByUser(post.getId(), userId));
        }

        if (post.getTags() != null) {
            dto.setTags(post.getTags().stream().filter(t -> t != null && t.getName() != null).map(Tag::getName).collect(Collectors.toList()));
        } else {
            dto.setTags(Collections.emptyList());
        }
        dto.setCreatedAt(post.getCreatedAt());
        dto.setGlobal(post.isGlobal());
        return dto;
    }

    private CommentResponseDto mapCommentToDto(Comment comment) {
        CommentResponseDto dto = new CommentResponseDto();
        dto.setId(comment.getId());
        dto.setPostId(comment.getPost().getId());
        dto.setAuthorId(comment.getAuthor().getId());

        Optional<Profile> profileOpt = profileRepository.findByUserId(comment.getAuthor().getId());
        dto.setAuthorName(profileOpt.map(Profile::getFullName).orElse(comment.getAuthor().getEmail()));
        dto.setAuthorHandle(profileOpt.map(Profile::getHandle).orElse(null));
        dto.setAvatarUrl(profileOpt.map(Profile::getAvatarUrl).orElse(null));
        dto.setInitials(profileOpt.map(Profile::getInitials).orElse("U"));
        dto.setCollegeName(comment.getAuthor().getCollege() != null ? comment.getAuthor().getCollege().getName() : null);
        dto.setCollegeShortName(comment.getAuthor().getCollege() != null ? comment.getAuthor().getCollege().getShortName() : null);
        dto.setBody(comment.getContent());
        dto.setTime(formatRelativeTime(comment.getCreatedAt()));
        dto.setCreatedAt(comment.getCreatedAt());
        return dto;
    }

    private String formatRelativeTime(Instant instant) {
        if (instant == null) return "Just now";
        Duration duration = Duration.between(instant, Instant.now());
        long seconds = duration.getSeconds();
        if (seconds < 60) return "Just now";
        long minutes = seconds / 60;
        if (minutes < 60) return minutes + "m ago";
        long hours = minutes / 60;
        if (hours < 24) return hours + "h ago";
        if (hours <= 36) return "1d ago";
        java.time.format.DateTimeFormatter formatter = java.time.format.DateTimeFormatter.ofPattern("d MMM ''yy", java.util.Locale.ENGLISH)
                .withZone(java.time.ZoneId.of("UTC"));
        return formatter.format(instant);
    }
}
