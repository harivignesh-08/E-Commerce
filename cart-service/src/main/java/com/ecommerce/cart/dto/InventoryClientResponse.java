package com.ecommerce.cart.dto;

import lombok.Data;

@Data
public class InventoryClientResponse {

    private Long id;
    private Long productId;
    private Integer quantity;
    private Integer reservedQuantity;
    private Integer availableQuantity;
}
