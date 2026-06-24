package com.ecommerce.notification.controller;

import com.ecommerce.common.dto.ApiResponse;
import com.ecommerce.notification.dto.NotificationResponse;
import com.ecommerce.notification.dto.SendNotificationRequest;
import com.ecommerce.notification.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@Tag(name = "Notification Service", description = "Email notification management")
public class NotificationController {

    private final NotificationService notificationService;

    @PostMapping("/send")
    @Operation(summary = "Send a notification (called by order/payment services)")
    public ResponseEntity<ApiResponse<NotificationResponse>> sendNotification(
            @Valid @RequestBody SendNotificationRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Notification sent", notificationService.sendNotification(request)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get notification by ID")
    public ResponseEntity<ApiResponse<NotificationResponse>> getNotification(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(notificationService.getNotification(id)));
    }

    @GetMapping
    @Operation(summary = "Get notifications for current user")
    public ResponseEntity<ApiResponse<Page<NotificationResponse>>> getNotifications(
            @RequestHeader("X-User-Id") Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<NotificationResponse> notifications = notificationService.getNotificationsByUser(userId,
                PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt")));
        return ResponseEntity.ok(ApiResponse.success(notifications));
    }
}
