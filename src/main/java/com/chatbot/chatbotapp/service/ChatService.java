package com.chatbot.chatbotapp.service;

import com.chatbot.chatbotapp.model.Chat;
import com.chatbot.chatbotapp.model.User;
import com.chatbot.chatbotapp.repository.ChatRepository;
import com.chatbot.chatbotapp.repository.UserRepository;
import com.chatbot.chatbotapp.util.SecurityUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class ChatService {

    @Autowired
    private ChatRepository chatRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SecurityUtils securityUtils;

    public Chat createChat(Long userId, String title) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Chat chat = new Chat(title, user);
        return chatRepository.save(chat);
    }

    public List<Chat> getChatsByUserId(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return chatRepository.findByUser(user);
    }

    public Optional<Chat> getChatById(Long chatId) {
        return chatRepository.findById(chatId);
    }

    public Chat getChatByIdWithOwnershipCheck(Long chatId) {
        User currentUser = securityUtils.getCurrentUser()
                .orElseThrow(() -> new RuntimeException("Unauthenticated: No user in security context"));

        Chat chat = chatRepository.findById(chatId)
                .orElseThrow(() -> new RuntimeException("Chat not found"));

        if (!chat.getUser().getId().equals(currentUser.getId())) {
            throw new RuntimeException("Access denied: You do not own this chat");
        }

        return chat;
    }

    @Transactional
    public void deleteChat(Long chatId) {
        Chat chat = getChatByIdWithOwnershipCheck(chatId);
        chatRepository.delete(chat);
    }

    public boolean isOwner(Long chatId, Long userId) {
        return chatRepository.findById(chatId)
                .map(chat -> chat.getUser().getId().equals(userId))
                .orElse(false);
    }

    public List<Chat> getChatsForCurrentUser() {
        User currentUser = securityUtils.getCurrentUser()
                .orElseThrow(() -> new RuntimeException("Unauthenticated: No user in security context"));
        return chatRepository.findByUser(currentUser);
    }
}
