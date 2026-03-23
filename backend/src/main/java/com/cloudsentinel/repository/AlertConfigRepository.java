package com.cloudsentinel.repository;
import com.cloudsentinel.entity.AlertConfig;
import com.cloudsentinel.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
public interface AlertConfigRepository extends JpaRepository<AlertConfig, Long> {
    Optional<AlertConfig> findByUser(User user);
}
