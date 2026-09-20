package com.collegebook.collegebookbackend.admin.service.impl;

import com.collegebook.collegebookbackend.ad.dto.AdResponseDto;
import com.collegebook.collegebookbackend.ad.entity.Ad;
import com.collegebook.collegebookbackend.ad.repository.AdRepository;
import com.collegebook.collegebookbackend.admin.dto.CreateAdRequest;
import com.collegebook.collegebookbackend.admin.service.AdminService;
import com.collegebook.collegebookbackend.auth.repository.UserRepository;
import com.collegebook.collegebookbackend.collab.repository.TeamRepository;
import com.collegebook.collegebookbackend.common.AppException;
import com.collegebook.collegebookbackend.common.ErrorCode;
import com.collegebook.collegebookbackend.common.PageResponse;
import com.collegebook.collegebookbackend.post.dto.PostResponseDto;
import com.collegebook.collegebookbackend.post.entity.Post;
import com.collegebook.collegebookbackend.post.repository.PostRepository;
import com.collegebook.collegebookbackend.post.service.PostService;
import com.collegebook.collegebookbackend.social.SocialInteractionService;
import com.collegebook.collegebookbackend.storage.service.MediaService;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AdminServiceImpl implements AdminService {

    private final UserRepository userRepository;
    private final PostRepository postRepository;
    private final TeamRepository teamRepository;
    private final AdRepository adRepository;
    private final PostService postService;
    private final MediaService mediaService;
    private final SocialInteractionService socialInteractionService;

    @Override
    @Transactional(readOnly = true)
    public Map<String, Long> getAdminStats() {
        long students = userRepository.count();
        long posts = postRepository.count();
        long teams = teamRepository.count();
        long ads = adRepository.count();
        long activeAds = adRepository.findByIsActiveTrue().size();

        return Map.of(
                "students", students,
                "posts", posts,
                "teams", teams,
                "ads", ads,
                "activeAds", activeAds,
                "totalUsers", students,
                "totalPosts", posts
        );
    }

    @Override
    @Transactional(readOnly = true)
    public List<AdResponseDto> getAllAds() {
        return adRepository.findAll().stream()
                .map(this::mapAdToDto)
                .toList();
    }

    @Override
    @Transactional
    @CacheEvict(value = "activeAds", allEntries = true)
    public AdResponseDto createAd(CreateAdRequest request) {
        String brand = (request.getBrand() != null && !request.getBrand().isBlank())
                ? request.getBrand().trim()
                : "Sponsored";

        String title = (request.getTitle() != null && !request.getTitle().isBlank())
                ? request.getTitle().trim()
                : "Sponsored Campaign";

        String image = (request.getImageUrl() != null && !request.getImageUrl().isBlank())
                ? request.getImageUrl().trim()
                : (request.getImageUrls() != null && !request.getImageUrls().isEmpty() ? request.getImageUrls().get(0) : "");

        String destination = (request.getDestinationUrl() != null && !request.getDestinationUrl().isBlank())
                ? request.getDestinationUrl().trim()
                : (request.getCtaLink() != null && !request.getCtaLink().isBlank() ? request.getCtaLink().trim() : "#");

        String ctaText = (request.getCtaText() != null && !request.getCtaText().isBlank())
                ? request.getCtaText().trim()
                : "Shop Now";

        boolean comments = request.isCommentsEnabled() && request.isAllowComments();

        Ad ad = new Ad();
        ad.setBrandName(brand);
        ad.setHeadline(title);
        ad.setBody(request.getDescription() != null ? request.getDescription().trim() : "");
        ad.setBrandLogoUrl(image);
        ad.setCtaUrl(destination);
        ad.setCtaText(ctaText);
        ad.setDiscountText(request.getDiscount() != null ? request.getDiscount().trim() : "");
        ad.setCommentsEnabled(comments);
        ad.setActive(true);

        Ad saved = adRepository.save(ad);
        return mapAdToDto(saved);
    }

    @Override
    @Transactional
    @CacheEvict(value = "activeAds", allEntries = true)
    public void deleteAd(UUID adId) {
        Ad ad = adRepository.findById(adId)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "Ad not found"));
        adRepository.delete(ad);
    }

    @Override
    @Transactional
    @CacheEvict(value = "activeAds", allEntries = true)
    public Map<String, Object> toggleAllAds(boolean active) {
        List<Ad> allAds = adRepository.findAll();
        for (Ad ad : allAds) {
            ad.setActive(active);
        }
        adRepository.saveAll(allAds);
        return Map.of(
                "success", true,
                "active", active,
                "totalCount", allAds.size(),
                "message", active ? "All ad campaigns activated" : "All ad campaigns paused"
        );
    }

    @Override
    @Transactional
    @CacheEvict(value = "activeAds", allEntries = true)
    public AdResponseDto toggleAdStatus(UUID adId, boolean active) {
        Ad ad = adRepository.findById(adId)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "Ad not found"));
        ad.setActive(active);
        Ad saved = adRepository.save(ad);
        return mapAdToDto(saved);
    }

    @Override
    @Transactional
    @CacheEvict(value = "activeAds", allEntries = true)
    public AdResponseDto toggleAdComments(UUID adId, boolean commentsEnabled) {
        Ad ad = adRepository.findById(adId)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "Ad not found"));
        ad.setCommentsEnabled(commentsEnabled);
        Ad saved = adRepository.save(ad);
        return mapAdToDto(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<PostResponseDto> getCampusFeed(UUID collegeId, int page, int size) {
        return postService.getPublicFeed(collegeId, null, page, size);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<PostResponseDto> getCampusFeed(String collegeIdStr, int page, int size) {
        if (collegeIdStr == null || collegeIdStr.trim().isBlank()) {
            return postService.getPublicFeed(null, null, page, size);
        }
        try {
            UUID collegeId = UUID.fromString(collegeIdStr.trim());
            return postService.getPublicFeed(collegeId, null, page, size);
        } catch (IllegalArgumentException e) {
            // Check if slug match exists or return empty page
            return PageResponse.of(Collections.emptyList(), page, size, 0);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<PostResponseDto> getExploreFeed(int page, int size) {
        return postService.getPublicExplore(null, page, size);
    }

    @Override
    @Transactional
    @CacheEvict(value = {"feed", "explore"}, allEntries = true)
    public void deletePostByAdmin(UUID postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "Post not found"));
        try {
            mediaService.deleteAllMediaForEntity("POST", postId);
        } catch (Exception ignored) {
        }
        postRepository.delete(post);
        try {
            socialInteractionService.evictPost(postId);
        } catch (Exception ignored) {
        }
    }

    private AdResponseDto mapAdToDto(Ad ad) {
        AdResponseDto dto = new AdResponseDto();
        dto.setId(ad.getId());
        dto.setBrand(ad.getBrandName() != null ? ad.getBrandName() : "Sponsored");
        dto.setTitle(ad.getTitle() != null ? ad.getTitle() : "");
        dto.setDescription(ad.getBody() != null ? ad.getBody() : "");
        dto.setImageUrl(ad.getImageUrl() != null ? ad.getImageUrl() : "");
        if (ad.getImageUrl() != null && !ad.getImageUrl().isBlank()) {
            dto.setImages(List.of(ad.getImageUrl()));
        } else {
            dto.setImages(Collections.emptyList());
        }
        dto.setDestinationUrl(ad.getDestinationUrl() != null ? ad.getDestinationUrl() : "#");
        dto.setCtaLink(ad.getDestinationUrl() != null ? ad.getDestinationUrl() : "#");
        dto.setCtaText(ad.getCtaText() != null ? ad.getCtaText() : "Shop Now");
        dto.setDiscount(ad.getDiscountText() != null ? ad.getDiscountText() : "");
        dto.setAllowComments(ad.isAllowComments());
        dto.setCommentsEnabled(ad.isAllowComments());
        dto.setActive(ad.isActive());
        dto.setLikes(ad.getLikesCount());
        dto.setCommentsCount(ad.getCommentsCount());
        dto.setImpressions(0);
        dto.setClicks(0);
        dto.setRevenue(0);
        return dto;
    }
}
