package com.cloudsentinel.service;
import com.cloudsentinel.dto.*;
import com.cloudsentinel.entity.AlertConfig;
import com.cloudsentinel.entity.User;
import com.cloudsentinel.repository.*;
import com.cloudsentinel.security.JwtUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.*;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.util.Set;

@Service @RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepository;
    private final AlertConfigRepository alertConfigRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtils jwtUtils;

    public AuthResponse register(RegisterRequest req) {
        if (userRepository.existsByUsername(req.getUsername()))
            throw new RuntimeException("Username already taken");
        if (userRepository.existsByEmail(req.getEmail()))
            throw new RuntimeException("Email already registered");

        User user = User.builder()
            .username(req.getUsername())
            .email(req.getEmail())
            .password(passwordEncoder.encode(req.getPassword()))
            .roles(Set.of("USER"))
            .build();
        userRepository.save(user);

        AlertConfig config = AlertConfig.builder()
            .user(user).monthlyThreshold(new BigDecimal("1000")).build();
        alertConfigRepository.save(config);

        String token = jwtUtils.generateToken(user.getUsername());
        return new AuthResponse(token, user.getUsername(), "Registration successful");
    }

    public AuthResponse login(LoginRequest req) {
        authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(req.getUsername(), req.getPassword()));
        String token = jwtUtils.generateToken(req.getUsername());
        return new AuthResponse(token, req.getUsername(), "Login successful");
    }
}
