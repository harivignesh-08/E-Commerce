package com.ecommerce.product.repository;

import com.ecommerce.product.entity.Category;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CategoryRepository extends JpaRepository<Category, Long> {
    Optional<Category> findByName(String name);
    boolean existsByName(String name);
    Page<Category> findByNameContainingIgnoreCase(String name, Pageable pageable);
    Page<Category> findByActiveTrue(Pageable pageable);
}
