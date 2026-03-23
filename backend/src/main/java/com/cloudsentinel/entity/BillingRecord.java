package com.cloudsentinel.entity;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity @Table(name = "billing_records",
    uniqueConstraints = @UniqueConstraint(columnNames = {"service_name","billing_date","cloud_provider","user_id"}))
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class BillingRecord {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "service_name", nullable = false) private String serviceName;
    private BigDecimal usageAmount;
    @Column(nullable = false) private BigDecimal cost;
    @Column(name = "billing_date", nullable = false) private LocalDate billingDate;
    private String region;
    @Column(name = "cloud_provider") private String cloudProvider;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id") private User user;
}
