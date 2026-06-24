package com.ecommerce.notification.service;

import com.ecommerce.common.exception.ResourceNotFoundException;
import com.ecommerce.notification.dto.NotificationResponse;
import com.ecommerce.notification.dto.SendNotificationRequest;
import com.ecommerce.notification.entity.Notification;
import com.ecommerce.notification.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;

    @Transactional
    public NotificationResponse sendNotification(SendNotificationRequest request) {
        Notification notification = Notification.builder()
                .userId(request.getUserId())
                .orderId(request.getOrderId())
                .type(request.getType())
                .subject(request.getSubject())
                .message(request.getMessage())
                .email(request.getEmail())
                .sent(true)
                .build();

        notification = notificationRepository.save(notification);
        simulateEmailSend(notification);
        return mapToResponse(notification);
    }

    public NotificationResponse getNotification(Long id) {
        return mapToResponse(findNotification(id));
    }

    public Page<NotificationResponse> getNotificationsByUser(Long userId, Pageable pageable) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable)
                .map(this::mapToResponse);
    }

    private Notification findNotification(Long id) {
        return notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found: " + id));
    }

    private void simulateEmailSend(Notification notification) {
        log.info("=== EMAIL NOTIFICATION ===");
        log.info("To: {}", notification.getEmail());
        log.info("Subject: {}", notification.getSubject());
        log.info("Type: {}", notification.getType());
        log.info("Message: {}", notification.getMessage());
        log.info("Order ID: {}", notification.getOrderId());
        log.info("==========================");
    }

    private NotificationResponse mapToResponse(Notification notification) {
        return NotificationResponse.builder()
                .id(notification.getId())
                .userId(notification.getUserId())
                .orderId(notification.getOrderId())
                .type(notification.getType())
                .subject(notification.getSubject())
                .message(notification.getMessage())
                .email(notification.getEmail())
                .sent(notification.isSent())
                .createdAt(notification.getCreatedAt())
                .build();
    }
}
