package com.collegebook.collegebookbackend.ad.controller;

import com.collegebook.collegebookbackend.ad.dto.AdResponseDto;
import com.collegebook.collegebookbackend.ad.service.AdService;
import com.collegebook.collegebookbackend.auth.UserPrincipal;
import com.collegebook.collegebookbackend.common.CurrentUser;
import com.collegebook.collegebookbackend.common.PageResponse;
import com.collegebook.collegebookbackend.post.dto.CommentResponseDto;
import com.collegebook.collegebookbackend.post.dto.CreateCommentRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
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
@RequestMapping("/api/v1/ads")
@RequiredArgsConstructor
public class AdController {

    private final AdService adService;

    @GetMapping("/feed")
    public ResponseEntity<List<AdResponseDto>> getFeedAds(@CurrentUser UserPrincipal currentUser) {
        UUID userId = currentUser != null ? currentUser.getId() : null;
        UUID collegeId = currentUser != null ? currentUser.getCollegeId() : null;
        return ResponseEntity.ok(adService.getFeedAds(userId, collegeId));
    }

    @GetMapping("/explore")
    public ResponseEntity<List<AdResponseDto>> getExploreAds(@CurrentUser UserPrincipal currentUser) {
        UUID userId = currentUser != null ? currentUser.getId() : null;
        return ResponseEntity.ok(adService.getExploreAds(userId));
    }

    @PostMapping("/{id}/like")
    public ResponseEntity<Map<String, Object>> toggleLike(
            @CurrentUser UserPrincipal currentUser,
            @PathVariable("id") UUID adId) {
        return ResponseEntity.ok(adService.toggleLike(currentUser.getId(), adId));
    }

    @GetMapping("/{id}/comments")
    public ResponseEntity<PageResponse<CommentResponseDto>> getComments(
            @PathVariable("id") UUID adId,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "20") int size) {
        return ResponseEntity.ok(adService.getComments(adId, page, size));
    }

    @PostMapping("/{id}/comments")
    public ResponseEntity<CommentResponseDto> addComment(
            @CurrentUser UserPrincipal currentUser,
            @PathVariable("id") UUID adId,
            @Valid @RequestBody CreateCommentRequest request) {
        return ResponseEntity.ok(adService.addComment(currentUser.getId(), adId, request));
    }
}
