package com.winsizer.controller;

import com.winsizer.dto.PartyRequest;
import com.winsizer.dto.PartyResponse;
import com.winsizer.service.PartyService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
@CrossOrigin(origins = "*")

@RestController
@RequestMapping("/api/parties")
@RequiredArgsConstructor
public class PartyController {

    private final PartyService partyService; // directly using class now

    @PostMapping
    public ResponseEntity<PartyResponse> createParty(@RequestBody PartyRequest request) {
        return ResponseEntity.ok(partyService.createParty(request));
    }

    @GetMapping
    public ResponseEntity<List<PartyResponse>> getAllParties() {
        return ResponseEntity.ok(partyService.getAllParties());
    }

    @GetMapping("/{id}")
    public ResponseEntity<PartyResponse> getPartyById(@PathVariable Long id) {
        return ResponseEntity.ok(partyService.getPartyById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PartyResponse> updateParty(@PathVariable Long id, @RequestBody PartyRequest request) {
        return ResponseEntity.ok(partyService.updateParty(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteParty(@PathVariable Long id) {
        partyService.deleteParty(id);
        return ResponseEntity.noContent().build();
    }
}
