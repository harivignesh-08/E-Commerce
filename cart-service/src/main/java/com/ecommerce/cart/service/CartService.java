package com.ecommerce.cart.service;

import com.ecommerce.cart.client.InventoryClient;
import com.ecommerce.cart.client.ProductClient;
import com.ecommerce.cart.dto.*;
import com.ecommerce.cart.entity.Cart;
import com.ecommerce.cart.entity.CartItem;
import com.ecommerce.cart.repository.CartItemRepository;
import com.ecommerce.cart.repository.CartRepository;
import com.ecommerce.common.exception.BusinessException;
import com.ecommerce.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductClient productClient;
    private final InventoryClient inventoryClient;

    @Transactional
    public CartResponse addItem(Long userId, AddToCartRequest request) {
        ProductClientResponse product = productClient.getProduct(request.getProductId());
        if (!product.isActive()) {
            throw new BusinessException("Product is not available: " + request.getProductId());
        }

        Cart cart = getOrCreateCart(userId);
        int newQuantity = request.getQuantity();

        CartItem existingItem = cartItemRepository
                .findByCartIdAndProductId(cart.getId(), request.getProductId())
                .orElse(null);

        if (existingItem != null) {
            newQuantity = existingItem.getQuantity() + request.getQuantity();
        }

        inventoryClient.validateStock(request.getProductId(), newQuantity);

        if (existingItem != null) {
            existingItem.setQuantity(newQuantity);
            existingItem.setPrice(product.getPrice());
            existingItem.setProductName(product.getName());
            cartItemRepository.save(existingItem);
            log.info("Updated cart item for user {} product {} qty {}", userId, request.getProductId(), newQuantity);
        } else {
            CartItem item = CartItem.builder()
                    .cartId(cart.getId())
                    .productId(request.getProductId())
                    .productName(product.getName())
                    .price(product.getPrice())
                    .quantity(request.getQuantity())
                    .build();
            cartItemRepository.save(item);
            log.info("Added product {} to cart for user {}", request.getProductId(), userId);
        }

        return buildCartResponse(cart);
    }

    @Transactional
    public CartResponse updateItemQuantity(Long userId, Long productId, UpdateCartItemRequest request) {
        Cart cart = findCartByUserId(userId);
        CartItem item = cartItemRepository.findByCartIdAndProductId(cart.getId(), productId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found for product: " + productId));

        inventoryClient.validateStock(productId, request.getQuantity());

        item.setQuantity(request.getQuantity());
        cartItemRepository.save(item);
        log.info("Updated quantity for user {} product {} to {}", userId, productId, request.getQuantity());

        return buildCartResponse(cart);
    }

    @Transactional
    public CartResponse removeItem(Long userId, Long productId) {
        Cart cart = findCartByUserId(userId);
        CartItem item = cartItemRepository.findByCartIdAndProductId(cart.getId(), productId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found for product: " + productId));

        cartItemRepository.delete(item);
        log.info("Removed product {} from cart for user {}", productId, userId);

        return buildCartResponse(cart);
    }

    public CartResponse getCart(Long userId) {
        Cart cart = cartRepository.findByUserId(userId)
                .orElseGet(() -> Cart.builder().userId(userId).build());
        if (cart.getId() == null) {
            return emptyCartResponse(userId);
        }
        return buildCartResponse(cart);
    }

    @Transactional
    public void clearCart(Long userId) {
        Cart cart = cartRepository.findByUserId(userId).orElse(null);
        if (cart == null) {
            return;
        }
        cartItemRepository.deleteByCartId(cart.getId());
        log.info("Cleared cart for user {}", userId);
    }

    private Cart getOrCreateCart(Long userId) {
        return cartRepository.findByUserId(userId)
                .orElseGet(() -> cartRepository.save(Cart.builder().userId(userId).build()));
    }

    private Cart findCartByUserId(Long userId) {
        return cartRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart not found for user: " + userId));
    }

    private CartResponse buildCartResponse(Cart cart) {
        List<CartItem> items = cartItemRepository.findByCartId(cart.getId());
        List<CartItemResponse> itemResponses = items.stream().map(this::mapToItemResponse).toList();

        BigDecimal totalAmount = itemResponses.stream()
                .map(CartItemResponse::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        int totalItems = itemResponses.stream()
                .mapToInt(CartItemResponse::getQuantity)
                .sum();

        return CartResponse.builder()
                .id(cart.getId())
                .userId(cart.getUserId())
                .items(itemResponses)
                .totalAmount(totalAmount)
                .totalItems(totalItems)
                .build();
    }

    private CartItemResponse mapToItemResponse(CartItem item) {
        BigDecimal subtotal = item.getPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
        return CartItemResponse.builder()
                .id(item.getId())
                .productId(item.getProductId())
                .productName(item.getProductName())
                .price(item.getPrice())
                .quantity(item.getQuantity())
                .subtotal(subtotal)
                .build();
    }

    private CartResponse emptyCartResponse(Long userId) {
        return CartResponse.builder()
                .userId(userId)
                .items(List.of())
                .totalAmount(BigDecimal.ZERO)
                .totalItems(0)
                .build();
    }
}
