package com.example.mini_bookstore.module.auth;

import com.example.mini_bookstore.module.auth.dto.AuthResponseDto;
import com.example.mini_bookstore.module.auth.dto.LoginRequestDto;
import com.example.mini_bookstore.module.auth.dto.RegisterRequestDto;
import com.example.mini_bookstore.module.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final UserRepository userRepository;

    @PostMapping("/register")
    public ResponseEntity<AuthResponseDto> register(@Valid @RequestBody RegisterRequestDto request) {
        String token = authService.register(request);
        return ResponseEntity.ok(AuthResponseDto.builder().token(token).build());
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponseDto> login(@Valid @RequestBody LoginRequestDto request) {
        String token = authService.login(request);
        return ResponseEntity.ok(AuthResponseDto.builder().token(token).build());
    }
}
