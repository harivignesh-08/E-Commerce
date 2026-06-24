package com.ecommerce.payment.service;

import com.ecommerce.common.enums.PaymentStatus;
import com.ecommerce.common.exception.BusinessException;
import com.ecommerce.common.exception.ResourceNotFoundException;
import com.ecommerce.payment.dto.PaymentResponse;
import com.ecommerce.payment.dto.ProcessPaymentRequest;
import com.ecommerce.payment.entity.Payment;
import com.ecommerce.payment.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;
import java.util.concurrent.ThreadLocalRandom;

@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;

    @Transactional
    public PaymentResponse processPayment(ProcessPaymentRequest request) {
        validateCardDetails(request);

        boolean success = simulateGateway(request.getPaymentMethod());
        PaymentStatus status = success ? PaymentStatus.SUCCESS : PaymentStatus.FAILED;
        String transactionId = success ? "TXN-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase() : null;

        Payment payment = Payment.builder()
                .orderId(request.getOrderId())
                .userId(request.getUserId())
                .amount(request.getAmount())
                .status(status)
                .transactionId(transactionId)
                .paymentMethod(request.getPaymentMethod())
                .build();

        payment = paymentRepository.save(payment);
        log.info("Payment processed for order {}: status={}", request.getOrderId(), status);
        return mapToResponse(payment);
    }

    public PaymentResponse getPaymentByOrderId(Long orderId) {
        Payment payment = paymentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found for order: " + orderId));
        return mapToResponse(payment);
    }

    public Page<PaymentResponse> getPaymentHistory(Long userId, Pageable pageable) {
        return paymentRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable)
                .map(this::mapToResponse);
    }

    private void validateCardDetails(ProcessPaymentRequest request) {
        if (!"CARD".equalsIgnoreCase(request.getPaymentMethod())) {
            return;
        }
        if (request.getCardNumber() == null || !request.getCardNumber().matches("\\d{13,19}")) {
            throw new BusinessException("Invalid card number");
        }
        if (request.getCardExpiry() == null || !request.getCardExpiry().matches("(0[1-9]|1[0-2])/\\d{2}")) {
            throw new BusinessException("Invalid card expiry (MM/YY)");
        }
        if (request.getCardCvv() == null || !request.getCardCvv().matches("\\d{3,4}")) {
            throw new BusinessException("Invalid CVV");
        }
    }

    private boolean simulateGateway(String paymentMethod) {
        if ("CARD".equalsIgnoreCase(paymentMethod)) {
            return true;
        }
        return ThreadLocalRandom.current().nextDouble() < 0.90;
    }

    private PaymentResponse mapToResponse(Payment payment) {
        return PaymentResponse.builder()
                .id(payment.getId())
                .orderId(payment.getOrderId())
                .userId(payment.getUserId())
                .amount(payment.getAmount())
                .status(payment.getStatus())
                .transactionId(payment.getTransactionId())
                .paymentMethod(payment.getPaymentMethod())
                .createdAt(payment.getCreatedAt())
                .build();
    }
}
