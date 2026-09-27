package com.collegebook.collegebookbackend.notification.entity;

import com.collegebook.collegebookbackend.auth.entity.User;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "push_subscriptions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PushSubscription {

    @Id
    private String endpoint;

    private String p256dh;
    private String auth;

    @ManyToOne
    private User user;

    @CreationTimestamp
    private LocalDateTime createdAt;
}
