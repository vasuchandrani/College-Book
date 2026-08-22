package com.collegebook.collegebookbackend.collab;

import com.collegebook.collegebookbackend.auth.entity.User;
import com.collegebook.collegebookbackend.auth.repository.UserRepository;
import com.collegebook.collegebookbackend.college.entity.College;
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
import com.collegebook.collegebookbackend.collab.entity.TeamType;
import com.collegebook.collegebookbackend.collab.repository.JoinRequestRepository;
import com.collegebook.collegebookbackend.collab.repository.TeamMemberRepository;
import com.collegebook.collegebookbackend.collab.repository.TeamRepository;
import com.collegebook.collegebookbackend.collab.repository.TeamStarRepository;
import com.collegebook.collegebookbackend.collab.service.impl.CollabServiceImpl;
import com.collegebook.collegebookbackend.common.AppException;
import com.collegebook.collegebookbackend.common.ErrorCode;
import com.collegebook.collegebookbackend.profile.entity.Profile;
import com.collegebook.collegebookbackend.profile.repository.ProfileRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class CollabServiceTest {

    @Mock
    private TeamRepository teamRepository;
    @Mock
    private TeamMemberRepository teamMemberRepository;
    @Mock
    private JoinRequestRepository joinRequestRepository;
    @Mock
    private TeamStarRepository teamStarRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private ProfileRepository profileRepository;
    @Mock
    private com.collegebook.collegebookbackend.social.SocialInteractionService socialInteractionService;

    private CollabServiceImpl collabService;

    @BeforeEach
    void setUp() {
        collabService = new CollabServiceImpl(
                teamRepository,
                teamMemberRepository,
                joinRequestRepository,
                teamStarRepository,
                userRepository,
                profileRepository,
                socialInteractionService
        );
    }

    @Test
    void testCreateTeamSuccess() {
        UUID userId = UUID.randomUUID();
        User owner = new User();
        owner.setId(userId);
        College college = new College();
        college.setId(UUID.randomUUID());
        owner.setCollege(college);

        when(userRepository.findById(userId)).thenReturn(Optional.of(owner));
        when(teamRepository.save(any(Team.class))).thenAnswer(i -> {
            Team t = i.getArgument(0);
            t.setId(UUID.randomUUID());
            return t;
        });

        CreateTeamRequest req = new CreateTeamRequest();
        req.setTitle("AI Research Project");
        req.setType(TeamType.PROJECT);
        req.setSkills(List.of("Python", "PyTorch"));

        TeamResponseDto resp = collabService.createTeam(userId, req);

        assertNotNull(resp);
        assertEquals("AI Research Project", resp.getTitle());
        assertEquals(TeamType.PROJECT, resp.getType());
    }

    @Test
    void testSendJoinRequestTeamFull() {
        UUID userId = UUID.randomUUID();
        UUID teamId = UUID.randomUUID();
        Team team = new Team();
        team.setId(teamId);
        team.setMaxMembers(2);
        team.setCurrentMembersCount(2);

        when(teamRepository.findById(teamId)).thenReturn(Optional.of(team));

        SendJoinRequestDto req = new SendJoinRequestDto("Frontend Developer", "Would love to join!");
        AppException ex = assertThrows(AppException.class, () -> collabService.sendJoinRequest(userId, teamId, req));

        assertEquals(ErrorCode.TEAM_FULL, ex.getErrorCode());
    }

    @Test
    void testRespondJoinRequestAccept() {
        UUID ownerId = UUID.randomUUID();
        UUID requestId = UUID.randomUUID();
        User owner = new User();
        owner.setId(ownerId);

        Team team = new Team();
        team.setId(UUID.randomUUID());
        team.setOwner(owner);
        team.setMaxMembers(4);
        team.setCurrentMembersCount(1);

        User applicant = new User();
        applicant.setId(UUID.randomUUID());

        JoinRequest joinReq = new JoinRequest();
        joinReq.setId(requestId);
        joinReq.setTeam(team);
        joinReq.setApplicant(applicant);
        joinReq.setRole("Backend");
        joinReq.setStatus(JoinRequestStatus.PENDING);

        when(joinRequestRepository.findById(requestId)).thenReturn(Optional.of(joinReq));
        when(joinRequestRepository.save(any(JoinRequest.class))).thenAnswer(i -> i.getArgument(0));

        RespondJoinRequestDto req = new RespondJoinRequestDto(true);
        JoinRequestResponseDto resp = collabService.respondJoinRequest(ownerId, requestId, req);

        assertEquals(JoinRequestStatus.ACCEPTED, resp.getStatus());
        assertEquals(2, team.getCurrentMembersCount());
    }

    @Test
    void testGetMyTeamsAll() {
        UUID userId = UUID.randomUUID();
        User owner = new User();
        owner.setId(userId);

        Team team = new Team();
        team.setId(UUID.randomUUID());
        team.setTitle("Hackathon Alpha");
        team.setType(TeamType.HACKATHON);
        team.setOwner(owner);

        when(teamRepository.findMyTeams(userId)).thenReturn(List.of(team));

        List<TeamResponseDto> result = collabService.getMyTeams(userId);
        assertEquals(1, result.size());
        assertEquals("Hackathon Alpha", result.get(0).getTitle());
    }

    @Test
    void testGetMyTeamsByType() {
        UUID userId = UUID.randomUUID();
        User owner = new User();
        owner.setId(userId);

        Team team = new Team();
        team.setId(UUID.randomUUID());
        team.setTitle("Open Source Lib");
        team.setType(TeamType.OPEN_SOURCE);
        team.setOwner(owner);

        when(teamRepository.findMyTeamsByType(userId, TeamType.OPEN_SOURCE)).thenReturn(List.of(team));

        List<TeamResponseDto> result = collabService.getMyTeams(userId, TeamType.OPEN_SOURCE);
        assertEquals(1, result.size());
        assertEquals(TeamType.OPEN_SOURCE, result.get(0).getType());
    }

    @Test
    void testUpdateTeamSuccess() {
        UUID userId = UUID.randomUUID();
        UUID teamId = UUID.randomUUID();
        User owner = new User();
        owner.setId(userId);

        Team team = new Team();
        team.setId(teamId);
        team.setTitle("Old Title");
        team.setType(TeamType.PROJECT);
        team.setOwner(owner);

        when(teamRepository.findById(teamId)).thenReturn(Optional.of(team));
        when(teamRepository.save(any(Team.class))).thenAnswer(i -> i.getArgument(0));

        UpdateTeamRequest req = new UpdateTeamRequest(
                "New Title",
                TeamType.OPEN_SOURCE,
                "Updated Description",
                "https://github.com/test/repo",
                List.of("Go", "Docker"),
                List.of("Go", "Docker"),
                0
        );

        TeamResponseDto updated = collabService.updateTeam(userId, teamId, req);
        assertNotNull(updated);
        assertEquals("New Title", updated.getTitle());
        assertEquals(TeamType.OPEN_SOURCE, updated.getType());
        assertEquals(0, team.getMaxMembers());
    }

    @Test
    void testUpdateTeamForbidden() {
        UUID ownerId = UUID.randomUUID();
        UUID nonOwnerId = UUID.randomUUID();
        UUID teamId = UUID.randomUUID();

        User owner = new User();
        owner.setId(ownerId);

        Team team = new Team();
        team.setId(teamId);
        team.setTitle("Alpha");
        team.setOwner(owner);

        when(teamRepository.findById(teamId)).thenReturn(Optional.of(team));

        UpdateTeamRequest req = new UpdateTeamRequest();
        req.setTitle("Hacked Title");

        assertThrows(AppException.class, () -> collabService.updateTeam(nonOwnerId, teamId, req));
    }

    @Test
    void testUpdateJoinRequestSuccess() {
        UUID userId = UUID.randomUUID();
        UUID requestId = UUID.randomUUID();

        User applicant = new User();
        applicant.setId(userId);

        Team team = new Team();
        team.setId(UUID.randomUUID());
        team.setTitle("Alpha Team");

        JoinRequest joinReq = new JoinRequest();
        joinReq.setId(requestId);
        joinReq.setApplicant(applicant);
        joinReq.setTeam(team);
        joinReq.setRole("Frontend");
        joinReq.setMessage("Initial note");
        joinReq.setStatus(JoinRequestStatus.PENDING);

        when(joinRequestRepository.findById(requestId)).thenReturn(Optional.of(joinReq));
        when(joinRequestRepository.save(any(JoinRequest.class))).thenAnswer(i -> i.getArgument(0));

        UpdateJoinRequestDto updateDto = new UpdateJoinRequestDto("Full Stack Dev", "Updated note with portfolio");
        JoinRequestResponseDto res = collabService.updateJoinRequest(userId, requestId, updateDto);

        assertNotNull(res);
        assertEquals("Full Stack Dev", res.getRole());
        assertEquals("Updated note with portfolio", res.getMessage());
    }

    @Test
    void testUpdateJoinRequestForbidden() {
        UUID applicantId = UUID.randomUUID();
        UUID otherUserId = UUID.randomUUID();
        UUID requestId = UUID.randomUUID();

        User applicant = new User();
        applicant.setId(applicantId);

        JoinRequest joinReq = new JoinRequest();
        joinReq.setId(requestId);
        joinReq.setApplicant(applicant);
        joinReq.setStatus(JoinRequestStatus.PENDING);

        when(joinRequestRepository.findById(requestId)).thenReturn(Optional.of(joinReq));

        UpdateJoinRequestDto updateDto = new UpdateJoinRequestDto("Role", "Note");
        assertThrows(AppException.class, () -> collabService.updateJoinRequest(otherUserId, requestId, updateDto));
    }

    @Test
    void testUpdateJoinRequestAlreadyProcessed() {
        UUID userId = UUID.randomUUID();
        UUID requestId = UUID.randomUUID();

        User applicant = new User();
        applicant.setId(userId);

        JoinRequest joinReq = new JoinRequest();
        joinReq.setId(requestId);
        joinReq.setApplicant(applicant);
        joinReq.setStatus(JoinRequestStatus.ACCEPTED);

        when(joinRequestRepository.findById(requestId)).thenReturn(Optional.of(joinReq));

        UpdateJoinRequestDto updateDto = new UpdateJoinRequestDto("Role", "Note");
        assertThrows(AppException.class, () -> collabService.updateJoinRequest(userId, requestId, updateDto));
    }

    @Test
    void testGetTeamJoinRequestsSuccess() {
        UUID ownerId = UUID.randomUUID();
        UUID teamId = UUID.randomUUID();

        User owner = new User();
        owner.setId(ownerId);

        Team team = new Team();
        team.setId(teamId);
        team.setOwner(owner);

        JoinRequest req = new JoinRequest();
        req.setId(UUID.randomUUID());
        req.setTeam(team);
        req.setApplicant(new User());
        req.setRole("Designer");

        when(teamRepository.findById(teamId)).thenReturn(Optional.of(team));
        when(joinRequestRepository.findByTeamIdOrderByCreatedAtDesc(teamId)).thenReturn(List.of(req));

        List<JoinRequestResponseDto> list = collabService.getTeamJoinRequests(ownerId, teamId);
        assertEquals(1, list.size());
        assertEquals("Designer", list.get(0).getRole());
    }

    @Test
    void testSendJoinRequestTeamCompleted() {
        UUID userId = UUID.randomUUID();
        UUID teamId = UUID.randomUUID();

        Team team = new Team();
        team.setId(teamId);
        team.setType(TeamType.PROJECT);
        team.setCompleted(true);

        when(teamRepository.findById(teamId)).thenReturn(Optional.of(team));

        SendJoinRequestDto req = new SendJoinRequestDto("Dev", "Please let me join");
        AppException ex = assertThrows(AppException.class, () -> collabService.sendJoinRequest(userId, teamId, req));
        assertEquals(ErrorCode.BAD_REQUEST, ex.getErrorCode());
    }

    @Test
    void testGetStarredTeamsSuccess() {
        UUID userId = UUID.randomUUID();
        UUID teamId = UUID.randomUUID();

        User owner = new User();
        owner.setId(userId);

        Team team = new Team();
        team.setId(teamId);
        team.setTitle("Starred Project");
        team.setType(TeamType.PROJECT);
        team.setOwner(owner);

        when(teamRepository.findStarredTeams(userId)).thenReturn(List.of(team));
        when(socialInteractionService.isTeamStarredByUser(teamId, userId)).thenReturn(true);

        List<TeamResponseDto> starred = collabService.getStarredTeams(userId);
        assertNotNull(starred);
        assertEquals(1, starred.size());
        assertEquals("Starred Project", starred.get(0).getTitle());
        assertTrue(starred.get(0).isStarred());
    }

    @Test
    void testToggleStarSuccess() {
        UUID userId = UUID.randomUUID();
        UUID teamId = UUID.randomUUID();

        when(socialInteractionService.toggleTeamStar(userId, teamId))
                .thenReturn(Map.of("id", teamId, "starred", true, "starsCount", 1));

        Map<String, Object> result = collabService.toggleStar(userId, teamId);

        assertTrue((Boolean) result.get("starred"));
        assertEquals(1, result.get("starsCount"));
    }

    @Test
    void testGetTeamsByUserIdSuccess() {
        UUID requesterId = UUID.randomUUID();
        UUID targetUserId = UUID.randomUUID();
        UUID teamId = UUID.randomUUID();

        User owner = new User();
        owner.setId(targetUserId);

        Team team = new Team();
        team.setId(teamId);
        team.setTitle("Member or Lead Team");
        team.setType(TeamType.PROJECT);
        team.setOwner(owner);

        when(teamRepository.findMyTeams(targetUserId)).thenReturn(List.of(team));

        List<TeamResponseDto> teams = collabService.getTeamsByUserId(requesterId, targetUserId);
        assertNotNull(teams);
        assertEquals(1, teams.size());
        assertEquals("Member or Lead Team", teams.get(0).getTitle());
    }

    @Test
    void testDeleteTeamSuccess() {
        UUID ownerId = UUID.randomUUID();
        UUID teamId = UUID.randomUUID();

        User owner = new User();
        owner.setId(ownerId);

        Team team = new Team();
        team.setId(teamId);
        team.setOwner(owner);

        when(teamRepository.findById(teamId)).thenReturn(Optional.of(team));

        collabService.deleteTeam(ownerId, teamId);

        verify(joinRequestRepository).deleteByTeamId(teamId);
        verify(teamStarRepository).deleteByIdTeamId(teamId);
        verify(teamMemberRepository).deleteByIdTeamId(teamId);
        verify(teamRepository).delete(team);
    }

    @Test
    void testDeleteTeamForbiddenWhenNotOwner() {
        UUID ownerId = UUID.randomUUID();
        UUID otherUserId = UUID.randomUUID();
        UUID teamId = UUID.randomUUID();

        User owner = new User();
        owner.setId(ownerId);

        Team team = new Team();
        team.setId(teamId);
        team.setOwner(owner);

        when(teamRepository.findById(teamId)).thenReturn(Optional.of(team));

        AppException ex = assertThrows(AppException.class, () -> collabService.deleteTeam(otherUserId, teamId));
        assertEquals(ErrorCode.FORBIDDEN, ex.getErrorCode());
    }

    @Test
    void testDeleteTeamBadRequestWhenCompleted() {
        UUID ownerId = UUID.randomUUID();
        UUID teamId = UUID.randomUUID();

        User owner = new User();
        owner.setId(ownerId);

        Team team = new Team();
        team.setId(teamId);
        team.setOwner(owner);
        team.setCompleted(true);

        when(teamRepository.findById(teamId)).thenReturn(Optional.of(team));

        AppException ex = assertThrows(AppException.class, () -> collabService.deleteTeam(ownerId, teamId));
        assertEquals(ErrorCode.BAD_REQUEST, ex.getErrorCode());
    }

    @Test
    void testAddMemberSuccess() {
        UUID ownerId = UUID.randomUUID();
        UUID memberUserId = UUID.randomUUID();
        UUID teamId = UUID.randomUUID();

        User owner = new User();
        owner.setId(ownerId);

        User memberUser = new User();
        memberUser.setId(memberUserId);

        Profile memberProfile = new Profile();
        memberProfile.setUserId(memberUserId);
        memberProfile.setHandle("alice_dev");
        memberProfile.setFullName("Alice Developer");
        memberProfile.setUser(memberUser);

        Team team = new Team();
        team.setId(teamId);
        team.setOwner(owner);
        team.setType(TeamType.PROJECT);
        team.setMaxMembers(4);
        team.setCurrentMembersCount(1);

        when(teamRepository.findById(teamId)).thenReturn(Optional.of(team));
        when(profileRepository.findByHandleIgnoreCase("alice_dev")).thenReturn(Optional.of(memberProfile));
        when(teamMemberRepository.existsByIdTeamIdAndIdUserId(teamId, memberUserId)).thenReturn(false);
        when(teamRepository.save(any(Team.class))).thenAnswer(i -> i.getArgument(0));

        TeamResponseDto result = collabService.addMember(ownerId, teamId, "@alice_dev");

        assertNotNull(result);
        assertEquals(2, result.getCurrentMembersCount());
        verify(teamMemberRepository).save(any());
    }

    @Test
    void testAddMemberFailsWhenAlreadyMember() {
        UUID ownerId = UUID.randomUUID();
        UUID memberUserId = UUID.randomUUID();
        UUID teamId = UUID.randomUUID();

        User owner = new User();
        owner.setId(ownerId);

        User memberUser = new User();
        memberUser.setId(memberUserId);

        Profile memberProfile = new Profile();
        memberProfile.setUserId(memberUserId);
        memberProfile.setHandle("alice_dev");
        memberProfile.setUser(memberUser);

        Team team = new Team();
        team.setId(teamId);
        team.setOwner(owner);
        team.setType(TeamType.PROJECT);
        team.setMaxMembers(4);
        team.setCurrentMembersCount(2);

        when(teamRepository.findById(teamId)).thenReturn(Optional.of(team));
        when(profileRepository.findByHandleIgnoreCase("alice_dev")).thenReturn(Optional.of(memberProfile));
        when(teamMemberRepository.existsByIdTeamIdAndIdUserId(teamId, memberUserId)).thenReturn(true);

        AppException ex = assertThrows(AppException.class, () -> collabService.addMember(ownerId, teamId, "alice_dev"));
        assertEquals(ErrorCode.ALREADY_MEMBER, ex.getErrorCode());
    }

    @Test
    void testRemoveMemberSuccess() {
        UUID ownerId = UUID.randomUUID();
        UUID memberUserId = UUID.randomUUID();
        UUID teamId = UUID.randomUUID();

        User owner = new User();
        owner.setId(ownerId);

        Team team = new Team();
        team.setId(teamId);
        team.setOwner(owner);
        team.setCurrentMembersCount(3);

        when(teamRepository.findById(teamId)).thenReturn(Optional.of(team));
        when(teamMemberRepository.existsByIdTeamIdAndIdUserId(teamId, memberUserId)).thenReturn(true);
        when(teamRepository.save(any(Team.class))).thenAnswer(i -> i.getArgument(0));

        TeamResponseDto result = collabService.removeMember(ownerId, teamId, memberUserId);

        assertNotNull(result);
        assertEquals(2, result.getCurrentMembersCount());
        verify(teamMemberRepository).deleteByIdTeamIdAndIdUserId(teamId, memberUserId);
    }

    @Test
    void testRemoveMemberFailsWhenRemovingOwner() {
        UUID ownerId = UUID.randomUUID();
        UUID teamId = UUID.randomUUID();

        User owner = new User();
        owner.setId(ownerId);

        Team team = new Team();
        team.setId(teamId);
        team.setOwner(owner);

        when(teamRepository.findById(teamId)).thenReturn(Optional.of(team));

        AppException ex = assertThrows(AppException.class, () -> collabService.removeMember(ownerId, teamId, ownerId));
        assertEquals(ErrorCode.BAD_REQUEST, ex.getErrorCode());
    }

    @Test
    void testDeleteJoinRequestSuccess() {
        UUID applicantId = UUID.randomUUID();
        UUID requestId = UUID.randomUUID();

        User applicant = new User();
        applicant.setId(applicantId);

        JoinRequest req = new JoinRequest();
        req.setId(requestId);
        req.setApplicant(applicant);

        when(joinRequestRepository.findById(requestId)).thenReturn(Optional.of(req));

        collabService.deleteJoinRequest(applicantId, requestId);

        verify(joinRequestRepository).delete(req);
    }

    @Test
    void testDeleteJoinRequestFailsWhenNotApplicant() {
        UUID applicantId = UUID.randomUUID();
        UUID otherUserId = UUID.randomUUID();
        UUID requestId = UUID.randomUUID();

        User applicant = new User();
        applicant.setId(applicantId);

        JoinRequest req = new JoinRequest();
        req.setId(requestId);
        req.setApplicant(applicant);

        when(joinRequestRepository.findById(requestId)).thenReturn(Optional.of(req));

        AppException ex = assertThrows(AppException.class, () -> collabService.deleteJoinRequest(otherUserId, requestId));
        assertEquals(ErrorCode.FORBIDDEN, ex.getErrorCode());
    }

    @Test
    void testGetTeamsWithStarPersonalizationOverlay() {
        UUID collegeId = UUID.randomUUID();
        UUID userA = UUID.randomUUID();
        UUID userB = UUID.randomUUID();
        UUID teamId = UUID.randomUUID();

        User owner = new User();
        owner.setId(UUID.randomUUID());
        owner.setEmail("lead@ddu.ac.in");

        Team team = new Team();
        team.setId(teamId);
        team.setOwner(owner);
        team.setTitle("AI Research Group");
        team.setType(TeamType.PROJECT);
        team.setStarsCount(5);

        org.springframework.data.domain.Page<Team> page = new org.springframework.data.domain.PageImpl<>(
                List.of(team),
                org.springframework.data.domain.PageRequest.of(0, 10),
                1
        );

        when(teamRepository.findByCollegeIdAndCompletedFalse(any(), any())).thenReturn(page);
        when(socialInteractionService.getTeamStarsCount(teamId, 5)).thenReturn(5L);

        // User A starred the project, User B has not
        when(socialInteractionService.isTeamStarredByUser(teamId, userA)).thenReturn(true);
        when(socialInteractionService.isTeamStarredByUser(teamId, userB)).thenReturn(false);

        com.collegebook.collegebookbackend.common.PageResponse<TeamResponseDto> respA = collabService.getTeams(userA, collegeId, null, 0, 10);
        com.collegebook.collegebookbackend.common.PageResponse<TeamResponseDto> respB = collabService.getTeams(userB, collegeId, null, 0, 10);

        assertNotNull(respA);
        assertEquals(1, respA.getItems().size());
        assertTrue(respA.getItems().get(0).isStarred());

        assertNotNull(respB);
        assertEquals(1, respB.getItems().size());
        org.junit.jupiter.api.Assertions.assertFalse(respB.getItems().get(0).isStarred());
    }
}
