package com.chatbot.chatbotapp.repository;

import com.chatbot.chatbotapp.model.Message;
import com.chatbot.chatbotapp.model.Chat;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MessageRepository extends JpaRepository<Message, Long> {
    List<Message> findByChat(Chat chat);
}
