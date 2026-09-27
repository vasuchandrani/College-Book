package com.collegebook.collegebookbackend.notification.dto;

import lombok.Data;

@Data
public class PushSubscriptionDto {
    private String endpoint;
    private Keys keys;

    @Data
    public static class Keys {
        private String p256dh;
        private String auth;
    }
}
