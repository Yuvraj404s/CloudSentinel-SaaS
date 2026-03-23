package com.cloudsentinel.repository;
import com.cloudsentinel.entity.BillingRecord;
import com.cloudsentinel.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface BillingRecordRepository extends JpaRepository<BillingRecord, Long> {
    Optional<BillingRecord> findByServiceNameAndBillingDateAndCloudProviderAndUser(
        String serviceName, LocalDate billingDate, String cloudProvider, User user);

    @Query(value = "SELECT service_name, SUM(cost) FROM billing_records WHERE user_id = :userId AND EXTRACT(MONTH FROM billing_date) = :month AND EXTRACT(YEAR FROM billing_date) = :year GROUP BY service_name", nativeQuery = true)
    List<Object[]> findMonthlySpendByService(@Param("userId") Long userId, @Param("month") int month, @Param("year") int year);

    @Query(value = "SELECT billing_date, SUM(cost) FROM billing_records WHERE user_id = :userId AND billing_date >= :since GROUP BY billing_date ORDER BY billing_date", nativeQuery = true)
    List<Object[]> findDailyTrend(@Param("userId") Long userId, @Param("since") LocalDate since);

    @Query(value = "SELECT SUM(cost) FROM billing_records WHERE user_id = :userId AND EXTRACT(MONTH FROM billing_date) = :month AND EXTRACT(YEAR FROM billing_date) = :year", nativeQuery = true)
    BigDecimal findMonthlyTotal(@Param("userId") Long userId, @Param("month") int month, @Param("year") int year);
}
