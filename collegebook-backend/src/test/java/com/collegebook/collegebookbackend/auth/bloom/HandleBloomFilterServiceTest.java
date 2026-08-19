package com.collegebook.collegebookbackend.auth.bloom;

import com.collegebook.collegebookbackend.profile.repository.ProfileRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class HandleBloomFilterServiceTest {

    @Mock
    private ProfileRepository profileRepository;

    private HandleBloomFilterService bloomFilterService;

    @BeforeEach
    void setUp() {
        when(profileRepository.findAllHandles()).thenReturn(List.of("existing_user", "alex.smith", "john_doe"));
        bloomFilterService = new HandleBloomFilterService(profileRepository);
        bloomFilterService.init();
    }

    @Test
    void testFormatValidation() {
        // Valid handles
        assertTrue(bloomFilterService.isValidHandleFormat("vatsal"));
        assertTrue(bloomFilterService.isValidHandleFormat("alex_smith"));
        assertTrue(bloomFilterService.isValidHandleFormat("john.doe.123"));
        assertTrue(bloomFilterService.isValidHandleFormat("@vatsal_dev")); // '@' stripped during normalize

        // Invalid handles
        assertFalse(bloomFilterService.isValidHandleFormat("ab")); // < 3 chars
        assertFalse(bloomFilterService.isValidHandleFormat("a".repeat(31))); // > 30 chars
        assertFalse(bloomFilterService.isValidHandleFormat("invalid@handle")); // contains illegal @ inside
        assertFalse(bloomFilterService.isValidHandleFormat("space user")); // contains space
        assertFalse(bloomFilterService.isValidHandleFormat("admin")); // reserved
        assertFalse(bloomFilterService.isValidHandleFormat("null")); // reserved
        assertFalse(bloomFilterService.isValidHandleFormat(null));
    }

    @Test
    void testHandleAvailability_PreloadedHandlesAreUnavailable() {
        when(profileRepository.existsByHandleIgnoreCase("existing_user")).thenReturn(true);
        // Pre-loaded handle should not be available
        assertFalse(bloomFilterService.isHandleAvailable("existing_user"));
        assertFalse(bloomFilterService.isHandleAvailable("@existing_user"));
        assertFalse(bloomFilterService.isHandleAvailable("EXISTING_USER"));
    }

    @Test
    void testHandleAvailability_NewHandleIsAvailable() {
        // New unique handle not in filter and not in DB
        assertTrue(bloomFilterService.isHandleAvailable("brand_new_handle_2026"));
        // DB query is not even invoked if Bloom filter says definitely not present
        verify(profileRepository, never()).existsByHandleIgnoreCase("brand_new_handle_2026");
    }

    @Test
    void testAddHandle_DynamicallyAddsToBloomFilter() {
        String newHandle = "sam_developer";
        assertTrue(bloomFilterService.isHandleAvailable(newHandle));

        // Add to filter
        bloomFilterService.addHandle(newHandle);

        // Mock DB exists check for the filter hit
        when(profileRepository.existsByHandleIgnoreCase("sam_developer")).thenReturn(true);

        assertFalse(bloomFilterService.isHandleAvailable(newHandle));
    }
}
