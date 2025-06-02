package com.chatbot.chatbotapp.service;

import com.chatbot.chatbotapp.model.Chat;
import com.chatbot.chatbotapp.model.Message;
import com.chatbot.chatbotapp.repository.ChatRepository;
import com.chatbot.chatbotapp.repository.MessageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class MessageService {

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private ChatRepository chatRepository;

    private final String API_URL = "https://api.groq.com/openai/v1/chat/completions";
    private final String API_KEY = "sk-..." ; // Replace it with a real key or move to env

    public Message createMessageAndGetCompletion(Long chatId, String userContent, String model) {
        Chat chat = chatRepository.findById(chatId)
                .orElseThrow(() -> new RuntimeException("Chat not found"));

        // 1. Save user message
        Message userMessage = new Message();
        userMessage.setChat(chat);
        userMessage.setContent(userContent);
        userMessage.setRole("user");
        userMessage.setTimestamp(LocalDateTime.now());
        messageRepository.save(userMessage);

        // 2. Prepare request to LLM
        RestTemplate restTemplate = new RestTemplate();
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(API_KEY);
        headers.add("Content-Type", "application/json");

        String requestBody = """
        {
          "model": "%s",
          "messages": [
            { "role": "system", "content": "You are a helpful assistant." },
            { "role": "user", "content": "%s" }
          ]
        }
        """.formatted(model, userContent.replace("\"", "\\\""));

        HttpEntity<String> httpEntity = new HttpEntity<>(requestBody, headers);

        // 3. Make the request
        String assistantReply;
        try {
            var response = restTemplate.postForEntity(API_URL, httpEntity, String.class);
            assistantReply = extractReplyFromRawJSON(response.getBody());
        } catch (Exception e) {
            assistantReply = "Sorry, something went wrong.";
        }

        // 4. Save assistant message
        Message assistantMessage = new Message();
        assistantMessage.setChat(chat);
        assistantMessage.setContent(assistantReply);
        assistantMessage.setRole("assistant");
        assistantMessage.setTimestamp(LocalDateTime.now());
        messageRepository.save(assistantMessage);

        return assistantMessage;
    }

    public List<Message> getMessagesForChat(Long chatId) {
        Chat chat = chatRepository.findById(chatId)
                .orElseThrow(() -> new RuntimeException("Chat not found"));

        return messageRepository.findByChat(chat);
    }

    // 🧠 VERY BASIC string parsing of reply content (you should ideally use a DTO + ObjectMapper)
    private String extractReplyFromRawJSON(String json) {
        if (json == null) return "No response";
        int start = json.indexOf("\"content\":\"");
        if (start == -1) return "No content found";
        start += 11;
        int end = json.indexOf("\"", start);
        return json.substring(start, end).replace("\\n", "\n").replace("\\\"", "\"");
    }
}
