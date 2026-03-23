package com.cloudsentinel.service;
import com.cloudsentinel.entity.*;
import com.cloudsentinel.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Map;

@Service @RequiredArgsConstructor
public class AlertService {
    private final AlertConfigRepository alertConfigRepo;
    private final BillingRecordRepository billingRepo;
    private final UserRepository userRepository;

    public void checkThreshold(User user) {
        LocalDate now = LocalDate.now();
        BigDecimal total = billingRepo.findMonthlyTotal(user.getId(), now.getMonthValue(), now.getYear());
        if (total == null) return;
        alertConfigRepo.findByUser(user).ifPresent(config -> {
            if (total.compareTo(config.getMonthlyThreshold()) > 0) {
                System.out.printf("[ALERT] User %s exceeded threshold! Spent: %s, Limit: %s%n",
                    user.getUsername(), total, config.getMonthlyThreshold());
            }
        });
    }

    public Map<String, Object> getAlertStatus(String username) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        LocalDate now = LocalDate.now();
        BigDecimal total = billingRepo.findMonthlyTotal(user.getId(), now.getMonthValue(), now.getYear());
        if (total == null) total = BigDecimal.ZERO;
        BigDecimal threshold = alertConfigRepo.findByUser(user)
            .map(AlertConfig::getMonthlyThreshold).orElse(new BigDecimal("1000"));
        boolean exceeded = total.compareTo(threshold) > 0;
        return Map.of("currentSpend", total, "threshold", threshold,
            "exceeded", exceeded, "message", exceeded ? "ALERT: Budget exceeded!" : "Within budget");
    }

    public Map<String, Object> updateThreshold(String username, BigDecimal threshold) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        AlertConfig config = alertConfigRepo.findByUser(user)
            .orElse(AlertConfig.builder().user(user).build());
        config.setMonthlyThreshold(threshold);
        alertConfigRepo.save(config);
        return Map.of("message", "Threshold updated", "threshold", threshold);
    }
}
