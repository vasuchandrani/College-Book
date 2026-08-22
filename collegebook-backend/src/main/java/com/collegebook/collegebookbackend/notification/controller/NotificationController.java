package com.collegebook.collegebookbackend.notification.controller;

import com.collegebook.collegebookbackend.auth.UserPrincipal;
import com.collegebook.collegebookbackend.common.CurrentUser;
import com.collegebook.collegebookbackend.common.PageResponse;
import com.collegebook.collegebookbackend.notification.dto.NotificationDto;
import com.collegebook.collegebookbackend.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    public ResponseEntity<PageResponse<NotificationDto>> getMyNotifications(
            @CurrentUser UserPrincipal currentUser,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "20") int size) {
        UUID userId = currentUser != null ? currentUser.getId() : null;
        return ResponseEntity.ok(notificationService.getMyNotifications(userId, page, size));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(
            @CurrentUser UserPrincipal currentUser,
            @PathVariable("id") UUID notificationId) {
        UUID userId = currentUser != null ? currentUser.getId() : null;
        notificationService.markAsRead(userId, notificationId);
        return ResponseEntity.noContent().build();
    }
}
