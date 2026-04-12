package com.healthcare.patient_service.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
public class CloudinaryService {
    
    private final Cloudinary cloudinary;
    
    public CloudinaryService(Cloudinary cloudinary) {
        this.cloudinary = cloudinary;
    }
    
    /**
     * Upload file to Cloudinary
     */
    public Map<String, String> uploadFile(MultipartFile file, Long patientId, String documentType) throws IOException {
        
        System.out.println("Uploading to Cloudinary - Patient: " + patientId + ", Type: " + documentType);
        
        // Generate unique public ID
        String publicId = String.format("patients/%d/documents/%s_%s",
            patientId,
            documentType.toLowerCase(),
            UUID.randomUUID().toString()
        );
        
        // Upload options
        Map<String, Object> uploadOptions = ObjectUtils.asMap(
            "public_id", publicId,
            "folder", "healthcare/patients/" + patientId + "/documents",
            "resource_type", "auto",
            "type", "upload"
        );
        
        // Upload file
        Map<?, ?> uploadResult = cloudinary.uploader().upload(file.getBytes(), uploadOptions);
        
        // Extract results
        Map<String, String> result = new HashMap<>();
        result.put("publicId", (String) uploadResult.get("public_id"));
        result.put("url", (String) uploadResult.get("secure_url"));
        result.put("format", (String) uploadResult.get("format"));
        result.put("bytes", String.valueOf(uploadResult.get("bytes")));
        
        System.out.println("Upload successful. URL: " + result.get("url"));
        
        return result;
    }
    
    /**
     * Upload profile picture to Cloudinary
     */
    public Map<String, String> uploadProfilePicture(MultipartFile file, Long patientId) throws IOException {
        
        System.out.println("Uploading profile picture for patient: " + patientId);
        
        // Generate unique public ID
        String publicId = String.format("patients/%d/profile/%s",
            patientId,
            UUID.randomUUID().toString()
        );
        
        // Upload options
        Map<String, Object> uploadOptions = ObjectUtils.asMap(
            "public_id", publicId,
            "folder", "healthcare/patients/" + patientId + "/profile",
            "resource_type", "image",
            "type", "upload"
        );
        
        // Upload file
        Map<?, ?> uploadResult = cloudinary.uploader().upload(file.getBytes(), uploadOptions);
        
        // Extract results
        Map<String, String> result = new HashMap<>();
        result.put("publicId", (String) uploadResult.get("public_id"));
        result.put("url", (String) uploadResult.get("secure_url"));
        result.put("format", (String) uploadResult.get("format"));
        result.put("bytes", String.valueOf(uploadResult.get("bytes")));
        
        System.out.println("Profile picture uploaded: " + result.get("url"));
        
        return result;
    }
    
    /**
     * Delete file from Cloudinary
     */
    public void deleteFile(String publicId) throws IOException {
        System.out.println("Deleting from Cloudinary: " + publicId);
        
        Map<?, ?> result = cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
        
        if ("ok".equals(result.get("result"))) {
            System.out.println("Deleted successfully: " + publicId);
        } else {
            System.out.println("Delete result: " + result.get("result"));
        }
    }
    
    /**
     * Get file URL
     */
    public String getFileUrl(String publicId) {
        return cloudinary.url().secure(true).generate(publicId);
    }
}