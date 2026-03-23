package com.cloudsentinel.entity;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity @Table(name = "alert_configs")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class AlertConfig {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @OneToOne @JoinColumn(name = "user_id") private User user;
    @Column(name = "monthly_threshold", nullable = false)
    private BigDecimal monthlyThreshold;
}
