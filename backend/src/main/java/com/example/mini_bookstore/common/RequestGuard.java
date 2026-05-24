package com.example.mini_bookstore.common;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import javax.servlet.http.HttpServletRequest;

/**
 * Utility class to enforce authorization rules on incoming requests.
 * The JwtFilter populates request attributes (userId, email, role) from the
 * JWT.
 */
public class RequestGuard {

    /**
     * Throws 401 Unauthorized if the request has no authenticated user (no valid
     * JWT).
     */
    public static void requireAuthenticated(HttpServletRequest request) {
        Object userId = request.getAttribute("userId");
        if (userId == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication required");
        }
    }

    /**
     * Throws 403 Forbidden if the authenticated user's role is not ADMIN.
     * Also throws 401 if there is no authenticated user at all.
     */
    public static void requireAdmin(HttpServletRequest request) {
        requireAuthenticated(request);
        String role = (String) request.getAttribute("role");
        if (!"ADMIN".equals(role)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Admin access required");
        }
    }
}
