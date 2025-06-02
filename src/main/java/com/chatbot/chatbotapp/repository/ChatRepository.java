package com.chatbot.chatbotapp.repository;

import com.chatbot.chatbotapp.model.Chat;
import com.chatbot.chatbotapp.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ChatRepository extends JpaRepository<Chat, Long> {
    List<Chat> findByUser(User user);
}
