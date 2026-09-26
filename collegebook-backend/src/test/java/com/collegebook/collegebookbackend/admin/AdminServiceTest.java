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
import com.collegebook.collegebookbackend.common.PageResponse;
import com.collegebook.collegebookbackend.post.dto.PostResponseDto;
import com.collegebook.collegebookbackend.post.entity.Post;
import com.collegebook.collegebookbackend.post.repository.PostRepository;
import com.collegebook.collegebookbackend.post.service.PostService;
import com.collegebook.collegebookbackend.social.SocialInteractionService;
import com.collegebook.collegebookbackend.storage.service.MediaService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
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

    @Mock
    private PostService postService;

    @Mock
    private MediaService mediaService;

    @Mock
    private SocialInteractionService socialInteractionService;

    @Mock
    private com.collegebook.collegebookbackend.college.repository.CollegeRepository collegeRepository;

    @Mock
    private com.collegebook.collegebookbackend.college.repository.CourseRepository courseRepository;

    @Mock
    private com.collegebook.collegebookbackend.college.repository.BranchRepository branchRepository;

    private AdminServiceImpl adminService;

    @BeforeEach
    void setUp() {
        adminService = new AdminServiceImpl(
                userRepository,
                postRepository,
                teamRepository,
                adRepository,
                postService,
                mediaService,
                socialInteractionService,
                collegeRepository,
                courseRepository,
                branchRepository
        );
    }

    @Test
    void testGetAdminStatsSuccess() {
        when(userRepository.count()).thenReturn(100L);
        when(postRepository.count()).thenReturn(500L);
        when(teamRepository.count()).thenReturn(50L);
        when(adRepository.count()).thenReturn(10L);
        when(adRepository.findByIsActiveTrue()).thenReturn(List.of());

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

    @Test
    void testToggleAllAds() {
        Ad ad1 = new Ad();
        ad1.setId(UUID.randomUUID());
        ad1.setActive(true);

        Ad ad2 = new Ad();
        ad2.setId(UUID.randomUUID());
        ad2.setActive(true);

        when(adRepository.findAll()).thenReturn(List.of(ad1, ad2));

        Map<String, Object> result = adminService.toggleAllAds(false);

        assertNotNull(result);
        assertEquals(true, result.get("success"));
        assertEquals(false, result.get("active"));
        verify(adRepository).saveAll(any());
    }

    @Test
    void testGetCampusFeed() {
        UUID collegeId = UUID.randomUUID();
        PostResponseDto dto = PostResponseDto.builder().id(UUID.randomUUID()).content("Campus post").build();
        PageResponse<PostResponseDto> pageResp = PageResponse.of(List.of(dto), 0, 20, 1);

        when(postService.getPublicFeed(collegeId, null, 0, 20)).thenReturn(pageResp);

        PageResponse<PostResponseDto> res = adminService.getCampusFeed(collegeId, 0, 20);

        assertNotNull(res);
        assertEquals(1, res.getContent().size());
        assertEquals("Campus post", res.getContent().get(0).getContent());
    }

    @Test
    void testDeletePostByAdmin() {
        UUID postId = UUID.randomUUID();
        Post post = new Post();
        post.setId(postId);

        when(postRepository.findById(postId)).thenReturn(Optional.of(post));

        adminService.deletePostByAdmin(postId);

        verify(postRepository).delete(post);
    }
}
