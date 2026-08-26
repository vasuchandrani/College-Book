package com.collegebook.collegebookbackend.chat;

import com.collegebook.collegebookbackend.auth.entity.User;
import com.collegebook.collegebookbackend.auth.repository.UserRepository;
import com.collegebook.collegebookbackend.chat.dto.ChatMessageDto;
import com.collegebook.collegebookbackend.chat.dto.SendMessageRequest;
import com.collegebook.collegebookbackend.chat.entity.ChatMessage;
import com.collegebook.collegebookbackend.chat.repository.ChatMessageRepository;
import com.collegebook.collegebookbackend.chat.service.impl.ChatServiceImpl;
import com.collegebook.collegebookbackend.collab.entity.Team;
import com.collegebook.collegebookbackend.collab.entity.TeamMember;
import com.collegebook.collegebookbackend.collab.repository.TeamMemberRepository;
import com.collegebook.collegebookbackend.collab.repository.TeamRepository;
import com.collegebook.collegebookbackend.college.entity.College;
import com.collegebook.collegebookbackend.common.AppException;
import com.collegebook.collegebookbackend.common.ErrorCode;
import com.collegebook.collegebookbackend.profile.entity.Profile;
import com.collegebook.collegebookbackend.profile.repository.ProfileRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.data.domain.Pageable;
import org.springframework.data.redis.core.ListOperations;
import org.springframework.data.redis.core.SetOperations;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
public class ChatServiceTest {

    @Mock
    private ChatMessageRepository chatMessageRepository;
    @Mock
    private TeamRepository teamRepository;
    @Mock
    private TeamMemberRepository teamMemberRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private ProfileRepository profileRepository;
    @Mock
    private SimpMessagingTemplate messagingTemplate;
    @Mock
    private StringRedisTemplate redisTemplate;
    @Mock
    private ListOperations<String, String> listOperations;
    @Mock
    private SetOperations<String, String> setOperations;

    private ChatServiceImpl chatService;
    private final ObjectMapper objectMapper = new ObjectMapper().registerModule(new JavaTimeModule());

    private User lead;
    private User member;
    private User stranger;
    private Team team;
    private College college;

    @BeforeEach
    void setUp() {
        chatService = new ChatServiceImpl(
                chatMessageRepository,
                teamRepository,
                teamMemberRepository,
                userRepository,
                profileRepository,
                objectMapper
        );
        ReflectionTestUtils.setField(chatService, "messagingTemplate", messagingTemplate);
        ReflectionTestUtils.setField(chatService, "redisTemplate", redisTemplate);

        college = College.builder()
                .id(UUID.randomUUID())
                .name("Dharmsinh Desai University")
                .shortName("DDU")
                .build();

        lead = User.builder()
                .id(UUID.randomUUID())
                .email("lead@ddu.ac.in")
                .college(college)
                .build();

        member = User.builder()
                .id(UUID.randomUUID())
                .email("member@ddu.ac.in")
                .college(college)
                .build();

        stranger = User.builder()
                .id(UUID.randomUUID())
                .email("stranger@ddu.ac.in")
                .college(college)
                .build();

        team = Team.builder()
                .id(UUID.randomUUID())
                .title("AI Campus Assistant")
                .owner(lead)
                .build();
    }

    @Test
    void testSendMessage_SuccessAsLead() {
        SendMessageRequest req = SendMessageRequest.builder()
                .content("Hello team, welcome to the room!")
                .messageType("TEXT")
                .build();

        when(teamRepository.findById(team.getId())).thenReturn(Optional.of(team));
        when(userRepository.findById(lead.getId())).thenReturn(Optional.of(lead));

        ChatMessage saved = ChatMessage.builder()
                .id(UUID.randomUUID())
                .team(team)
                .sender(lead)
                .content("Hello team, welcome to the room!")
                .messageType("TEXT")
                .createdAt(Instant.now())
                .build();

        when(chatMessageRepository.save(any(ChatMessage.class))).thenReturn(saved);
        when(redisTemplate.opsForList()).thenReturn(listOperations);

        ChatMessageDto result = chatService.sendMessage(team.getId(), lead.getId(), req);

        assertNotNull(result);
        assertEquals("Hello team, welcome to the room!", result.getContent());
        assertEquals("LEAD", result.getRole());
        verify(messagingTemplate).convertAndSend(eq("/topic/room." + team.getId()), any(ChatMessageDto.class));
    }

