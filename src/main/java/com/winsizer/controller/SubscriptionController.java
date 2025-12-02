package com.winsizer.controller;

import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.razorpay.Utils;
import com.winsizer.dto.MessageResponse;
import com.winsizer.model.SubscriptionPlan;
import com.winsizer.service.SubscriptionService;
import com.winsizer.service.UserService;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/subscription")
@CrossOrigin(origins = "*")
public class SubscriptionController {

    @Autowired
    private SubscriptionService subscriptionService;

    @Autowired
    private UserService userService;

    @Value("${razorpay.key.id}")
    private String razorpayKeyId;

    @Value("${razorpay.key.secret}")
    private String razorpayKeySecret;

    private Long getCurrentUserId() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userService.findByUsername(username).getId();
    }

    /**
     * Get current user's subscription status
     */
    @GetMapping("/status")
    public ResponseEntity<?> getSubscriptionStatus() {
        try {
            Long userId = getCurrentUserId();
            var stats = subscriptionService.getSubscriptionStats(userId);
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Error fetching subscription: " + e.getMessage(), false));
        }
    }

    /**
     * Create Razorpay order
     */
    @PostMapping("/create-order")
    public ResponseEntity<?> createOrder(@RequestBody Map<String, String> request) {
        try {
            String planType = request.get("plan");
            
            // Determine amount based on plan
            int amount;
            if ("MONTHLY".equals(planType)) {
                amount = 9900; // ₹99 in paise
            } else if ("YEARLY".equals(planType)) {
                amount = 99900; // ₹999 in paise
            } else {
                return ResponseEntity.badRequest()
                        .body(new MessageResponse("Invalid plan", false));
            }

            RazorpayClient client = new RazorpayClient(razorpayKeyId, razorpayKeySecret);

            JSONObject orderRequest = new JSONObject();
            orderRequest.put("amount", (Object) amount);
            orderRequest.put("currency", (Object) "INR");
            orderRequest.put("receipt", (Object) ("sub_" + System.currentTimeMillis()));
            orderRequest.put("payment_capture", (Object) 1);

            Order order = client.orders.create(orderRequest);

            JSONObject response = new JSONObject();
            response.put("orderId", (Object) order.get("id"));
            response.put("amount", (Object) order.get("amount"));
            response.put("currency", (Object) order.get("currency"));
            response.put("keyId", (Object) razorpayKeyId);

            return ResponseEntity.ok(response.toMap());

        } catch (RazorpayException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Error creating order: " + e.getMessage(), false));
        }
    }

    /**
     * Verify payment and activate subscription
     */
    @PostMapping("/verify-payment")
    public ResponseEntity<?> verifyPayment(@RequestBody Map<String, String> request) {
        try {
            String razorpayOrderId = request.get("razorpay_order_id");
            String razorpayPaymentId = request.get("razorpay_payment_id");
            String razorpaySignature = request.get("razorpay_signature");
            String planType = request.get("plan");

            // Verify signature
            JSONObject options = new JSONObject();
            options.put("razorpay_order_id", (Object) razorpayOrderId);
            options.put("razorpay_payment_id", (Object) razorpayPaymentId);
            options.put("razorpay_signature", (Object) razorpaySignature);

            boolean isValid = Utils.verifyPaymentSignature(options, razorpayKeySecret);

            if (!isValid) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(new MessageResponse("Invalid payment signature", false));
            }

            // Activate subscription
            Long userId = getCurrentUserId();
            SubscriptionPlan plan = SubscriptionPlan.valueOf(planType);
            
            subscriptionService.activateSubscription(
                    userId, 
                    plan, 
                    razorpayOrderId, 
                    razorpayPaymentId, 
                    razorpaySignature
            );

            return ResponseEntity.ok(new MessageResponse("Subscription activated successfully", true));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Error verifying payment: " + e.getMessage(), false));
        }
    }

    /**
     * Cancel subscription
     */
    @PostMapping("/cancel")
    public ResponseEntity<?> cancelSubscription() {
        try {
            Long userId = getCurrentUserId();
            subscriptionService.cancelSubscription(userId);
            return ResponseEntity.ok(new MessageResponse("Subscription cancelled", true));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Error cancelling subscription: " + e.getMessage(), false));
        }
    }

    /**
     * Get subscription plans
     */
    @GetMapping("/plans")
    public ResponseEntity<?> getPlans() {
        return ResponseEntity.ok(Map.of(
                "plans", new Object[]{
                        Map.of(
                                "id", "MONTHLY",
                                "name", "Monthly Plan",
                                "price", 99,
                                "currency", "INR",
                                "duration", "1 month",
                                "features", new String[]{
                                        "Unlimited orders",
                                        "Priority support",
                                        "All features unlocked"
                                }
                        ),
                        Map.of(
                                "id", "YEARLY",
                                "name", "Yearly Plan",
                                "price", 999,
                                "currency", "INR",
                                "duration", "1 year",
                                "savings", "Save ₹189",
                                "features", new String[]{
                                        "Unlimited orders",
                                        "Priority support",
                                        "All features unlocked",
                                        "16% discount"
                                }
                        )
                }
        ));
    }
}