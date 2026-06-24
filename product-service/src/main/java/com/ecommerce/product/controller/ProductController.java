package com.ecommerce.product.controller;

import com.ecommerce.common.dto.ApiResponse;
import com.ecommerce.product.dto.*;
import com.ecommerce.product.service.CategoryService;
import com.ecommerce.product.service.ProductService;

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
@RequestMapping("/api/products")
@RequiredArgsConstructor
@Tag(name = "Product Service", description = "Product and category catalog management")
public class ProductController {

    private final ProductService productService;
    private final CategoryService categoryService;

    @PostMapping
    @Operation(summary = "Create a new product")
    public ResponseEntity<ApiResponse<ProductResponse>> createProduct(
            @Valid @RequestBody ProductRequest request) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(
                        "Product created",
                        productService.createProduct(request)
                ));
    }

    @GetMapping
    @Operation(summary = "Get all products")
    public ResponseEntity<ApiResponse<Page<ProductResponse>>> getAllProducts(

            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "10") int size,
            @RequestParam(name = "sortBy", defaultValue = "id") String sortBy,
            @RequestParam(name = "direction", defaultValue = "ASC") String direction,
            @RequestParam(name = "search", required = false) String search) {

        Sort sort = Sort.by(
                Sort.Direction.fromString(direction),
                sortBy
        );

        Page<ProductResponse> products =
                search != null && !search.isBlank()
                        ? productService.searchProducts(
                        search,
                        PageRequest.of(page, size, sort)
                )
                        : productService.getAllProducts(
                        PageRequest.of(page, size, sort)
                );

        return ResponseEntity.ok(ApiResponse.success(products));
    }

    @GetMapping("/search")
    @Operation(summary = "Search products")
    public ResponseEntity<ApiResponse<Page<ProductResponse>>> searchProducts(

            @RequestParam("keyword") String keyword,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "10") int size,
            @RequestParam(name = "sortBy", defaultValue = "id") String sortBy,
            @RequestParam(name = "direction", defaultValue = "ASC") String direction) {

        Sort sort = Sort.by(
                Sort.Direction.fromString(direction),
                sortBy
        );

        return ResponseEntity.ok(
                ApiResponse.success(
                        productService.searchProducts(
                                keyword,
                                PageRequest.of(page, size, sort)
                        )
                )
        );
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get product by ID")
    public ResponseEntity<ApiResponse<ProductResponse>> getProductById(
            @PathVariable("id") Long id) {

        return ResponseEntity.ok(
                ApiResponse.success(
                        productService.getProductById(id)
                )
        );
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update product")
    public ResponseEntity<ApiResponse<ProductResponse>> updateProduct(

            @PathVariable("id") Long id,
            @Valid @RequestBody ProductRequest request) {

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Product updated",
                        productService.updateProduct(id, request)
                )
        );
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete product")
    public ResponseEntity<ApiResponse<Void>> deleteProduct(
            @PathVariable("id") Long id) {

        productService.deleteProduct(id);

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Product deleted",
                        null
                )
        );
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Toggle status")
    public ResponseEntity<ApiResponse<ProductResponse>> toggleProductStatus(
            @PathVariable("id") Long id) {

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Status updated",
                        productService.toggleProductStatus(id)
                )
        );
    }

    @GetMapping("/category/{categoryId}")
    @Operation(summary = "Get products by category")
    public ResponseEntity<ApiResponse<Page<ProductResponse>>> getProductsByCategory(

            @PathVariable("categoryId") Long categoryId,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "10") int size,
            @RequestParam(name = "sortBy", defaultValue = "id") String sortBy,
            @RequestParam(name = "direction", defaultValue = "ASC") String direction) {

        Sort sort = Sort.by(
                Sort.Direction.fromString(direction),
                sortBy
        );

        return ResponseEntity.ok(
                ApiResponse.success(
                        productService.getProductsByCategory(
                                categoryId,
                                PageRequest.of(page, size, sort)
                        )
                )
        );
    }

    @PostMapping("/categories")
    public ResponseEntity<ApiResponse<CategoryResponse>> createCategory(
            @Valid @RequestBody CategoryRequest request) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(
                        "Category created",
                        categoryService.createCategory(request)
                ));
    }

    @GetMapping("/categories/{id}")
    public ResponseEntity<ApiResponse<CategoryResponse>> getCategoryById(
            @PathVariable("id") Long id) {

        return ResponseEntity.ok(
                ApiResponse.success(
                        categoryService.getCategoryById(id)
                )
        );
    }

    @PutMapping("/categories/{id}")
    public ResponseEntity<ApiResponse<CategoryResponse>> updateCategory(

            @PathVariable("id") Long id,
            @Valid @RequestBody CategoryRequest request) {

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Category updated",
                        categoryService.updateCategory(id, request)
                )
        );
    }

    @DeleteMapping("/categories/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteCategory(
            @PathVariable("id") Long id) {

        categoryService.deleteCategory(id);

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Category deleted",
                        null
                )
        );
    }
}