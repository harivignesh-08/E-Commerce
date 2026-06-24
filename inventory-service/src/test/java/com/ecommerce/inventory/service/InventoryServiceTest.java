package com.ecommerce.inventory.service;

import com.ecommerce.common.exception.BusinessException;
import com.ecommerce.common.exception.ResourceNotFoundException;
import com.ecommerce.inventory.dto.InventoryRequest;
import com.ecommerce.inventory.dto.StockUpdateRequest;
import com.ecommerce.inventory.entity.Inventory;
import com.ecommerce.inventory.repository.InventoryRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class InventoryServiceTest {

    @Mock
    private InventoryRepository inventoryRepository;

    @InjectMocks
    private InventoryService inventoryService;

    @Test
    void createInventory_success() {
        InventoryRequest request = new InventoryRequest();
        request.setProductId(1L);
        request.setQuantity(100);

        when(inventoryRepository.existsByProductId(1L)).thenReturn(false);
        when(inventoryRepository.save(any(Inventory.class))).thenAnswer(invocation -> {
            Inventory saved = invocation.getArgument(0);
            saved.setId(1L);
            return saved;
        });

        var response = inventoryService.createInventory(request);

        assertEquals(1L, response.getProductId());
        assertEquals(100, response.getQuantity());
        assertEquals(0, response.getReservedQuantity());
        assertEquals(100, response.getAvailableQuantity());
    }

    @Test
    void createInventory_duplicateProduct() {
        InventoryRequest request = new InventoryRequest();
        request.setProductId(1L);
        request.setQuantity(100);

        when(inventoryRepository.existsByProductId(1L)).thenReturn(true);

        assertThrows(BusinessException.class, () -> inventoryService.createInventory(request));
    }

    @Test
    void decreaseStock_insufficientStock() {
        Inventory inventory = Inventory.builder()
                .id(1L)
                .productId(1L)
                .quantity(5)
                .reservedQuantity(0)
                .build();

        StockUpdateRequest request = new StockUpdateRequest();
        request.setAmount(10);

        when(inventoryRepository.findByProductId(1L)).thenReturn(Optional.of(inventory));

        assertThrows(BusinessException.class, () -> inventoryService.decreaseStock(1L, request));
    }

    @Test
    void checkAvailability_returnsTrueWhenSufficient() {
        Inventory inventory = Inventory.builder()
                .productId(1L)
                .quantity(50)
                .reservedQuantity(10)
                .build();

        when(inventoryRepository.findByProductId(1L)).thenReturn(Optional.of(inventory));

        assertTrue(inventoryService.checkAvailability(1L, 40));
    }

    @Test
    void getByProductId_notFound() {
        when(inventoryRepository.findByProductId(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> inventoryService.getByProductId(99L));
    }
}
