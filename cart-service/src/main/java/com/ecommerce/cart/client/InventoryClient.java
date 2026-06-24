package com.ecommerce.cart.client;

import com.ecommerce.cart.dto.InventoryClientResponse;
import com.ecommerce.common.dto.ApiResponse;
import com.ecommerce.common.exception.BusinessException;
import com.ecommerce.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

@Slf4j
@Component
@RequiredArgsConstructor
public class InventoryClient {

    private static final String INVENTORY_SERVICE = "http://inventory-service";

    private final RestTemplate restTemplate;

    public InventoryClientResponse getInventory(Long productId) {
        try {
            ResponseEntity<ApiResponse<InventoryClientResponse>> response = restTemplate.exchange(
                    INVENTORY_SERVICE + "/api/inventory/product/" + productId,
                    HttpMethod.GET,
                    null,
                    new ParameterizedTypeReference<ApiResponse<InventoryClientResponse>>() {}
            );
            ApiResponse<InventoryClientResponse> body = response.getBody();
            if (body == null || body.getData() == null) {
                throw new ResourceNotFoundException("Inventory not found for product: " + productId);
            }
            log.debug("Fetched inventory for product {} from inventory-service", productId);
            return body.getData();
        } catch (HttpClientErrorException.NotFound e) {
            throw new ResourceNotFoundException("Inventory not found for product: " + productId);
        }
    }

    public void validateStock(Long productId, int requestedQuantity) {
        InventoryClientResponse inventory = getInventory(productId);
        int available = inventory.getAvailableQuantity() != null
                ? inventory.getAvailableQuantity()
                : inventory.getQuantity() - inventory.getReservedQuantity();
        if (available < requestedQuantity) {
            throw new BusinessException(
                    "Insufficient stock for product " + productId + ". Available: " + available);
        }
    }
}
