package com.cloudsentinel.entity;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity @Table(name = "upload_history")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class UploadHistory {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id") private User user;
    private String fileName;
    private int recordsSaved;
    private int recordsSkipped;
    private LocalDateTime uploadedAt;
}
