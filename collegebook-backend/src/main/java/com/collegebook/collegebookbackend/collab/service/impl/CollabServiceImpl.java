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
import com.collegebook.collegebookbackend.collab.repository.JoinRequestRepository;
import com.collegebook.collegebookbackend.collab.repository.TeamMemberRepository;
import com.collegebook.collegebookbackend.collab.repository.TeamRepository;
import com.collegebook.collegebookbackend.collab.repository.TeamStarRepository;
import com.collegebook.collegebookbackend.collab.service.CollabService;
import com.collegebook.collegebookbackend.common.AppException;
import com.collegebook.collegebookbackend.common.ErrorCode;
import com.collegebook.collegebookbackend.common.PageResponse;
import com.collegebook.collegebookbackend.profile.entity.Profile;
import com.collegebook.collegebookbackend.profile.repository.ProfileRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class CollabServiceImpl implements CollabService {

    private final TeamRepository teamRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final JoinRequestRepository joinRequestRepository;
    private final TeamStarRepository teamStarRepository;
    private final UserRepository userRepository;
    private final ProfileRepository profileRepository;

    public CollabServiceImpl(
            TeamRepository teamRepository,
            TeamMemberRepository teamMemberRepository,
            JoinRequestRepository joinRequestRepository,
            TeamStarRepository teamStarRepository,
            UserRepository userRepository,
            ProfileRepository profileRepository
    ) {
        this.teamRepository = teamRepository;
        this.teamMemberRepository = teamMemberRepository;
        this.joinRequestRepository = joinRequestRepository;
        this.teamStarRepository = teamStarRepository;
        this.userRepository = userRepository;
        this.profileRepository = profileRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<TeamResponseDto> getTeams(UUID userId, UUID collegeId, TeamType type, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Team> teamsPage;

        if (type != null) {
            teamsPage = teamRepository.findByCollegeIdAndTypeAndCompletedFalse(collegeId, type, pageable);
        } else {
            teamsPage = teamRepository.findByCollegeIdAndCompletedFalse(collegeId, pageable);
        }

        List<TeamResponseDto> content = teamsPage.getContent().stream()
                .map(t -> mapToTeamDto(t, userId))
                .collect(Collectors.toList());

        return PageResponse.of(content, teamsPage.getNumber(), teamsPage.getSize(), teamsPage.getTotalElements());
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
        team.setRequiredExpertise(request.getRequiredExpertise() != null ? request.getRequiredExpertise() : Collections.emptyList());

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
        if (request.getRequiredExpertise() != null) {
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
        if (!team.getOwner().getId().equals(ownerId)) {
            throw new AppException(ErrorCode.FORBIDDEN, "Only the team owner can respond to join requests");
        }

        if (request.isAccept()) {
            if (team.getMaxMembers() > 0 && team.getCurrentMembersCount() >= team.getMaxMembers()) {
                throw new AppException(ErrorCode.TEAM_FULL, "This team is already full");
            }
            joinReq.setStatus(JoinRequestStatus.ACCEPTED);
            team.setCurrentMembersCount(team.getCurrentMembersCount() + 1);
            teamRepository.save(team);

            // Add member
            TeamMember newMember = new TeamMember(team, joinReq.getApplicant(), TeamMemberRole.MEMBER);
            teamMemberRepository.save(newMember);
        } else {
            joinReq.setStatus(JoinRequestStatus.REJECTED);
        }

        JoinRequest saved = joinRequestRepository.save(joinReq);
        return mapToJoinRequestDto(saved);
    }

    @Override
    @Transactional
    public Map<String, Object> toggleStar(UUID userId, UUID teamId) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new AppException(ErrorCode.TEAM_NOT_FOUND, "Team not found"));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND, "User not found"));

        boolean starred;
        if (teamStarRepository.existsByIdTeamIdAndIdUserId(teamId, userId)) {
            teamStarRepository.deleteByIdTeamIdAndIdUserId(teamId, userId);
            team.setStarsCount(Math.max(0, team.getStarsCount() - 1));
            starred = false;
        } else {
            teamStarRepository.save(new TeamStar(team, user));
            team.setStarsCount(team.getStarsCount() + 1);
            starred = true;
        }
        teamRepository.save(team);

        return Map.of("id", teamId, "starred", starred, "starsCount", team.getStarsCount());
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
    public TeamResponseDto markComplete(UUID ownerId, UUID teamId) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new AppException(ErrorCode.TEAM_NOT_FOUND, "Team not found"));

        if (!team.getOwner().getId().equals(ownerId)) {
            throw new AppException(ErrorCode.FORBIDDEN, "Only the team owner can mark a project as complete");
        }

        team.setCompleted(true);
        Team saved = teamRepository.save(team);
        return mapToTeamDto(saved, ownerId);
    }

    @Override
    @Transactional
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
            throw new AppException(ErrorCode.FORBIDDEN, "You can only withdraw/delete your own join requests");
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

        dto.setTitle(team.getTitle());
        dto.setType(team.getType());
        dto.setDescription(team.getDescription());
        dto.setGithubLink(team.getGithubLink());
        dto.setSkills(team.getSkills());
        dto.setRequiredExpertise(team.getRequiredExpertise());
        dto.setMaxMembers(team.getMaxMembers());
        dto.setCurrentMembersCount(team.getCurrentMembersCount());
        dto.setCompleted(team.isCompleted());
        dto.setStarsCount(team.getStarsCount());
        dto.setOwnerCollegeName(team.getOwnerCollegeName());

        // Map team members
        try {
            List<TeamMember> teamMembers = teamMemberRepository.findByIdTeamId(team.getId());
            if (teamMembers != null && !teamMembers.isEmpty()) {
                List<TeamResponseDto.TeamMemberDto> memberDtos = teamMembers.stream().map(m -> {
                    Optional<Profile> memberProf = profileRepository.findByUserId(m.getUser().getId());
                    String name = memberProf.map(Profile::getFullName).orElse(m.getUser().getEmail());
                    String handle = memberProf.map(Profile::getHandle).orElse(null);
                    return new TeamResponseDto.TeamMemberDto(
                            m.getUser().getId(),
                            name,
                            handle,
                            m.getRole() != null ? m.getRole().name() : "MEMBER",
                            m.getJoinedAt()
                    );
                }).toList();
                dto.setMembers(memberDtos);
            }
        } catch (Exception e) {
            // Non-critical fallback
        }

        if (userId != null) {
            dto.setStarred(teamStarRepository.existsByIdTeamIdAndIdUserId(team.getId(), userId));
        }

        dto.setCreatedAt(team.getCreatedAt());
        return dto;
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
