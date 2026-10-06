package com.collegebook.collegebookbackend.notification.handler;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationPayload {
    private String title;
    private String message;
    private String actionUrl;
}
