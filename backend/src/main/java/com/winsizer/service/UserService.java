package com.winsizer.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import com.winsizer.model.User;
import com.winsizer.repository.UserRepository;

import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    private BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    /**
     * Register new user
     */
    public boolean register(User user) {
        // Check if username already exists
        if (userRepository.findByUsername(user.getUsername().toLowerCase()).isPresent()) {
            return false; // username exists
        }
        
        // Hash password
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        
        // Set username to lowercase for consistency
        user.setUsername(user.getUsername().toLowerCase());
        
        // Save user
        userRepository.save(user);
        return true;
    }

    /**
     * Login user - verify credentials
     */
    public boolean login(String username, String rawPassword) {
        Optional<User> userOpt = userRepository.findByUsername(username.toLowerCase());
        
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            return passwordEncoder.matches(rawPassword, user.getPassword());
        }
        
        return false;
    }
    
    /**
     * Find user by username
     */
    public User findByUsername(String username) {
        return userRepository.findByUsername(username.toLowerCase()).orElse(null);
    }
    
    /**
     * Find user by ID
     */
    public User findById(Long id) {
        return userRepository.findById(id).orElse(null);
    }
    
    /**
     * Check if username exists
     */
    public boolean existsByUsername(String username) {
        return userRepository.findByUsername(username.toLowerCase()).isPresent();
    }
}