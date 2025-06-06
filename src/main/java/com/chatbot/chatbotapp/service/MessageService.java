package com.chatbot.chatbotapp.service;

import com.chatbot.chatbotapp.model.Chat;
import com.chatbot.chatbotapp.model.Message;
import com.chatbot.chatbotapp.repository.ChatRepository;
import com.chatbot.chatbotapp.repository.MessageRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class MessageService {

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private ChatRepository chatRepository;

    @Value("${llm.groq.api-key}")
    private String apiKey;

    @Value("${llm.groq.api-url}")
    private String apiUrl;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final RestTemplate restTemplate = new RestTemplate();

    public Message createMessageAndGetCompletion(Long chatId, String userContent, String model) {
        Chat chat = chatRepository.findById(chatId)
                .orElseThrow(() -> new RuntimeException("Chat not found"));

        Message userMessage = new Message();
        userMessage.setChat(chat);
        userMessage.setContent(userContent);
        userMessage.setRole("user");
        userMessage.setTimestamp(LocalDateTime.now());
        messageRepository.save(userMessage);

        List<Message> conversationHistory = getMessagesForChat(chatId);

        String assistantReply;
        try {
            assistantReply = callGroqAPI(conversationHistory, model);
        } catch (Exception e) {
            System.err.println("Error calling Groq API: " + e.getMessage());
            assistantReply = "I apologize, but I'm having trouble processing your request right now. Please try again.";
        }

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

    private String callGroqAPI(List<Message> conversationHistory, String model) throws Exception {
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(apiKey);
        headers.add("Content-Type", "application/json");

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("model", model);

        List<Map<String, String>> messages = new ArrayList<>();

        Map<String, String> systemMessage = new HashMap<>();
        systemMessage.put("role", "system");
        systemMessage.put("content", "You are a helpful, knowledgeable, and friendly AI assistant. Provide clear, accurate, and helpful responses.");
        messages.add(systemMessage);

        int startIndex = Math.max(0, conversationHistory.size() - 20);
        for (int i = startIndex; i < conversationHistory.size(); i++) {
            Message msg = conversationHistory.get(i);
            Map<String, String> messageMap = new HashMap<>();
            messageMap.put("role", msg.getRole());
            messageMap.put("content", msg.getContent());
            messages.add(messageMap);
        }

        requestBody.put("messages", messages);
        requestBody.put("max_tokens", 1000);
        requestBody.put("temperature", 0.7);

        String jsonBody = objectMapper.writeValueAsString(requestBody);
        HttpEntity<String> httpEntity = new HttpEntity<>(jsonBody, headers);

        try {
            ResponseEntity<String> response = restTemplate.postForEntity(apiUrl, httpEntity, String.class);
            return parseGroqResponse(response.getBody());
        } catch (HttpClientErrorException e) {
            if (e.getStatusCode() == HttpStatus.UNAUTHORIZED) {
                throw new RuntimeException("Invalid API key. Please check your Groq API configuration.");
            } else if (e.getStatusCode() == HttpStatus.TOO_MANY_REQUESTS) {
                throw new RuntimeException("Rate limit exceeded. Please try again in a moment.");
            } else {
                throw new RuntimeException("API error: " + e.getMessage());
            }
        }
    }

    private String parseGroqResponse(String jsonResponse) throws Exception {
        if (jsonResponse == null || jsonResponse.trim().isEmpty()) {
            throw new RuntimeException("Empty response from API");
        }

        try {
            JsonNode root = objectMapper.readTree(jsonResponse);
            JsonNode choices = root.get("choices");

            if (choices == null || choices.size() == 0) {
                throw new RuntimeException("No choices in API response");
            }

            JsonNode firstChoice = choices.get(0);
            JsonNode message = firstChoice.get("message");

            if (message == null) {
                throw new RuntimeException("No message in API response");
            }

            JsonNode content = message.get("content");
            if (content == null) {
                throw new RuntimeException("No content in API response");
            }

            return content.asText();

        } catch (Exception e) {
            System.err.println("Error parsing API response: " + e.getMessage());
            System.err.println("Raw response: " + jsonResponse);
            throw new RuntimeException("Failed to parse API response: " + e.getMessage());
        }
    }
}
