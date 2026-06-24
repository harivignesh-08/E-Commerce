package com.ecommerce.order.client;

import com.ecommerce.common.dto.ApiResponse;
import com.ecommerce.order.dto.NotificationClientRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Component
@RequiredArgsConstructor
public class NotificationClient {

    private static final String NOTIFICATION_SERVICE_URL = "http://notification-service/api/notifications";

    private final RestTemplate restTemplate;

    public void sendNotification(NotificationClientRequest request) {
        restTemplate.exchange(
                NOTIFICATION_SERVICE_URL + "/send",
                HttpMethod.POST,
                new HttpEntity<>(request),
                new ParameterizedTypeReference<ApiResponse<Void>>() {}
        );
    }
}
