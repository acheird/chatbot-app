package com.chatbot.chatbotapp.util;

import com.chatbot.chatbotapp.model.User;
import com.chatbot.chatbotapp.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
public class SecurityUtils {

    private final UserRepository userRepository;

    @Autowired
    public SecurityUtils(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public Long getCurrentUserId() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication != null && authentication.getPrincipal() instanceof Jwt jwt) {
                return Long.parseLong(jwt.getSubject());
            }
        } catch (Exception ignored) {
        }
        return null;
    }

    public String getCurrentUserEmail() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication != null && authentication.getPrincipal() instanceof Jwt jwt) {
                return jwt.getClaimAsString("email");
            }
        } catch (Exception ignored) {
        }
        return null;
    }

    public Optional<User> getCurrentUser() {
        Long userId = getCurrentUserId();
        if (userId == null) return Optional.empty();
        return userRepository.findById(userId);
    }

    public boolean canAccessUser(Long targetUserId) {
        Long currentUserId = getCurrentUserId();
        return currentUserId != null && currentUserId.equals(targetUserId);
    }

    public boolean isAuthenticated() {
        return getCurrentUserId() != null;
    }

    public void requireAuthentication() {
        if (!isAuthenticated()) {
            throw new RuntimeException("User not authenticated");
        }
    }

    public void requireOwnership(Long resourceOwnerId) {
        Long currentUserId = getCurrentUserId();
        if (currentUserId == null) {
            throw new RuntimeException("User not authenticated");
        }
        if (!currentUserId.equals(resourceOwnerId)) {
            throw new RuntimeException("Access denied: Insufficient permissions");
        }
    }
}
