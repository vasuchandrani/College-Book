package com.collegebook.collegebookbackend.collab.entity;

import com.collegebook.collegebookbackend.auth.entity.User;
import com.collegebook.collegebookbackend.college.entity.College;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
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
@Table(name = "teams")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Team {

    @Id
    @GeneratedValue
    @Column(columnDefinition = "uuid", updatable = false, nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "lead_id", nullable = false)
    private User owner;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "college_id", nullable = false)
    private College college;

    @Column(name = "title", nullable = false)
    private String title;

    @Enumerated(EnumType.STRING)
    @Column(name = "kind", nullable = false)
    private TeamType type;

    @Column(name = "description", columnDefinition = "text")
    private String description;

    @Column(name = "github_url")
    private String githubLink;

    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(name = "skills", columnDefinition = "text[]")
    @Builder.Default
    private List<String> skills = new ArrayList<>();

    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(name = "required_roles", columnDefinition = "text[]")
    @Builder.Default
    private List<String> requiredRoles = new ArrayList<>();

    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(name = "required_expertise", columnDefinition = "text[]")
    @Builder.Default
    private List<String> requiredExpertise = new ArrayList<>();

    @Column(name = "max_members", nullable = false)
    @Builder.Default
    private int maxMembers = 4;

    @Column(name = "current_members_count", nullable = false)
    @Builder.Default
    private int currentMembersCount = 1;

    @Column(name = "is_completed", nullable = false)
    @Builder.Default
    private boolean completed = false;

    @Column(name = "stars_count", nullable = false)
    @Builder.Default
    private int starsCount = 0;

    @Column(name = "owner_name")
    private String ownerName;

    @Column(name = "owner_handle")
    private String ownerHandle;

    @Column(name = "owner_avatar_url", columnDefinition = "text")
    private String ownerAvatarUrl;

    @Column(name = "college_name")
    private String collegeName;

    @Column(name = "college_short_name")
    private String collegeShortName;

    @Column(name = "owner_college_name")
    private String ownerCollegeName;

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
}
