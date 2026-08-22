package com.collegebook.collegebookbackend.profile.entity;

import com.collegebook.collegebookbackend.auth.entity.User;
import com.collegebook.collegebookbackend.college.entity.College;
import com.collegebook.collegebookbackend.college.entity.Course;
import com.collegebook.collegebookbackend.college.entity.Department;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapsId;
import jakarta.persistence.OneToOne;
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
@Table(name = "profiles")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Profile {

    @Id
    @Column(name = "user_id", columnDefinition = "uuid")
    private UUID userId;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "handle", nullable = false, unique = true)
    private String handle;

    @Column(name = "full_name", nullable = false)
    private String fullName;

    @Column(name = "initials", nullable = false)
    private String initials;

    @Enumerated(EnumType.STRING)
    @Column(name = "gender")
    private Gender gender;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id")
    private Course course;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id")
    private Department department;

    @Column(name = "current_year")
    private Short currentYear;

    @Column(name = "default_bio")
    private String defaultBio;

    @Column(name = "bio_extra", columnDefinition = "text")
    private String bioExtra;

    @Column(name = "avatar_url")
    private String avatarUrl;

    @Column(name = "github_url")
    private String githubUrl;

    @Column(name = "linkedin_url")
    private String linkedinUrl;

    @Column(name = "website_url")
    private String websiteUrl;

    @Column(name = "memory_book_email")
    private String memoryBookEmail;

    @Column(name = "custom_links", columnDefinition = "text")
    private String customLinks;

    @Column(name = "contact_details", columnDefinition = "text")
    private String contactDetails;

    @Column(name = "is_public", nullable = false)
    @Builder.Default
    private boolean isPublic = true;

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

    public String getSlug() {
        return handle;
    }

    public College getCollege() {
        return user != null ? user.getCollege() : null;
    }
}
