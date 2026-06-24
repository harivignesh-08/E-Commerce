package com.ecommerce.notification.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class SendNotificationRequest {

    @NotNull
    private Long userId;

    private Long orderId;

    @NotBlank
    private String type;

    @NotBlank
    private String subject;

    @NotBlank
    private String message;

    @NotBlank
    @Email
    private String email;
}
