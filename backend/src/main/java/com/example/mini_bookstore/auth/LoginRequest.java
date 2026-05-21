package com.example.mini_bookstore.auth;

import com.example.mini_bookstore.user.*;
import com.example.mini_bookstore.common.security.*;
import com.example.mini_bookstore.common.dto.*;

import javax.validation.constraints.NotBlank;

public class LoginRequest {
    @NotBlank
    private String username;

    @NotBlank
    private String password;

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}

