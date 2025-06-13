package com.chatbot.chatbotapp.controllers;

import com.chatbot.chatbotapp.dto.LoginRequest;
import com.chatbot.chatbotapp.dto.LoginResponse;
import com.chatbot.chatbotapp.dto.SignupRequest;
import com.chatbot.chatbotapp.dto.SignupResponse;
import com.chatbot.chatbotapp.model.User;
import com.chatbot.chatbotapp.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jwt.*;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
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

    @Autowired
    private JwtDecoder jwtDecoder;

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody SignupRequest signupRequest) {
        if (userService.getUserByEmail(signupRequest.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email already in use"));

        }

        User user = new User();
        user.setEmail(signupRequest.getEmail());
        user.setName(signupRequest.getUsername());
        user.setPassword(passwordEncoder.encode(signupRequest.getPassword()));

        User newUser = userService.registerUser(user);

        SignupResponse response = new SignupResponse(
                "User registered successfully",
                newUser.getId(),
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

        Instant now = Instant.now();
        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer("chatbot-app")
                .issuedAt(now)
                .expiresAt(now.plus(1, ChronoUnit.HOURS))
                .subject(user.getId().toString())
                .claim("email", user.getEmail())
                .build();

        String token = jwtEncoder.encode(JwtEncoderParameters.from(claims)).getTokenValue();

        LoginResponse response = new LoginResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                token
        );

        return ResponseEntity.ok(response);
    }

    @GetMapping("/verify")
    public ResponseEntity<?> verifyToken(@RequestHeader("Authorization") String authHeader) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Missing or invalid Authorization header");
            }

            String token = authHeader.substring(7);
            Jwt jwt = jwtDecoder.decode(token);

            return ResponseEntity.ok(Map.of(
                    "message", "Token is valid",
                    "userId", jwt.getSubject(),
                    "email", jwt.getClaim("email")
            ));
        } catch (JwtException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid or expired token");
        }
    }
    }

//    @GetMapping("/test-bcrypt")
//    public ResponseEntity<?> testBcrypt() {
//        String rawPassword = "123456";
//
//        String hash1 = passwordEncoder.encode(rawPassword);
//        String hash2 = passwordEncoder.encode(rawPassword);
//
//        boolean match1 = passwordEncoder.matches(rawPassword, hash1);
//        boolean match2 = passwordEncoder.matches(rawPassword, hash2);
//
//        return ResponseEntity.ok(Map.of(
//                "rawPassword", rawPassword,
//                "hash1", hash1,
//                "hash2", hash2,
//                "match1", match1,
//                "match2", match2,
//                "encoderClass", passwordEncoder.getClass().getName()
//        ));
//    }


