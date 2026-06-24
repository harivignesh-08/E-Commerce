package com.ecommerce.order.client;

import com.ecommerce.common.dto.ApiResponse;
import com.ecommerce.order.dto.PaymentClientRequest;
import com.ecommerce.order.dto.PaymentClientResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Component
@RequiredArgsConstructor
public class PaymentClient {

    private static final String PAYMENT_SERVICE_URL = "http://payment-service/api/payments";

    private final RestTemplate restTemplate;

    public PaymentClientResponse processPayment(PaymentClientRequest request) {
        ApiResponse<PaymentClientResponse> response = restTemplate.exchange(
                PAYMENT_SERVICE_URL + "/process",
                HttpMethod.POST,
                new HttpEntity<>(request),
                new ParameterizedTypeReference<ApiResponse<PaymentClientResponse>>() {}
        ).getBody();

        return response != null ? response.getData() : null;
    }
}
