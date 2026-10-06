package com.collegebook.collegebookbackend.notification.service;

import com.collegebook.collegebookbackend.common.PageResponse;
import com.collegebook.collegebookbackend.notification.dto.NotificationDto;

import java.util.UUID;

public interface NotificationService {
    PageResponse<NotificationDto> getMyNotifications(UUID userId, int page, int size);
    void markAsRead(UUID userId, UUID notificationId);
    long getUnreadCount(UUID userId);
    void createNotification(com.collegebook.collegebookbackend.auth.entity.User user, String type, String title, String message);
    void subscribeToPushNotifications(UUID userId, com.collegebook.collegebookbackend.notification.dto.PushSubscriptionDto dto);
    void unsubscribeFromPushNotifications(UUID userId, String endpoint);
    void notifyCollegeStudents(com.collegebook.collegebookbackend.college.entity.College college, String message, String type, String relatedId, UUID excludeUserId);
    void sendPushNotificationsAsync(java.util.List<UUID> userIds, String type, String title, String message);
}
