package com.winsizer.model;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "parties")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Party {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ADD THIS FIELD - IMPORTANT!
    private Long userId;

    private String partyName;
    private String contactNumber;
    private String partyType; // e.g. Supplier or Customer
    private String gstNumber;
    private String panNumber;
    private String billingAddress;
    private String city;
    private String state;
}