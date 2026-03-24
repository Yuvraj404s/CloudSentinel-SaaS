package com.cloudsentinel.service;
import com.cloudsentinel.dto.AnalyticsResponse;
import com.cloudsentinel.entity.User;
import com.cloudsentinel.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.*;

@Service @RequiredArgsConstructor
public class AnalyticsService {
    private final BillingRecordRepository billingRepo;
    private final UserRepository userRepository;

    public AnalyticsResponse getAnalytics(String username) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        LocalDate now = LocalDate.now();
        int month = now.getMonthValue(), year = now.getYear();

        List<Object[]> monthlyRaw = billingRepo.findMonthlySpendByService(user.getId(), month, year);
        List<Map<String, Object>> monthlySpend = new ArrayList<>();
        for (Object[] row : monthlyRaw)
            monthlySpend.add(Map.of("service", row[0], "total", row[1]));

        List<Object[]> dailyRaw = billingRepo.findDailyTrend(user.getId(), now.minusDays(30));
        List<Map<String, Object>> dailyTrend = new ArrayList<>();
        for (Object[] row : dailyRaw)
            dailyTrend.add(Map.of("date", row[0].toString(), "cost", row[1]));

        BigDecimal monthTotal = billingRepo.findMonthlyTotal(user.getId(), month, year);
        if (monthTotal == null) monthTotal = BigDecimal.ZERO;

        int dayOfMonth = now.getDayOfMonth();
        int daysInMonth = now.lengthOfMonth();
        BigDecimal avgDaily = dayOfMonth > 0
            ? monthTotal.divide(BigDecimal.valueOf(dayOfMonth), 2, RoundingMode.HALF_UP)
            : BigDecimal.ZERO;
        BigDecimal projected = avgDaily.multiply(BigDecimal.valueOf(daysInMonth));

        // Provider breakdown
        List<Object[]> providerRaw = billingRepo.findSpendByProvider(user.getId(), month, year);
        List<Map<String, Object>> providerBreakdown = new ArrayList<>();
        for (Object[] row : providerRaw)
            providerBreakdown.add(Map.of("provider", row[0], "total", row[1]));

        // Top regions
        List<Object[]> regionRaw = billingRepo.findTopRegions(user.getId(), month, year);
        List<Map<String, Object>> topRegions = new ArrayList<>();
        for (Object[] row : regionRaw)
            topRegions.add(Map.of("region", row[0], "total", row[1]));

        return AnalyticsResponse.builder()
            .monthlySpend(monthlySpend)
            .dailyTrend(dailyTrend)
            .currentMonthTotal(monthTotal)
            .projectedMonthlyTotal(projected)
            .providerBreakdown(providerBreakdown)
            .topRegions(topRegions)
            .build();
    }
}
