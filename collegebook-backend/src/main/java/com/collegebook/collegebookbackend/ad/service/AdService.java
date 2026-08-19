package com.collegebook.collegebookbackend.ad.service;

import com.collegebook.collegebookbackend.ad.dto.AdResponseDto;
import com.collegebook.collegebookbackend.common.PageResponse;
import com.collegebook.collegebookbackend.post.dto.CommentResponseDto;
import com.collegebook.collegebookbackend.post.dto.CreateCommentRequest;

import java.util.List;
import java.util.Map;
import java.util.UUID;

public interface AdService {
    List<AdResponseDto> getFeedAds(UUID userId, UUID collegeId);
    List<AdResponseDto> getExploreAds(UUID userId);
    Map<String, Object> toggleLike(UUID userId, UUID adId);
    PageResponse<CommentResponseDto> getComments(UUID adId, int page, int size);
    CommentResponseDto addComment(UUID userId, UUID adId, CreateCommentRequest request);
}
