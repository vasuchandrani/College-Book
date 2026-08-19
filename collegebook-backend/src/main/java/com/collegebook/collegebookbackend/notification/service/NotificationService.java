package com.collegebook.collegebookbackend.notification.service;

import com.collegebook.collegebookbackend.common.PageResponse;
import com.collegebook.collegebookbackend.notification.dto.NotificationDto;

import java.util.UUID;

public interface NotificationService {
    PageResponse<NotificationDto> getMyNotifications(UUID userId, int page, int size);
    void markAsRead(UUID userId, UUID notificationId);
}
