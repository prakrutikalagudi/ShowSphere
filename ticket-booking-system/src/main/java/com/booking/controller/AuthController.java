package com.booking.controller;

import com.booking.dto.request.*;
import com.booking.dto.response.*;
import com.booking.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(
            @Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(
                    "User registered successfully", response));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(
            @Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(
                ApiResponse.success("Login successful", response));
    }

    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<AuthResponse>> updateProfile(
            org.springframework.security.core.Authentication auth,
            @Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.updateProfile(auth.getName(), request);
        return ResponseEntity.ok(
                ApiResponse.success("Profile updated successfully", response));
    }

    @DeleteMapping("/profile")
    public ResponseEntity<ApiResponse<Void>> deleteProfile(
            org.springframework.security.core.Authentication auth) {
        authService.deleteProfile(auth.getName());
        return ResponseEntity.ok(
                ApiResponse.success("Account deleted successfully", null));
    }
}