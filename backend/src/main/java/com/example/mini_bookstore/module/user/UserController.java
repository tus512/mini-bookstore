package com.example.mini_bookstore.module.user;

import com.example.mini_bookstore.module.user.dto.UserResponseDto;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletRequest;
import java.util.UUID;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {
  private final UserService userService;
  private final UserRepository userRepository;
  
  @GetMapping("/me")
  public ResponseEntity<UserResponseDto> getMe(HttpServletRequest request) {
    UUID userId = (UUID) request.getAttribute("userId");
    if (userId == null) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }

    User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));

    UserResponseDto responseDto = UserResponseDto.builder()
            .id(user.getId())
            .email(user.getEmail())
            .fullName(user.getFullName())
            .phone(user.getPhone())
            .role(user.getRole())
            .createdAt(user.getCreatedAt())
            .updatedAt(user.getUpdatedAt())
            .build();

    return ResponseEntity.ok(responseDto);
  }

}
