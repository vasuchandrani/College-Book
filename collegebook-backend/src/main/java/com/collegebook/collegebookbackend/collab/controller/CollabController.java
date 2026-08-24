package com.collegebook.collegebookbackend.collab.controller;

import com.collegebook.collegebookbackend.auth.UserPrincipal;
import com.collegebook.collegebookbackend.collab.dto.CreateDiscussionRequest;
import com.collegebook.collegebookbackend.collab.dto.CreateTeamRequest;
import com.collegebook.collegebookbackend.collab.dto.JoinRequestResponseDto;
import com.collegebook.collegebookbackend.collab.dto.RespondJoinRequestDto;
import com.collegebook.collegebookbackend.collab.dto.SendJoinRequestDto;
import com.collegebook.collegebookbackend.collab.dto.TeamDiscussionResponseDto;
import com.collegebook.collegebookbackend.collab.dto.TeamResponseDto;
import com.collegebook.collegebookbackend.collab.dto.UpdateJoinRequestDto;
import com.collegebook.collegebookbackend.collab.dto.UpdateTeamRequest;
import com.collegebook.collegebookbackend.collab.entity.TeamType;
import com.collegebook.collegebookbackend.collab.service.CollabService;
import com.collegebook.collegebookbackend.common.CurrentUser;
import com.collegebook.collegebookbackend.common.PageResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import com.collegebook.collegebookbackend.collab.dto.AddMemberRequest;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class CollabController {

    private final CollabService collabService;

    @GetMapping("/teams")
    public ResponseEntity<PageResponse<TeamResponseDto>> getTeams(
            @CurrentUser UserPrincipal currentUser,
            @RequestParam(value = "type", required = false) TeamType type,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "20") int size) {
        UUID userId = currentUser != null ? currentUser.getId() : null;
        UUID collegeId = currentUser != null ? currentUser.getCollegeId() : null;
        return ResponseEntity.ok(collabService.getTeams(userId, collegeId, type, page, size));
    }

    @GetMapping("/teams/my")
    public ResponseEntity<List<TeamResponseDto>> getMyTeams(
            @CurrentUser UserPrincipal currentUser,
            @RequestParam(value = "type", required = false) TeamType type) {
        UUID userId = currentUser != null ? currentUser.getId() : null;
        return ResponseEntity.ok(collabService.getMyTeams(userId, type));
    }

    @GetMapping("/teams/my/open-source")
    public ResponseEntity<List<TeamResponseDto>> getMyOpenSourceProjects(@CurrentUser UserPrincipal currentUser) {
        UUID userId = currentUser != null ? currentUser.getId() : null;
        return ResponseEntity.ok(collabService.getMyTeams(userId, TeamType.OPEN_SOURCE));
    }

    @GetMapping("/teams/starred")
    public ResponseEntity<List<TeamResponseDto>> getStarredTeams(@CurrentUser UserPrincipal currentUser) {
        UUID userId = currentUser != null ? currentUser.getId() : null;
        return ResponseEntity.ok(collabService.getStarredTeams(userId));
    }

    @GetMapping("/teams/user/{userId}")
    public ResponseEntity<List<TeamResponseDto>> getTeamsByUserId(
            @CurrentUser UserPrincipal currentUser,
            @PathVariable("userId") UUID userId) {
        UUID requesterId = currentUser != null ? currentUser.getId() : null;
        return ResponseEntity.ok(collabService.getTeamsByUserId(requesterId, userId));
    }

    @GetMapping("/teams/{id}")
    public ResponseEntity<TeamResponseDto> getTeamById(
            @CurrentUser UserPrincipal currentUser,
            @PathVariable("id") UUID teamId) {
        UUID userId = currentUser != null ? currentUser.getId() : null;
        return ResponseEntity.ok(collabService.getTeamById(userId, teamId));
    }

    @GetMapping("/teams/{id}/requests")
    public ResponseEntity<List<JoinRequestResponseDto>> getTeamJoinRequests(
            @CurrentUser UserPrincipal currentUser,
            @PathVariable("id") UUID teamId) {
        UUID userId = currentUser != null ? currentUser.getId() : null;
        return ResponseEntity.ok(collabService.getTeamJoinRequests(userId, teamId));
    }

    @GetMapping("/teams/my/incoming-requests")
    public ResponseEntity<List<JoinRequestResponseDto>> getMyIncomingRequests(@CurrentUser UserPrincipal currentUser) {
        UUID userId = currentUser != null ? currentUser.getId() : null;
        return ResponseEntity.ok(collabService.getMyIncomingRequests(userId));
    }

    @GetMapping("/join-requests/my")
    public ResponseEntity<List<JoinRequestResponseDto>> getMyJoinRequests(@CurrentUser UserPrincipal currentUser) {
        UUID userId = currentUser != null ? currentUser.getId() : null;
        return ResponseEntity.ok(collabService.getMyJoinRequests(userId));
    }

    @PutMapping("/join-requests/{id}")
    public ResponseEntity<JoinRequestResponseDto> updateJoinRequest(
            @CurrentUser UserPrincipal currentUser,
            @PathVariable("id") UUID requestId,
            @Valid @RequestBody UpdateJoinRequestDto request) {
        UUID userId = currentUser != null ? currentUser.getId() : null;
        return ResponseEntity.ok(collabService.updateJoinRequest(userId, requestId, request));
    }

    @DeleteMapping("/join-requests/{id}")
    public ResponseEntity<Map<String, String>> deleteJoinRequest(
            @CurrentUser UserPrincipal currentUser,
            @PathVariable("id") UUID requestId) {
        UUID userId = currentUser != null ? currentUser.getId() : null;
        collabService.deleteJoinRequest(userId, requestId);
        return ResponseEntity.ok(Map.of("message", "Join request withdrawn successfully"));
    }

    @PostMapping("/teams")
    public ResponseEntity<TeamResponseDto> createTeam(
            @CurrentUser UserPrincipal currentUser,
            @Valid @RequestBody CreateTeamRequest request) {
        UUID userId = currentUser != null ? currentUser.getId() : null;
        return ResponseEntity.ok(collabService.createTeam(userId, request));
    }

    @PutMapping("/teams/{id}")
    public ResponseEntity<TeamResponseDto> updateTeam(
            @CurrentUser UserPrincipal currentUser,
            @PathVariable("id") UUID teamId,
            @Valid @RequestBody UpdateTeamRequest request) {
        UUID userId = currentUser != null ? currentUser.getId() : null;
        return ResponseEntity.ok(collabService.updateTeam(userId, teamId, request));
    }

    @DeleteMapping("/teams/{id}")
    public ResponseEntity<Map<String, String>> deleteTeam(
            @CurrentUser UserPrincipal currentUser,
            @PathVariable("id") UUID teamId) {
        UUID userId = currentUser != null ? currentUser.getId() : null;
        collabService.deleteTeam(userId, teamId);
        return ResponseEntity.ok(Map.of("message", "Team/project deleted successfully"));
    }

    @PostMapping("/teams/{id}/members")
    public ResponseEntity<TeamResponseDto> addMember(
            @CurrentUser UserPrincipal currentUser,
            @PathVariable("id") UUID teamId,
            @Valid @RequestBody AddMemberRequest request) {
        UUID userId = currentUser != null ? currentUser.getId() : null;
        return ResponseEntity.ok(collabService.addMember(userId, teamId, request.getHandle()));
    }

    @DeleteMapping("/teams/{id}/members/{userId}")
    public ResponseEntity<TeamResponseDto> removeMember(
            @CurrentUser UserPrincipal currentUser,
            @PathVariable("id") UUID teamId,
            @PathVariable("userId") UUID memberUserId) {
        UUID userId = currentUser != null ? currentUser.getId() : null;
        return ResponseEntity.ok(collabService.removeMember(userId, teamId, memberUserId));
    }

    @PostMapping("/teams/{id}/join")
    public ResponseEntity<JoinRequestResponseDto> sendJoinRequest(
            @CurrentUser UserPrincipal currentUser,
            @PathVariable("id") UUID teamId,
            @Valid @RequestBody SendJoinRequestDto request) {
        UUID userId = currentUser != null ? currentUser.getId() : null;
        return ResponseEntity.ok(collabService.sendJoinRequest(userId, teamId, request));
    }

    @PatchMapping("/join-requests/{id}")
    public ResponseEntity<JoinRequestResponseDto> respondJoinRequest(
            @CurrentUser UserPrincipal currentUser,
            @PathVariable("id") UUID requestId,
            @Valid @RequestBody RespondJoinRequestDto request) {
        UUID userId = currentUser != null ? currentUser.getId() : null;
        return ResponseEntity.ok(collabService.respondJoinRequest(userId, requestId, request));
    }

    @PostMapping("/teams/{id}/star")
    public ResponseEntity<Map<String, Object>> toggleStar(
            @CurrentUser UserPrincipal currentUser,
            @PathVariable("id") UUID teamId) {
        UUID userId = currentUser != null ? currentUser.getId() : null;
        return ResponseEntity.ok(collabService.toggleStar(userId, teamId));
    }

    @PatchMapping("/teams/{id}/complete")
    public ResponseEntity<TeamResponseDto> markComplete(
            @CurrentUser UserPrincipal currentUser,
            @PathVariable("id") UUID teamId) {
        UUID userId = currentUser != null ? currentUser.getId() : null;
        return ResponseEntity.ok(collabService.markComplete(userId, teamId));
    }

    @GetMapping("/teams/{id}/discussions")
    public ResponseEntity<PageResponse<TeamDiscussionResponseDto>> getDiscussions(
            @PathVariable("id") UUID teamId,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "20") int size) {
        return ResponseEntity.ok(collabService.getDiscussions(teamId, page, size));
    }

    @PostMapping("/teams/{id}/discussions")
    public ResponseEntity<TeamDiscussionResponseDto> addDiscussion(
            @CurrentUser UserPrincipal currentUser,
            @PathVariable("id") UUID teamId,
            @Valid @RequestBody CreateDiscussionRequest request) {
        UUID userId = currentUser != null ? currentUser.getId() : null;
        return ResponseEntity.ok(collabService.addDiscussion(userId, teamId, request));
    }

    @DeleteMapping("/teams/{id}/discussions/{discussionId}")
    public ResponseEntity<Map<String, String>> deleteDiscussion(
            @CurrentUser UserPrincipal currentUser,
            @PathVariable("id") UUID teamId,
            @PathVariable("discussionId") UUID discussionId) {
        UUID userId = currentUser != null ? currentUser.getId() : null;
        collabService.deleteDiscussion(userId, teamId, discussionId);
        return ResponseEntity.ok(Map.of("message", "Discussion comment deleted successfully"));
    }
}
