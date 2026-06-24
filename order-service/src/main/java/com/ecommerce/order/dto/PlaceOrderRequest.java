package com.ecommerce.order.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class PlaceOrderRequest {

    @NotBlank
    private String shippingAddress;

    @NotBlank
    private String paymentMethod;

    private String cardNumber;
    private String cardExpiry;
    private String cardCvv;

    @NotBlank
    private String email;
}
