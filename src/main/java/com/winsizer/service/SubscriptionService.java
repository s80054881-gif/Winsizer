package com.winsizer.service;

import com.winsizer.model.*;
import com.winsizer.repository.SubscriptionRepository;
import com.winsizer.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class SubscriptionService {

    @Autowired
    private SubscriptionRepository subscriptionRepository;

    @Autowired
    private OrderRepository orderRepository;

    /**
     * Initialize free subscription for new user
     */
    @Transactional
    public Subscription initializeFreeSubscription(Long userId) {
        // Check if subscription already exists
        Optional<Subscription> existing = subscriptionRepository.findByUserId(userId);
        if (existing.isPresent()) {
            return existing.get();
        }

        Subscription subscription = Subscription.builder()
                .userId(userId)
                .plan(SubscriptionPlan.FREE)
                .status(SubscriptionStatus.FREE)
                .freeOrdersUsed(0)
                .freeOrdersLimit(10)
                .autoRenew(false)
                .build();

        return subscriptionRepository.save(subscription);
    }

    /**
     * Get subscription for user
     */
    public Subscription getUserSubscription(Long userId) {
        return subscriptionRepository.findByUserId(userId)
                .orElseGet(() -> initializeFreeSubscription(userId));
    }

    /**
     * Check if user can create order
     */
    public boolean canCreateOrder(Long userId) {
        Subscription subscription = getUserSubscription(userId);
        return subscription.canCreateOrder();
    }

    /**
     * Increment free order count
     */
    @Transactional
    public void incrementOrderCount(Long userId) {
        Subscription subscription = getUserSubscription(userId);
        
        if (subscription.getStatus() == SubscriptionStatus.FREE) {
            subscription.setFreeOrdersUsed(subscription.getFreeOrdersUsed() + 1);
            subscriptionRepository.save(subscription);
        }
    }

    /**
     * Get remaining free orders
     */
    public int getRemainingFreeOrders(Long userId) {
        Subscription subscription = getUserSubscription(userId);
        return subscription.getRemainingFreeOrders();
    }

    /**
     * Activate paid subscription
     */
    @Transactional
    public Subscription activateSubscription(
            Long userId, 
            SubscriptionPlan plan, 
            String razorpayOrderId,
            String razorpayPaymentId,
            String razorpaySignature
    ) {
        Subscription subscription = getUserSubscription(userId);
        
        subscription.setPlan(plan);
        subscription.setStatus(SubscriptionStatus.ACTIVE);
        subscription.setStartDate(LocalDateTime.now());
        
        // Set end date based on plan
        if (plan == SubscriptionPlan.MONTHLY) {
            subscription.setEndDate(LocalDateTime.now().plusMonths(1));
        } else if (plan == SubscriptionPlan.YEARLY) {
            subscription.setEndDate(LocalDateTime.now().plusYears(1));
        }
        
        subscription.setRazorpayOrderId(razorpayOrderId);
        subscription.setRazorpayPaymentId(razorpayPaymentId);
        subscription.setRazorpaySignature(razorpaySignature);
        
        return subscriptionRepository.save(subscription);
    }

    /**
     * Check and update expired subscriptions
     */
    @Transactional
    public void checkExpiredSubscriptions() {
        LocalDateTime now = LocalDateTime.now();
        var expiredSubs = subscriptionRepository
            .findByEndDateBeforeAndStatus(now, SubscriptionStatus.ACTIVE);
        
        for (Subscription sub : expiredSubs) {
            sub.setStatus(SubscriptionStatus.EXPIRED);
            subscriptionRepository.save(sub);
        }
    }

    /**
     * Cancel subscription
     */
    @Transactional
    public Subscription cancelSubscription(Long userId) {
        Subscription subscription = getUserSubscription(userId);
        subscription.setStatus(SubscriptionStatus.CANCELLED);
        subscription.setAutoRenew(false);
        return subscriptionRepository.save(subscription);
    }

    /**
     * Get subscription stats
     */
    public SubscriptionStats getSubscriptionStats(Long userId) {
        Subscription subscription = getUserSubscription(userId);
        long totalOrders = orderRepository.findByUserId(userId).size();
        
        return SubscriptionStats.builder()
                .plan(subscription.getPlan().toString())
                .status(subscription.getStatus().toString())
                .isActive(subscription.isActive())
                .canCreateOrder(subscription.canCreateOrder())
                .freeOrdersUsed(subscription.getFreeOrdersUsed())
                .freeOrdersLimit(subscription.getFreeOrdersLimit())
                .remainingFreeOrders(subscription.getRemainingFreeOrders())
                .totalOrders(totalOrders)
                .startDate(subscription.getStartDate())
                .endDate(subscription.getEndDate())
                .autoRenew(subscription.getAutoRenew())
                .build();
    }
}

@lombok.Data
@lombok.Builder
class SubscriptionStats {
    private String plan;
    private String status;
    private boolean isActive;
    private boolean canCreateOrder;
    private int freeOrdersUsed;
    private int freeOrdersLimit;
    private int remainingFreeOrders;
    private long totalOrders;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private Boolean autoRenew;
}