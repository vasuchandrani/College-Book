package com.collegebook.collegebookbackend.profile.controller;

import com.collegebook.collegebookbackend.auth.UserPrincipal;
import com.collegebook.collegebookbackend.common.CurrentUser;
import com.collegebook.collegebookbackend.profile.dto.ProfileDto;
import com.collegebook.collegebookbackend.profile.dto.ProfileUpdateDto;
import com.collegebook.collegebookbackend.profile.dto.PublicProfileDto;
import com.collegebook.collegebookbackend.profile.service.ProfileService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1")
public class ProfileController {

    private final ProfileService profileService;

    public ProfileController(ProfileService profileService) {
        this.profileService = profileService;
    }

    @GetMapping("/profiles/me")
    public ResponseEntity<ProfileDto> getMyProfile(@CurrentUser UserPrincipal currentUser) {
        return ResponseEntity.ok(profileService.getMyProfile(currentUser.getId()));
    }

    @PatchMapping("/profiles/me")
    public ResponseEntity<ProfileDto> updateMyProfile(
            @CurrentUser UserPrincipal currentUser,
            @Valid @RequestBody ProfileUpdateDto updateDto) {
        return ResponseEntity.ok(profileService.updateMyProfile(currentUser.getId(), updateDto));
    }

    @GetMapping("/students/{slug}")
    public ResponseEntity<PublicProfileDto> getStudentBySlug(@PathVariable("slug") String slug) {
        return ResponseEntity.ok(profileService.getStudentBySlug(slug));
    }

    @GetMapping("/students/verify-member")
    public ResponseEntity<java.util.Map<String, Object>> verifyMember(
            @org.springframework.web.bind.annotation.RequestParam("query") String query) {
        if (query == null || query.isBlank()) {
            return ResponseEntity.ok(java.util.Map.of("exists", false, "message", "Username query is empty"));
        }
        String clean = query.trim().replaceFirst("^@", "");
        java.util.Optional<PublicProfileDto> profileOpt = profileService.findStudentByHandleOrName(clean);
        if (profileOpt.isPresent()) {
            return ResponseEntity.ok(java.util.Map.of(
                "exists", true,
                "student", profileOpt.get()
            ));
        } else {
            return ResponseEntity.ok(java.util.Map.of(
                "exists", false,
                "message", "Student @" + clean + " not found in CollegeBook. Make sure they have registered."
            ));
        }
    }

    @GetMapping("/campus/students")
    public ResponseEntity<java.util.List<PublicProfileDto>> getCampusStudents(@CurrentUser UserPrincipal currentUser) {
        UUID collegeId = currentUser != null ? currentUser.getCollegeId() : null;
        UUID currentUserId = currentUser != null ? currentUser.getId() : null;
        if (collegeId == null) {
            return ResponseEntity.ok(java.util.List.of());
        }
        return ResponseEntity.ok(profileService.getStudentsByCollege(collegeId, currentUserId));
    }

    @org.springframework.web.bind.annotation.PostMapping("/profiles/me/memory-book-email/otp")
    public ResponseEntity<java.util.Map<String, String>> sendMemoryBookEmailOtp(
            @CurrentUser UserPrincipal currentUser,
            @RequestBody java.util.Map<String, String> body) {
        String email = body != null ? body.get("email") : null;
        profileService.sendMemoryBookEmailOtp(currentUser.getId(), email);
        return ResponseEntity.ok(java.util.Map.of("message", "Verification code sent to " + email));
    }

    @org.springframework.web.bind.annotation.PostMapping("/profiles/me/memory-book-email/verify")
    public ResponseEntity<ProfileDto> verifyAndSetMemoryBookEmail(
            @CurrentUser UserPrincipal currentUser,
            @RequestBody java.util.Map<String, String> body) {
        String email = body != null ? body.get("email") : null;
        String otp = body != null ? body.get("otp") : null;
        ProfileDto updated = profileService.verifyAndSetMemoryBookEmail(currentUser.getId(), email, otp);
        return ResponseEntity.ok(updated);
    }

    @org.springframework.web.bind.annotation.DeleteMapping("/profiles/me/memory-book-email")
    public ResponseEntity<ProfileDto> removeMemoryBookEmail(@CurrentUser UserPrincipal currentUser) {
        ProfileDto updated = profileService.removeMemoryBookEmail(currentUser.getId());
        return ResponseEntity.ok(updated);
    }
}
