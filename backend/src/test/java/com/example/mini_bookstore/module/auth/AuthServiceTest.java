package com.example.mini_bookstore.module.auth;

import com.example.mini_bookstore.module.auth.dto.LoginRequestDto;
import com.example.mini_bookstore.module.auth.dto.RegisterRequestDto;
import com.example.mini_bookstore.module.user.Role;
import com.example.mini_bookstore.module.user.User;
import com.example.mini_bookstore.module.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AuthServiceTest {

  @Mock
  private UserRepository userRepository;
  @Mock
  private JwtUtil jwtUtil;

  private AuthService authService;

  @BeforeEach
  void setUp() {
    authService = new AuthService(userRepository, jwtUtil);
  }

  @Test
  void testRegister_success() {
    RegisterRequestDto request = RegisterRequestDto.builder()
        .email("test@example.com")
        .password("password123")
        .fullName("John Doe")
        .phone("123456789")
        .build();

    when(userRepository.existsByEmail("test@example.com")).thenReturn(false);
    when(userRepository.save(any(User.class))).thenAnswer(i -> {
      User u = i.getArgument(0);
      u.setId(UUID.randomUUID());
      return u;
    });

    when(jwtUtil.generateToken(any(), eq("test@example.com"), eq("USER"))).thenReturn("mocked-jwt-token");

    String token = authService.register(request);

    assertNotNull(token);
    assertEquals("mocked-jwt-token", token);
    verify(userRepository).save(any(User.class));
  }

  @Test
  void testRegister_throwsWhenEmailTaken() {
    RegisterRequestDto request = RegisterRequestDto.builder()
        .email("taken@example.com")
        .password("password123")
        .build();

    when(userRepository.existsByEmail("taken@example.com")).thenReturn(true);

    Exception exception = assertThrows(RuntimeException.class, () -> {
      authService.register(request);
    });

    assertTrue(exception.getMessage().contains("Email is already taken"));
    verify(userRepository, never()).save(any(User.class));
  }

  @Test
  void testLogin_success() {
    UUID userId = UUID.randomUUID();
    User user = User.builder()
        .id(userId)
        .email("test@example.com")
        .passwordHash(PasswordUtil.hashPassword("password123"))
        .role(Role.USER)
        .build();

    LoginRequestDto request = LoginRequestDto.builder()
        .email("test@example.com")
        .password("password123")
        .build();

    when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(user));
    when(jwtUtil.generateToken(userId, "test@example.com", "USER")).thenReturn("mocked-jwt-token");

    String token = authService.login(request);

    assertNotNull(token);
    assertEquals("mocked-jwt-token", token);
  }

  @Test
  void testLogin_throwsWhenUserNotFound() {
    LoginRequestDto request = LoginRequestDto.builder()
        .email("unknown@example.com")
        .password("password123")
        .build();

    when(userRepository.findByEmail("unknown@example.com")).thenReturn(Optional.empty());

    Exception exception = assertThrows(RuntimeException.class, () -> {
      authService.login(request);
    });

    assertTrue(exception.getMessage().contains("User not found"));
  }

  @Test
  void testLogin_throwsWhenPasswordInvalid() {
    User user = User.builder()
        .id(UUID.randomUUID())
        .email("test@example.com")
        .passwordHash(PasswordUtil.hashPassword("correct-password"))
        .role(Role.USER)
        .build();

    LoginRequestDto request = LoginRequestDto.builder()
        .email("test@example.com")
        .password("wrong-password")
        .build();

    when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(user));

    Exception exception = assertThrows(RuntimeException.class, () -> {
      authService.login(request);
    });

    assertTrue(exception.getMessage().contains("Invalid password"));
  }
}
