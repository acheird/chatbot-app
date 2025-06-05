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
import java.time.temporal.ChronoUnit;
import java.util.Collections;
import java.util.Map;
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
        user.setName(signupRequest.getUsername());

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
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("The User does not exist!");
        }

        User user = userOpt.get();

        // TEMPORARY: Simple string comparison
        if (!loginRequest.getPassword().equals(user.getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid credentials");
        }

        // JWT creation remains the same
        Instant now = Instant.now();
        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer("chatbot-app")
                .issuedAt(now)
                .expiresAt(now.plus(1, ChronoUnit.HOURS))
                .subject(user.getId().toString())
                .claim("email", user.getEmail())
                .build();

        String token = jwtEncoder.encode(JwtEncoderParameters.from(claims)).getTokenValue();

        return ResponseEntity.ok(Map.of(
                "token", token,
                "id", user.getId(),
                "email", user.getEmail(),
                "name", user.getName()
        ));
    }

    @GetMapping("/test-bcrypt")
    public ResponseEntity<?> testBcrypt() {
        String rawPassword = "123456";

        String hash1 = passwordEncoder.encode(rawPassword);
        String hash2 = passwordEncoder.encode(rawPassword);

        boolean match1 = passwordEncoder.matches(rawPassword, hash1);
        boolean match2 = passwordEncoder.matches(rawPassword, hash2);

        return ResponseEntity.ok(Map.of(
                "rawPassword", rawPassword,
                "hash1", hash1,
                "hash2", hash2,
                "match1", match1,
                "match2", match2,
                "encoderClass", passwordEncoder.getClass().getName()
        ));
    }



}
