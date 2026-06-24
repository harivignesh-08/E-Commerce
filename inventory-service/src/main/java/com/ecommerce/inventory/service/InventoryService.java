package com.ecommerce.inventory.service;

import com.ecommerce.common.exception.BusinessException;
import com.ecommerce.common.exception.ResourceNotFoundException;
import com.ecommerce.inventory.dto.InventoryRequest;
import com.ecommerce.inventory.dto.InventoryResponse;
import com.ecommerce.inventory.dto.StockUpdateRequest;
import com.ecommerce.inventory.entity.Inventory;
import com.ecommerce.inventory.repository.InventoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class InventoryService {

    private final InventoryRepository inventoryRepository;

    @Transactional
    public InventoryResponse createInventory(InventoryRequest request) {
        if (inventoryRepository.existsByProductId(request.getProductId())) {
            throw new BusinessException("Inventory already exists for product: " + request.getProductId());
        }

        Inventory inventory = Inventory.builder()
                .productId(request.getProductId())
                .quantity(request.getQuantity())
                .reservedQuantity(0)
                .build();

        inventory = inventoryRepository.save(inventory);
        log.info("Inventory created for product {} with quantity {}", inventory.getProductId(), inventory.getQuantity());
        return mapToResponse(inventory);
    }

    @Transactional
    public InventoryResponse updateStock(Long productId, InventoryRequest request) {
        Inventory inventory = findByProductId(productId);
        inventory.setQuantity(request.getQuantity());
        inventory = inventoryRepository.save(inventory);
        log.info("Stock updated for product {} to quantity {}", productId, request.getQuantity());
        return mapToResponse(inventory);
    }

    @Transactional
    public InventoryResponse increaseStock(Long productId, StockUpdateRequest request) {
        Inventory inventory = findByProductId(productId);
        inventory.setQuantity(inventory.getQuantity() + request.getAmount());
        inventory = inventoryRepository.save(inventory);
        log.info("Stock increased for product {} by {}", productId, request.getAmount());
        return mapToResponse(inventory);
    }

    @Transactional
    public InventoryResponse decreaseStock(Long productId, StockUpdateRequest request) {
        Inventory inventory = findByProductId(productId);
        if (inventory.getAvailableQuantity() < request.getAmount()) {
            throw new BusinessException("Insufficient stock for product: " + productId);
        }
        inventory.setQuantity(inventory.getQuantity() - request.getAmount());
        inventory = inventoryRepository.save(inventory);
        log.info("Stock decreased for product {} by {}", productId, request.getAmount());
        return mapToResponse(inventory);
    }

    public boolean checkAvailability(Long productId, int amount) {
        return inventoryRepository.findByProductId(productId)
                .map(inventory -> inventory.getAvailableQuantity() >= amount)
                .orElse(false);
    }

    public InventoryResponse getByProductId(Long productId) {
        return mapToResponse(findByProductId(productId));
    }

    private Inventory findByProductId(Long productId) {
        return inventoryRepository.findByProductId(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Inventory not found for product: " + productId));
    }

    private InventoryResponse mapToResponse(Inventory inventory) {
        return InventoryResponse.builder()
                .id(inventory.getId())
                .productId(inventory.getProductId())
                .quantity(inventory.getQuantity())
                .reservedQuantity(inventory.getReservedQuantity())
                .availableQuantity(inventory.getAvailableQuantity())
                .createdAt(inventory.getCreatedAt())
                .updatedAt(inventory.getUpdatedAt())
                .build();
    }
}
