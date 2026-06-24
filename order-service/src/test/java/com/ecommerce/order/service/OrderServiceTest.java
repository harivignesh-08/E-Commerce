package com.ecommerce.order.service;

import com.ecommerce.common.enums.OrderStatus;
import com.ecommerce.common.exception.BusinessException;
import com.ecommerce.order.client.CartClient;
import com.ecommerce.order.client.InventoryClient;
import com.ecommerce.order.client.NotificationClient;
import com.ecommerce.order.client.PaymentClient;
import com.ecommerce.order.dto.PlaceOrderRequest;
import com.ecommerce.order.repository.OrderRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Mock private OrderRepository orderRepository;
    @Mock private CartClient cartClient;
    @Mock private InventoryClient inventoryClient;
    @Mock private PaymentClient paymentClient;
    @Mock private NotificationClient notificationClient;
    @InjectMocks private OrderService orderService;

    @Test
    void placeOrder_emptyCart_throwsBusinessException() {
        when(cartClient.getCart(1L)).thenReturn(null);

        PlaceOrderRequest request = new PlaceOrderRequest();
        request.setShippingAddress("123 Main St");
        request.setPaymentMethod("CARD");
        request.setEmail("user@test.com");

        assertThrows(BusinessException.class, () -> orderService.placeOrder(1L, request));
    }

    @Test
    void cancelOrder_deliveredStatus_throwsBusinessException() {
        com.ecommerce.order.entity.Order order = com.ecommerce.order.entity.Order.builder()
                .id(1L)
                .userId(1L)
                .status(OrderStatus.DELIVERED)
                .build();

        when(orderRepository.findById(1L)).thenReturn(java.util.Optional.of(order));

        assertThrows(BusinessException.class, () -> orderService.cancelOrder(1L, 1L));
    }
}
