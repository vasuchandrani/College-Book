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

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;

    @Override
    @Transactional(readOnly = true)
    public PageResponse<NotificationDto> getMyNotifications(UUID userId, int page, int size) {
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
}
