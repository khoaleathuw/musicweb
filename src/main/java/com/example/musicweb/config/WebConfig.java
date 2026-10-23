package com.example.musicweb.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {

        Path uploadPath = Paths
                .get(uploadDir)
                .toAbsolutePath()
                .normalize();

        try {
            Files.createDirectories(uploadPath);
            Files.createDirectories(uploadPath.resolve("music"));
            Files.createDirectories(uploadPath.resolve("covers"));
        } catch (Exception e) {
            throw new RuntimeException(
                    "Không thể tạo thư mục upload: " + uploadPath,
                    e
            );
        }

        String uploadLocation = uploadPath.toUri().toString();

        if (!uploadLocation.endsWith("/")) {
            uploadLocation += "/";
        }

        System.out.println("======================================");
        System.out.println("UPLOAD DIRECTORY:");
        System.out.println(uploadPath);
        System.out.println("UPLOAD URL:");
        System.out.println(uploadLocation);
        System.out.println("======================================");

        registry
                .addResourceHandler("/uploads/**")
                .addResourceLocations(uploadLocation);
    }
}