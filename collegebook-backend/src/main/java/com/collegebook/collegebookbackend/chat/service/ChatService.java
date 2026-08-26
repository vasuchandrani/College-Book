package com.collegebook.collegebookbackend.chat.service;

import com.collegebook.collegebookbackend.chat.dto.ChatMessageDto;
import com.collegebook.collegebookbackend.chat.dto.ChatUserDto;
import com.collegebook.collegebookbackend.chat.dto.SendMessageRequest;
import com.collegebook.collegebookbackend.common.PageResponse;

import java.util.List;
import java.util.UUID;

public interface ChatService {

    List<ChatMessageDto> getRecentMessages(UUID teamId, UUID currentUserId, int limit);

    PageResponse<ChatMessageDto> getPagedMessages(UUID teamId, UUID currentUserId, int page, int size);

    ChatMessageDto sendMessage(UUID teamId, UUID senderId, SendMessageRequest request);

    void deleteMessage(UUID teamId, UUID messageId, UUID currentUserId);

    List<ChatUserDto> getRoomMembers(UUID teamId, UUID currentUserId);

    void setUserOnlinePresence(UUID teamId, UUID userId, boolean online);
}
