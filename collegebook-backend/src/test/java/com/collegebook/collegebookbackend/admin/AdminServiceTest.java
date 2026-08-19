package com.collegebook.collegebookbackend.admin;

import com.collegebook.collegebookbackend.ad.dto.AdResponseDto;
import com.collegebook.collegebookbackend.ad.entity.Ad;
import com.collegebook.collegebookbackend.ad.repository.AdRepository;
import com.collegebook.collegebookbackend.admin.dto.CreateAdRequest;
import com.collegebook.collegebookbackend.admin.service.impl.AdminServiceImpl;
import com.collegebook.collegebookbackend.auth.repository.UserRepository;
import com.collegebook.collegebookbackend.collab.repository.TeamRepository;
import com.collegebook.collegebookbackend.common.AppException;
import com.collegebook.collegebookbackend.common.ErrorCode;
import com.collegebook.collegebookbackend.post.repository.PostRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class AdminServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PostRepository postRepository;

    @Mock
    private TeamRepository teamRepository;

    @Mock
    private AdRepository adRepository;

    private AdminServiceImpl adminService;

    @BeforeEach
    void setUp() {
        adminService = new AdminServiceImpl(userRepository, postRepository, teamRepository, adRepository);
    }

    @Test
    void testGetAdminStatsSuccess() {
        when(userRepository.count()).thenReturn(100L);
        when(postRepository.count()).thenReturn(500L);
        when(teamRepository.count()).thenReturn(50L);
        when(adRepository.count()).thenReturn(10L);

        Map<String, Long> stats = adminService.getAdminStats();

        assertNotNull(stats);
        assertEquals(100L, stats.get("students"));
        assertEquals(500L, stats.get("posts"));
        assertEquals(50L, stats.get("teams"));
        assertEquals(10L, stats.get("ads"));
    }

    @Test
    void testCreateAdSuccess() {
        UUID adId = UUID.randomUUID();
        CreateAdRequest req = new CreateAdRequest();
        req.setTitle("Campus Tech Fest 2026");
        req.setImageUrl("https://cloudinary.com/fest.png");
        req.setDestinationUrl("https://fest.collegebook.com");
        req.setAllowComments(true);

        when(adRepository.save(any(Ad.class))).thenAnswer(invocation -> {
            Ad a = invocation.getArgument(0);
            a.setId(adId);
            return a;
        });

        AdResponseDto result = adminService.createAd(req);

        assertNotNull(result);
        assertEquals(adId, result.getId());
        assertEquals("Campus Tech Fest 2026", result.getTitle());
        assertEquals("https://fest.collegebook.com", result.getDestinationUrl());
    }

    @Test
    void testDeleteAdSuccess() {
        UUID adId = UUID.randomUUID();
        Ad ad = new Ad();
        ad.setId(adId);

        when(adRepository.findById(adId)).thenReturn(Optional.of(ad));

        adminService.deleteAd(adId);

        verify(adRepository).delete(ad);
    }

    @Test
    void testDeleteAdNotFound() {
        UUID adId = UUID.randomUUID();
        when(adRepository.findById(adId)).thenReturn(Optional.empty());

        AppException ex = assertThrows(AppException.class, () -> adminService.deleteAd(adId));
        assertEquals(ErrorCode.NOT_FOUND, ex.getErrorCode());
    }
}
