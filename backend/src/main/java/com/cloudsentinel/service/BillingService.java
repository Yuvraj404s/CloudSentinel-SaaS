package com.cloudsentinel.service;
import com.cloudsentinel.entity.*;
import com.cloudsentinel.repository.*;
import com.opencsv.CSVReader;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.InputStreamReader;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Service @RequiredArgsConstructor
public class BillingService {
    private final BillingRecordRepository billingRepo;
    private final UserRepository userRepository;
    private final AlertService alertService;
    private final UploadHistoryRepository uploadHistoryRepo;

    public Map<String, Object> processCSV(MultipartFile file, String username) throws Exception {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        if (file.isEmpty()) throw new RuntimeException("Uploaded file is empty.");
        if (!file.getOriginalFilename().endsWith(".csv"))
            throw new RuntimeException("Only CSV files are supported.");

        List<BillingRecord> batch = new ArrayList<>();
        int saved = 0, skipped = 0, rowNum = 1;

        try (CSVReader reader = new CSVReader(new InputStreamReader(file.getInputStream()))) {
            String[] line;
            boolean isHeader = true;
            while ((line = reader.readNext()) != null) {
                if (isHeader) { isHeader = false; continue; }
                rowNum++;
                if (line.length < 6) continue;
                try {
                    String serviceName = line[0].trim();
                    BigDecimal usageAmount = new BigDecimal(line[1].trim());
                    BigDecimal cost = new BigDecimal(line[2].trim());
                    LocalDate billingDate = LocalDate.parse(line[3].trim());
                    String region = line[4].trim();
                    String cloudProvider = line[5].trim();

                    boolean exists = billingRepo.findByServiceNameAndBillingDateAndCloudProviderAndUser(
                        serviceName, billingDate, cloudProvider, user).isPresent();
                    if (exists) { skipped++; continue; }

                    batch.add(BillingRecord.builder()
                        .serviceName(serviceName).usageAmount(usageAmount).cost(cost)
                        .billingDate(billingDate).region(region).cloudProvider(cloudProvider)
                        .user(user).build());

                    if (batch.size() >= 500) {
                        billingRepo.saveAll(batch);
                        saved += batch.size();
                        batch.clear();
                    }
                } catch (Exception e) {
                    throw new RuntimeException("Error parsing row " + rowNum + ": " + e.getMessage());
                }
            }
            if (!batch.isEmpty()) {
                billingRepo.saveAll(batch);
                saved += batch.size();
            }
        }

        // Save upload history
        uploadHistoryRepo.save(UploadHistory.builder()
            .user(user).fileName(file.getOriginalFilename())
            .recordsSaved(saved).recordsSkipped(skipped)
            .uploadedAt(LocalDateTime.now()).build());

        alertService.checkThreshold(user);

        return Map.of("saved", saved, "skipped", skipped,
            "message", saved + " records saved, " + skipped + " duplicates skipped");
    }

    public List<Map<String, Object>> getUploadHistory(String username) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        return uploadHistoryRepo.findTop5ByUserOrderByUploadedAtDesc(user).stream()
            .map(h -> Map.<String, Object>of(
                "fileName", h.getFileName(),
                "recordsSaved", h.getRecordsSaved(),
                "recordsSkipped", h.getRecordsSkipped(),
                "uploadedAt", h.getUploadedAt().toString()))
            .toList();
    }
}