    @Test
    void testSendMessage_ForbiddenForStranger() {
        SendMessageRequest req = SendMessageRequest.builder()
                .content("I want to spy on your chat")
                .build();

        when(teamRepository.findById(team.getId())).thenReturn(Optional.of(team));
        when(teamMemberRepository.existsByIdTeamIdAndIdUserId(team.getId(), stranger.getId())).thenReturn(false);

        AppException ex = assertThrows(AppException.class, () ->
                chatService.sendMessage(team.getId(), stranger.getId(), req)
        );

        assertEquals(ErrorCode.FORBIDDEN, ex.getErrorCode());
    }

    @Test
    void testGetRecentMessages_ColdCacheFallsBackToDb() {
        when(teamRepository.findById(team.getId())).thenReturn(Optional.of(team));
        when(redisTemplate.opsForList()).thenReturn(listOperations);
        when(listOperations.range(anyString(), eq(-50), eq(-1))).thenReturn(null);

        ChatMessage msg1 = ChatMessage.builder()
                .id(UUID.randomUUID())
                .team(team)
                .sender(lead)
                .content("Initial message")
                .messageType("TEXT")
                .createdAt(Instant.now())
                .build();

        when(chatMessageRepository.findRecentMessagesByTeamId(eq(team.getId()), any(Pageable.class)))
                .thenReturn(List.of(msg1));

        List<ChatMessageDto> result = chatService.getRecentMessages(team.getId(), lead.getId(), 50);

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("Initial message", result.get(0).getContent());
    }

    @Test
    void testDeleteMessage_AuthorCanDelete() {
        UUID messageId = UUID.randomUUID();
        ChatMessage msg = ChatMessage.builder()
                .id(messageId)
                .team(team)
                .sender(member)
                .content("Typo message")
                .build();

        when(teamRepository.findById(team.getId())).thenReturn(Optional.of(team));
        when(teamMemberRepository.existsByIdTeamIdAndIdUserId(team.getId(), member.getId()))
                .thenReturn(true);
        when(chatMessageRepository.findByIdAndTeamIdAndDeletedAtIsNull(messageId, team.getId()))
                .thenReturn(Optional.of(msg));

        chatService.deleteMessage(team.getId(), messageId, member.getId());

        verify(chatMessageRepository).save(msg);
        assertNotNull(msg.getDeletedAt());
    }

    @Test
    void testDeleteMessage_StrangerForbidden() {
        UUID messageId = UUID.randomUUID();
        ChatMessage msg = ChatMessage.builder()
                .id(messageId)
                .team(team)
                .sender(member)
                .content("Member secret")
                .build();

        when(teamRepository.findById(team.getId())).thenReturn(Optional.of(team));
        when(teamMemberRepository.existsByIdTeamIdAndIdUserId(team.getId(), stranger.getId()))
                .thenReturn(false);

        AppException ex = assertThrows(AppException.class, () ->
                chatService.deleteMessage(team.getId(), messageId, stranger.getId())
        );

        assertEquals(ErrorCode.FORBIDDEN, ex.getErrorCode());
    }

    @Test
    void testSetUserOnlinePresence_UpdatesRedisAndBroadcasts() {
        when(redisTemplate.opsForSet()).thenReturn(setOperations);

        chatService.setUserOnlinePresence(team.getId(), member.getId(), true);

        verify(setOperations).add(eq("chat:room:" + team.getId() + ":presence"), eq(member.getId().toString()));
        verify(messagingTemplate).convertAndSend(eq("/topic/room." + team.getId() + ".presence"), any(Object.class));
    }
}
