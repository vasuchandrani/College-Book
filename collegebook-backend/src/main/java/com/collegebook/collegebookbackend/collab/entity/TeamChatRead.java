package com.collegebook.collegebookbackend.collab.entity;

import jakarta.persistence.Column;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "team_chat_reads")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TeamChatRead {

    @EmbeddedId
    private TeamChatReadId id;

    @Column(name = "last_read_at", nullable = false)
    private Instant lastReadAt;

    public TeamChatRead(UUID teamId, UUID userId, Instant lastReadAt) {
        this.id = new TeamChatReadId(teamId, userId);
        this.lastReadAt = lastReadAt != null ? lastReadAt : Instant.now();
    }

    @PrePersist
    @PreUpdate
    protected void onPersist() {
        if (this.lastReadAt == null) {
            this.lastReadAt = Instant.now();
        }
    }
}
