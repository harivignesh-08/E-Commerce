package com.ecommerce.cart.client;

import com.ecommerce.cart.dto.ProductClientResponse;
import com.ecommerce.common.dto.ApiResponse;
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
public class ProductClient {

    private static final String PRODUCT_SERVICE = "http://product-service";

    private final RestTemplate restTemplate;

    public ProductClientResponse getProduct(Long productId) {
        try {
            ResponseEntity<ApiResponse<ProductClientResponse>> response = restTemplate.exchange(
                    PRODUCT_SERVICE + "/api/products/" + productId,
                    HttpMethod.GET,
                    null,
                    new ParameterizedTypeReference<ApiResponse<ProductClientResponse>>() {}
            );
            ApiResponse<ProductClientResponse> body = response.getBody();
            if (body == null || body.getData() == null) {
                throw new ResourceNotFoundException("Product not found: " + productId);
            }
            log.debug("Fetched product {} from product-service", productId);
            return body.getData();
        } catch (HttpClientErrorException.NotFound e) {
            throw new ResourceNotFoundException("Product not found: " + productId);
        }
    }
}
