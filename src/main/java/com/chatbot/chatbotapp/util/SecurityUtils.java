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

    private static UserRepository userRepository;

    @Autowired
    public void setUserRepository(UserRepository userRepository) {
        SecurityUtils.userRepository = userRepository;
    }

    public static Long getCurrentUserId() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

            if (authentication != null && authentication.getPrincipal() instanceof Jwt jwt) {
                String subject = jwt.getSubject();
                return Long.parseLong(subject);
            }

            return null;
        } catch (Exception e) {
            return null;
        }
    }

    public static String getCurrentUserEmail() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

            if (authentication != null && authentication.getPrincipal() instanceof Jwt jwt) {
                return jwt.getClaimAsString("email");
            }

            return null;
        } catch (Exception e) {
            return null;
        }
    }

    public static Optional<User> getCurrentUser() {
        Long userId = getCurrentUserId();
        if (userId == null || userRepository == null) {
            return Optional.empty();
        }

        return userRepository.findById(userId);
    }

    public static boolean canAccessUser(Long targetUserId) {
        Long currentUserId = getCurrentUserId();
        return currentUserId != null && currentUserId.equals(targetUserId);
    }

    public static boolean isAuthenticated() {
        return getCurrentUserId() != null;
    }

    public static void requireAuthentication() {
        if (!isAuthenticated()) {
            throw new RuntimeException("User not authenticated");
        }
    }

    public static void requireOwnership(Long resourceOwnerId) {
        Long currentUserId = getCurrentUserId();
        if (currentUserId == null) {
            throw new RuntimeException("User not authenticated");
        }
        if (!currentUserId.equals(resourceOwnerId)) {
            throw new RuntimeException("Access denied: Insufficient permissions");
        }
    }
}