package com.collegebook.collegebookbackend.ad.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "ads")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Ad {

    @Id
    @GeneratedValue
    @Column(columnDefinition = "uuid", updatable = false, nullable = false)
    private UUID id;

    @Column(name = "brand_name", nullable = false)
    private String brandName;

    @Column(name = "brand_logo_url")
    private String brandLogoUrl;

    @Column(name = "headline", nullable = false)
    private String headline;

    @Column(name = "body")
    private String body;

    @Column(name = "discount_text")
    private String discountText;

    @Column(name = "cta_text", nullable = false)
    private String ctaText = "Shop Now";

    @Column(name = "cta_url", nullable = false)
    private String ctaUrl;

    @Column(name = "comments_enabled", nullable = false)
    private boolean commentsEnabled = true;

    @Column(name = "is_active", nullable = false)
    private boolean isActive = true;

    @Column(name = "starts_at")
    private Instant startsAt;

    @Column(name = "ends_at")
    private Instant endsAt;

    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(name = "target_college_ids", columnDefinition = "uuid[]")
    private List<UUID> targetCollegeIds = new ArrayList<>();

    @Column(name = "priority", nullable = false)
    private short priority = 0;

    @Column(name = "like_count", nullable = false)
    private int likeCount = 0;

    @Column(name = "comment_count", nullable = false)
    private int commentCount = 0;

    @Column(name = "deleted_at")
    private Instant deletedAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist
    protected void onCreate() {
        Instant now = Instant.now();
        if (this.createdAt == null) {
            this.createdAt = now;
        }
        if (this.updatedAt == null) {
            this.updatedAt = now;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = Instant.now();
    }

    // Compatibility getters & setters for existing service/dto usage
    public String getTitle() {
        return headline;
    }

    public void setTitle(String title) {
        this.headline = title;
    }

    public String getImageUrl() {
        return brandLogoUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.brandLogoUrl = imageUrl;
    }

    public String getDestinationUrl() {
        return ctaUrl;
    }

    public void setDestinationUrl(String destinationUrl) {
        this.ctaUrl = destinationUrl;
    }

    public boolean isAllowComments() {
        return commentsEnabled;
    }

    public void setAllowComments(boolean allowComments) {
        this.commentsEnabled = allowComments;
    }

    public int getLikesCount() {
        return likeCount;
    }

    public void setLikesCount(int likesCount) {
        this.likeCount = likesCount;
    }

    public int getCommentsCount() {
        return commentCount;
    }

    public void setCommentsCount(int commentsCount) {
        this.commentCount = commentsCount;
    }
}
