package com.chatbot.chatbotapp.dto;

// SignupResponse.java
public class SignupResponse {
    private String message;
    private String userId;
    private String email;

    // Constructors
    public SignupResponse() {}

    public SignupResponse(String message, String userId, String email) {
        this.message = message;
        this.userId = userId;
        this.email = email;
    }

    // Getters and Setters
    public String getMessage() {
        return message;
    }
    public void setMessage(String message) {
        this.message = message;
    }

    public String getUserId() {
        return userId;
    }
    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getEmail() {
        return email;
    }
    public void setEmail(String email) {
        this.email = email;
    }
}
