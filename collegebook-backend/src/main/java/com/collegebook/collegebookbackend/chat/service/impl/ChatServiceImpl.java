package com.collegebook.collegebookbackend.chat.service.impl;

import com.collegebook.collegebookbackend.auth.entity.User;
import com.collegebook.collegebookbackend.auth.repository.UserRepository;
import com.collegebook.collegebookbackend.chat.dto.ChatMessageDto;
import com.collegebook.collegebookbackend.chat.dto.ChatUserDto;
import com.collegebook.collegebookbackend.chat.dto.PresenceEventDto;
import com.collegebook.collegebookbackend.chat.dto.SendMessageRequest;
import com.collegebook.collegebookbackend.chat.entity.ChatMessage;
import com.collegebook.collegebookbackend.chat.repository.ChatMessageRepository;
import com.collegebook.collegebookbackend.chat.service.ChatService;
import com.collegebook.collegebookbackend.collab.entity.Team;
import com.collegebook.collegebookbackend.collab.entity.TeamMember;
import com.collegebook.collegebookbackend.collab.repository.TeamMemberRepository;
import com.collegebook.collegebookbackend.collab.repository.TeamRepository;
import com.collegebook.collegebookbackend.common.AppException;
import com.collegebook.collegebookbackend.common.ErrorCode;
import com.collegebook.collegebookbackend.common.PageResponse;
import com.collegebook.collegebookbackend.profile.entity.Profile;
import com.collegebook.collegebookbackend.profile.repository.ProfileRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ChatServiceImpl implements ChatService {

    private final ChatMessageRepository chatMessageRepository;
    private final TeamRepository teamRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final UserRepository userRepository;
    private final ProfileRepository profileRepository;
    private final ObjectMapper objectMapper;

    @Autowired(required = false)
    private com.collegebook.collegebookbackend.storage.service.MediaService mediaService;

    @Autowired(required = false)
    private SimpMessagingTemplate messagingTemplate;

    @Autowired(required = false)
    private StringRedisTemplate redisTemplate;

    private static final String KEY_PREFIX_ROOM_MESSAGES = "chat:room:%s:messages";
    private static final String KEY_PREFIX_ROOM_PRESENCE = "chat:room:%s:presence";
    private static final long CACHE_TTL_DAYS = 7;
    private static final int MAX_CACHED_MESSAGES = 100;

    private void validateMembership(Team team, UUID userId) {
        if (team == null || userId == null) {
            throw new AppException(ErrorCode.FORBIDDEN, "Invalid team or user context");
        }

        boolean isLead = team.getOwner() != null && team.getOwner().getId().equals(userId);
        if (isLead) return;

        boolean isMember = teamMemberRepository.existsByIdTeamIdAndIdUserId(team.getId(), userId);
        if (isMember) return;

        throw new AppException(ErrorCode.FORBIDDEN, "You are not an authorized member of this team room");
    }

    private Team getTeamOrThrow(UUID teamId) {
        return teamRepository.findById(teamId)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "Team project not found"));
    }

    @Override
    @Transactional(readOnly = true)
    public List<ChatMessageDto> getRecentMessages(UUID teamId, UUID currentUserId, int limit) {
        Team team = getTeamOrThrow(teamId);
        validateMembership(team, currentUserId);

        int effectiveLimit = limit > 0 && limit <= 100 ? limit : 50;
        String cacheKey = String.format(KEY_PREFIX_ROOM_MESSAGES, teamId);

        // 1. Try Redis Cache first (< 5ms response)
        if (redisTemplate != null) {
            try {
                List<String> rawMessages = redisTemplate.opsForList().range(cacheKey, -effectiveLimit, -1);
                if (rawMessages != null && !rawMessages.isEmpty()) {
                    List<ChatMessageDto> cachedList = new ArrayList<>();
                    for (String json : rawMessages) {
                        try {
                            ChatMessageDto item = objectMapper.readValue(json, ChatMessageDto.class);
                            if (item.getAvatarUrl() == null && item.getSenderId() != null) {
                                profileRepository.findByUserId(item.getSenderId())
                                        .ifPresent(p -> item.setAvatarUrl(resolveAvatarUrl(p.getAvatarUrl())));
                            }
                            cachedList.add(item);
                        } catch (Exception e) {
                            log.warn("Failed to deserialize cached chat message: {}", e.getMessage());
                        }
                    }
                    if (!cachedList.isEmpty()) {
                        return cachedList;
                    }
                }
            } catch (Exception e) {
                log.warn("Redis read failed for room {}: {}", teamId, e.getMessage());
            }
        }

        // 2. Fallback to Database on cold cache
        Pageable pageable = PageRequest.of(0, effectiveLimit);
        List<ChatMessage> messages = chatMessageRepository.findRecentMessagesByTeamId(teamId, pageable);
        List<ChatMessageDto> dtoList = messages.stream().map(m -> mapToDto(m, team)).collect(Collectors.toList());
        java.util.Collections.reverse(dtoList);

        // 3. Populate Redis Cache
        if (redisTemplate != null && !dtoList.isEmpty()) {
            try {
                redisTemplate.delete(cacheKey);
                List<String> jsonList = new ArrayList<>();
                for (ChatMessageDto dto : dtoList) {
                    jsonList.add(objectMapper.writeValueAsString(dto));
                }
                redisTemplate.opsForList().rightPushAll(cacheKey, jsonList);
                redisTemplate.expire(cacheKey, CACHE_TTL_DAYS, TimeUnit.DAYS);
            } catch (Exception e) {
                log.warn("Redis write failed for room {}: {}", teamId, e.getMessage());
            }
        }

        return dtoList;
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<ChatMessageDto> getPagedMessages(UUID teamId, UUID currentUserId, int page, int size) {
        Team team = getTeamOrThrow(teamId);
        validateMembership(team, currentUserId);

        int effectiveSize = size > 0 && size <= 100 ? size : 50;
        Pageable pageable = PageRequest.of(Math.max(0, page), effectiveSize);

        Page<ChatMessage> paged = chatMessageRepository.findPagedMessagesByTeamId(teamId, pageable);
        List<ChatMessageDto> items = paged.getContent().stream()
                .map(m -> mapToDto(m, team))
                .collect(Collectors.toList());

        // Reverse so client gets chronological order if descending was fetched
        Collections.reverse(items);

        return PageResponse.of(items, paged.getNumber(), paged.getSize(), paged.getTotalElements());
    }

    @Override
    @Transactional
    public ChatMessageDto sendMessage(UUID teamId, UUID senderId, SendMessageRequest request) {
        Team team = getTeamOrThrow(teamId);
        validateMembership(team, senderId);

        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND, "Sender user not found"));

        String rawContent = request.getContent() != null ? request.getContent().trim() : "";
        if (rawContent.isBlank()) {
            throw new AppException(ErrorCode.VALIDATION_ERROR, "Message content cannot be empty");
        }

        String msgType = request.getMessageType() != null && !request.getMessageType().isBlank()
                ? request.getMessageType().toUpperCase()
                : "TEXT";

        ChatMessage entity = ChatMessage.builder()
                .team(team)
                .sender(sender)
                .content(rawContent)
                .messageType(msgType)
                .mediaUrl(request.getMediaUrl())
                .build();

        ChatMessage saved = chatMessageRepository.save(entity);
        ChatMessageDto dto = mapToDto(saved, team);

        // 1. Append to Redis List Cache & maintain max items
        if (redisTemplate != null) {
            try {
                String cacheKey = String.format(KEY_PREFIX_ROOM_MESSAGES, teamId);
                String json = objectMapper.writeValueAsString(dto);
                redisTemplate.opsForList().rightPush(cacheKey, json);
                redisTemplate.opsForList().trim(cacheKey, -MAX_CACHED_MESSAGES, -1);
                redisTemplate.expire(cacheKey, CACHE_TTL_DAYS, TimeUnit.DAYS);
            } catch (Exception e) {
                log.warn("Failed to cache new message in Redis for room {}: {}", teamId, e.getMessage());
            }
        }

        // 2. Broadcast live message via Spring STOMP messagingTemplate
        if (messagingTemplate != null) {
            try {
                messagingTemplate.convertAndSend("/topic/room." + teamId, dto);
            } catch (Exception e) {
                log.warn("Failed to broadcast message to /topic/room.{}: {}", teamId, e.getMessage());
            }
        }

        return dto;
    }

    @Override
    @Transactional
    public void deleteMessage(UUID teamId, UUID messageId, UUID currentUserId) {
        Team team = getTeamOrThrow(teamId);
        validateMembership(team, currentUserId);

        ChatMessage message = chatMessageRepository.findByIdAndTeamIdAndDeletedAtIsNull(messageId, teamId)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "Message not found"));

        boolean isAuthor = message.getSender().getId().equals(currentUserId);
        boolean isLead = team.getOwner() != null && team.getOwner().getId().equals(currentUserId);

        if (!isAuthor && !isLead) {
            throw new AppException(ErrorCode.FORBIDDEN, "You do not have permission to delete this message");
        }

        message.setDeletedAt(Instant.now());
        chatMessageRepository.save(message);

        // Invalidate Redis list cache so next read fetches fresh data
        if (redisTemplate != null) {
            try {
                String cacheKey = String.format(KEY_PREFIX_ROOM_MESSAGES, teamId);
                redisTemplate.delete(cacheKey);
            } catch (Exception e) {
                log.warn("Failed to evict Redis chat cache for room {}: {}", teamId, e.getMessage());
            }
        }

        // Broadcast deletion event to room subscribers
        if (messagingTemplate != null) {
            try {
                messagingTemplate.convertAndSend("/topic/room." + teamId + ".deleted", Map.of("messageId", messageId.toString()));
            } catch (Exception e) {
                log.warn("Failed to broadcast message deletion for room {}: {}", teamId, e.getMessage());
            }
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<ChatUserDto> getRoomMembers(UUID teamId, UUID currentUserId) {
        Team team = getTeamOrThrow(teamId);
        validateMembership(team, currentUserId);

        Set<String> onlineUserIds = Collections.emptySet();
        if (redisTemplate != null) {
            try {
                String presenceKey = String.format(KEY_PREFIX_ROOM_PRESENCE, teamId);
                Set<String> members = redisTemplate.opsForSet().members(presenceKey);
                if (members != null) {
                    onlineUserIds = members;
                }
            } catch (Exception e) {
                log.warn("Failed to fetch presence from Redis for room {}: {}", teamId, e.getMessage());
            }
        }

        List<ChatUserDto> list = new ArrayList<>();

        // Add Team Lead
        if (team.getOwner() != null) {
            User lead = team.getOwner();
            Optional<Profile> leadProfile = profileRepository.findByUserId(lead.getId());
            boolean isOnline = onlineUserIds.contains(lead.getId().toString());

            list.add(ChatUserDto.builder()
                    .userId(lead.getId())
                    .name(leadProfile.map(Profile::getFullName).orElse(lead.getEmail()))
                    .handle(leadProfile.map(Profile::getHandle).orElse(null))
                    .avatarUrl(resolveAvatarUrl(leadProfile.map(Profile::getAvatarUrl).orElse(null)))
                    .initials(leadProfile.map(Profile::getInitials).orElse("L"))
                    .role("LEAD")
                    .online(isOnline)
                    .build());
        }

        // Add Members
        List<TeamMember> members = teamMemberRepository.findByIdTeamId(teamId);
        for (TeamMember m : members) {
            if (m.getUser() != null && (team.getOwner() == null || !m.getUser().getId().equals(team.getOwner().getId()))) {
                User user = m.getUser();
                Optional<Profile> memberProfile = profileRepository.findByUserId(user.getId());
                boolean isOnline = onlineUserIds.contains(user.getId().toString());

                list.add(ChatUserDto.builder()
                        .userId(user.getId())
                        .name(memberProfile.map(Profile::getFullName).orElse(user.getEmail()))
                        .handle(memberProfile.map(Profile::getHandle).orElse(null))
                        .avatarUrl(resolveAvatarUrl(memberProfile.map(Profile::getAvatarUrl).orElse(null)))
                        .initials(memberProfile.map(Profile::getInitials).orElse("M"))
                        .role(m.getRole() != null ? m.getRole().name() : "MEMBER")
                        .online(isOnline)
                        .build());
            }
        }

        return list;
    }

    @Override
    public void setUserOnlinePresence(UUID teamId, UUID userId, boolean online) {
        if (teamId == null || userId == null) return;

        if (redisTemplate != null) {
            try {
                String presenceKey = String.format(KEY_PREFIX_ROOM_PRESENCE, teamId);
                if (online) {
                    redisTemplate.opsForSet().add(presenceKey, userId.toString());
                    redisTemplate.expire(presenceKey, CACHE_TTL_DAYS, TimeUnit.DAYS);
                } else {
                    redisTemplate.opsForSet().remove(presenceKey, userId.toString());
                }
            } catch (Exception e) {
                log.warn("Failed to update presence in Redis: {}", e.getMessage());
            }
        }

        if (messagingTemplate != null) {
            try {
                Optional<Profile> profileOpt = profileRepository.findByUserId(userId);
                String userName = profileOpt.map(Profile::getFullName).orElse("User");

                PresenceEventDto event = PresenceEventDto.builder()
                        .teamId(teamId)
                        .eventType(online ? "JOIN" : "LEAVE")
                        .userId(userId)
                        .userName(userName)
                        .build();

                messagingTemplate.convertAndSend("/topic/room." + teamId + ".presence", event);
            } catch (Exception e) {
                log.warn("Failed to broadcast presence update: {}", e.getMessage());
            }
        }
    }

    private ChatMessageDto mapToDto(ChatMessage message, Team team) {
        User sender = message.getSender();
        Optional<Profile> profileOpt = profileRepository.findByUserId(sender.getId());

        boolean isLead = team.getOwner() != null && team.getOwner().getId().equals(sender.getId());

        String senderName = profileOpt.map(Profile::getFullName).orElse(sender.getEmail());
        String senderHandle = profileOpt.map(Profile::getHandle).orElse(null);
        String avatarUrl = resolveAvatarUrl(profileOpt.map(Profile::getAvatarUrl).orElse(null));
        String initials = profileOpt.map(Profile::getInitials).orElse("U");

        String collegeName = sender.getCollege() != null ? sender.getCollege().getName() : null;
        String collegeShortName = sender.getCollege() != null ? sender.getCollege().getShortName() : null;

        return ChatMessageDto.builder()
                .id(message.getId())
                .teamId(team.getId())
                .senderId(sender.getId())
                .senderName(senderName)
                .senderHandle(senderHandle)
                .avatarUrl(avatarUrl)
                .initials(initials)
                .collegeName(collegeName)
                .collegeShortName(collegeShortName)
                .role(isLead ? "LEAD" : "MEMBER")
                .content(message.getContent())
                .messageType(message.getMessageType())
                .mediaUrl(message.getMediaUrl())
                .createdAt(message.getCreatedAt())
                .time(formatRelativeTime(message.getCreatedAt()))
                .build();
    }

    private String resolveAvatarUrl(String avatarUrl) {
        if (avatarUrl == null || avatarUrl.isBlank()) {
            return null;
        }
        if (mediaService != null && (avatarUrl.startsWith("avatars/") || avatarUrl.contains(".amazonaws.com/"))) {
            try {
                return mediaService.resolveAccessUrl(avatarUrl, "S3");
            } catch (Exception e) {
                return avatarUrl;
            }
        }
        return avatarUrl;
    }

    private String formatRelativeTime(Instant instant) {
        if (instant == null) return "Just now";
        Duration duration = Duration.between(instant, Instant.now());
        long seconds = duration.getSeconds();
        if (seconds < 45) return "Just now";
        long minutes = seconds / 60;
        if (minutes < 60) return minutes + "m ago";
        long hours = minutes / 60;
        if (hours < 24) return hours + "h ago";
        if (hours <= 36) return "1d ago";
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("d MMM ''yy", Locale.ENGLISH)
                .withZone(java.time.ZoneId.of("UTC"));
        return formatter.format(instant);
    }
}
