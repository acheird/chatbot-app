package com.chatbot.chatbotapp.controllers;

import com.chatbot.chatbotapp.dto.LoginRequest;
import com.chatbot.chatbotapp.dto.SignupRequest;
import com.chatbot.chatbotapp.dto.SignupResponse;
import com.chatbot.chatbotapp.model.User;
import com.chatbot.chatbotapp.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.Collections;
import java.util.Optional;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private UserService userService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtEncoder jwtEncoder;

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody SignupRequest signupRequest) {
        if (userService.getUserByEmail(signupRequest.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body("Email already in use");
        }

        User user = new User();
        user.setEmail(signupRequest.getEmail());
        user.setPassword(passwordEncoder.encode(signupRequest.getPassword()));
        user.setName(signupRequest.getUsername()); // match your model's "name"

        User newUser = userService.registerUser(user);

        SignupResponse response = new SignupResponse(
                "User registered successfully",
                newUser.getId().toString(),
                newUser.getEmail()
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }



    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        Optional<User> userOpt = userService.getUserByEmail(loginRequest.getEmail());
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid credentials");
        }

        User user = userOpt.get();

        System.out.println("Raw password: " + loginRequest.getPassword());
        System.out.println("Encoded password from DB: " + user.getPassword());
        System.out.println("Password matches? " + passwordEncoder.matches(loginRequest.getPassword(), user.getPassword()));

        if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid credentials");
        }

        return ResponseEntity.ok("Login successful");
    }


}
