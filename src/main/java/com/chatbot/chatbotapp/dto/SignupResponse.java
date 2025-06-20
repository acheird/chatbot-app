package com.chatbot.chatbotapp.dto;

public class SignupResponse {
    private String message;
    private Long userId;
    private String email;

    public SignupResponse() {}

    public SignupResponse(String message, Long userId, String email) {
        this.message = message;
        this.userId = userId;
        this.email = email;
    }

    public String getMessage() {
        return message;
    }
    public void setMessage(String message) {
        this.message = message;
    }

    public Long getUserId() {
        return userId;
    }
    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getEmail() {
        return email;
    }
    public void setEmail(String email) {
        this.email = email;
    }
}
