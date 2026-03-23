package com.cloudsentinel.dto;
import lombok.*;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data @AllArgsConstructor @NoArgsConstructor @Builder
public class AnalyticsResponse {
    private List<Map<String, Object>> monthlySpend;
    private List<Map<String, Object>> dailyTrend;
    private BigDecimal projectedMonthlyTotal;
    private BigDecimal currentMonthTotal;
}
