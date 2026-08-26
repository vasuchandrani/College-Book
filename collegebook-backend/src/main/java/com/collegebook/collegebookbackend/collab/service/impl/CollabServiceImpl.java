package com.collegebook.collegebookbackend.collab.service.impl;

import com.collegebook.collegebookbackend.auth.entity.User;
import com.collegebook.collegebookbackend.auth.repository.UserRepository;
import com.collegebook.collegebookbackend.collab.dto.CreateTeamRequest;
import com.collegebook.collegebookbackend.collab.dto.UpdateJoinRequestDto;
import com.collegebook.collegebookbackend.collab.dto.UpdateTeamRequest;
import com.collegebook.collegebookbackend.collab.dto.JoinRequestResponseDto;
import com.collegebook.collegebookbackend.collab.dto.RespondJoinRequestDto;
import com.collegebook.collegebookbackend.collab.dto.SendJoinRequestDto;
import com.collegebook.collegebookbackend.collab.dto.TeamResponseDto;
import com.collegebook.collegebookbackend.collab.entity.JoinRequest;
import com.collegebook.collegebookbackend.collab.entity.JoinRequestStatus;
import com.collegebook.collegebookbackend.collab.entity.Team;
import com.collegebook.collegebookbackend.collab.entity.TeamMember;
import com.collegebook.collegebookbackend.collab.entity.TeamMemberRole;
import com.collegebook.collegebookbackend.collab.entity.TeamStar;
import com.collegebook.collegebookbackend.collab.entity.TeamType;
import com.collegebook.collegebookbackend.collab.dto.CreateDiscussionRequest;
import com.collegebook.collegebookbackend.collab.dto.TeamDiscussionResponseDto;
import com.collegebook.collegebookbackend.collab.entity.TeamDiscussion;
import com.collegebook.collegebookbackend.collab.repository.JoinRequestRepository;
import com.collegebook.collegebookbackend.collab.repository.TeamDiscussionRepository;
import com.collegebook.collegebookbackend.collab.repository.TeamMemberRepository;
import com.collegebook.collegebookbackend.collab.repository.TeamRepository;
import com.collegebook.collegebookbackend.collab.repository.TeamStarRepository;
import com.collegebook.collegebookbackend.collab.service.CollabService;
import com.collegebook.collegebookbackend.common.AppException;
import com.collegebook.collegebookbackend.common.ErrorCode;
import com.collegebook.collegebookbackend.common.PageResponse;
import com.collegebook.collegebookbackend.profile.entity.Profile;
import com.collegebook.collegebookbackend.profile.repository.ProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.context.annotation.Lazy;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CollabServiceImpl implements CollabService {

    private final TeamRepository teamRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final JoinRequestRepository joinRequestRepository;
    private final TeamStarRepository teamStarRepository;
    private final TeamDiscussionRepository teamDiscussionRepository;
    private final UserRepository userRepository;
    private final ProfileRepository profileRepository;
    private final com.collegebook.collegebookbackend.social.SocialInteractionService socialInteractionService;

    @Lazy
    @Autowired
    private CollabService self;

    @Override
    public PageResponse<TeamResponseDto> getTeams(UUID userId, UUID collegeId, TeamType type, int page, int size) {
        PageResponse<TeamResponseDto> publicPage = (self != null ? self : this).getPublicTeams(collegeId, type, page, size);
        return overlayUserTeamPersonalization(publicPage, userId);
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(
            value = "collab_teams",
            key = "(#collegeId != null ? #collegeId.toString() : 'all') + ':' + (#type != null ? #type.name() : 'all') + ':' + #page + ':' + #size"
    )
    public PageResponse<TeamResponseDto> getPublicTeams(UUID collegeId, TeamType type, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Team> teamsPage;

        if (type != null) {
            teamsPage = teamRepository.findByCollegeIdAndTypeAndCompletedFalse(collegeId, type, pageable);
        } else {
            teamsPage = teamRepository.findByCollegeIdAndCompletedFalse(collegeId, pageable);
        }

        List<TeamResponseDto> content = teamsPage.getContent().stream()
                .map(this::mapToPublicTeamDto)
                .collect(Collectors.toList());

        return PageResponse.of(content, teamsPage.getNumber(), teamsPage.getSize(), teamsPage.getTotalElements());
    }

    private PageResponse<TeamResponseDto> overlayUserTeamPersonalization(PageResponse<TeamResponseDto> publicPage, UUID userId) {
        if (publicPage == null || publicPage.getItems() == null) {
            return publicPage;
        }

        List<TeamResponseDto> personalized = publicPage.getItems().stream()
                .map(dto -> {
                    int effectiveStars = (int) socialInteractionService.getTeamStarsCount(dto.getId(), dto.getStarsCount());
                    boolean starred = userId != null && socialInteractionService.isTeamStarredByUser(dto.getId(), userId);
                    return dto.toBuilder()
                            .starsCount(effectiveStars)
                            .starred(starred)
                            .build();
                })
                .collect(Collectors.toList());

        return PageResponse.of(personalized, publicPage.getPage(), publicPage.getSize(), publicPage.getTotalItems());
    }

    private TeamResponseDto mapToPublicTeamDto(Team team) {
        return mapToTeamDto(team, null);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TeamResponseDto> getMyTeams(UUID userId) {
        return getMyTeams(userId, null);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TeamResponseDto> getMyTeams(UUID userId, TeamType type) {
        List<Team> myTeams;
        if (type != null) {
            myTeams = teamRepository.findMyTeamsByType(userId, type);
        } else {
            myTeams = teamRepository.findMyTeams(userId);
        }
        return myTeams.stream()
                .map(t -> mapToTeamDto(t, userId))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<TeamResponseDto> getTeamsByUserId(UUID requesterId, UUID targetUserId) {
        List<Team> teams = teamRepository.findMyTeams(targetUserId);
        return teams.stream()
                .map(t -> mapToTeamDto(t, requesterId))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<JoinRequestResponseDto> getMyJoinRequests(UUID userId) {
        List<JoinRequest> requests = joinRequestRepository.findByApplicantIdOrderByCreatedAtDesc(userId);
        return requests.stream()
                .map(this::mapToJoinRequestDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<JoinRequestResponseDto> getMyIncomingRequests(UUID ownerId) {
        List<JoinRequest> requests = joinRequestRepository.findByTeamOwnerIdOrderByCreatedAtDesc(ownerId);
        return requests.stream()
                .map(this::mapToJoinRequestDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<JoinRequestResponseDto> getTeamJoinRequests(UUID ownerId, UUID teamId) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new AppException(ErrorCode.TEAM_NOT_FOUND, "Team/Project not found"));
        if (!team.getOwner().getId().equals(ownerId)) {
            throw new AppException(ErrorCode.FORBIDDEN, "Only the team lead/owner can view join requests");
        }
        List<JoinRequest> requests = joinRequestRepository.findByTeamIdOrderByCreatedAtDesc(teamId);
        return requests.stream()
                .map(this::mapToJoinRequestDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public JoinRequestResponseDto updateJoinRequest(UUID userId, UUID requestId, UpdateJoinRequestDto request) {
        JoinRequest joinReq = joinRequestRepository.findById(requestId)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "Join request not found"));

        if (!joinReq.getApplicant().getId().equals(userId)) {
            throw new AppException(ErrorCode.FORBIDDEN, "You can only edit your own join requests");
        }

        if (joinReq.getStatus() != JoinRequestStatus.PENDING) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Cannot edit a request that has already been accepted or rejected");
        }

        if (request.getRole() != null && !request.getRole().isBlank()) {
            joinReq.setRole(request.getRole().trim());
        }
        if (request.getMessage() != null) {
            joinReq.setMessage(request.getMessage());
        }

        JoinRequest saved = joinRequestRepository.save(joinReq);
        return mapToJoinRequestDto(saved);
    }

    @Override
    @Transactional
    @CacheEvict(value = "collab_teams", allEntries = true)
    public TeamResponseDto createTeam(UUID userId, CreateTeamRequest request) {
        User owner = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND, "User not found"));

        Team team = new Team();
        team.setOwner(owner);
        team.setCollege(owner.getCollege());
        team.setTitle(request.getTitle());
        team.setType(request.getType());
        team.setDescription(request.getDescription());
        team.setGithubLink(request.getGithubLink());
        team.setSkills(request.getSkills() != null ? request.getSkills() : Collections.emptyList());
        List<String> roles = request.getRequiredRoles() != null ? request.getRequiredRoles() :
                (request.getRequiredExpertise() != null ? request.getRequiredExpertise() : Collections.emptyList());
        team.setRequiredRoles(roles);
        team.setRequiredExpertise(roles);

        // Open source projects have unlimited members (maxMembers=0)
        if (request.getType() == TeamType.OPEN_SOURCE) {
            team.setMaxMembers(0);
        } else {
            team.setMaxMembers(Math.max(2, request.getMaxMembers()));
        }

        team.setCurrentMembersCount(1);

        // Denormalize college name for filtering
        if (owner.getCollege() != null) {
            team.setOwnerCollegeName(owner.getCollege().getName());
        }

        Team savedTeam = teamRepository.save(team);

        // Add owner as TeamMember
        TeamMember member = new TeamMember(savedTeam, owner, TeamMemberRole.OWNER);
        teamMemberRepository.save(member);

        // Add initial members if provided
        if (request.getMemberHandles() != null && !request.getMemberHandles().isEmpty() && request.getType() != TeamType.OPEN_SOURCE) {
            for (String handle : request.getMemberHandles()) {
                if (handle == null || handle.trim().isBlank()) continue;
                String cleanHandle = handle.trim().replaceFirst("^@", "");
                Optional<Profile> memberProfileOpt = profileRepository.findByHandleIgnoreCase(cleanHandle);
                if (memberProfileOpt.isEmpty()) {
                    memberProfileOpt = profileRepository.findFirstByFullNameIgnoreCase(cleanHandle);
                }
                if (memberProfileOpt.isPresent()) {
                    Profile memberProfile = memberProfileOpt.get();
                    UUID memberUserId = memberProfile.getUserId();
                    if (!memberUserId.equals(owner.getId()) && !teamMemberRepository.existsByIdTeamIdAndIdUserId(savedTeam.getId(), memberUserId)) {
                        User memberUser = memberProfile.getUser();
                        if (memberUser == null) {
                            memberUser = userRepository.findById(memberUserId).orElse(null);
                        }
                        if (memberUser != null) {
                            teamMemberRepository.save(new TeamMember(savedTeam, memberUser, TeamMemberRole.MEMBER));
                            savedTeam.setCurrentMembersCount(savedTeam.getCurrentMembersCount() + 1);
                        }
                    }
                }
            }
            savedTeam = teamRepository.save(savedTeam);
        }

        return mapToTeamDto(savedTeam, userId);
    }

    @Override
    @Transactional
    @CacheEvict(value = "collab_teams", allEntries = true)
    public TeamResponseDto updateTeam(UUID userId, UUID teamId, UpdateTeamRequest request) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new AppException(ErrorCode.TEAM_NOT_FOUND, "Team/Project not found"));

        if (!team.getOwner().getId().equals(userId)) {
            throw new AppException(ErrorCode.FORBIDDEN, "Only the owner/lead can edit this project or team");
        }

        if (team.isCompleted()) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Hiring for this team is completed. Completed projects/teams cannot be edited.");
        }

        if (request.getTitle() != null && !request.getTitle().isBlank()) {
            team.setTitle(request.getTitle().trim());
        }
        if (request.getDescription() != null) {
            team.setDescription(request.getDescription());
        }
        if (request.getGithubLink() != null) {
            team.setGithubLink(request.getGithubLink());
        }
        if (request.getSkills() != null) {
            team.setSkills(request.getSkills());
        }
        if (request.getRequiredRoles() != null) {
            team.setRequiredRoles(request.getRequiredRoles());
            team.setRequiredExpertise(request.getRequiredRoles());
        } else if (request.getRequiredExpertise() != null) {
            team.setRequiredRoles(request.getRequiredExpertise());
            team.setRequiredExpertise(request.getRequiredExpertise());
        }
        if (request.getType() != null) {
            team.setType(request.getType());
        }
        if (team.getType() == TeamType.OPEN_SOURCE) {
            team.setMaxMembers(0);
        } else if (request.getMaxMembers() != null && request.getMaxMembers() >= 2) {
            team.setMaxMembers(request.getMaxMembers());
        }

        Team updated = teamRepository.save(team);
        return mapToTeamDto(updated, userId);
    }

    @Override
    @Transactional
    public JoinRequestResponseDto sendJoinRequest(UUID userId, UUID teamId, SendJoinRequestDto request) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new AppException(ErrorCode.TEAM_NOT_FOUND, "Team not found"));

        // Block join requests for open source projects
        if (team.getType() == TeamType.OPEN_SOURCE) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Open source projects don't accept join requests. Contribute directly via GitHub.");
        }

        if (team.isCompleted()) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Hiring for this team is completed and is no longer accepting new requests.");
        }

        if (team.getMaxMembers() > 0 && team.getCurrentMembersCount() >= team.getMaxMembers()) {
            throw new AppException(ErrorCode.TEAM_FULL, "This team has no open slots");
        }

        if (teamMemberRepository.existsByIdTeamIdAndIdUserId(teamId, userId)) {
            throw new AppException(ErrorCode.ALREADY_MEMBER, "You are already a member of this team");
        }

        if (joinRequestRepository.existsByTeamIdAndApplicantIdAndStatus(teamId, userId, JoinRequestStatus.PENDING)) {
            throw new AppException(ErrorCode.REQUEST_EXISTS, "You already have a pending join request for this team");
        }

        User applicant = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND, "User not found"));

        JoinRequest req = new JoinRequest();
        req.setTeam(team);
        req.setApplicant(applicant);
        req.setRole(request.getRole());
        req.setMessage(request.getMessage());
        req.setStatus(JoinRequestStatus.PENDING);

        JoinRequest saved = joinRequestRepository.save(req);
        return mapToJoinRequestDto(saved);
    }

    @Override
    @Transactional
    public JoinRequestResponseDto respondJoinRequest(UUID ownerId, UUID requestId, RespondJoinRequestDto request) {
        JoinRequest joinReq = joinRequestRepository.findById(requestId)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "Join request not found"));

        Team team = joinReq.getTeam();
        if (ownerId == null || !team.getOwner().getId().equals(ownerId)) {
            throw new AppException(ErrorCode.FORBIDDEN, "Only the team owner can respond to join requests");
        }

        boolean isAccept = request.isAccept() || request.getStatus() == JoinRequestStatus.ACCEPTED;
        boolean isUndoPending = request.getStatus() == JoinRequestStatus.PENDING;

        if (isAccept) {
            if (joinReq.getStatus() == JoinRequestStatus.ACCEPTED) {
                return mapToJoinRequestDto(joinReq);
            }
            if (team.getMaxMembers() > 0 && team.getCurrentMembersCount() >= team.getMaxMembers()) {
                throw new AppException(ErrorCode.TEAM_FULL, "This team is already full");
            }
            joinReq.setStatus(JoinRequestStatus.ACCEPTED);
            team.setCurrentMembersCount(team.getCurrentMembersCount() + 1);
            teamRepository.save(team);

            // Add member
            TeamMember newMember = new TeamMember(team, joinReq.getApplicant(), TeamMemberRole.MEMBER);
            teamMemberRepository.save(newMember);
        } else if (isUndoPending) {
            if (joinReq.getStatus() == JoinRequestStatus.ACCEPTED) {
                throw new AppException(ErrorCode.BAD_REQUEST, "Accepted requests cannot be reverted to pending");
            }
            joinReq.setStatus(JoinRequestStatus.PENDING);
        } else {
            // Rejection
            if (joinReq.getStatus() == JoinRequestStatus.ACCEPTED) {
                throw new AppException(ErrorCode.BAD_REQUEST, "Accepted requests cannot be rejected");
            }
            joinReq.setStatus(JoinRequestStatus.REJECTED);
        }

        JoinRequest saved = joinRequestRepository.save(joinReq);
        return mapToJoinRequestDto(saved);
    }

    @Override
    public Map<String, Object> toggleStar(UUID userId, UUID teamId) {
        return socialInteractionService.toggleTeamStar(userId, teamId);
    }

    @Override
    @Transactional(readOnly = true)
    public TeamResponseDto getTeamById(UUID userId, UUID teamId) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new AppException(ErrorCode.TEAM_NOT_FOUND, "Team/Project not found"));
        return mapToTeamDto(team, userId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TeamResponseDto> getStarredTeams(UUID userId) {
        List<Team> teams = teamRepository.findStarredTeams(userId);
        return teams.stream()
                .map(t -> mapToTeamDto(t, userId))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    @CacheEvict(value = "collab_teams", allEntries = true)
    public TeamResponseDto markComplete(UUID ownerId, UUID teamId) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new AppException(ErrorCode.TEAM_NOT_FOUND, "Team not found"));

        if (ownerId == null || !team.getOwner().getId().equals(ownerId)) {
            throw new AppException(ErrorCode.FORBIDDEN, "Only the team owner can mark a project as complete");
        }

        team.setCompleted(true);
        Team saved = teamRepository.save(team);

        // Delete all remaining join requests for this team upon completing hiring
        joinRequestRepository.deleteByTeamId(teamId);

        return mapToTeamDto(saved, ownerId);
    }

    @Override
    @Transactional
    @CacheEvict(value = "collab_teams", allEntries = true)
    public void deleteTeam(UUID ownerId, UUID teamId) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new AppException(ErrorCode.TEAM_NOT_FOUND, "Team/Project not found"));

        if (!team.getOwner().getId().equals(ownerId)) {
            throw new AppException(ErrorCode.FORBIDDEN, "Only the team owner/creator can delete this project");
        }

        if (team.isCompleted()) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Hiring for this team is completed. Completed projects/teams cannot be deleted.");
        }

        // 1. Delete all join requests for this team
        joinRequestRepository.deleteByTeamId(teamId);

        // 2. Delete all team stars
        teamStarRepository.deleteByIdTeamId(teamId);

        // 3. Delete all team members
        teamMemberRepository.deleteByIdTeamId(teamId);

        // 4. Delete the team itself
        teamRepository.delete(team);

        // 5. Evict Redis star keys
        socialInteractionService.evictTeam(teamId);
    }

    @Override
    @Transactional
    public TeamResponseDto addMember(UUID ownerId, UUID teamId, String handle) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new AppException(ErrorCode.TEAM_NOT_FOUND, "Team/Project not found"));

        if (!team.getOwner().getId().equals(ownerId)) {
            throw new AppException(ErrorCode.FORBIDDEN, "Only the team owner/lead can add members");
        }

        if (team.isCompleted()) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Cannot add members to a completed project/team");
        }

        if (team.getType() == TeamType.OPEN_SOURCE) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Open source projects do not have fixed team members");
        }

        if (team.getMaxMembers() > 0 && team.getCurrentMembersCount() >= team.getMaxMembers()) {
            throw new AppException(ErrorCode.TEAM_FULL, "Team is already at maximum capacity");
        }

        if (handle == null || handle.trim().isBlank()) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Username/handle is required");
        }

        String cleanHandle = handle.trim().replaceFirst("^@", "");
        Profile profile = profileRepository.findByHandleIgnoreCase(cleanHandle)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND, "User with username @" + cleanHandle + " not found"));

        User targetUser = profile.getUser();
        if (targetUser == null) {
            targetUser = userRepository.findById(profile.getUserId())
                    .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND, "User not found"));
        }

        if (teamMemberRepository.existsByIdTeamIdAndIdUserId(teamId, targetUser.getId())) {
            throw new AppException(ErrorCode.ALREADY_MEMBER, "User @" + cleanHandle + " is already a member of this team");
        }

        TeamMember newMember = new TeamMember(team, targetUser, TeamMemberRole.MEMBER);
        teamMemberRepository.save(newMember);

        team.setCurrentMembersCount(team.getCurrentMembersCount() + 1);
        Team saved = teamRepository.save(team);

        return mapToTeamDto(saved, ownerId);
    }

    @Override
    @Transactional
    public TeamResponseDto removeMember(UUID ownerId, UUID teamId, UUID memberUserId) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new AppException(ErrorCode.TEAM_NOT_FOUND, "Team/Project not found"));

        if (!team.getOwner().getId().equals(ownerId)) {
            throw new AppException(ErrorCode.FORBIDDEN, "Only the team owner/lead can remove members");
        }

        if (team.getOwner().getId().equals(memberUserId)) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Cannot remove the team creator/lead");
        }

        if (!teamMemberRepository.existsByIdTeamIdAndIdUserId(teamId, memberUserId)) {
            throw new AppException(ErrorCode.NOT_FOUND, "Member not found in this team");
        }

        teamMemberRepository.deleteByIdTeamIdAndIdUserId(teamId, memberUserId);

        team.setCurrentMembersCount(Math.max(1, team.getCurrentMembersCount() - 1));
        Team saved = teamRepository.save(team);

        return mapToTeamDto(saved, ownerId);
    }

    @Override
    @Transactional
    public void deleteJoinRequest(UUID userId, UUID requestId) {
        JoinRequest joinReq = joinRequestRepository.findById(requestId)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "Join request not found"));

        if (!joinReq.getApplicant().getId().equals(userId)) {
            throw new AppException(ErrorCode.FORBIDDEN, "You can only withdraw your own join requests");
        }

        if (joinReq.getStatus() != JoinRequestStatus.PENDING) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Cannot withdraw or remove a request that has already been accepted or rejected");
        }

        joinRequestRepository.delete(joinReq);
    }

    private TeamResponseDto mapToTeamDto(Team team, UUID userId) {
        TeamResponseDto dto = new TeamResponseDto();
        dto.setId(team.getId());
        dto.setOwnerId(team.getOwner().getId());

        Optional<Profile> profileOpt = profileRepository.findByUserId(team.getOwner().getId());
        dto.setOwnerName(profileOpt.map(Profile::getFullName).orElse(team.getOwner().getEmail()));
        dto.setOwnerHandle(profileOpt.map(Profile::getHandle).orElse(null));
        dto.setOwnerAvatarUrl(profileOpt.map(Profile::getAvatarUrl).orElse(null));

        dto.setTitle(team.getTitle());
        dto.setType(team.getType());
        dto.setDescription(team.getDescription());
        dto.setGithubLink(team.getGithubLink());
        dto.setSkills(team.getSkills() != null ? team.getSkills() : Collections.emptyList());
        List<String> roles = team.getRequiredRoles() != null && !team.getRequiredRoles().isEmpty() ?
                team.getRequiredRoles() : team.getRequiredExpertise();
        dto.setRequiredRoles(roles != null ? roles : Collections.emptyList());
        dto.setRequiredExpertise(roles != null ? roles : Collections.emptyList());
        dto.setMaxMembers(team.getMaxMembers());
        dto.setCurrentMembersCount(team.getCurrentMembersCount());
        dto.setCompleted(team.isCompleted());
        int effectiveStars = (int) socialInteractionService.getTeamStarsCount(team.getId(), team.getStarsCount());
        dto.setStarsCount(effectiveStars);
        dto.setOwnerCollegeName(team.getOwnerCollegeName());

        // Map team members
        try {
            List<TeamMember> teamMembers = teamMemberRepository.findByIdTeamId(team.getId());
            if (teamMembers != null && !teamMembers.isEmpty()) {
                List<TeamResponseDto.TeamMemberDto> memberDtos = teamMembers.stream().map(m -> {
                    Optional<Profile> memberProf = profileRepository.findByUserId(m.getUser().getId());
                    String name = memberProf.map(Profile::getFullName).orElse(m.getUser().getEmail());
                    String handle = memberProf.map(Profile::getHandle).orElse(null);
                    String avatar = memberProf.map(Profile::getAvatarUrl).orElse(null);
                    String initials = memberProf.map(Profile::getInitials).orElse(name != null && !name.isBlank() ? name.substring(0, Math.min(2, name.length())).toUpperCase() : "U");
                    return TeamResponseDto.TeamMemberDto.builder()
                            .userId(m.getUser().getId())
                            .name(name)
                            .handle(handle)
                            .role(m.getRole() != null ? m.getRole().name() : "MEMBER")
                            .joinedAt(m.getJoinedAt())
                            .avatarUrl(avatar)
                            .initials(initials)
                            .build();
                }).toList();
                dto.setMembers(memberDtos);
            }
        } catch (Exception e) {
            // Non-critical fallback
        }

        if (userId != null) {
            dto.setStarred(socialInteractionService.isTeamStarredByUser(team.getId(), userId));
        }

        dto.setCreatedAt(team.getCreatedAt());
        return dto;
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "team_discussions", key = "#teamId.toString() + ':' + #page + ':' + #size")
    public PageResponse<TeamDiscussionResponseDto> getDiscussions(UUID teamId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<TeamDiscussion> discussionPage = teamDiscussionRepository
                .findByTeamIdAndDeletedAtIsNullOrderByCreatedAtAsc(teamId, pageable);

        List<TeamDiscussionResponseDto> content = discussionPage.getContent().stream()
                .map(this::mapDiscussionToDto)
                .collect(Collectors.toList());

        return PageResponse.of(content, discussionPage.getNumber(), discussionPage.getSize(), discussionPage.getTotalElements());
    }

    @Override
    @Transactional
    @CacheEvict(value = "team_discussions", allEntries = true)
    public TeamDiscussionResponseDto addDiscussion(UUID userId, UUID teamId, CreateDiscussionRequest request) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new AppException(ErrorCode.TEAM_NOT_FOUND, "Team not found"));

        User author = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND, "User not found"));

        TeamDiscussion discussion = TeamDiscussion.builder()
                .team(team)
                .author(author)
                .body(request.getBody().trim())
                .build();

        TeamDiscussion saved = teamDiscussionRepository.save(discussion);
        return mapDiscussionToDto(saved);
    }

    @Override
    @Transactional
    @CacheEvict(value = "team_discussions", allEntries = true)
    public void deleteDiscussion(UUID userId, UUID teamId, UUID discussionId) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new AppException(ErrorCode.TEAM_NOT_FOUND, "Team not found"));

        TeamDiscussion discussion = teamDiscussionRepository.findById(discussionId)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "Discussion comment not found"));

        if (discussion.getDeletedAt() != null) {
            throw new AppException(ErrorCode.NOT_FOUND, "Discussion comment not found or already deleted");
        }

        if (!discussion.getAuthor().getId().equals(userId)) {
            throw new AppException(ErrorCode.FORBIDDEN, "Only the author can delete this discussion comment");
        }

        discussion.setDeletedAt(Instant.now());
        teamDiscussionRepository.save(discussion);
    }

    private TeamDiscussionResponseDto mapDiscussionToDto(TeamDiscussion d) {
        Optional<Profile> profileOpt = profileRepository.findByUserId(d.getAuthor().getId());

        return TeamDiscussionResponseDto.builder()
                .id(d.getId())
                .teamId(d.getTeam().getId())
                .authorId(d.getAuthor().getId())
                .authorName(profileOpt.map(Profile::getFullName).orElse(d.getAuthor().getEmail()))
                .authorHandle(profileOpt.map(Profile::getHandle).orElse(null))
                .avatarUrl(profileOpt.map(Profile::getAvatarUrl).orElse(null))
                .initials(profileOpt.map(Profile::getInitials).orElse("U"))
                .collegeName(d.getAuthor().getCollege() != null ? d.getAuthor().getCollege().getName() : null)
                .collegeShortName(d.getAuthor().getCollege() != null ? d.getAuthor().getCollege().getShortName() : null)
                .body(d.getBody())
                .time(formatRelativeTime(d.getCreatedAt()))
                .createdAt(d.getCreatedAt())
                .build();
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
        if (hours <= 36) return "1d ago";
        java.time.format.DateTimeFormatter formatter = java.time.format.DateTimeFormatter.ofPattern("d MMM ''yy", java.util.Locale.ENGLISH)
                .withZone(java.time.ZoneId.of("UTC"));
        return formatter.format(instant);
    }

    private JoinRequestResponseDto mapToJoinRequestDto(JoinRequest req) {
        JoinRequestResponseDto dto = new JoinRequestResponseDto();
        dto.setId(req.getId());
        dto.setTeamId(req.getTeam().getId());
        dto.setTeamTitle(req.getTeam().getTitle());
        dto.setApplicantId(req.getApplicant().getId());

        Optional<Profile> profileOpt = profileRepository.findByUserId(req.getApplicant().getId());
        dto.setApplicantName(profileOpt.map(Profile::getFullName).orElse(req.getApplicant().getEmail()));

        dto.setRole(req.getRole());
        dto.setMessage(req.getMessage());
        dto.setStatus(req.getStatus());
        dto.setCreatedAt(req.getCreatedAt());
        return dto;
    }
}
