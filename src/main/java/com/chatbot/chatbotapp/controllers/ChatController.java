package com.chatbot.chatbotapp.controllers;

import com.chatbot.chatbotapp.model.Chat;
import com.chatbot.chatbotapp.service.ChatService;
import com.chatbot.chatbotapp.util.SecurityUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;

@RestController
@RequestMapping("/chats")
public class ChatController {

    private final ChatService chatService;
    private final SecurityUtils securityUtils;

    @Autowired
    public ChatController(ChatService chatService, SecurityUtils securityUtils) {
        this.chatService = chatService;
        this.securityUtils = securityUtils;
    }

    @PostMapping
    public ResponseEntity<?> createChat(@RequestParam String title) {
        Long currentUserId = securityUtils.getCurrentUserId();
        if (currentUserId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not authenticated");
        }

        try {
            Chat chat = chatService.createChat(currentUserId, title);
            return ResponseEntity.ok(chat);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Error creating chat: " + e.getMessage());
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getChatsByUser(@PathVariable Long userId) {
        if (!securityUtils.canAccessUser(userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied");
        }

        try {
            List<Chat> chats = chatService.getChatsByUserId(userId);
            return ResponseEntity.ok(chats);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        }
    }

    @GetMapping("/my-chats")
    public ResponseEntity<?> getMyChats() {
        Long currentUserId = securityUtils.getCurrentUserId();
        if (currentUserId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not authenticated");
        }

        try {
            List<Chat> chats = chatService.getChatsByUserId(currentUserId);
            return ResponseEntity.ok(chats);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonMap("error", "Error fetching chats"));
        }
    }

    @GetMapping("/{chatId}")
    public ResponseEntity<?> getChatById(@PathVariable Long chatId) {
        Long currentUserId = securityUtils.getCurrentUserId();
        if (currentUserId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not authenticated");
        }

        return chatService.getChatById(chatId)
                .map(chat -> {
                    if (!chat.getUser().getId().equals(currentUserId)) {
                        return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied");
                    }
                    return ResponseEntity.ok(chat);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{chatId}")
    public ResponseEntity<?> deleteChat(@PathVariable Long chatId) {
        Long currentUserId = securityUtils.getCurrentUserId();
        if (currentUserId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not authenticated");
        }

        return chatService.getChatById(chatId)
                .map(chat -> {
                    if (!chat.getUser().getId().equals(currentUserId)) {
                        return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied");
                    }

                    chatService.deleteChat(chatId);
                    return ResponseEntity.ok("Chat deleted successfully");
                })
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).body("Chat not found"));
    }
}
