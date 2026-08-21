package com.collegebook.collegebookbackend.social;

import java.util.Map;
import java.util.UUID;

public interface SocialInteractionService {

    Map<String, Object> togglePostLike(UUID userId, UUID postId);

    Map<String, Object> togglePostSave(UUID userId, UUID postId);

    Map<String, Object> toggleTeamStar(UUID userId, UUID teamId);

    boolean isPostLikedByUser(UUID postId, UUID userId);

    boolean isPostSavedByUser(UUID postId, UUID userId);

    boolean isTeamStarredByUser(UUID teamId, UUID userId);

    long getPostLikesCount(UUID postId, long fallbackCount);

    long getPostSavesCount(UUID postId, long fallbackCount);

    long getTeamStarsCount(UUID teamId, long fallbackCount);

    void evictPost(UUID postId);

    void evictTeam(UUID teamId);

    void syncAllDirtyToDatabase();
}
