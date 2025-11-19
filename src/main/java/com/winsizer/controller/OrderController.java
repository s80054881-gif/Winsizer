package com.winsizer.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.winsizer.dto.AddOrderRequest;
import com.winsizer.dto.AddOrderResponse;
import com.winsizer.service.OrderService;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    private OrderService orderService;

    @PostMapping
    public ResponseEntity<AddOrderResponse> addOrder(@RequestBody AddOrderRequest request) {
        AddOrderResponse response = orderService.addOrder(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<AddOrderResponse>> getAllOrders() {
        return ResponseEntity.ok(orderService.getAllOrders());
    }

    @GetMapping("/{id}")
    public ResponseEntity<AddOrderResponse> getOrderById(@PathVariable Long id) {
        return orderService.getOrderById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<AddOrderResponse> updateOrder(@PathVariable Long id, @RequestBody AddOrderRequest request) {
        return orderService.updateOrder(id, request)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteOrder(@PathVariable Long id) {
        boolean deleted = orderService.deleteOrder(id);
        return deleted ? ResponseEntity.noContent().build() : ResponseEntity.notFound().build();
    }

    @GetMapping("/party/{partyId}")
    public ResponseEntity<List<AddOrderResponse>> getOrdersByParty(@PathVariable Long partyId) {
        return ResponseEntity.ok(orderService.getOrdersByParty(partyId));
    }
}