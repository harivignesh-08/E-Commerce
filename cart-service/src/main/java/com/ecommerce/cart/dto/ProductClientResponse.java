package com.ecommerce.cart.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class ProductClientResponse {

    private Long id;
    private String name;
    private String description;
    private BigDecimal price;
    private String sku;
    private String imageUrl;
    private Long categoryId;
    private boolean active;
}
