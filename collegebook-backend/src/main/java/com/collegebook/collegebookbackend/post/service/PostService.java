package com.collegebook.collegebookbackend.post.service;

import com.collegebook.collegebookbackend.common.PageResponse;
import com.collegebook.collegebookbackend.post.dto.CommentResponseDto;
import com.collegebook.collegebookbackend.post.dto.CreateCommentRequest;
import com.collegebook.collegebookbackend.post.dto.CreatePostRequest;
import com.collegebook.collegebookbackend.post.dto.PostResponseDto;

import java.util.List;

import java.util.Map;
import java.util.UUID;

public interface PostService {
    PageResponse<PostResponseDto> getFeed(UUID userId, UUID collegeId, String tag, int page, int size);

    PageResponse<PostResponseDto> getExplore(UUID userId, String tag, int page, int size);

    PageResponse<PostResponseDto> getSavedPosts(UUID userId, int page, int size);

    PageResponse<PostResponseDto> getMyPosts(UUID userId, int page, int size);

    PageResponse<PostResponseDto> getStudentPosts(UUID currentUserId, String slug, int page, int size);

    PostResponseDto getPostById(UUID userId, UUID postId);

    PostResponseDto createPost(UUID userId, CreatePostRequest request);

    void deletePost(UUID userId, UUID postId);

    Map<String, Object> toggleLike(UUID userId, UUID postId);

    Map<String, Object> toggleSave(UUID userId, UUID postId);

    PageResponse<CommentResponseDto> getComments(UUID postId, int page, int size);

    CommentResponseDto addComment(UUID userId, UUID postId, CreateCommentRequest request);

    List<String> getTrendingTags();
}
