package com.example.mini_store;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/")
public class MiniStoreController {

  @GetMapping("/")
  public String getMessage() {
    return "Hello from Spring Boot on port zzzzzzz!";
  }
}