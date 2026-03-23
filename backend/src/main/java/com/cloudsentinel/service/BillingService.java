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
import java.util.*;

@Service @RequiredArgsConstructor
public class BillingService {
    private final BillingRecordRepository billingRepo;
    private final UserRepository userRepository;
    private final AlertService alertService;

    public Map<String, Object> processCSV(MultipartFile file, String username) throws Exception {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        List<BillingRecord> batch = new ArrayList<>();
        int saved = 0, skipped = 0;

        try (CSVReader reader = new CSVReader(new InputStreamReader(file.getInputStream()))) {
            String[] line;
            boolean isHeader = true;
            while ((line = reader.readNext()) != null) {
                if (isHeader) { isHeader = false; continue; }
                if (line.length < 6) continue;

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
            }
            if (!batch.isEmpty()) {
                billingRepo.saveAll(batch);
                saved += batch.size();
            }
        }

        alertService.checkThreshold(user);

        return Map.of("saved", saved, "skipped", skipped,
            "message", "Upload complete: " + saved + " saved, " + skipped + " duplicates skipped");
    }
}
