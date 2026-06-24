package com.ecommerce.user.service;

import com.ecommerce.common.enums.Role;
import com.ecommerce.common.exception.BusinessException;
import com.ecommerce.common.security.JwtUtil;
import com.ecommerce.user.dto.RegisterRequest;
import com.ecommerce.user.entity.User;
import com.ecommerce.user.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private JwtUtil jwtUtil;
    @InjectMocks private UserService userService;

    @Test
    void register_success() {
        RegisterRequest request = new RegisterRequest();
        request.setUsername("john");
        request.setEmail("john@test.com");
        request.setPassword("password123");

        when(userRepository.existsByUsername("john")).thenReturn(false);
        when(userRepository.existsByEmail("john@test.com")).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("encoded");
        when(userRepository.save(any(User.class))).thenAnswer(inv -> {
            User u = inv.getArgument(0);
            u.setId(1L);
            return u;
        });
        when(jwtUtil.generateToken(any(), any(), any())).thenReturn("token");

        var response = userService.register(request);
        assertNotNull(response.getToken());
        assertEquals("john", response.getUser().getUsername());
    }

    @Test
    void register_duplicateUsername() {
        RegisterRequest request = new RegisterRequest();
        request.setUsername("john");
        request.setEmail("john@test.com");
        request.setPassword("password123");

        when(userRepository.existsByUsername("john")).thenReturn(true);
        assertThrows(BusinessException.class, () -> userService.register(request));
    }
}
