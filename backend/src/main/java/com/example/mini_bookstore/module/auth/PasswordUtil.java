package com.example.mini_bookstore.module.auth;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

public class PasswordUtil {
    
    private static final PasswordEncoder encoder = new BCryptPasswordEncoder();
    
    public static String hashPassword(String password) {
        return encoder.encode(password);
    }
    
    public static boolean checkPassword(String password, String hashed) {
        return encoder.matches(password, hashed);
    }
}
