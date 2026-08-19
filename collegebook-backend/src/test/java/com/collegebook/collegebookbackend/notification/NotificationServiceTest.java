package com.collegebook.collegebookbackend.notification;

import com.collegebook.collegebookbackend.auth.entity.User;
import com.collegebook.collegebookbackend.common.AppException;
import com.collegebook.collegebookbackend.common.ErrorCode;
import com.collegebook.collegebookbackend.notification.entity.Notification;
import com.collegebook.collegebookbackend.notification.repository.NotificationRepository;
import com.collegebook.collegebookbackend.notification.service.impl.NotificationServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class NotificationServiceTest {

    @Mock
    private NotificationRepository notificationRepository;

    private NotificationServiceImpl notificationService;

    @BeforeEach
    void setUp() {
        notificationService = new NotificationServiceImpl(notificationRepository);
    }

    @Test
    void testMarkAsReadSuccess() {
        UUID userId = UUID.randomUUID();
        UUID notifId = UUID.randomUUID();

        User user = new User();
        user.setId(userId);

        Notification notif = new Notification();
        notif.setId(notifId);
        notif.setUser(user);
        notif.setRead(false);

        when(notificationRepository.findById(notifId)).thenReturn(Optional.of(notif));

        notificationService.markAsRead(userId, notifId);

        assertTrue(notif.isRead());
    }

    @Test
    void testMarkAsReadUnauthorized() {
        UUID userId = UUID.randomUUID();
        UUID otherUserId = UUID.randomUUID();
        UUID notifId = UUID.randomUUID();

        User user = new User();
        user.setId(userId);

        Notification notif = new Notification();
        notif.setId(notifId);
        notif.setUser(user);

        when(notificationRepository.findById(notifId)).thenReturn(Optional.of(notif));

        AppException ex = assertThrows(AppException.class, () -> notificationService.markAsRead(otherUserId, notifId));

        assertEquals(ErrorCode.FORBIDDEN, ex.getErrorCode());
    }
}
