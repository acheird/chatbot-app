package com.chatbot.chatbotapp.controllers;

import com.chatbot.chatbotapp.model.Message;
import com.chatbot.chatbotapp.service.MessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/messages")
public class MessageController {

    @Autowired
    private MessageService messageService;

    // POST /messages/send
    @PostMapping("/send")
    public Message sendMessage(
            @RequestParam Long chatId,
            @RequestParam String content,
            @RequestParam(defaultValue = "mixtral-8x7b-32768") String model
    ) {
        return messageService.createMessageAndGetCompletion(chatId, content, model);
    }

    // GET /messages?chatId=123
    @GetMapping
    public List<Message> getMessages(@RequestParam Long chatId) {
        return messageService.getMessagesForChat(chatId);
    }
}
