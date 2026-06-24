package com.ecommerce.order.service;

import com.ecommerce.common.enums.OrderStatus;
import com.ecommerce.common.enums.PaymentStatus;
import com.ecommerce.common.exception.BusinessException;
import com.ecommerce.common.exception.ResourceNotFoundException;
import com.ecommerce.order.client.CartClient;
import com.ecommerce.order.client.InventoryClient;
import com.ecommerce.order.client.NotificationClient;
import com.ecommerce.order.client.PaymentClient;
import com.ecommerce.order.dto.*;
import com.ecommerce.order.entity.Order;
import com.ecommerce.order.entity.OrderItem;
import com.ecommerce.order.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final CartClient cartClient;
    private final InventoryClient inventoryClient;
    private final PaymentClient paymentClient;
    private final NotificationClient notificationClient;

    @Transactional
    public OrderResponse placeOrder(Long userId, PlaceOrderRequest request) {
        CartResponse cart = cartClient.getCart(userId);
        if (cart == null || cart.getItems() == null || cart.getItems().isEmpty()) {
            throw new BusinessException("Cart is empty");
        }

        List<CartItemResponse> reservedItems = new ArrayList<>();
        try {
            for (CartItemResponse item : cart.getItems()) {
                inventoryClient.reserveStock(item.getProductId(), item.getQuantity());
                reservedItems.add(item);
            }
        } catch (Exception e) {
            rollbackInventory(reservedItems);
            throw new BusinessException("Failed to reserve inventory: " + e.getMessage());
        }

        Order order = Order.builder()
                .userId(userId)
                .totalAmount(cart.getTotalAmount())
                .status(OrderStatus.PENDING)
                .shippingAddress(request.getShippingAddress())
                .build();

        for (CartItemResponse cartItem : cart.getItems()) {
            OrderItem orderItem = OrderItem.builder()
                    .productId(cartItem.getProductId())
                    .productName(cartItem.getProductName())
                    .price(cartItem.getPrice())
                    .quantity(cartItem.getQuantity())
                    .build();
            order.addItem(orderItem);
        }

        order = orderRepository.save(order);

        PaymentClientResponse payment = paymentClient.processPayment(PaymentClientRequest.builder()
                .orderId(order.getId())
                .userId(userId)
                .amount(order.getTotalAmount())
                .paymentMethod(request.getPaymentMethod())
                .cardNumber(request.getCardNumber())
                .cardExpiry(request.getCardExpiry())
                .cardCvv(request.getCardCvv())
                .build());

        if (payment == null || payment.getStatus() != PaymentStatus.SUCCESS) {
            order.setStatus(OrderStatus.CANCELLED);
            orderRepository.save(order);
            rollbackInventory(reservedItems);
            throw new BusinessException("Payment failed");
        }

        order.setStatus(OrderStatus.CONFIRMED);
        order = orderRepository.save(order);

        notificationClient.sendNotification(NotificationClientRequest.builder()
                .userId(userId)
                .orderId(order.getId())
                .type("ORDER_CONFIRMATION")
                .subject("Order Confirmed")
                .message("Your order #" + order.getId() + " has been confirmed. Total: " + order.getTotalAmount())
                .email(request.getEmail())
                .build());

        notificationClient.sendNotification(NotificationClientRequest.builder()
                .userId(userId)
                .orderId(order.getId())
                .type("PAYMENT_SUCCESS")
                .subject("Payment Successful")
                .message("Payment of " + order.getTotalAmount() + " for order #" + order.getId() + " was successful.")
                .email(request.getEmail())
                .build());

        cartClient.clearCart(userId);
        log.info("Order placed successfully: {}", order.getId());
        return mapToResponse(order);
    }

    @Transactional
    public OrderResponse cancelOrder(Long userId, Long orderId) {
        Order order = findOrder(orderId);
        if (!order.getUserId().equals(userId)) {
            throw new BusinessException("Not authorized to cancel this order");
        }
        if (order.getStatus() == OrderStatus.CANCELLED || order.getStatus() == OrderStatus.DELIVERED) {
            throw new BusinessException("Order cannot be cancelled in status: " + order.getStatus());
        }

        for (OrderItem item : order.getItems()) {
            inventoryClient.releaseStock(item.getProductId(), item.getQuantity());
        }

        order.setStatus(OrderStatus.CANCELLED);
        order = orderRepository.save(order);
        log.info("Order cancelled: {}", orderId);
        return mapToResponse(order);
    }

    public OrderResponse getOrder(Long userId, Long orderId) {
        Order order = findOrder(orderId);
        if (!order.getUserId().equals(userId)) {
            throw new BusinessException("Not authorized to view this order");
        }
        return mapToResponse(order);
    }

    public Page<OrderResponse> getOrderHistory(Long userId, Pageable pageable) {
        return orderRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable)
                .map(this::mapToResponse);
    }

    @Transactional
    public OrderResponse updateStatus(Long orderId, UpdateOrderStatusRequest request) {
        Order order = findOrder(orderId);
        order.setStatus(request.getStatus());
        order = orderRepository.save(order);
        log.info("Order {} status updated to {}", orderId, request.getStatus());
        return mapToResponse(order);
    }

    public Page<OrderResponse> getAllOrders(Pageable pageable) {
        return orderRepository.findAll(pageable).map(this::mapToResponse);
    }

    private Order findOrder(Long orderId) {
        return orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + orderId));
    }

    private void rollbackInventory(List<CartItemResponse> items) {
        for (CartItemResponse item : items) {
            try {
                inventoryClient.releaseStock(item.getProductId(), item.getQuantity());
            } catch (Exception ex) {
                log.warn("Failed to release stock for product {}: {}", item.getProductId(), ex.getMessage());
            }
        }
    }

    private OrderResponse mapToResponse(Order order) {
        List<OrderItemResponse> items = order.getItems().stream()
                .map(item -> OrderItemResponse.builder()
                        .id(item.getId())
                        .productId(item.getProductId())
                        .productName(item.getProductName())
                        .price(item.getPrice())
                        .quantity(item.getQuantity())
                        .build())
                .toList();

        return OrderResponse.builder()
                .id(order.getId())
                .userId(order.getUserId())
                .totalAmount(order.getTotalAmount())
                .status(order.getStatus())
                .shippingAddress(order.getShippingAddress())
                .items(items)
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .build();
    }
}
