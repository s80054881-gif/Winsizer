package com.winsizer.repository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.winsizer.model.Party;

import java.util.List;
import java.util.Optional;

@Repository
public interface PartyRepository extends JpaRepository<Party, Long> {
    List<Party> findByUserId(Long userId);
    Optional<Party> findByIdAndUserId(Long id, Long userId);
}