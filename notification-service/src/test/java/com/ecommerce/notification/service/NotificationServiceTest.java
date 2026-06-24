package com.ecommerce.notification.service;

import com.ecommerce.notification.dto.SendNotificationRequest;
import com.ecommerce.notification.entity.Notification;
import com.ecommerce.notification.repository.NotificationRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class NotificationServiceTest {

    @Mock private NotificationRepository notificationRepository;
    @InjectMocks private NotificationService notificationService;

    @Test
    void sendNotification_success() {
        SendNotificationRequest request = new SendNotificationRequest();
        request.setUserId(1L);
        request.setOrderId(100L);
        request.setType("ORDER_CONFIRMATION");
        request.setSubject("Order Confirmed");
        request.setMessage("Your order has been confirmed.");
        request.setEmail("user@test.com");

        when(notificationRepository.save(any(Notification.class))).thenAnswer(inv -> {
            Notification n = inv.getArgument(0);
            n.setId(1L);
            return n;
        });

        var response = notificationService.sendNotification(request);
        assertTrue(response.isSent());
        assertEquals("ORDER_CONFIRMATION", response.getType());
        assertEquals("user@test.com", response.getEmail());
    }
}
