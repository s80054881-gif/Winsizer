package com.winsizer.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "subscriptions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Subscription {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false, unique = true)
    private Long userId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SubscriptionPlan plan;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SubscriptionStatus status;

    @Column(name = "start_date")
    private LocalDateTime startDate;

    @Column(name = "end_date")
    private LocalDateTime endDate;

    @Column(name = "free_orders_used", nullable = false)
    private Integer freeOrdersUsed = 0;

    @Column(name = "free_orders_limit", nullable = false)
    private Integer freeOrdersLimit = 10;

    // For Razorpay
    @Column(name = "razorpay_order_id")
    private String razorpayOrderId;

    @Column(name = "razorpay_payment_id")
    private String razorpayPaymentId;

    @Column(name = "razorpay_signature")
    private String razorpaySignature;

    @Column(name = "auto_renew")
    private Boolean autoRenew = false;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null) {
            status = SubscriptionStatus.FREE;
        }
        if (plan == null) {
            plan = SubscriptionPlan.FREE;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Check if subscription is active
    public boolean isActive() {
        if (status == SubscriptionStatus.FREE) {
            return freeOrdersUsed < freeOrdersLimit;
        }
        return status == SubscriptionStatus.ACTIVE && 
               endDate != null && 
               endDate.isAfter(LocalDateTime.now());
    }

    // Check if user can create order
    public boolean canCreateOrder() {
        if (status == SubscriptionStatus.FREE) {
            return freeOrdersUsed < freeOrdersLimit;
        }
        return isActive();
    }

    // Get remaining free orders
    public int getRemainingFreeOrders() {
        if (status == SubscriptionStatus.FREE) {
            return Math.max(0, freeOrdersLimit - freeOrdersUsed);
        }
        return 0;
    }
}


