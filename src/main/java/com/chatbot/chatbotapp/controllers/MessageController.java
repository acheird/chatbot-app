package com.chatbot.chatbotapp.controllers;

import com.chatbot.chatbotapp.model.Message;
import com.chatbot.chatbotapp.service.ChatService;
import com.chatbot.chatbotapp.service.MessageService;
import com.chatbot.chatbotapp.util.SecurityUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/messages")
public class MessageController {

    private final MessageService messageService;
    private final ChatService chatService;
    private final SecurityUtils securityUtils;

    @Autowired
    public MessageController(
            MessageService messageService,
            ChatService chatService,
            SecurityUtils securityUtils
    ) {
        this.messageService = messageService;
        this.chatService = chatService;
        this.securityUtils = securityUtils;
    }

    @PostMapping("/send")
    public ResponseEntity<?> sendMessage(
            @RequestParam Long chatId,
            @RequestParam String content,
            @RequestParam(defaultValue = "mixtral-8x7b-32768") String model
    ) {
        Long userId = securityUtils.getCurrentUserId();
        if (userId == null) return ResponseEntity.status(401).body("User not authenticated");

        if (content == null || content.isBlank()) {
            return ResponseEntity.badRequest().body("Message content cannot be empty");
        }

        if (content.length() > 4000) {
            return ResponseEntity.badRequest().body("Message too long (max 4000 characters)");
        }

        return chatService.getChatById(chatId)
                .map(chat -> {
                    if (!chat.getUser().getId().equals(userId)) {
                        return ResponseEntity.status(403).body("Access denied");
                    }

                    Message reply = messageService.createMessageAndGetCompletion(chatId, content.trim(), model);
                    return ResponseEntity.ok(reply);
                })
                .orElse(ResponseEntity.status(404).body("Chat not found"));
    }

    @GetMapping
    public ResponseEntity<?> getMessages(@RequestParam Long chatId) {
        Long userId = securityUtils.getCurrentUserId();
        if (userId == null) return ResponseEntity.status(401).body("User not authenticated");

        return chatService.getChatById(chatId)
                .map(chat -> {
                    if (!chat.getUser().getId().equals(userId)) {
                        return ResponseEntity.status(403).body("Access denied");
                    }

                    List<Message> messages = messageService.getMessagesForChat(chatId);
                    return ResponseEntity.ok(messages);
                })
                .orElse(ResponseEntity.status(404).body("Chat not found"));
    }
}
