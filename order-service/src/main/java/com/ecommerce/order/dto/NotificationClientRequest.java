package com.ecommerce.order.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationClientRequest {
    private Long userId;
    private Long orderId;
    private String type;
    private String subject;
    private String message;
    private String email;
}
