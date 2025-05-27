package com.chatbot.chatbotapp.dto;

// SignupRequest.java
public class SignupRequest {
    private String email;
    private String password;
    private String username; // Optional, add if you want to capture username

    // Constructors
    public SignupRequest() {}

    public SignupRequest(String email, String password, String username) {
        this.email = email;
        this.password = password;
        this.username = username;
    }

    // Getters and Setters
    public String getEmail() {
        return email;
    }
    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }
    public void setPassword(String password) {
        this.password = password;
    }

    public String getUsername() {
        return username;
    }
    public void setUsername(String username) {
        this.username = username;
    }
}
