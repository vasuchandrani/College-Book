package com.collegebook.collegebookbackend.post.controller;

import com.collegebook.collegebookbackend.auth.UserPrincipal;
import com.collegebook.collegebookbackend.common.CurrentUser;
import com.collegebook.collegebookbackend.common.PageResponse;
import com.collegebook.collegebookbackend.post.dto.CommentResponseDto;
import com.collegebook.collegebookbackend.post.dto.CreateCommentRequest;
import com.collegebook.collegebookbackend.post.dto.CreatePostRequest;
import com.collegebook.collegebookbackend.post.dto.PostResponseDto;
import com.collegebook.collegebookbackend.post.service.PostService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class PostController {

    private final PostService postService;

    @GetMapping("/feed")
    public ResponseEntity<PageResponse<PostResponseDto>> getFeed(
            @CurrentUser UserPrincipal currentUser,
            @RequestParam(value = "tag", required = false) String tag,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "20") int size) {
        UUID userId = currentUser != null ? currentUser.getId() : null;
        UUID collegeId = currentUser != null ? currentUser.getCollegeId() : null;
        return ResponseEntity.ok(postService.getFeed(userId, collegeId, tag, page, size));
    }

    @GetMapping("/explore")
    public ResponseEntity<PageResponse<PostResponseDto>> getExplore(
            @CurrentUser UserPrincipal currentUser,
            @RequestParam(value = "tag", required = false) String tag,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "20") int size) {
        UUID userId = currentUser != null ? currentUser.getId() : null;
        return ResponseEntity.ok(postService.getExplore(userId, tag, page, size));
    }

    @GetMapping("/saved-posts")
    public ResponseEntity<PageResponse<PostResponseDto>> getSavedPosts(
            @CurrentUser UserPrincipal currentUser,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "20") int size) {
        if (currentUser == null) {
            return ResponseEntity.ok(PageResponse.of(List.of(), page, size, 0));
        }
        return ResponseEntity.ok(postService.getSavedPosts(currentUser.getId(), page, size));
    }

    @GetMapping("/my-posts")
    public ResponseEntity<PageResponse<PostResponseDto>> getMyPosts(
            @CurrentUser UserPrincipal currentUser,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "20") int size) {
        if (currentUser == null) {
            return ResponseEntity.ok(PageResponse.of(List.of(), page, size, 0));
        }
        return ResponseEntity.ok(postService.getMyPosts(currentUser.getId(), page, size));
    }

    @GetMapping("/students/{slug}/posts")
    public ResponseEntity<PageResponse<PostResponseDto>> getStudentPosts(
            @CurrentUser UserPrincipal currentUser,
            @PathVariable("slug") String slug,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "20") int size) {
        UUID currentUserId = currentUser != null ? currentUser.getId() : null;
        return ResponseEntity.ok(postService.getStudentPosts(currentUserId, slug, page, size));
    }

    @GetMapping("/posts/{id}")
    public ResponseEntity<PostResponseDto> getPost(
            @CurrentUser UserPrincipal currentUser,
            @PathVariable("id") UUID postId) {
        UUID userId = currentUser != null ? currentUser.getId() : null;
        return ResponseEntity.ok(postService.getPostById(userId, postId));
    }

    @PostMapping("/posts")
    public ResponseEntity<PostResponseDto> createPost(
            @CurrentUser UserPrincipal currentUser,
            @Valid @RequestBody CreatePostRequest request) {
        UUID userId = currentUser != null ? currentUser.getId() : UUID.randomUUID();
        return ResponseEntity.ok(postService.createPost(userId, request));
    }

    @DeleteMapping("/posts/{id}")
    public ResponseEntity<Void> deletePost(
            @CurrentUser UserPrincipal currentUser,
            @PathVariable("id") UUID postId) {
        if (currentUser != null) {
            postService.deletePost(currentUser.getId(), postId);
        }
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/posts/{id}/like")
    public ResponseEntity<Map<String, Object>> toggleLike(
            @CurrentUser UserPrincipal currentUser,
            @PathVariable("id") UUID postId) {
        UUID userId = currentUser != null ? currentUser.getId() : UUID.randomUUID();
        return ResponseEntity.ok(postService.toggleLike(userId, postId));
    }

    @PostMapping("/posts/{id}/save")
    public ResponseEntity<Map<String, Object>> toggleSave(
            @CurrentUser UserPrincipal currentUser,
            @PathVariable("id") UUID postId) {
        UUID userId = currentUser != null ? currentUser.getId() : UUID.randomUUID();
        return ResponseEntity.ok(postService.toggleSave(userId, postId));
    }

    @GetMapping("/posts/{id}/comments")
    public ResponseEntity<PageResponse<CommentResponseDto>> getComments(
            @PathVariable("id") UUID postId,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "20") int size) {
        return ResponseEntity.ok(postService.getComments(postId, page, size));
    }

    @PostMapping("/posts/{id}/comments")
    public ResponseEntity<CommentResponseDto> addComment(
            @CurrentUser UserPrincipal currentUser,
            @PathVariable("id") UUID postId,
            @Valid @RequestBody CreateCommentRequest request) {
        UUID userId = currentUser != null ? currentUser.getId() : UUID.randomUUID();
        return ResponseEntity.ok(postService.addComment(userId, postId, request));
    }

    @DeleteMapping("/posts/{postId}/comments/{commentId}")
    public ResponseEntity<Void> deleteComment(
            @CurrentUser UserPrincipal currentUser,
            @PathVariable("postId") UUID postId,
            @PathVariable("commentId") UUID commentId) {
        if (currentUser != null) {
            postService.deleteComment(currentUser.getId(), postId, commentId);
        }
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/tags/trending")
    public ResponseEntity<List<String>> getTrendingTags() {
        return ResponseEntity.ok(postService.getTrendingTags());
    }
}
