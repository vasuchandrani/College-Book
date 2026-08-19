package com.collegebook.collegebookbackend.admin.service;

import com.collegebook.collegebookbackend.ad.dto.AdResponseDto;
import com.collegebook.collegebookbackend.admin.dto.CreateAdRequest;

import java.util.Map;
import java.util.UUID;

public interface AdminService {
    Map<String, Long> getAdminStats();
    AdResponseDto createAd(CreateAdRequest request);
    void deleteAd(UUID adId);
}
