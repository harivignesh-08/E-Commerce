package com.ecommerce.order.client;

import com.ecommerce.common.dto.ApiResponse;
import com.ecommerce.order.dto.ReserveStockRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Component
@RequiredArgsConstructor
public class InventoryClient {

    private static final String INVENTORY_SERVICE_URL = "http://inventory-service/api/inventory";

    private final RestTemplate restTemplate;

    public void reserveStock(Long productId, Integer quantity) {
        ReserveStockRequest request = ReserveStockRequest.builder()
                .productId(productId)
                .quantity(quantity)
                .build();

        restTemplate.exchange(
                INVENTORY_SERVICE_URL + "/reserve",
                HttpMethod.POST,
                new HttpEntity<>(request),
                new ParameterizedTypeReference<ApiResponse<Void>>() {}
        );
    }

    public void releaseStock(Long productId, Integer quantity) {
        ReserveStockRequest request = ReserveStockRequest.builder()
                .productId(productId)
                .quantity(quantity)
                .build();

        restTemplate.exchange(
                INVENTORY_SERVICE_URL + "/release",
                HttpMethod.POST,
                new HttpEntity<>(request),
                new ParameterizedTypeReference<ApiResponse<Void>>() {}
        );
    }
}
