package com.winsizer.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import com.winsizer.dto.AddOrderRequest;
import com.winsizer.dto.AddOrderResponse;
import com.winsizer.model.Order;
import com.winsizer.repository.OrderRepository;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private UserService userService;

    private Long getCurrentUserId() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userService.findByUsername(username).getId();
    }

    public AddOrderResponse addOrder(AddOrderRequest request) {
        Order order = mapRequestToOrder(request);
        order.setUserId(getCurrentUserId());
        calculateOrder(order);
        Order saved = orderRepository.save(order);
        return mapOrderToResponse(saved);
    }

    public List<AddOrderResponse> getAllOrders() {
        Long userId = getCurrentUserId();
        return orderRepository.findByUserId(userId).stream()
                .map(this::mapOrderToResponse)
                .collect(Collectors.toList());
    }

    public List<AddOrderResponse> getOrdersByParty(Long partyId) {
        Long userId = getCurrentUserId();
        return orderRepository.findByPartyIdAndUserId(partyId, userId)
                .stream()
                .map(this::mapOrderToResponse)
                .collect(Collectors.toList());
    }

    public Optional<AddOrderResponse> getOrderById(Long id) {
        Long userId = getCurrentUserId();
        return orderRepository.findByIdAndUserId(id, userId)
                .map(this::mapOrderToResponse);
    }

    public Optional<AddOrderResponse> updateOrder(Long id, AddOrderRequest request) {
        Long userId = getCurrentUserId();
        return orderRepository.findByIdAndUserId(id, userId).map(existing -> {
            existing.setPartyName(request.getPartyName());
            existing.setPartyId(request.getPartyId());
            existing.setWindowType(request.getWindowType());
            existing.setHeight(request.getHeight());
            existing.setWidth(request.getWidth());
            existing.setQuantity(request.getQuantity());
            existing.setTracks(request.getTracks());
            existing.setRate(request.getRate());
            
            existing.setAluminumColor((request.getAluminumColor() != null && !request.getAluminumColor().trim().isEmpty()) 
                ? request.getAluminumColor() : "Black");
            existing.setGlassMaterial((request.getGlassMaterial() != null && !request.getGlassMaterial().trim().isEmpty()) 
                ? request.getGlassMaterial() : "Zinga 3mm");
            existing.setHandlePattiInterlockReduction(request.getHandlePattiInterlockReduction() != 0.0 
                ? request.getHandlePattiInterlockReduction() : 1.5);
            existing.setBearingReduction(request.getBearingReduction() != 0.0 
                ? request.getBearingReduction() : 6.5);
            existing.setGlassHeightReduction(request.getGlassHeightReduction() != 0.0 
                ? request.getGlassHeightReduction() : 4.0);
            existing.setGlassWidthReduction(request.getGlassWidthReduction() != 0.0 
                ? request.getGlassWidthReduction() : 0.05);

            calculateOrder(existing);
            return mapOrderToResponse(orderRepository.save(existing));
        });
    }

    public boolean deleteOrder(Long id) {
        Long userId = getCurrentUserId();
        Optional<Order> order = orderRepository.findByIdAndUserId(id, userId);
        if (order.isPresent()) {
            orderRepository.deleteById(id);
            return true;
        }
        return false;
    }

    private Order mapRequestToOrder(AddOrderRequest request) {
        Order order = new Order();
        order.setPartyId(request.getPartyId());
        order.setPartyName(request.getPartyName());
        order.setWindowType(request.getWindowType());
        order.setHeight(request.getHeight());
        order.setWidth(request.getWidth());
        order.setQuantity(request.getQuantity());
        order.setTracks(request.getTracks());
        order.setRate(request.getRate());
        
        order.setAluminumColor((request.getAluminumColor() != null && !request.getAluminumColor().trim().isEmpty()) 
            ? request.getAluminumColor() : "Black");
        order.setGlassMaterial((request.getGlassMaterial() != null && !request.getGlassMaterial().trim().isEmpty()) 
            ? request.getGlassMaterial() : "Zinga 3mm");
        
        order.setHandlePattiInterlockReduction(request.getHandlePattiInterlockReduction() != 0.0 
            ? request.getHandlePattiInterlockReduction() : 1.5);
        order.setBearingReduction(request.getBearingReduction() != 0.0 
            ? request.getBearingReduction() : 6.5);
        order.setGlassHeightReduction(request.getGlassHeightReduction() != 0.0 
            ? request.getGlassHeightReduction() : 4.0);
        order.setGlassWidthReduction(request.getGlassWidthReduction() != 0.0 
            ? request.getGlassWidthReduction() : 0.05);
        
        return order;
    }

    private AddOrderResponse mapOrderToResponse(Order order) {
        AddOrderResponse resp = new AddOrderResponse();
        resp.setId(order.getId());
        resp.setPartyName(order.getPartyName());
        resp.setWindowType(order.getWindowType());
        resp.setHeight(order.getHeight());
        resp.setWidth(order.getWidth());
        resp.setQuantity(order.getQuantity());
        resp.setTracks(order.getTracks());
        resp.setRate(order.getRate());
        
        resp.setAluminumColor(order.getAluminumColor() != null ? order.getAluminumColor() : "Black");
        resp.setGlassMaterial(order.getGlassMaterial() != null ? order.getGlassMaterial() : "Zinga 3mm");
        
        resp.setAreaPerWindow(order.getAreaPerWindow());
        resp.setTotalArea(order.getTotalArea());
        resp.setTotalCost(order.getTotalCost());
        resp.setTrackTopHeight(order.getTrackTopHeight());
        resp.setTrackTopWidth(order.getTrackTopWidth());
        resp.setTrackBottom(order.getTrackBottom());
        resp.setHandlePatti(order.getHandlePatti());
        resp.setInterlock(order.getInterlock());
        resp.setBearingBottom(order.getBearingBottom());
        resp.setGlassWidth(order.getGlassWidth());
        resp.setGlassHeight(order.getGlassHeight());
        resp.setGlassQuantity(order.getGlassQuantity());
        return resp;
    }

    private void calculateOrder(Order order) {
        Double heightObj = order.getHeight();
        Double widthObj = order.getWidth();
        Integer quantityObj = order.getQuantity();
        Integer tracksObj = order.getTracks();
        Double rateObj = order.getRate();
        
        double h = (heightObj != null) ? heightObj : 0.0;
        double w = (widthObj != null) ? widthObj : 0.0;
        int qty = (quantityObj != null) ? quantityObj : 1;
        int t = (tracksObj != null) ? tracksObj : 2;
        double r = (rateObj != null) ? rateObj : 0.0;

        Double hpIlReductionObj = order.getHandlePattiInterlockReduction();
        Double brReductionObj = order.getBearingReduction();
        Double ghReductionObj = order.getGlassHeightReduction();
        Double gwReductionObj = order.getGlassWidthReduction();
        
        double hpIlReduction = (hpIlReductionObj != null) ? hpIlReductionObj : 1.5;
        double brReduction = (brReductionObj != null) ? brReductionObj : 6.5;
        double ghReduction = (ghReductionObj != null) ? ghReductionObj : 4.0;
        double gwReduction = (gwReductionObj != null) ? gwReductionObj : 0.05;

        double heightFeet = h / 12;
        double widthFeet = w / 12;
        double heightRounded = Math.ceil(heightFeet * 2) / 2;
        double widthRounded = Math.ceil(widthFeet * 2) / 2;

        double areaPerWindow = heightRounded * widthRounded;
        double totalArea = areaPerWindow * qty;
        double totalCost = totalArea * r;

        order.setAreaPerWindow(areaPerWindow);
        order.setTotalArea(totalArea);
        order.setTotalCost(totalCost);

        order.setTrackTopHeight(h);
        order.setTrackTopWidth(w);
        order.setTrackBottom(w);
        order.setHandlePatti(h - hpIlReduction);
        order.setInterlock(h - hpIlReduction);
        order.setBearingBottom((w - brReduction) / t);

        order.setGlassHeight(h - ghReduction);
        order.setGlassWidth(order.getBearingBottom() + gwReduction);
        order.setGlassQuantity(t * qty);
    }
}