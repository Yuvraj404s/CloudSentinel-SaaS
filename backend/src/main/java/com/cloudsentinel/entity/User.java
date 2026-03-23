package com.cloudsentinel.entity;
import jakarta.persistence.*;
import lombok.*;
import java.util.Set;

@Entity @Table(name = "users")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class User {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(unique = true, nullable = false) private String username;
    @Column(nullable = false) private String password;
    @Column(unique = true, nullable = false) private String email;
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "user_roles")
    @Column(name = "role")
    private Set<String> roles;
}
