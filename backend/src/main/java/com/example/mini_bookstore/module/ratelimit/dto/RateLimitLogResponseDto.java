package com.example.mini_bookstore.module.ratelimit.dto;

import com.example.mini_bookstore.module.ratelimit.IdentifierType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RateLimitLogResponseDto {
    private UUID id;
    private String identifier;
    private IdentifierType identifierType;
    private String endpoint;
    private LocalDateTime violatedAt;
}
