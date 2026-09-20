package com.collegebook.collegebookbackend.admin.controller;

import com.collegebook.collegebookbackend.ad.dto.AdResponseDto;
import com.collegebook.collegebookbackend.admin.dto.CreateAdRequest;
import com.collegebook.collegebookbackend.admin.service.AdminService;
import com.collegebook.collegebookbackend.common.PageResponse;
import com.collegebook.collegebookbackend.post.dto.PostResponseDto;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Long>> getAdminStats() {
        return ResponseEntity.ok(adminService.getAdminStats());
    }

    @GetMapping("/ads")
    public ResponseEntity<List<AdResponseDto>> getAllAds() {
        return ResponseEntity.ok(adminService.getAllAds());
    }

    @PostMapping("/ads")
    public ResponseEntity<AdResponseDto> createAd(@Valid @RequestBody CreateAdRequest request) {
        return ResponseEntity.ok(adminService.createAd(request));
    }

    @DeleteMapping("/ads/{id}")
    public ResponseEntity<Void> deleteAd(@PathVariable("id") UUID adId) {
        adminService.deleteAd(adId);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/ads/toggle-all")
    public ResponseEntity<Map<String, Object>> toggleAllAds(
            @RequestParam(value = "active", defaultValue = "true") boolean active) {
        return ResponseEntity.ok(adminService.toggleAllAds(active));
    }

    @PutMapping("/ads/{id}/status")
    public ResponseEntity<AdResponseDto> toggleAdStatus(
            @PathVariable("id") UUID adId,
            @RequestParam("active") boolean active) {
        return ResponseEntity.ok(adminService.toggleAdStatus(adId, active));
    }

    @PutMapping("/ads/{id}/comments")
    public ResponseEntity<AdResponseDto> toggleAdComments(
            @PathVariable("id") UUID adId,
            @RequestParam("commentsEnabled") boolean commentsEnabled) {
        return ResponseEntity.ok(adminService.toggleAdComments(adId, commentsEnabled));
    }

    @GetMapping("/posts/feed")
    public ResponseEntity<PageResponse<PostResponseDto>> getCampusFeed(
            @RequestParam(value = "collegeId", required = false) String collegeId,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "20") int size) {
        return ResponseEntity.ok(adminService.getCampusFeed(collegeId, page, size));
    }

    @GetMapping("/posts/explore")
    public ResponseEntity<PageResponse<PostResponseDto>> getExploreFeed(
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "20") int size) {
        return ResponseEntity.ok(adminService.getExploreFeed(page, size));
    }

    @DeleteMapping("/posts/{id}")
    public ResponseEntity<Void> deletePost(@PathVariable("id") UUID postId) {
        adminService.deletePostByAdmin(postId);
        return ResponseEntity.noContent().build();
    }
}
