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
import com.collegebook.collegebookbackend.post.repository.PostRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.UUID;

@Service
public class AdminServiceImpl implements AdminService {

    private final UserRepository userRepository;
    private final PostRepository postRepository;
    private final TeamRepository teamRepository;
    private final AdRepository adRepository;

    public AdminServiceImpl(
            UserRepository userRepository,
            PostRepository postRepository,
            TeamRepository teamRepository,
            AdRepository adRepository
    ) {
        this.userRepository = userRepository;
        this.postRepository = postRepository;
        this.teamRepository = teamRepository;
        this.adRepository = adRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, Long> getAdminStats() {
        long students = userRepository.count();
        long posts = postRepository.count();
        long teams = teamRepository.count();
        long ads = adRepository.count();

        return Map.of(
                "students", students,
                "posts", posts,
                "teams", teams,
                "ads", ads
        );
    }

    @Override
    @Transactional
    public AdResponseDto createAd(CreateAdRequest request) {
        Ad ad = new Ad();
        ad.setTitle(request.getTitle());
        ad.setImageUrl(request.getImageUrl());
        ad.setDestinationUrl(request.getDestinationUrl());
        ad.setAllowComments(request.isAllowComments());
        ad.setActive(true);

        Ad saved = adRepository.save(ad);

        AdResponseDto dto = new AdResponseDto();
        dto.setId(saved.getId());
        dto.setTitle(saved.getTitle());
        dto.setImageUrl(saved.getImageUrl());
        dto.setDestinationUrl(saved.getDestinationUrl());
        dto.setAllowComments(saved.isAllowComments());
        dto.setLikes(0);
        dto.setCommentsCount(0);

        return dto;
    }

    @Override
    @Transactional
    public void deleteAd(UUID adId) {
        Ad ad = adRepository.findById(adId)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "Ad not found"));
        adRepository.delete(ad);
    }
}
