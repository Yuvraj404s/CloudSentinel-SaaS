package com.cloudsentinel.dto;
import lombok.*;
@Data @AllArgsConstructor
public class AuthResponse {
    private String token;
    private String username;
    private String message;
}
