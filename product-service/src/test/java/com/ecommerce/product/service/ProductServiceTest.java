package com.ecommerce.product.service;

import com.ecommerce.common.exception.BusinessException;
import com.ecommerce.common.exception.ResourceNotFoundException;
import com.ecommerce.product.dto.ProductRequest;
import com.ecommerce.product.dto.ProductResponse;
import com.ecommerce.product.entity.Category;
import com.ecommerce.product.entity.Product;
import com.ecommerce.product.repository.ProductRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProductServiceTest {

    @Mock private ProductRepository productRepository;
    @Mock private CategoryService categoryService;
    @InjectMocks private ProductService productService;

    @Test
    void createProduct_success() {
        ProductRequest request = new ProductRequest();
        request.setName("Laptop");
        request.setDescription("Gaming laptop");
        request.setPrice(new BigDecimal("999.99"));
        request.setSku("LAP-001");
        request.setCategoryId(1L);

        Category category = Category.builder().id(1L).name("Electronics").active(true).build();

        when(productRepository.existsBySku("LAP-001")).thenReturn(false);
        when(categoryService.findCategory(1L)).thenReturn(category);
        when(productRepository.save(any(Product.class))).thenAnswer(inv -> {
            Product p = inv.getArgument(0);
            p.setId(1L);
            return p;
        });

        ProductResponse response = productService.createProduct(request);

        assertNotNull(response);
        assertEquals("LAP-001", response.getSku());
        assertEquals("Electronics", response.getCategoryName());
        verify(productRepository).save(any(Product.class));
    }

    @Test
    void createProduct_duplicateSku() {
        ProductRequest request = new ProductRequest();
        request.setName("Laptop");
        request.setPrice(new BigDecimal("999.99"));
        request.setSku("LAP-001");
        request.setCategoryId(1L);

        when(productRepository.existsBySku("LAP-001")).thenReturn(true);

        assertThrows(BusinessException.class, () -> productService.createProduct(request));
        verify(productRepository, never()).save(any(Product.class));
    }

    @Test
    void getProductById_notFound() {
        when(productRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> productService.getProductById(99L));
    }

    @Test
    void deleteProduct_success() {
        Product product = Product.builder().id(1L).sku("LAP-001").categoryId(1L).build();
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));

        productService.deleteProduct(1L);

        verify(productRepository).delete(product);
    }
}
