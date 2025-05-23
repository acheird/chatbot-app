package com.chatbot.chatbotapp.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/users/signup", "/users/login", "/actuator/**").permitAll()
                        .anyRequest().authenticated()
                )
                .formLogin(form -> form.disable())         // Disable form-based login
                .httpBasic(httpBasic -> httpBasic.disable()); // Disable HTTP Basic Auth

        return http.build();
    }
}
