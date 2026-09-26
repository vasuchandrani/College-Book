package com.collegebook.collegebookbackend.admin.service;

import com.collegebook.collegebookbackend.ad.dto.AdResponseDto;
import com.collegebook.collegebookbackend.admin.dto.CreateAdRequest;
import com.collegebook.collegebookbackend.college.dto.BranchDto;
import com.collegebook.collegebookbackend.college.dto.CollegeDto;
import com.collegebook.collegebookbackend.college.dto.CourseDto;
import com.collegebook.collegebookbackend.common.PageResponse;
import com.collegebook.collegebookbackend.post.dto.PostResponseDto;

import java.util.List;
import java.util.Map;
import java.util.UUID;

public interface AdminService {
    Map<String, Long> getAdminStats();
    List<AdResponseDto> getAllAds();
    AdResponseDto createAd(CreateAdRequest request);
    void deleteAd(UUID adId);
    Map<String, Object> toggleAllAds(boolean active);
    AdResponseDto toggleAdStatus(UUID adId, boolean active);
    AdResponseDto toggleAdComments(UUID adId, boolean commentsEnabled);
    PageResponse<PostResponseDto> getCampusFeed(UUID collegeId, int page, int size);
    PageResponse<PostResponseDto> getCampusFeed(String collegeIdStr, int page, int size);
    PageResponse<PostResponseDto> getExploreFeed(int page, int size);
    void deletePostByAdmin(UUID postId);

    // Colleges CRUD
    CollegeDto createCollege(CollegeDto dto);
    CollegeDto updateCollege(UUID id, CollegeDto dto);
    void deleteCollege(UUID id);

    // Courses CRUD
    CourseDto createCourse(CourseDto dto);
    CourseDto updateCourse(UUID id, CourseDto dto);
    void deleteCourse(UUID id);

    // Branches CRUD
    BranchDto createBranch(BranchDto dto);
    BranchDto updateBranch(UUID id, BranchDto dto);
    void deleteBranch(UUID id);
}
