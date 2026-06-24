package com.ecommerce.inventory.controller;

import com.ecommerce.common.dto.ApiResponse;
import com.ecommerce.inventory.dto.InventoryRequest;
import com.ecommerce.inventory.dto.InventoryResponse;
import com.ecommerce.inventory.dto.StockUpdateRequest;
import com.ecommerce.inventory.service.InventoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/inventory")
@RequiredArgsConstructor
@Tag(name = "Inventory Service", description = "Product stock management and availability checks")
public class InventoryController {

    private final InventoryService inventoryService;

    @PostMapping
    @Operation(summary = "Create inventory record for a product")
    public ResponseEntity<ApiResponse<InventoryResponse>> createInventory(
            @Valid @RequestBody InventoryRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Inventory created", inventoryService.createInventory(request)));
    }

    @PutMapping("/{productId}")
    @Operation(summary = "Update stock quantity for a product")
    public ResponseEntity<ApiResponse<InventoryResponse>> updateStock(
            @PathVariable Long productId,
            @Valid @RequestBody InventoryRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Stock updated", inventoryService.updateStock(productId, request)));
    }

    @PostMapping("/{productId}/increase")
    @Operation(summary = "Increase stock for a product")
    public ResponseEntity<ApiResponse<InventoryResponse>> increaseStock(
            @PathVariable Long productId,
            @Valid @RequestBody StockUpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Stock increased", inventoryService.increaseStock(productId, request)));
    }

    @PostMapping("/{productId}/decrease")
    @Operation(summary = "Decrease stock for a product")
    public ResponseEntity<ApiResponse<InventoryResponse>> decreaseStock(
            @PathVariable Long productId,
            @Valid @RequestBody StockUpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Stock decreased", inventoryService.decreaseStock(productId, request)));
    }

    @GetMapping("/{productId}/availability")
    @Operation(summary = "Check if sufficient stock is available")
    public ResponseEntity<ApiResponse<Map<String, Object>>> checkAvailability(
            @PathVariable Long productId,
            @RequestParam int amount) {
        boolean available = inventoryService.checkAvailability(productId, amount);
        return ResponseEntity.ok(ApiResponse.success(Map.of(
                "productId", productId,
                "amount", amount,
                "available", available
        )));
    }

    @GetMapping("/{productId}")
    @Operation(summary = "Get inventory by product ID")
    public ResponseEntity<ApiResponse<InventoryResponse>> getByProductId(@PathVariable Long productId) {
        return ResponseEntity.ok(ApiResponse.success(inventoryService.getByProductId(productId)));
    }
}
