package com.ecommerce.payment.dto;

import com.ecommerce.common.enums.PaymentStatus;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class PaymentResponse {
    private Long id;
    private Long orderId;
    private Long userId;
    private BigDecimal amount;
    private PaymentStatus status;
    private String transactionId;
    private String paymentMethod;
    private LocalDateTime createdAt;
}
