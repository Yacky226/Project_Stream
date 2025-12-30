package com.fstm.ma.ilisi.appstreaming.service.impl;

import com.fstm.ma.ilisi.appstreaming.service.FileStorageService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

/**
 * Implémentation locale du stockage de fichiers
 * Utilisée par défaut ou quand storage.type=local
 */
@Service
@ConditionalOnProperty(name = "storage.type", havingValue = "local", matchIfMissing = true)
public class LocalFileStorageService implements FileStorageService {

    @Value("${storage.local.base-path:src/main/resources/static/Uploads}")
    private String basePath;

    @Value("${server.servlet.context-path:}")
    private String contextPath;

    @Value("${server.port:8080}")
    private String serverPort;

    @Override
    public String saveFile(MultipartFile file, String subdirectory) throws IOException {
        if (file.isEmpty()) {
            throw new IOException("Impossible de sauvegarder un fichier vide");
        }

        // Créer le répertoire si nécessaire
        Path uploadPath = Paths.get(basePath, subdirectory);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        // Générer un nom de fichier unique
        String originalFilename = file.getOriginalFilename();
        String extension = originalFilename != null && originalFilename.contains(".") 
            ? originalFilename.substring(originalFilename.lastIndexOf("."))
            : "";
        String filename = UUID.randomUUID().toString() + extension;

        // Sauvegarder le fichier
        Path filePath = uploadPath.resolve(filename);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        // Retourner l'URL publique
        return String.format("http://localhost:%s%s/Uploads/%s/%s", 
            serverPort, contextPath, subdirectory, filename);
    }

    @Override
    public void deleteFile(String fileUrl) throws IOException {
        // Extraire le chemin du fichier depuis l'URL
        String[] parts = fileUrl.split("/Uploads/");
        if (parts.length < 2) {
            throw new IOException("URL de fichier invalide: " + fileUrl);
        }

        Path filePath = Paths.get(basePath, parts[1]);
        Files.deleteIfExists(filePath);
    }

    @Override
    public boolean fileExists(String fileUrl) {
        try {
            String[] parts = fileUrl.split("/Uploads/");
            if (parts.length < 2) {
                return false;
            }
            Path filePath = Paths.get(basePath, parts[1]);
            return Files.exists(filePath);
        } catch (Exception e) {
            return false;
        }
    }

    @Override
    public String getStorageType() {
        return "LOCAL";
    }
}
