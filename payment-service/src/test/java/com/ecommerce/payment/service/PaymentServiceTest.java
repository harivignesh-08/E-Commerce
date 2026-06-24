package com.ecommerce.payment.service;

import com.ecommerce.common.enums.PaymentStatus;
import com.ecommerce.common.exception.BusinessException;
import com.ecommerce.payment.dto.ProcessPaymentRequest;
import com.ecommerce.payment.entity.Payment;
import com.ecommerce.payment.repository.PaymentRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PaymentServiceTest {

    @Mock private PaymentRepository paymentRepository;
    @InjectMocks private PaymentService paymentService;

    @Test
    void processPayment_cardWithValidDetails_success() {
        ProcessPaymentRequest request = new ProcessPaymentRequest();
        request.setOrderId(1L);
        request.setUserId(1L);
        request.setAmount(BigDecimal.valueOf(99.99));
        request.setPaymentMethod("CARD");
        request.setCardNumber("4111111111111111");
        request.setCardExpiry("12/28");
        request.setCardCvv("123");

        when(paymentRepository.save(any(Payment.class))).thenAnswer(inv -> {
            Payment p = inv.getArgument(0);
            p.setId(1L);
            return p;
        });

        var response = paymentService.processPayment(request);
        assertEquals(PaymentStatus.SUCCESS, response.getStatus());
        assertNotNull(response.getTransactionId());
    }

    @Test
    void processPayment_invalidCardNumber_throwsBusinessException() {
        ProcessPaymentRequest request = new ProcessPaymentRequest();
        request.setOrderId(1L);
        request.setUserId(1L);
        request.setAmount(BigDecimal.valueOf(99.99));
        request.setPaymentMethod("CARD");
        request.setCardNumber("1234");
        request.setCardExpiry("12/28");
        request.setCardCvv("123");

        assertThrows(BusinessException.class, () -> paymentService.processPayment(request));
    }
}
