package com.collegebook.collegebookbackend.social;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
public class SocialBatchFlusherTest {

    @Mock
    private SocialInteractionService socialInteractionService;

    @InjectMocks
    private SocialBatchFlusher socialBatchFlusher;

    @Test
    void testFlushDirtySocialInteractions() {
        socialBatchFlusher.flushDirtySocialInteractions();
        verify(socialInteractionService).syncAllDirtyToDatabase();
    }
}
