package com.example.mini_bookstore.module.auth;

import com.example.mini_bookstore.module.auth.dto.LoginRequestDto;
import com.example.mini_bookstore.module.auth.dto.RegisterRequestDto;
import com.example.mini_bookstore.module.user.Role;
import com.example.mini_bookstore.module.user.User;
import com.example.mini_bookstore.module.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {
    
    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;

    public String register(RegisterRequestDto request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email is already taken!");
        }

        User user = User.builder()
                .email(request.getEmail())
                .passwordHash(PasswordUtil.hashPassword(request.getPassword()))
                .fullName(request.getFullName())
                .phone(request.getPhone())
                .role(Role.USER)
                .build();
                
        userRepository.save(user);
        
        return jwtUtil.generateToken(user.getId(), user.getEmail(), user.getRole().name());
    }

    public String login(LoginRequestDto request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!PasswordUtil.checkPassword(request.getPassword(), user.getPasswordHash())) {
            throw new RuntimeException("Invalid password");
        }

        return jwtUtil.generateToken(user.getId(), user.getEmail(), user.getRole().name());
    }
}
