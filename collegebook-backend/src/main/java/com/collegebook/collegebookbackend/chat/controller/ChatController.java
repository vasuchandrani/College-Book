package com.collegebook.collegebookbackend.chat.controller;

import com.collegebook.collegebookbackend.auth.UserPrincipal;
import com.collegebook.collegebookbackend.chat.dto.ChatMessageDto;
import com.collegebook.collegebookbackend.chat.dto.ChatUserDto;
import com.collegebook.collegebookbackend.chat.dto.SendMessageRequest;
import com.collegebook.collegebookbackend.chat.dto.TypingEventDto;
import com.collegebook.collegebookbackend.chat.service.ChatService;
import com.collegebook.collegebookbackend.common.CurrentUser;
import com.collegebook.collegebookbackend.common.PageResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/v1/teams/{teamId}/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;
    private final SimpMessagingTemplate messagingTemplate;

    // -------------------------------------------------------------------------
    // Real-Time STOMP Handlers
    // -------------------------------------------------------------------------

    @MessageMapping("/chat.send/{teamId}")
    public void handleSendStompMessage(
            @DestinationVariable("teamId") UUID teamId,
            @Valid @Payload SendMessageRequest request,
            Authentication authentication
    ) {
        if (authentication != null && authentication.getPrincipal() instanceof UserPrincipal principal) {
            chatService.sendMessage(teamId, principal.getId(), request);
        } else {
            log.warn("Unauthorized STOMP message send attempt on room {}", teamId);
        }
    }

    @MessageMapping("/chat.typing/{teamId}")
    public void handleTypingEvent(
            @DestinationVariable("teamId") UUID teamId,
            @Payload TypingEventDto typingEvent,
            Authentication authentication
    ) {
        if (authentication != null && authentication.getPrincipal() instanceof UserPrincipal principal) {
            typingEvent.setTeamId(teamId);
            typingEvent.setUserId(principal.getId());
            messagingTemplate.convertAndSend("/topic/room." + teamId + ".typing", typingEvent);
        }
    }

    // -------------------------------------------------------------------------
    // REST Endpoints (Read-Through Cache & Optimistic Fallback)
    // -------------------------------------------------------------------------

    @GetMapping("/messages")
    public ResponseEntity<?> getRoomMessages(
            @CurrentUser UserPrincipal currentUser,
            @PathVariable("teamId") UUID teamId,
            @RequestParam(value = "paged", defaultValue = "false") boolean paged,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "50") int size
    ) {
        UUID userId = currentUser != null ? currentUser.getId() : null;
        if (paged) {
            PageResponse<ChatMessageDto> pagedResponse = chatService.getPagedMessages(teamId, userId, page, size);
            return ResponseEntity.ok(pagedResponse);
        }
        List<ChatMessageDto> recentMessages = chatService.getRecentMessages(teamId, userId, size);
        return ResponseEntity.ok(recentMessages);
    }

    @PostMapping("/messages")
    public ResponseEntity<ChatMessageDto> sendMessageRest(
            @CurrentUser UserPrincipal currentUser,
            @PathVariable("teamId") UUID teamId,
            @Valid @RequestBody SendMessageRequest request
    ) {
        UUID userId = currentUser != null ? currentUser.getId() : null;
        ChatMessageDto sent = chatService.sendMessage(teamId, userId, request);
        return ResponseEntity.ok(sent);
    }

    @DeleteMapping("/messages/{messageId}")
    public ResponseEntity<Void> deleteMessage(
            @CurrentUser UserPrincipal currentUser,
            @PathVariable("teamId") UUID teamId,
            @PathVariable("messageId") UUID messageId
    ) {
        UUID userId = currentUser != null ? currentUser.getId() : null;
        chatService.deleteMessage(teamId, messageId, userId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/members")
    public ResponseEntity<List<ChatUserDto>> getRoomMembers(
            @CurrentUser UserPrincipal currentUser,
            @PathVariable("teamId") UUID teamId
    ) {
        UUID userId = currentUser != null ? currentUser.getId() : null;
        return ResponseEntity.ok(chatService.getRoomMembers(teamId, userId));
    }
}
