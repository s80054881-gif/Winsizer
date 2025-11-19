package com.winsizer.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.winsizer.model.Order;
import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByUserId(Long userId);
    Optional<Order> findByIdAndUserId(Long id, Long userId);
    List<Order> findByPartyIdAndUserId(Long partyId, Long userId);
}