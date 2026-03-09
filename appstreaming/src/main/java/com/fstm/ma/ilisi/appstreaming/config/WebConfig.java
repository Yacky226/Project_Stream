package com.fstm.ma.ilisi.appstreaming.config;

import java.nio.file.Paths;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        String uploadPath = Paths.get("src/main/resources/static/Uploads/photos").toAbsolutePath().toString();
        
        registry.addResourceHandler("/api/Uploads/photos/**")
                .addResourceLocations("file:" + uploadPath + "/");
    }
}