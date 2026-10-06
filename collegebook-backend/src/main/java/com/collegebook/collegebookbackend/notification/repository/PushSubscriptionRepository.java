package com.collegebook.collegebookbackend.notification.repository;

import com.collegebook.collegebookbackend.notification.entity.PushSubscription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PushSubscriptionRepository extends JpaRepository<PushSubscription, String> {
    List<PushSubscription> findByUserId(UUID userId);
    List<PushSubscription> findByUserIdIn(List<UUID> userIds);
}
