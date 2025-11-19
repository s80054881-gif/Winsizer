package com.winsizer.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "orders")
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "party_id")
    private Long partyId;

    @Column(name = "party_name", nullable = false)
    private String partyName;

    @Column(name = "window_type")
    private String windowType;

    @Column(nullable = false)
    private Double height;

    @Column(nullable = false)
    private Double width;

    @Column(nullable = false)
    private Integer quantity;

    @Column(nullable = false)
    private Integer tracks;

    @Column(nullable = false)
    private Double rate;

    @Column(name = "aluminum_color")
    private String aluminumColor;

    @Column(name = "glass_material")
    private String glassMaterial;

    @Column(name = "area_per_window")
    private Double areaPerWindow;

    @Column(name = "total_area")
    private Double totalArea;

    @Column(name = "total_cost")
    private Double totalCost;

    @Column(name = "track_top_height")
    private Double trackTopHeight;

    @Column(name = "track_top_width")
    private Double trackTopWidth;

    @Column(name = "track_bottom")
    private Double trackBottom;

    @Column(name = "handle_patti")
    private Double handlePatti;

    @Column(name = "interlock")
    private Double interlock;

    @Column(name = "bearing_bottom")
    private Double bearingBottom;

    @Column(name = "glass_width")
    private Double glassWidth;

    @Column(name = "glass_height")
    private Double glassHeight;

    @Column(name = "glass_quantity")
    private Integer glassQuantity;

    @Column(name = "handle_patti_interlock_reduction")
    private Double handlePattiInterlockReduction;

    @Column(name = "bearing_reduction")
    private Double bearingReduction;

    @Column(name = "glass_height_reduction")
    private Double glassHeightReduction;

    @Column(name = "glass_width_reduction")
    private Double glassWidthReduction;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}