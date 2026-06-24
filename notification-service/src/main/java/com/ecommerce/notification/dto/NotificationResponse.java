package com.ecommerce.notification.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class NotificationResponse {
    private Long id;
    private Long userId;
    private Long orderId;
    private String type;
    private String subject;
    private String message;
    private String email;
    private boolean sent;
    private LocalDateTime createdAt;
}
