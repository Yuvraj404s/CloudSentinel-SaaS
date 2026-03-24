package com.cloudsentinel.repository;
import com.cloudsentinel.entity.UploadHistory;
import com.cloudsentinel.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface UploadHistoryRepository extends JpaRepository<UploadHistory, Long> {
    List<UploadHistory> findTop5ByUserOrderByUploadedAtDesc(User user);
}
