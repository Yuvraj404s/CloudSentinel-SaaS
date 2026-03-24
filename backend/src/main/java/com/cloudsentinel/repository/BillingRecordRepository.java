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

    @Query(value = "SELECT service_name, SUM(cost) FROM billing_records WHERE user_id = :userId AND EXTRACT(MONTH FROM billing_date) = :month AND EXTRACT(YEAR FROM billing_date) = :year AND (:provider = 'All' OR cloud_provider = :provider) GROUP BY service_name ORDER BY SUM(cost) DESC", nativeQuery = true)
    List<Object[]> findMonthlySpendByService(@Param("userId") Long userId, @Param("month") int month, @Param("year") int year, @Param("provider") String provider);

    @Query(value = "SELECT billing_date, SUM(cost) FROM billing_records WHERE user_id = :userId AND billing_date >= :since AND (:provider = 'All' OR cloud_provider = :provider) GROUP BY billing_date ORDER BY billing_date", nativeQuery = true)
    List<Object[]> findDailyTrend(@Param("userId") Long userId, @Param("since") LocalDate since, @Param("provider") String provider);

    @Query(value = "SELECT SUM(cost) FROM billing_records WHERE user_id = :userId AND EXTRACT(MONTH FROM billing_date) = :month AND EXTRACT(YEAR FROM billing_date) = :year", nativeQuery = true)
    BigDecimal findMonthlyTotal(@Param("userId") Long userId, @Param("month") int month, @Param("year") int year);

    @Query(value = "SELECT cloud_provider, SUM(cost) FROM billing_records WHERE user_id = :userId AND EXTRACT(MONTH FROM billing_date) = :month AND EXTRACT(YEAR FROM billing_date) = :year GROUP BY cloud_provider ORDER BY SUM(cost) DESC", nativeQuery = true)
    List<Object[]> findSpendByProvider(@Param("userId") Long userId, @Param("month") int month, @Param("year") int year);

    @Query(value = "SELECT region, SUM(cost) FROM billing_records WHERE user_id = :userId AND EXTRACT(MONTH FROM billing_date) = :month AND EXTRACT(YEAR FROM billing_date) = :year GROUP BY region ORDER BY SUM(cost) DESC LIMIT 5", nativeQuery = true)
    List<Object[]> findTopRegions(@Param("userId") Long userId, @Param("month") int month, @Param("year") int year);
}
