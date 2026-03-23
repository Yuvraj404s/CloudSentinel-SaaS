package com.cloudsentinel.controller;
import com.cloudsentinel.service.AlertService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.util.Map;

@RestController @RequestMapping("/api/alerts") @RequiredArgsConstructor
public class AlertController {
    private final AlertService alertService;

    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> status(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(alertService.getAlertStatus(userDetails.getUsername()));
    }

    @PutMapping("/threshold")
    public ResponseEntity<Map<String, Object>> updateThreshold(
            @RequestBody Map<String, BigDecimal> body,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(alertService.updateThreshold(userDetails.getUsername(), body.get("threshold")));
    }
}
