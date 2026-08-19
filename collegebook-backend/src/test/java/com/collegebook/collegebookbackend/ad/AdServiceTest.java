package com.collegebook.collegebookbackend.ad;

import com.collegebook.collegebookbackend.ad.dto.AdResponseDto;
import com.collegebook.collegebookbackend.ad.entity.Ad;
import com.collegebook.collegebookbackend.ad.repository.AdCommentRepository;
import com.collegebook.collegebookbackend.ad.repository.AdLikeRepository;
import com.collegebook.collegebookbackend.ad.repository.AdRepository;
import com.collegebook.collegebookbackend.ad.service.impl.AdServiceImpl;
import com.collegebook.collegebookbackend.auth.entity.User;
import com.collegebook.collegebookbackend.auth.repository.UserRepository;
import com.collegebook.collegebookbackend.common.AppException;
import com.collegebook.collegebookbackend.common.ErrorCode;
import com.collegebook.collegebookbackend.post.dto.CreateCommentRequest;
import com.collegebook.collegebookbackend.profile.repository.ProfileRepository;
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
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class AdServiceTest {

    @Mock
    private AdRepository adRepository;
    @Mock
    private AdLikeRepository adLikeRepository;
    @Mock
    private AdCommentRepository adCommentRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private ProfileRepository profileRepository;

    private AdServiceImpl adService;

    @BeforeEach
    void setUp() {
        adService = new AdServiceImpl(
                adRepository,
                adLikeRepository,
                adCommentRepository,
                userRepository,
                profileRepository
        );
    }

    @Test
    void testGetFeedAdsFilterByCollege() {
        UUID collegeId = UUID.randomUUID();
        Ad ad1 = new Ad();
        ad1.setId(UUID.randomUUID());
        ad1.setTitle("Campus Tech Fest");
        ad1.setTargetCollegeIds(List.of(collegeId));

        Ad ad2 = new Ad();
        ad2.setId(UUID.randomUUID());
        ad2.setTitle("Global Hackathon");
        ad2.setTargetCollegeIds(List.of(UUID.randomUUID())); // Other college

        when(adRepository.findByIsActiveTrue()).thenReturn(List.of(ad1, ad2));

        List<AdResponseDto> ads = adService.getFeedAds(UUID.randomUUID(), collegeId);

        assertEquals(1, ads.size());
        assertEquals("Campus Tech Fest", ads.get(0).getTitle());
    }

    @Test
    void testAddCommentDisabled() {
        UUID userId = UUID.randomUUID();
        UUID adId = UUID.randomUUID();
        Ad ad = new Ad();
        ad.setId(adId);
        ad.setAllowComments(false);

        when(adRepository.findById(adId)).thenReturn(Optional.of(ad));

        CreateCommentRequest req = new CreateCommentRequest("Great ad!");
        AppException ex = assertThrows(AppException.class, () -> adService.addComment(userId, adId, req));

        assertEquals(ErrorCode.COMMENTS_DISABLED, ex.getErrorCode());
    }

    @Test
    void testToggleLikeAd() {
        UUID userId = UUID.randomUUID();
        UUID adId = UUID.randomUUID();
        Ad ad = new Ad();
        ad.setId(adId);
        ad.setLikesCount(5);

        User user = new User();
        user.setId(userId);

        when(adRepository.findById(adId)).thenReturn(Optional.of(ad));
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(adLikeRepository.existsByIdAdIdAndIdUserId(adId, userId)).thenReturn(false);

        Map<String, Object> result = adService.toggleLike(userId, adId);

        assertTrue((Boolean) result.get("liked"));
        assertEquals(6, result.get("likesCount"));
    }
}
