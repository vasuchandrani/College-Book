package com.collegebook.collegebookbackend.ad.service.impl;

import com.collegebook.collegebookbackend.ad.dto.AdResponseDto;
import com.collegebook.collegebookbackend.ad.entity.Ad;
import com.collegebook.collegebookbackend.ad.entity.AdComment;
import com.collegebook.collegebookbackend.ad.entity.AdLike;
import com.collegebook.collegebookbackend.ad.repository.AdCommentRepository;
import com.collegebook.collegebookbackend.ad.repository.AdLikeRepository;
import com.collegebook.collegebookbackend.ad.repository.AdRepository;
import com.collegebook.collegebookbackend.ad.service.AdService;
import com.collegebook.collegebookbackend.auth.entity.User;
import com.collegebook.collegebookbackend.auth.repository.UserRepository;
import com.collegebook.collegebookbackend.common.AppException;
import com.collegebook.collegebookbackend.common.ErrorCode;
import com.collegebook.collegebookbackend.common.PageResponse;
import com.collegebook.collegebookbackend.post.dto.CommentResponseDto;
import com.collegebook.collegebookbackend.post.dto.CreateCommentRequest;
import com.collegebook.collegebookbackend.profile.entity.Profile;
import com.collegebook.collegebookbackend.profile.repository.ProfileRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class AdServiceImpl implements AdService {

    private final AdRepository adRepository;
    private final AdLikeRepository adLikeRepository;
    private final AdCommentRepository adCommentRepository;
    private final UserRepository userRepository;
    private final ProfileRepository profileRepository;

    public AdServiceImpl(
            AdRepository adRepository,
            AdLikeRepository adLikeRepository,
            AdCommentRepository adCommentRepository,
            UserRepository userRepository,
            ProfileRepository profileRepository
    ) {
        this.adRepository = adRepository;
        this.adLikeRepository = adLikeRepository;
        this.adCommentRepository = adCommentRepository;
        this.userRepository = userRepository;
        this.profileRepository = profileRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<AdResponseDto> getFeedAds(UUID userId, UUID collegeId) {
        List<Ad> activeAds = adRepository.findByIsActiveTrue();
        return activeAds.stream()
                .filter(ad -> ad.getTargetCollegeIds() == null || ad.getTargetCollegeIds().isEmpty() || (collegeId != null && ad.getTargetCollegeIds().contains(collegeId)))
                .map(ad -> mapToDto(ad, userId))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<AdResponseDto> getExploreAds(UUID userId) {
        List<Ad> activeAds = adRepository.findByIsActiveTrue();
        return activeAds.stream()
                .map(ad -> mapToDto(ad, userId))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    @CacheEvict(value = "activeAds", allEntries = true)
    public Map<String, Object> toggleLike(UUID userId, UUID adId) {
        Ad ad = adRepository.findById(adId)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "Ad not found"));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND, "User not found"));

        boolean liked;
        if (adLikeRepository.existsByIdAdIdAndIdUserId(adId, userId)) {
            adLikeRepository.deleteByIdAdIdAndIdUserId(adId, userId);
            ad.setLikesCount(Math.max(0, ad.getLikesCount() - 1));
            liked = false;
        } else {
            adLikeRepository.save(new AdLike(ad, user));
            ad.setLikesCount(ad.getLikesCount() + 1);
            liked = true;
        }
        adRepository.save(ad);

        return Map.of("id", adId, "liked", liked, "likesCount", ad.getLikesCount());
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<CommentResponseDto> getComments(UUID adId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<AdComment> commentsPage = adCommentRepository.findByAdIdOrderByCreatedAtAsc(adId, pageable);

        List<CommentResponseDto> content = commentsPage.getContent().stream()
                .map(this::mapCommentToDto)
                .collect(Collectors.toList());

        return PageResponse.of(content, commentsPage.getNumber(), commentsPage.getSize(), commentsPage.getTotalElements());
    }

    @Override
    @Transactional
    @CacheEvict(value = "activeAds", allEntries = true)
    public CommentResponseDto addComment(UUID userId, UUID adId, CreateCommentRequest request) {
        Ad ad = adRepository.findById(adId)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "Ad not found"));

        if (!ad.isAllowComments()) {
            throw new AppException(ErrorCode.COMMENTS_DISABLED, "Comments are disabled for this ad");
        }

        User author = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND, "User not found"));

        AdComment comment = new AdComment();
        comment.setAd(ad);
        comment.setAuthor(author);
        comment.setContent(request.getBody());

        AdComment saved = adCommentRepository.save(comment);

        ad.setCommentsCount(ad.getCommentsCount() + 1);
        adRepository.save(ad);

        return mapCommentToDto(saved);
    }

    private AdResponseDto mapToDto(Ad ad, UUID userId) {
        AdResponseDto dto = new AdResponseDto();
        dto.setId(ad.getId());
        dto.setTitle(ad.getTitle());
        dto.setImageUrl(ad.getImageUrl());
        dto.setDestinationUrl(ad.getDestinationUrl());
        dto.setAllowComments(ad.isAllowComments());
        dto.setLikes(ad.getLikesCount());
        dto.setCommentsCount(ad.getCommentsCount());

        if (userId != null) {
            dto.setLiked(adLikeRepository.existsByIdAdIdAndIdUserId(ad.getId(), userId));
        }

        return dto;
    }

    private CommentResponseDto mapCommentToDto(AdComment comment) {
        CommentResponseDto dto = new CommentResponseDto();
        dto.setId(comment.getId());
        dto.setPostId(comment.getAd().getId());
        dto.setAuthorId(comment.getAuthor().getId());

        Optional<Profile> profileOpt = profileRepository.findByUserId(comment.getAuthor().getId());
        dto.setAuthorName(profileOpt.map(Profile::getFullName).orElse(comment.getAuthor().getEmail()));
        dto.setInitials(profileOpt.map(Profile::getInitials).orElse("U"));
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
        long days = hours / 24;
        return days + "d ago";
    }
}
