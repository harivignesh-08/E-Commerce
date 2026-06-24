package com.ecommerce.cart.service;

import com.ecommerce.cart.client.InventoryClient;
import com.ecommerce.cart.client.ProductClient;
import com.ecommerce.cart.dto.AddToCartRequest;
import com.ecommerce.cart.dto.ProductClientResponse;
import com.ecommerce.cart.entity.Cart;
import com.ecommerce.cart.entity.CartItem;
import com.ecommerce.cart.repository.CartItemRepository;
import com.ecommerce.cart.repository.CartRepository;
import com.ecommerce.common.exception.BusinessException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CartServiceTest {

    @Mock private CartRepository cartRepository;
    @Mock private CartItemRepository cartItemRepository;
    @Mock private ProductClient productClient;
    @Mock private InventoryClient inventoryClient;
    @InjectMocks private CartService cartService;

    @Test
    void addItem_success() {
        Long userId = 1L;
        Long productId = 10L;
        AddToCartRequest request = new AddToCartRequest();
        request.setProductId(productId);
        request.setQuantity(2);

        ProductClientResponse product = new ProductClientResponse();
        product.setId(productId);
        product.setName("Test Product");
        product.setPrice(BigDecimal.valueOf(29.99));
        product.setActive(true);

        Cart cart = Cart.builder().id(100L).userId(userId).build();

        when(productClient.getProduct(productId)).thenReturn(product);
        when(cartRepository.findByUserId(userId)).thenReturn(Optional.of(cart));
        when(cartItemRepository.findByCartIdAndProductId(100L, productId)).thenReturn(Optional.empty());
        doNothing().when(inventoryClient).validateStock(productId, 2);
        when(cartItemRepository.save(any(CartItem.class))).thenAnswer(inv -> {
            CartItem item = inv.getArgument(0);
            item.setId(1L);
            return item;
        });
        when(cartItemRepository.findByCartId(100L)).thenAnswer(inv -> {
            CartItem item = CartItem.builder()
                    .id(1L)
                    .cartId(100L)
                    .productId(productId)
                    .productName("Test Product")
                    .price(BigDecimal.valueOf(29.99))
                    .quantity(2)
                    .build();
            return java.util.List.of(item);
        });

        var response = cartService.addItem(userId, request);

        assertNotNull(response);
        assertEquals(userId, response.getUserId());
        assertEquals(1, response.getItems().size());
        assertEquals(2, response.getTotalItems());
        assertEquals(0, BigDecimal.valueOf(59.98).compareTo(response.getTotalAmount()));
        verify(inventoryClient).validateStock(productId, 2);
    }

    @Test
    void addItem_inactiveProduct() {
        Long userId = 1L;
        Long productId = 10L;
        AddToCartRequest request = new AddToCartRequest();
        request.setProductId(productId);
        request.setQuantity(1);

        ProductClientResponse product = new ProductClientResponse();
        product.setId(productId);
        product.setActive(false);

        when(productClient.getProduct(productId)).thenReturn(product);

        assertThrows(BusinessException.class, () -> cartService.addItem(userId, request));
        verify(cartRepository, never()).save(any());
    }

    @Test
    void addItem_insufficientStock() {
        Long userId = 1L;
        Long productId = 10L;
        AddToCartRequest request = new AddToCartRequest();
        request.setProductId(productId);
        request.setQuantity(5);

        ProductClientResponse product = new ProductClientResponse();
        product.setId(productId);
        product.setName("Test Product");
        product.setPrice(BigDecimal.TEN);
        product.setActive(true);

        Cart cart = Cart.builder().id(100L).userId(userId).build();

        when(productClient.getProduct(productId)).thenReturn(product);
        when(cartRepository.findByUserId(userId)).thenReturn(Optional.of(cart));
        when(cartItemRepository.findByCartIdAndProductId(100L, productId)).thenReturn(Optional.empty());
        doThrow(new BusinessException("Insufficient stock"))
                .when(inventoryClient).validateStock(eq(productId), eq(5));

        assertThrows(BusinessException.class, () -> cartService.addItem(userId, request));
        verify(cartItemRepository, never()).save(any());
    }
}
