package com.collegebook.collegebookbackend.notification.service.impl;

import com.collegebook.collegebookbackend.common.AppException;
import com.collegebook.collegebookbackend.common.ErrorCode;
import com.collegebook.collegebookbackend.common.PageResponse;
import com.collegebook.collegebookbackend.notification.dto.NotificationDto;
import com.collegebook.collegebookbackend.notification.entity.Notification;
import com.collegebook.collegebookbackend.notification.repository.NotificationRepository;
import com.collegebook.collegebookbackend.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.collegebook.collegebookbackend.notification.dto.PushSubscriptionDto;
import com.collegebook.collegebookbackend.notification.entity.PushSubscription;
import com.collegebook.collegebookbackend.notification.repository.PushSubscriptionRepository;
import com.collegebook.collegebookbackend.auth.entity.User;
import nl.martijndwars.webpush.PushService;
import org.springframework.beans.factory.annotation.Value;
import org.bouncycastle.jce.provider.BouncyCastleProvider;
import java.security.Security;
import jakarta.annotation.PostConstruct;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final PushSubscriptionRepository pushSubscriptionRepository;
    private final com.collegebook.collegebookbackend.auth.repository.UserRepository userRepository;
    private final org.springframework.data.redis.core.StringRedisTemplate redisTemplate;

    @Value("${webpush.vapid.public-key}")
    private String vapidPublicKey;

    @Value("${webpush.vapid.private-key}")
    private String vapidPrivateKey;

    @Value("${webpush.vapid.subject}")
    private String vapidSubject;

    private PushService pushService;

    @PostConstruct
    public void init() {
        try {
            if (Security.getProvider(BouncyCastleProvider.PROVIDER_NAME) == null) {
                Security.addProvider(new BouncyCastleProvider());
            }
            if (vapidPublicKey != null && !vapidPublicKey.isBlank() && vapidPrivateKey != null && !vapidPrivateKey.isBlank()) {
                pushService = new PushService(vapidPublicKey, vapidPrivateKey, vapidSubject);
            }
        } catch (Exception e) {
            System.err.println("Failed to initialize PushService: " + e.getMessage());
        }
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<NotificationDto> getMyNotifications(UUID userId, int page, int size) {
        // Clear the unread badge automatically when they open notifications
        redisTemplate.delete("cb:notif:unread:" + userId);
        
        Pageable pageable = PageRequest.of(page, size);
        Page<Notification> notifPage = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);

        List<NotificationDto> content = notifPage.getContent().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());

        return PageResponse.of(content, notifPage.getNumber(), notifPage.getSize(), notifPage.getTotalElements());
    }

    @Override
    @Transactional
    public void markAsRead(UUID userId, UUID notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "Notification not found"));

        if (!notification.getUser().getId().equals(userId)) {
            throw new AppException(ErrorCode.FORBIDDEN, "Not authorized");
        }

        notification.setRead(true);
        notificationRepository.save(notification);
    }

    private NotificationDto mapToDto(Notification notif) {
        return NotificationDto.builder()
                .id(notif.getId())
                .type(notif.getType())
                .title(notif.getTitle())
                .message(notif.getMessage())
                .isRead(notif.isRead())
                .createdAt(notif.getCreatedAt())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public long getUnreadCount(UUID userId) {
        String countStr = redisTemplate.opsForValue().get("cb:notif:unread:" + userId);
        return countStr != null ? Long.parseLong(countStr) : 0L;
    }

    @Override
    @Transactional
    public void createNotification(User user, String type, String title, String message) {
        com.collegebook.collegebookbackend.notification.entity.Notification notif =
                com.collegebook.collegebookbackend.notification.entity.Notification.builder()
                        .user(user)
                        .type(type)
                        .title(title)
                        .message(message)
                        .isRead(false)
                        .build();
        notificationRepository.save(notif);

        // Send Push
        if (pushService != null) {
            List<PushSubscription> subs = pushSubscriptionRepository.findByUserId(user.getId());
            for (PushSubscription sub : subs) {
                try {
                    nl.martijndwars.webpush.Subscription webSub = new nl.martijndwars.webpush.Subscription(
                            sub.getEndpoint(),
                            new nl.martijndwars.webpush.Subscription.Keys(sub.getP256dh(), sub.getAuth())
                    );
                    String payload = String.format("{\"title\":\"%s\", \"body\":\"%s\", \"type\":\"%s\"}", 
                            title.replace("\"", "\\\""), 
                            message.replace("\"", "\\\""), 
                            type);
                    nl.martijndwars.webpush.Notification pushNotif = new nl.martijndwars.webpush.Notification(webSub, payload);
                    pushService.send(pushNotif);
                } catch (Exception e) {
                    // Log error, potentially remove expired subscriptions
                    System.err.println("Push failed for " + user.getEmail() + ": " + e.getMessage());
                }
            }
        }
    }
    
    @Override
    @org.springframework.scheduling.annotation.Async
    public void sendPushNotificationsAsync(List<UUID> userIds, String type, String title, String message) {
        if (pushService == null) return;
        
        List<PushSubscription> subs = pushSubscriptionRepository.findByUserIdIn(userIds);
        for (PushSubscription sub : subs) {
            try {
                nl.martijndwars.webpush.Subscription webSub = new nl.martijndwars.webpush.Subscription(
                        sub.getEndpoint(),
                        new nl.martijndwars.webpush.Subscription.Keys(sub.getP256dh(), sub.getAuth())
                );
                String payload = String.format("{\"title\":\"%s\", \"body\":\"%s\", \"type\":\"%s\"}", 
                        title.replace("\"", "\\\""), 
                        message.replace("\"", "\\\""), 
                        type);
                nl.martijndwars.webpush.Notification pushNotif = new nl.martijndwars.webpush.Notification(webSub, payload);
                pushService.send(pushNotif);
            } catch (Exception e) {
                log.error("Push failed for endpoint {}: {}", sub.getEndpoint(), e.getMessage());
            }
        }
    }

    @Override
    @Transactional
    public void subscribeToPushNotifications(UUID userId, PushSubscriptionDto dto) {
        PushSubscription sub = pushSubscriptionRepository.findById(dto.getEndpoint()).orElse(new PushSubscription());
        sub.setEndpoint(dto.getEndpoint());
        sub.setP256dh(dto.getKeys().getP256dh());
        sub.setAuth(dto.getKeys().getAuth());
        User user = new User();
        user.setId(userId);
        sub.setUser(user);
        pushSubscriptionRepository.save(sub);
    }

    @Override
    @Transactional
    public void unsubscribeFromPushNotifications(UUID userId, String endpoint) {
        pushSubscriptionRepository.findById(endpoint).ifPresent(sub -> {
            if (sub.getUser() != null && sub.getUser().getId().equals(userId)) {
                pushSubscriptionRepository.delete(sub);
            }
        });
    }
    @Override
    @org.springframework.scheduling.annotation.Async
    @Transactional
    public void notifyCollegeStudents(com.collegebook.collegebookbackend.college.entity.College college, String message, String type, String relatedId, UUID excludeUserId) {
        if (college == null) return;
        List<User> students = userRepository.findByCollegeId(college.getId());
        
        for (User student : students) {
            if (student.getId().equals(excludeUserId)) {
                continue;
            }
            createNotification(student, type, "New Update", message);
        }
    }
}
