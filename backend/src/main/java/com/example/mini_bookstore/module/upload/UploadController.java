package com.example.mini_bookstore.module.upload;

import com.example.mini_bookstore.common.RequestGuard;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import javax.servlet.http.HttpServletRequest;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Collections;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/upload")
public class UploadController {

    private final Path root = Paths.get("./uploads");

    @PostMapping
    public ResponseEntity<Map<String, String>> uploadFile(
            @RequestParam("file") MultipartFile file,
            HttpServletRequest request) {
        // Enforce admin permission for image uploads
        RequestGuard.requireAdmin(request);

        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("error", "File is empty"));
        }

        String originalFilename = file.getOriginalFilename();
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }

        String contentType = file.getContentType();
        if (contentType == null || !(contentType.equals("image/jpeg") || contentType.equals("image/png")
                || contentType.equals("image/gif") || contentType.equals("image/webp"))) {
            return ResponseEntity.badRequest().body(
                    Collections.singletonMap("error",
                            "Invalid file type. Only JPG, PNG, GIF, and WEBP images are allowed"));
        }

        String extLower = extension.toLowerCase();
        if (!(extLower.equals(".jpg") || extLower.equals(".jpeg") || extLower.equals(".png") || extLower.equals(".gif")
                || extLower.equals(".webp"))) {
            return ResponseEntity.badRequest().body(
                    Collections.singletonMap("error",
                            "Invalid file extension. Only JPG, PNG, GIF, and WEBP are allowed"));
        }

        try {
            if (!Files.exists(root)) {
                Files.createDirectories(root);
            }

            String newFilename = UUID.randomUUID().toString() + extension;
            Files.copy(file.getInputStream(), this.root.resolve(newFilename));

            // S5: Replace hardcoded localhost:3010 URL with dynamic base URL
            String baseUrl = ServletUriComponentsBuilder.fromRequestUri(request)
                    .replacePath(null)
                    .build()
                    .toUriString();

            String fileUrl = baseUrl + "/uploads/" + newFilename;
            return ResponseEntity.ok(Collections.singletonMap("url", fileUrl));
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body(
                    Collections.singletonMap("error", "Could not upload file: " + e.getMessage()));
        }
    }
}
