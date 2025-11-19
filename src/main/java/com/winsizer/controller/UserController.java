package com.winsizer.controller;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.winsizer.dto.LoginRequest;
import com.winsizer.dto.LoginResponse;
import com.winsizer.dto.MessageResponse;
import com.winsizer.dto.SignupRequest;
import com.winsizer.model.User;
import com.winsizer.security.JwtUtil;
import com.winsizer.service.UserService;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*") // allow React Native frontend
public class UserController {

    @Autowired
    private UserService userService;
    
    @Autowired
    private JwtUtil jwtUtil;

    /**
     * Signup API - Register new user
     */
    @PostMapping("/signup")
    public ResponseEntity<?> signup(@Valid @RequestBody SignupRequest request) {
        try {
            // Create user object
            User user = User.builder()
                    .username(request.getUsername().toLowerCase())
                    .password(request.getPassword())
                    .phone(request.getPhone() != null ? request.getPhone() : "")
                    .address(request.getAddress() != null ? request.getAddress() : "")
                    .build();
            
            boolean success = userService.register(user);
            
            if (!success) {
                return ResponseEntity
                        .badRequest()
                        .body(new MessageResponse("Username already exists", false));
            }
            
            // Generate JWT token after successful registration
            String token = jwtUtil.generateToken(user.getUsername());
            
            // Get the saved user
            User savedUser = userService.findByUsername(user.getUsername());
            
            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(new LoginResponse(
                            token,
                            "Bearer",
                            savedUser.getId(),
                            savedUser.getUsername(),
                            "User registered successfully"
                    ));
                    
        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Error during registration: " + e.getMessage(), false));
        }
    }

    /**
     * Login API - Authenticate user
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        try {
            boolean success = userService.login(
                    request.getUsername().toLowerCase(), 
                    request.getPassword()
            );
            
            if (!success) {
                return ResponseEntity
                        .status(HttpStatus.UNAUTHORIZED)
                        .body(new MessageResponse("Invalid username or password", false));
            }
            
            // Generate JWT token
            String token = jwtUtil.generateToken(request.getUsername().toLowerCase());
            
            // Get user details
            User user = userService.findByUsername(request.getUsername().toLowerCase());
            
            return ResponseEntity.ok(new LoginResponse(
                    token,
                    "Bearer",
                    user.getId(),
                    user.getUsername(),
                    "Login successful"
            ));
            
        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Error during login: " + e.getMessage(), false));
        }
    }
    
    /**
     * Get current user details (Protected route)
     */
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@RequestHeader("Authorization") String authHeader) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity
                        .status(HttpStatus.UNAUTHORIZED)
                        .body(new MessageResponse("Missing or invalid authorization header", false));
            }
            
            String token = authHeader.substring(7);
            String username = jwtUtil.extractUsername(token);
            
            if (!jwtUtil.validateToken(token, username)) {
                return ResponseEntity
                        .status(HttpStatus.UNAUTHORIZED)
                        .body(new MessageResponse("Invalid or expired token", false));
            }
            
            User user = userService.findByUsername(username);
            
            if (user == null) {
                return ResponseEntity
                        .status(HttpStatus.NOT_FOUND)
                        .body(new MessageResponse("User not found", false));
            }
            
            return ResponseEntity.ok(user);
            
        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Error fetching user: " + e.getMessage(), false));
        }
    }
    
    /**
     * Verify JWT token
     */
    @PostMapping("/verify")
    public ResponseEntity<?> verifyToken(@RequestHeader("Authorization") String authHeader) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity
                        .status(HttpStatus.UNAUTHORIZED)
                        .body(new MessageResponse("Missing or invalid authorization header", false));
            }
            
            String token = authHeader.substring(7);
            String username = jwtUtil.extractUsername(token);
            
            if (jwtUtil.validateToken(token, username)) {
                return ResponseEntity.ok(new MessageResponse("Token is valid", true));
            } else {
                return ResponseEntity
                        .status(HttpStatus.UNAUTHORIZED)
                        .body(new MessageResponse("Invalid or expired token", false));
            }
            
        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(new MessageResponse("Token verification failed", false));
        }
    }
    
    /**
     * Health check
     */
    @GetMapping("/health")
    public ResponseEntity<MessageResponse> healthCheck() {
        return ResponseEntity.ok(new MessageResponse("User service is running", true));
    }
}