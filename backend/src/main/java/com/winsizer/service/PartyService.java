package com.winsizer.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.winsizer.dto.PartyRequest;
import com.winsizer.dto.PartyResponse;
import com.winsizer.model.Party;
import com.winsizer.repository.PartyRepository;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PartyService {

    private final PartyRepository partyRepository;
    
    @Autowired
    private UserService userService;

    // Get current logged-in user ID
    private Long getCurrentUserId() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userService.findByUsername(username).getId();
    }

    public PartyResponse createParty(PartyRequest request) {
        Party party = Party.builder()
                .userId(getCurrentUserId()) // Set current user's ID
                .partyName(request.getPartyName())
                .contactNumber(request.getContactNumber())
                .partyType(request.getPartyType())
                .gstNumber(request.getGstNumber())
                .panNumber(request.getPanNumber())
                .billingAddress(request.getBillingAddress())
                .city(request.getCity())
                .state(request.getState())
                .build();

        party = partyRepository.save(party);
        return mapToResponse(party);
    }

    public PartyResponse updateParty(Long id, PartyRequest request) {
        Long userId = getCurrentUserId();
        Party party = partyRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new RuntimeException("Party not found with id: " + id));

        party.setPartyName(request.getPartyName());
        party.setContactNumber(request.getContactNumber());
        party.setPartyType(request.getPartyType());
        party.setGstNumber(request.getGstNumber());
        party.setPanNumber(request.getPanNumber());
        party.setBillingAddress(request.getBillingAddress());
        party.setCity(request.getCity());
        party.setState(request.getState());

        partyRepository.save(party);
        return mapToResponse(party);
    }

    public List<PartyResponse> getAllParties() {
        Long userId = getCurrentUserId();
        return partyRepository.findByUserId(userId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public PartyResponse getPartyById(Long id) {
        Long userId = getCurrentUserId();
        Party party = partyRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new RuntimeException("Party not found with id: " + id));
        return mapToResponse(party);
    }

    public void deleteParty(Long id) {
        Long userId = getCurrentUserId();
        Party party = partyRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new RuntimeException("Party not found with id: " + id));
        partyRepository.deleteById(id);
    }

    private PartyResponse mapToResponse(Party party) {
        return PartyResponse.builder()
                .id(party.getId())
                .partyName(party.getPartyName())
                .contactNumber(party.getContactNumber())
                .partyType(party.getPartyType())
                .gstNumber(party.getGstNumber())
                .panNumber(party.getPanNumber())
                .billingAddress(party.getBillingAddress())
                .city(party.getCity())
                .state(party.getState())
                .build();
    }
}