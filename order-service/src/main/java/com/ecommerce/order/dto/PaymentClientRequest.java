package com.ecommerce.order.dto;

import com.ecommerce.common.enums.PaymentStatus;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class PaymentClientRequest {
    private Long orderId;
    private Long userId;
    private BigDecimal amount;
    private String paymentMethod;
    private String cardNumber;
    private String cardExpiry;
    private String cardCvv;
}
