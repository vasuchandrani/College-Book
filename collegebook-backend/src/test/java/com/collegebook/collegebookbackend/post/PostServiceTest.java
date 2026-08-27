package com.collegebook.collegebookbackend.post;

import com.collegebook.collegebookbackend.auth.entity.User;
import com.collegebook.collegebookbackend.auth.repository.UserRepository;
import com.collegebook.collegebookbackend.college.entity.College;
import com.collegebook.collegebookbackend.common.AppException;
import com.collegebook.collegebookbackend.common.ErrorCode;
import com.collegebook.collegebookbackend.post.dto.CreatePostRequest;
import com.collegebook.collegebookbackend.post.dto.PostResponseDto;
import com.collegebook.collegebookbackend.post.entity.Post;
import com.collegebook.collegebookbackend.post.repository.CommentRepository;
import com.collegebook.collegebookbackend.post.repository.PostLikeRepository;
import com.collegebook.collegebookbackend.post.repository.PostMediaRepository;
import com.collegebook.collegebookbackend.post.repository.PostRepository;
import com.collegebook.collegebookbackend.post.repository.PostSaveRepository;
import com.collegebook.collegebookbackend.post.repository.TagRepository;
import com.collegebook.collegebookbackend.post.service.impl.PostServiceImpl;
import com.collegebook.collegebookbackend.profile.repository.ProfileRepository;
import com.collegebook.collegebookbackend.storage.dto.MediaKeyDto;
import com.collegebook.collegebookbackend.storage.service.MediaService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class PostServiceTest {

    @Mock
    private PostRepository postRepository;
    @Mock
    private PostLikeRepository postLikeRepository;
    @Mock
    private PostSaveRepository postSaveRepository;
    @Mock
    private CommentRepository commentRepository;
    @Mock
    private TagRepository tagRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private ProfileRepository profileRepository;
    @Mock
    private PostMediaRepository postMediaRepository;
    @Mock
    private MediaService mediaService;
    @Mock
    private com.collegebook.collegebookbackend.social.SocialInteractionService socialInteractionService;

    private PostServiceImpl postService;

    @BeforeEach
    void setUp() {
        postService = new PostServiceImpl(
                postRepository,
                postLikeRepository,
                postSaveRepository,
                commentRepository,
                tagRepository,
                userRepository,
                profileRepository,
                postMediaRepository,
                mediaService,
                socialInteractionService
        );
    }

    @Test
    void testCreatePostSuccess() {
        UUID userId = UUID.randomUUID();
        User author = new User();
        author.setId(userId);
        College college = new College();
        college.setId(UUID.randomUUID());
        author.setCollege(college);

        CreatePostRequest req = CreatePostRequest.builder()
                .content("Hello CollegeBook!")
                .isGlobal(true)
                .tags(List.of("tech"))
                .mediaKeys(List.of())
                .images(List.of())
                .build();

        when(userRepository.findById(userId)).thenReturn(Optional.of(author));
        when(postRepository.save(any(Post.class))).thenAnswer(i -> {
            Post p = i.getArgument(0);
            p.setId(UUID.randomUUID());
            return p;
        });

        PostResponseDto dto = postService.createPost(userId, req);

        assertNotNull(dto);
        assertEquals("Hello CollegeBook!", dto.getContent());
        verify(postRepository).save(any(Post.class));
    }

    @Test
    void testCreatePostWithR2AndStreamMedia() {
        UUID userId = UUID.randomUUID();
        User author = new User();
        author.setId(userId);
        College college = new College();
        college.setId(UUID.randomUUID());
        author.setCollege(college);

        when(userRepository.findById(userId)).thenReturn(Optional.of(author));
        when(postRepository.save(any(Post.class))).thenAnswer(invocation -> {
            Post p = invocation.getArgument(0);
            p.setId(UUID.randomUUID());
            return p;
        });
        when(mediaService.resolveAccessUrl("posts/images/test.jpg", "R2")).thenReturn("https://pub-r2.dev/posts/images/test.jpg");
        when(mediaService.resolveAccessUrl("video-uid-123", "CLOUDFLARE_STREAM")).thenReturn("https://customer-stream.com/video-uid-123/iframe");

        List<MediaKeyDto> mediaKeys = List.of(
                new MediaKeyDto("posts/images/test.jpg", "IMAGE", "R2", null, null),
                new MediaKeyDto(null, "VIDEO", "CLOUDFLARE_STREAM", "video-uid-123", null)
        );

        CreatePostRequest req = CreatePostRequest.builder()
                .content("Post with Image & Video")
                .mediaKeys(mediaKeys)
                .build();

        PostResponseDto resp = postService.createPost(userId, req);

        assertNotNull(resp);
        assertEquals("Post with Image & Video", resp.getContent());
        verify(postMediaRepository).saveAll(any());
    }

    @Test
    void testCreatePostWithMediaAndEmptyContent() {
        UUID userId = UUID.randomUUID();
        User author = new User();
        author.setId(userId);
        College college = new College();
        college.setId(UUID.randomUUID());
        author.setCollege(college);

        when(userRepository.findById(userId)).thenReturn(Optional.of(author));
        when(postRepository.save(any(Post.class))).thenAnswer(invocation -> {
            Post p = invocation.getArgument(0);
            p.setId(UUID.randomUUID());
            return p;
        });
        when(mediaService.resolveAccessUrl("posts/images/test.jpg", "CLOUDINARY")).thenReturn("https://res.cloudinary.com/test.jpg");

        List<MediaKeyDto> mediaKeys = List.of(
                new MediaKeyDto("posts/images/test.jpg", "IMAGE", "CLOUDINARY", null, null)
        );

        CreatePostRequest req = CreatePostRequest.builder()
                .content("")
                .mediaKeys(mediaKeys)
                .build();

        PostResponseDto resp = postService.createPost(userId, req);

        assertNotNull(resp);
        assertEquals("", resp.getContent());
        verify(postMediaRepository).saveAll(any());
    }

    @Test
    void testCreatePostEmptyContentAndNoMediaThrowsValidationError() {
        UUID userId = UUID.randomUUID();
        User author = new User();
        author.setId(userId);

        when(userRepository.findById(userId)).thenReturn(Optional.of(author));

        CreatePostRequest req = CreatePostRequest.builder()
                .content("   ")
                .mediaKeys(List.of())
                .images(List.of())
                .build();

        AppException ex = assertThrows(AppException.class, () -> postService.createPost(userId, req));
        assertEquals(ErrorCode.VALIDATION_ERROR, ex.getErrorCode());
    }

    @Test
    void testToggleLikeNew() {
        UUID userId = UUID.randomUUID();
        UUID postId = UUID.randomUUID();

        when(socialInteractionService.togglePostLike(userId, postId))
                .thenReturn(Map.of("id", postId, "liked", true, "likesCount", 1));

        Map<String, Object> result = postService.toggleLike(userId, postId);

        assertTrue((Boolean) result.get("liked"));
        assertEquals(1, result.get("likesCount"));
    }

    @Test
    void testGetFeedWithPersonalizationOverlay() {
        UUID collegeId = UUID.randomUUID();
        UUID userA = UUID.randomUUID();
        UUID userB = UUID.randomUUID();
        UUID postId = UUID.randomUUID();

        User author = new User();
        author.setId(UUID.randomUUID());
        author.setEmail("author@ddu.ac.in");

        Post post = new Post();
        post.setId(postId);
        post.setAuthor(author);
        post.setContent("Shared College Post");
        post.setLikesCount(10);

        org.springframework.data.domain.Page<Post> page = new org.springframework.data.domain.PageImpl<>(
                List.of(post),
                org.springframework.data.domain.PageRequest.of(0, 10),
                1
        );

        when(postRepository.findByCollegeId(any(), any())).thenReturn(page);
        when(socialInteractionService.getPostLikesCountsBatch(any())).thenReturn(Map.of(postId, 10L));

        // User A liked the post
        when(socialInteractionService.getLikedPostIdsBatch(any(), eq(userA))).thenReturn(Set.of(postId));
        when(socialInteractionService.getSavedPostIdsBatch(any(), eq(userA))).thenReturn(Collections.emptySet());

        // User B has not liked the post, but saved it
        when(socialInteractionService.getLikedPostIdsBatch(any(), eq(userB))).thenReturn(Collections.emptySet());
        when(socialInteractionService.getSavedPostIdsBatch(any(), eq(userB))).thenReturn(Set.of(postId));

        com.collegebook.collegebookbackend.common.PageResponse<PostResponseDto> respA = postService.getFeed(userA, collegeId, null, 0, 10);
        com.collegebook.collegebookbackend.common.PageResponse<PostResponseDto> respB = postService.getFeed(userB, collegeId, null, 0, 10);

        assertNotNull(respA);
        assertEquals(1, respA.getItems().size());
        assertTrue(respA.getItems().get(0).isLiked());
        org.junit.jupiter.api.Assertions.assertFalse(respA.getItems().get(0).isSaved());

        assertNotNull(respB);
        assertEquals(1, respB.getItems().size());
        org.junit.jupiter.api.Assertions.assertFalse(respB.getItems().get(0).isLiked());
        assertTrue(respB.getItems().get(0).isSaved());
    }

    @Test
    void testDeletePostUnauthorized() {
        UUID authorId = UUID.randomUUID();
        UUID otherUserId = UUID.randomUUID();
        UUID postId = UUID.randomUUID();

        User author = new User();
        author.setId(authorId);
        Post post = new Post();
        post.setId(postId);
        post.setAuthor(author);

        when(postRepository.findById(postId)).thenReturn(Optional.of(post));

        AppException ex = assertThrows(AppException.class, () -> postService.deletePost(otherUserId, postId));
        assertEquals(ErrorCode.FORBIDDEN, ex.getErrorCode());
    }

    @Test
    void testAddCommentSuccess() {
        UUID userId = UUID.randomUUID();
        UUID postId = UUID.randomUUID();

        User author = new User();
        author.setId(userId);
        author.setEmail("ronak@ddu.ac.in");

        Post post = new Post();
        post.setId(postId);
        post.setCommentsEnabled(true);
        post.setCommentsCount(0);

        when(postRepository.findById(postId)).thenReturn(Optional.of(post));
        when(userRepository.findById(userId)).thenReturn(Optional.of(author));
        when(commentRepository.save(any())).thenAnswer(i -> {
            com.collegebook.collegebookbackend.post.entity.Comment c = i.getArgument(0);
            c.setId(UUID.randomUUID());
            c.setCreatedAt(java.time.Instant.now());
            return c;
        });

        com.collegebook.collegebookbackend.profile.entity.Profile profile = new com.collegebook.collegebookbackend.profile.entity.Profile();
        profile.setFullName("Ronak Gondaliya");
        profile.setHandle("ronakgondaliya");
        profile.setInitials("RG");
        when(profileRepository.findByUserId(userId)).thenReturn(Optional.of(profile));

        com.collegebook.collegebookbackend.post.dto.CreateCommentRequest req = new com.collegebook.collegebookbackend.post.dto.CreateCommentRequest("@ronakgondaliya great idea!");
        com.collegebook.collegebookbackend.post.dto.CommentResponseDto resp = postService.addComment(userId, postId, req);

        assertNotNull(resp);
        assertEquals("Ronak Gondaliya", resp.getAuthorName());
        assertEquals("ronakgondaliya", resp.getAuthorHandle());
        assertEquals("@ronakgondaliya great idea!", resp.getBody());
        assertEquals(1, post.getCommentsCount());
    }

    @Test
    void testAddCommentWhenCommentsDisabledThrowsException() {
        UUID userId = UUID.randomUUID();
        UUID postId = UUID.randomUUID();

        Post post = new Post();
        post.setId(postId);
        post.setCommentsEnabled(false);

        when(postRepository.findById(postId)).thenReturn(Optional.of(post));

        com.collegebook.collegebookbackend.post.dto.CreateCommentRequest req = new com.collegebook.collegebookbackend.post.dto.CreateCommentRequest("Test comment");
        AppException ex = assertThrows(AppException.class, () -> postService.addComment(userId, postId, req));
        assertEquals(ErrorCode.COMMENTS_DISABLED, ex.getErrorCode());
    }

    @Test
    void testDeleteCommentSuccess() {
        UUID authorId = UUID.randomUUID();
        UUID postId = UUID.randomUUID();
        UUID commentId = UUID.randomUUID();

        User author = new User();
        author.setId(authorId);

        Post post = new Post();
        post.setId(postId);
        post.setCommentsCount(2);

        com.collegebook.collegebookbackend.post.entity.Comment comment = new com.collegebook.collegebookbackend.post.entity.Comment();
        comment.setId(commentId);
        comment.setAuthor(author);
        comment.setPost(post);

        when(postRepository.findById(postId)).thenReturn(Optional.of(post));
        when(commentRepository.findById(commentId)).thenReturn(Optional.of(comment));

        postService.deleteComment(authorId, postId, commentId);

        assertNotNull(comment.getDeletedAt());
        assertEquals(1, post.getCommentsCount());
        verify(commentRepository).save(comment);
        verify(postRepository).save(post);
    }

    @Test
    void testDeleteCommentForbiddenForNonAuthor() {
        UUID authorId = UUID.randomUUID();
        UUID otherUserId = UUID.randomUUID();
        UUID postId = UUID.randomUUID();
        UUID commentId = UUID.randomUUID();

        User author = new User();
        author.setId(authorId);

        Post post = new Post();
        post.setId(postId);

        com.collegebook.collegebookbackend.post.entity.Comment comment = new com.collegebook.collegebookbackend.post.entity.Comment();
        comment.setId(commentId);
        comment.setAuthor(author);
        comment.setPost(post);

        when(postRepository.findById(postId)).thenReturn(Optional.of(post));
        when(commentRepository.findById(commentId)).thenReturn(Optional.of(comment));

        AppException ex = assertThrows(AppException.class, () -> postService.deleteComment(otherUserId, postId, commentId));
        assertEquals(ErrorCode.FORBIDDEN, ex.getErrorCode());
    }

    @Test
    void testDeleteCommentAlreadyDeletedThrowsNotFound() {
        UUID authorId = UUID.randomUUID();
        UUID postId = UUID.randomUUID();
        UUID commentId = UUID.randomUUID();

        User author = new User();
        author.setId(authorId);

        Post post = new Post();
        post.setId(postId);

        com.collegebook.collegebookbackend.post.entity.Comment comment = new com.collegebook.collegebookbackend.post.entity.Comment();
        comment.setId(commentId);
        comment.setAuthor(author);
        comment.setPost(post);
        comment.setDeletedAt(java.time.Instant.now());

        when(postRepository.findById(postId)).thenReturn(Optional.of(post));
        when(commentRepository.findById(commentId)).thenReturn(Optional.of(comment));

        AppException ex = assertThrows(AppException.class, () -> postService.deleteComment(authorId, postId, commentId));
        assertEquals(ErrorCode.NOT_FOUND, ex.getErrorCode());
    }

    @Test
    void testDeleteCommentFloorCountAtZero() {
        UUID authorId = UUID.randomUUID();
        UUID postId = UUID.randomUUID();
        UUID commentId = UUID.randomUUID();

        User author = new User();
        author.setId(authorId);

        Post post = new Post();
        post.setId(postId);
        post.setCommentsCount(0);

        com.collegebook.collegebookbackend.post.entity.Comment comment = new com.collegebook.collegebookbackend.post.entity.Comment();
        comment.setId(commentId);
        comment.setAuthor(author);
        comment.setPost(post);

        when(postRepository.findById(postId)).thenReturn(Optional.of(post));
        when(commentRepository.findById(commentId)).thenReturn(Optional.of(comment));

        postService.deleteComment(authorId, postId, commentId);

        assertEquals(0, post.getCommentsCount());
    }

    @Test
    void testAddCommentNonExistentPostThrowsNotFound() {
        UUID userId = UUID.randomUUID();
        UUID postId = UUID.randomUUID();

        when(postRepository.findById(postId)).thenReturn(Optional.empty());

        com.collegebook.collegebookbackend.post.dto.CreateCommentRequest req = new com.collegebook.collegebookbackend.post.dto.CreateCommentRequest("Hello");
        AppException ex = assertThrows(AppException.class, () -> postService.addComment(userId, postId, req));
        assertEquals(ErrorCode.NOT_FOUND, ex.getErrorCode());
    }

    @Test
    void testGetCommentsOnlyReturnsActiveComments() {
        UUID postId = UUID.randomUUID();

        User author = new User();
        author.setId(UUID.randomUUID());
        author.setEmail("alice@ddu.ac.in");

        Post post = new Post();
        post.setId(postId);

        com.collegebook.collegebookbackend.post.entity.Comment activeComment = new com.collegebook.collegebookbackend.post.entity.Comment();
        activeComment.setId(UUID.randomUUID());
        activeComment.setPost(post);
        activeComment.setAuthor(author);
        activeComment.setContent("Active comment");
        activeComment.setCreatedAt(java.time.Instant.now());

        org.springframework.data.domain.Page<com.collegebook.collegebookbackend.post.entity.Comment> page =
                new org.springframework.data.domain.PageImpl<>(List.of(activeComment));

        when(commentRepository.findByPostIdAndDeletedAtIsNullOrderByCreatedAtAsc(any(), any())).thenReturn(page);

        com.collegebook.collegebookbackend.common.PageResponse<com.collegebook.collegebookbackend.post.dto.CommentResponseDto> res =
                postService.getComments(postId, 0, 10);

        assertNotNull(res);
        assertEquals(1, res.getItems().size());
        assertEquals("Active comment", res.getItems().get(0).getBody());
    }
}
