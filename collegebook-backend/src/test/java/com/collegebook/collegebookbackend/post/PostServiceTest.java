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

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

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
                mediaService
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

        when(userRepository.findById(userId)).thenReturn(Optional.of(author));
        when(postRepository.save(any(Post.class))).thenAnswer(invocation -> {
            Post p = invocation.getArgument(0);
            p.setId(UUID.randomUUID());
            return p;
        });

        CreatePostRequest req = new CreatePostRequest("Hello CollegeBook!", List.of(), List.of("general"));
        PostResponseDto resp = postService.createPost(userId, req);

        assertNotNull(resp);
        assertEquals("Hello CollegeBook!", resp.getContent());
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
        Post post = new Post();
        post.setId(postId);
        post.setLikesCount(0);
        User user = new User();
        user.setId(userId);

        when(postRepository.findById(postId)).thenReturn(Optional.of(post));
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(postLikeRepository.existsByIdPostIdAndIdUserId(postId, userId)).thenReturn(false);

        Map<String, Object> result = postService.toggleLike(userId, postId);

        assertTrue((Boolean) result.get("liked"));
        assertEquals(1, result.get("likesCount"));
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
}
