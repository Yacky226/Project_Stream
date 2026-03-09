package com.fstm.ma.ilisi.appstreaming.service;

import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

/**
 * Interface pour le service de stockage de fichiers
 * Permet de changer facilement d'implémentation (local, S3, MinIO, Cloudinary...)
 */
public interface FileStorageService {
    
    /**
     * Sauvegarder un fichier et retourner son URL publique
     * @param file Le fichier à sauvegarder
     * @param subdirectory Le sous-répertoire (ex: "photos", "documents")
     * @return L'URL publique du fichier
     * @throws IOException Si erreur lors de la sauvegarde
     */
    String saveFile(MultipartFile file, String subdirectory) throws IOException;
    
    /**
     * Supprimer un fichier
     * @param fileUrl L'URL ou le chemin du fichier à supprimer
     * @throws IOException Si erreur lors de la suppression
     */
    void deleteFile(String fileUrl) throws IOException;
    
    /**
     * Vérifier si un fichier existe
     * @param fileUrl L'URL ou le chemin du fichier
     * @return true si le fichier existe
     */
    boolean fileExists(String fileUrl);
    
    /**
     * Obtenir le type de stockage utilisé
     * @return Le type (LOCAL, S3, MINIO, CLOUDINARY)
     */
    String getStorageType();
}
