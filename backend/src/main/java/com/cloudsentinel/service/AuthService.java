package com.cloudsentinel.service;
import com.cloudsentinel.dto.*;
import com.cloudsentinel.entity.AlertConfig;
import com.cloudsentinel.entity.User;
import com.cloudsentinel.repository.*;
import com.cloudsentinel.security.JwtUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.*;
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
        if (req.getUsername() == null || req.getUsername().trim().length() < 3)
            throw new RuntimeException("Username must be at least 3 characters");
        if (req.getPassword() == null || req.getPassword().length() < 6)
            throw new RuntimeException("Password must be at least 6 characters");
        if (userRepository.existsByUsername(req.getUsername()))
            throw new RuntimeException("Username already taken. Please choose another.");
        if (userRepository.existsByEmail(req.getEmail()))
            throw new RuntimeException("Email already registered. Try logging in.");

        User user = User.builder()
            .username(req.getUsername().trim())
            .email(req.getEmail().trim())
            .password(passwordEncoder.encode(req.getPassword()))
            .roles(Set.of("USER"))
            .build();
        userRepository.save(user);

        AlertConfig config = AlertConfig.builder()
            .user(user).monthlyThreshold(new BigDecimal("1000")).build();
        alertConfigRepository.save(config);

        String token = jwtUtils.generateToken(user.getUsername());
        return new AuthResponse(token, user.getUsername(), "Registration successful! Welcome to CloudSentinel.");
    }

    public AuthResponse login(LoginRequest req) {
        try {
            authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.getUsername(), req.getPassword()));
        } catch (BadCredentialsException e) {
            throw new RuntimeException("Invalid username or password. Please try again.");
        } catch (DisabledException e) {
            throw new RuntimeException("Your account is disabled. Contact support.");
        } catch (LockedException e) {
            throw new RuntimeException("Your account is locked. Contact support.");
        }
        String token = jwtUtils.generateToken(req.getUsername());
        return new AuthResponse(token, req.getUsername(), "Welcome back!");
    }
}
