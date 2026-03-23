package com.cloudsentinel.controller;
import com.cloudsentinel.service.BillingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.Map;

@RestController @RequestMapping("/api/billing") @RequiredArgsConstructor
public class BillingController {
    private final BillingService billingService;

    @PostMapping("/upload")
    public ResponseEntity<Map<String, Object>> upload(
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal UserDetails userDetails) throws Exception {
        return ResponseEntity.ok(billingService.processCSV(file, userDetails.getUsername()));
    }
}
