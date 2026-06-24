package com.ecommerce.product.service;

import com.ecommerce.common.exception.BusinessException;
import com.ecommerce.common.exception.ResourceNotFoundException;
import com.ecommerce.product.dto.ProductRequest;
import com.ecommerce.product.dto.ProductResponse;
import com.ecommerce.product.entity.Category;
import com.ecommerce.product.entity.Product;
import com.ecommerce.product.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryService categoryService;

    @Transactional
    public ProductResponse createProduct(ProductRequest request) {
        if (productRepository.existsBySku(request.getSku())) {
            throw new BusinessException("SKU already exists");
        }

        Category category = categoryService.findCategory(request.getCategoryId());

        Product product = Product.builder()
                .name(request.getName())
                .description(request.getDescription())
                .price(request.getPrice())
                .sku(request.getSku())
                .imageUrl(request.getImageUrl())
                .categoryId(category.getId())
                .active(request.getActive() != null ? request.getActive() : true)
                .build();

        product = productRepository.save(product);
        log.info("Product created: {}", product.getSku());
        return mapToResponse(product, category.getName());
    }

    public ProductResponse getProductById(Long id) {
        Product product = findProduct(id);
        String categoryName = resolveCategoryName(product.getCategoryId());
        return mapToResponse(product, categoryName);
    }

    public Page<ProductResponse> getAllProducts(Pageable pageable) {
        return productRepository.findAll(pageable)
                .map(product -> mapToResponse(product, resolveCategoryName(product.getCategoryId())));
    }

    public Page<ProductResponse> searchProducts(String keyword, Pageable pageable) {
        return productRepository.searchByKeyword(keyword, pageable)
                .map(product -> mapToResponse(product, resolveCategoryName(product.getCategoryId())));
    }

    public Page<ProductResponse> getProductsByCategory(Long categoryId, Pageable pageable) {
        categoryService.findCategory(categoryId);
        return productRepository.findByCategoryId(categoryId, pageable)
                .map(product -> mapToResponse(product, resolveCategoryName(product.getCategoryId())));
    }

    @Transactional
    public ProductResponse updateProduct(Long id, ProductRequest request) {
        Product product = findProduct(id);

        if (request.getSku() != null && !request.getSku().equals(product.getSku())) {
            if (productRepository.existsBySku(request.getSku())) {
                throw new BusinessException("SKU already exists");
            }
            product.setSku(request.getSku());
        }
        if (request.getName() != null) {
            product.setName(request.getName());
        }
        if (request.getDescription() != null) {
            product.setDescription(request.getDescription());
        }
        if (request.getPrice() != null) {
            product.setPrice(request.getPrice());
        }
        if (request.getImageUrl() != null) {
            product.setImageUrl(request.getImageUrl());
        }
        if (request.getCategoryId() != null) {
            Category category = categoryService.findCategory(request.getCategoryId());
            product.setCategoryId(category.getId());
        }
        if (request.getActive() != null) {
            product.setActive(request.getActive());
        }

        product = productRepository.save(product);
        return mapToResponse(product, resolveCategoryName(product.getCategoryId()));
    }

    @Transactional
    public void deleteProduct(Long id) {
        Product product = findProduct(id);
        productRepository.delete(product);
        log.info("Product deleted: {}", product.getSku());
    }

    @Transactional
    public ProductResponse toggleProductStatus(Long id) {
        Product product = findProduct(id);
        product.setActive(!product.isActive());
        product = productRepository.save(product);
        return mapToResponse(product, resolveCategoryName(product.getCategoryId()));
    }

    private Product findProduct(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + id));
    }

    private String resolveCategoryName(Long categoryId) {
        return categoryService.findCategory(categoryId).getName();
    }

    private ProductResponse mapToResponse(Product product, String categoryName) {
        return ProductResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .description(product.getDescription())
                .price(product.getPrice())
                .sku(product.getSku())
                .imageUrl(product.getImageUrl())
                .categoryId(product.getCategoryId())
                .categoryName(categoryName)
                .active(product.isActive())
                .createdAt(product.getCreatedAt())
                .updatedAt(product.getUpdatedAt())
                .build();
    }
}
