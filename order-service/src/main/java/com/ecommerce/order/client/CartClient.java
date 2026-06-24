package com.ecommerce.order.client;

import com.ecommerce.common.dto.ApiResponse;
import com.ecommerce.order.dto.CartResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Component
@RequiredArgsConstructor
public class CartClient {

    private static final String CART_SERVICE_URL = "http://cart-service/api/cart";

    private final RestTemplate restTemplate;

    public CartResponse getCart(Long userId) {
        HttpHeaders headers = new HttpHeaders();
        headers.set("X-User-Id", String.valueOf(userId));
        HttpEntity<Void> entity = new HttpEntity<>(headers);

        ApiResponse<CartResponse> response = restTemplate.exchange(
                CART_SERVICE_URL,
                HttpMethod.GET,
                entity,
                new ParameterizedTypeReference<ApiResponse<CartResponse>>() {}
        ).getBody();

        return response != null ? response.getData() : null;
    }

    public void clearCart(Long userId) {
        HttpHeaders headers = new HttpHeaders();
        headers.set("X-User-Id", String.valueOf(userId));
        HttpEntity<Void> entity = new HttpEntity<>(headers);

        restTemplate.exchange(
                CART_SERVICE_URL,
                HttpMethod.DELETE,
                entity,
                Void.class
        );
    }
}
