package com.collegebook.collegebookbackend.profile.service;

import com.collegebook.collegebookbackend.profile.dto.ProfileDto;
import com.collegebook.collegebookbackend.profile.dto.ProfileUpdateDto;
import com.collegebook.collegebookbackend.profile.dto.PublicProfileDto;

import java.util.List;
import java.util.UUID;

public interface ProfileService {
    ProfileDto getMyProfile(UUID userId);
    com.collegebook.collegebookbackend.profile.dto.ProfileHeaderDto getMyProfileHeader(UUID userId);
    com.collegebook.collegebookbackend.profile.dto.ProfileAboutDto getMyProfileAbout(UUID userId);
    ProfileDto updateMyProfile(UUID userId, ProfileUpdateDto updateDto);
    PublicProfileDto getStudentBySlug(String slug);
    com.collegebook.collegebookbackend.profile.dto.PublicProfileHeaderDto getStudentHeaderBySlug(String slug);
    com.collegebook.collegebookbackend.profile.dto.PublicProfileAboutDto getStudentAboutBySlug(String slug);
    List<PublicProfileDto> getStudentsByCollege(UUID collegeId, UUID excludeUserId);
    void sendMemoryBookEmailOtp(UUID userId, String targetEmail);
    ProfileDto verifyAndSetMemoryBookEmail(UUID userId, String targetEmail, String otpCode);
    ProfileDto removeMemoryBookEmail(UUID userId);
    java.util.Optional<PublicProfileDto> findStudentByHandleOrName(String handleOrName);
}
