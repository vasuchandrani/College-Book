package com.collegebook.collegebookbackend.ad.entity;

import jakarta.persistence.Embeddable;

import java.io.Serializable;
import java.util.Objects;
import java.util.UUID;

@Embeddable
public class AdLikeId implements Serializable {

    private UUID adId;
    private UUID userId;

    public AdLikeId() {
    }

    public AdLikeId(UUID adId, UUID userId) {
        this.adId = adId;
        this.userId = userId;
    }

    public UUID getAdId() {
        return adId;
    }

    public void setAdId(UUID adId) {
        this.adId = adId;
    }

    public UUID getUserId() {
        return userId;
    }

    public void setUserId(UUID userId) {
        this.userId = userId;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        AdLikeId adLikeId = (AdLikeId) o;
        return Objects.equals(adId, adLikeId.adId) && Objects.equals(userId, adLikeId.userId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(adId, userId);
    }
}
