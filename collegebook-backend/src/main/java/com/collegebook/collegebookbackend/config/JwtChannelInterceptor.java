package com.collegebook.collegebookbackend.config;

import com.collegebook.collegebookbackend.auth.UserPrincipal;
import com.collegebook.collegebookbackend.chat.service.ChatService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Lazy;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.security.Principal;
import java.util.List;
import java.util.UUID;

@Slf4j
@Component
public class JwtChannelInterceptor implements ChannelInterceptor {

    private final JwtService jwtService;
    private final ChatService chatService;

    public JwtChannelInterceptor(JwtService jwtService, @Lazy ChatService chatService) {
        this.jwtService = jwtService;
        this.chatService = chatService;
    }

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
        if (accessor == null) {
            return message;
        }

        if (StompCommand.CONNECT.equals(accessor.getCommand())) {
            String authHeader = accessor.getFirstNativeHeader("Authorization");
            if (authHeader == null || authHeader.isBlank()) {
                authHeader = accessor.getFirstNativeHeader("token");
            }

            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                authHeader = authHeader.substring(7);
            }

            if (authHeader != null && jwtService.validateToken(authHeader)) {
                try {
                    String userIdStr = jwtService.extractUserId(authHeader);
                    String collegeIdStr = jwtService.extractCollegeId(authHeader);
                    List<String> roles = jwtService.extractRoles(authHeader);

                    UUID userId = UUID.fromString(userIdStr);
                    UUID collegeId = collegeIdStr != null ? UUID.fromString(collegeIdStr) : null;

                    UserPrincipal principal = new UserPrincipal(userId, collegeId, "", "", roles != null ? roles : List.of());
                    UsernamePasswordAuthenticationToken auth =
                            new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities());

                    accessor.setUser(auth);
                    SecurityContextHolder.getContext().setAuthentication(auth);
                    log.info("WebSocket STOMP connected for user: {}", userId);
                } catch (Exception e) {
                    log.warn("Failed to set WebSocket authentication: {}", e.getMessage());
                }
            } else {
                log.warn("WebSocket STOMP connect rejected: missing or invalid JWT token");
            }
        } else if (StompCommand.SUBSCRIBE.equals(accessor.getCommand())) {
            String destination = accessor.getDestination();
            Principal user = accessor.getUser();
            if (destination != null && destination.startsWith("/topic/room.") && user instanceof UsernamePasswordAuthenticationToken authToken) {
                if (authToken.getPrincipal() instanceof UserPrincipal principal) {
                    try {
                        String roomSuffix = destination.substring("/topic/room.".length());
                        if (roomSuffix.contains(".")) {
                            roomSuffix = roomSuffix.substring(0, roomSuffix.indexOf("."));
                        }
                        UUID teamId = UUID.fromString(roomSuffix);
                        chatService.setUserOnlinePresence(teamId, principal.getId(), true);
                    } catch (Exception ignored) {}
                }
            }
        }

        return message;
    }
}
