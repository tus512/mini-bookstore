package com.example.mini_bookstore.module.upload;

import com.example.mini_bookstore.common.RequestGuard;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

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

        try {
            if (!Files.exists(root)) {
                Files.createDirectories(root);
            }

            String originalFilename = file.getOriginalFilename();
            String extension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            
            String newFilename = UUID.randomUUID().toString() + extension;
            Files.copy(file.getInputStream(), this.root.resolve(newFilename));

            String fileUrl = "http://localhost:3010/uploads/" + newFilename;
            return ResponseEntity.ok(Collections.singletonMap("url", fileUrl));
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body(
                Collections.singletonMap("error", "Could not upload file: " + e.getMessage())
            );
        }
    }
}
