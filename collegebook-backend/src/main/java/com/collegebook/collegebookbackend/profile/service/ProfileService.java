package com.collegebook.collegebookbackend.profile.service;

import com.collegebook.collegebookbackend.profile.dto.ProfileDto;
import com.collegebook.collegebookbackend.profile.dto.ProfileUpdateDto;
import com.collegebook.collegebookbackend.profile.dto.PublicProfileDto;

import java.util.List;
import java.util.UUID;

public interface ProfileService {
    ProfileDto getMyProfile(UUID userId);
    ProfileDto updateMyProfile(UUID userId, ProfileUpdateDto updateDto);
    PublicProfileDto getStudentBySlug(String slug);
    List<PublicProfileDto> getStudentsByCollege(UUID collegeId, UUID excludeUserId);
    void sendMemoryBookEmailOtp(UUID userId, String targetEmail);
    ProfileDto verifyAndSetMemoryBookEmail(UUID userId, String targetEmail, String otpCode);
    ProfileDto removeMemoryBookEmail(UUID userId);
    java.util.Optional<PublicProfileDto> findStudentByHandleOrName(String handleOrName);
}
