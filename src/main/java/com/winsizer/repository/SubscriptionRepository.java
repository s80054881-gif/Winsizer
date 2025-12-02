package com.winsizer.repository;

import com.winsizer.model.Subscription;
import com.winsizer.model.SubscriptionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface SubscriptionRepository extends JpaRepository<Subscription, Long> {
    
    Optional<Subscription> findByUserId(Long userId);
    
    boolean existsByUserId(Long userId);
    
    List<Subscription> findByStatus(SubscriptionStatus status);
    
    List<Subscription> findByEndDateBeforeAndStatus(
        LocalDateTime date, 
        SubscriptionStatus status
    );
    
}