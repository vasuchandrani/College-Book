package com.collegebook.collegebookbackend.collab.service;

import com.collegebook.collegebookbackend.collab.dto.CreateTeamRequest;
import com.collegebook.collegebookbackend.collab.dto.UpdateJoinRequestDto;
import com.collegebook.collegebookbackend.collab.dto.UpdateTeamRequest;
import com.collegebook.collegebookbackend.collab.dto.JoinRequestResponseDto;
import com.collegebook.collegebookbackend.collab.dto.RespondJoinRequestDto;
import com.collegebook.collegebookbackend.collab.dto.SendJoinRequestDto;
import com.collegebook.collegebookbackend.collab.dto.TeamResponseDto;
import com.collegebook.collegebookbackend.collab.entity.TeamType;
import com.collegebook.collegebookbackend.common.PageResponse;

import com.collegebook.collegebookbackend.collab.dto.CreateDiscussionRequest;
import com.collegebook.collegebookbackend.collab.dto.TeamDiscussionResponseDto;

import java.util.List;
import java.util.Map;
import java.util.UUID;

public interface CollabService {
    PageResponse<TeamResponseDto> getTeams(UUID userId, UUID collegeId, TeamType type, int page, int size);
    PageResponse<TeamResponseDto> getPublicTeams(UUID collegeId, TeamType type, int page, int size);
    List<TeamResponseDto> getMyTeams(UUID userId);
    List<TeamResponseDto> getMyTeams(UUID userId, TeamType type);
    List<TeamResponseDto> getTeamsByUserId(UUID requesterId, UUID targetUserId);
    List<JoinRequestResponseDto> getMyJoinRequests(UUID userId);
    List<JoinRequestResponseDto> getMyIncomingRequests(UUID ownerId);
    List<JoinRequestResponseDto> getTeamJoinRequests(UUID ownerId, UUID teamId);
    JoinRequestResponseDto updateJoinRequest(UUID userId, UUID requestId, UpdateJoinRequestDto request);
    TeamResponseDto createTeam(UUID userId, CreateTeamRequest request);
    TeamResponseDto updateTeam(UUID userId, UUID teamId, UpdateTeamRequest request);
    JoinRequestResponseDto sendJoinRequest(UUID userId, UUID teamId, SendJoinRequestDto request);
    JoinRequestResponseDto respondJoinRequest(UUID ownerId, UUID requestId, RespondJoinRequestDto request);
    TeamResponseDto getTeamById(UUID userId, UUID teamId);
    List<TeamResponseDto> getStarredTeams(UUID userId);
    Map<String, Object> toggleStar(UUID userId, UUID teamId);
    TeamResponseDto markComplete(UUID ownerId, UUID teamId);
    void deleteTeam(UUID ownerId, UUID teamId);
    TeamResponseDto addMember(UUID ownerId, UUID teamId, String handle);
    TeamResponseDto removeMember(UUID ownerId, UUID teamId, UUID memberUserId);
    void deleteJoinRequest(UUID userId, UUID requestId);
    PageResponse<TeamDiscussionResponseDto> getDiscussions(UUID teamId, int page, int size);
    TeamDiscussionResponseDto addDiscussion(UUID userId, UUID teamId, CreateDiscussionRequest request);
    void deleteDiscussion(UUID userId, UUID teamId, UUID discussionId);
    com.collegebook.collegebookbackend.collab.dto.CollabBadgeCountDto getCollabBadgeCount(UUID userId);
    void markRoomAsRead(UUID teamId, UUID userId);
}
