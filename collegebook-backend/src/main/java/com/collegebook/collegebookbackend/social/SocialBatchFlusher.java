package com.collegebook.collegebookbackend.social;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class SocialBatchFlusher {

    private final SocialInteractionService socialInteractionService;

    @Scheduled(fixedDelayString = "${app.social.sync-interval-ms:15000}")
    public void flushDirtySocialInteractions() {
        try {
            socialInteractionService.syncAllDirtyToDatabase();
        } catch (Exception e) {
            log.error("Failed to execute scheduled social batch flush: {}", e.getMessage(), e);
        }
    }
}
