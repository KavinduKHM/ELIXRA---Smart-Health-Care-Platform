package com.healthcare.patient_service.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.LocalDate;
import java.time.LocalDateTime;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class PatientDTO {
    
    private Long id;
    private Long userId;
    private String firstName;
    private String lastName;
    private String middleName;
    private String fullName;
    private String email;
    private String phoneNumber;
    private LocalDate dateOfBirth;
    private String gender;
    private String bloodGroup;
    private String addressLine1;
    private String addressLine2;
    private String city;
    private String state;
    private String postalCode;
    private String country;
    private String emergencyContactName;
    private String emergencyContactPhone;
    private String emergencyContactRelation;
    private String allergies;
    private String chronicConditions;
    private String currentMedications;
    private boolean active;
    private String profilePictureUrl;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Constructor
    public PatientDTO() {}
    
    public static PatientDTOBuilder builder() {
        return new PatientDTOBuilder();
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    
    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }
    
    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }
    
    public String getMiddleName() { return middleName; }
    public void setMiddleName(String middleName) { this.middleName = middleName; }
    
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    
    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }
    
    public LocalDate getDateOfBirth() { return dateOfBirth; }
    public void setDateOfBirth(LocalDate dateOfBirth) { this.dateOfBirth = dateOfBirth; }
    
    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }
    
    public String getBloodGroup() { return bloodGroup; }
    public void setBloodGroup(String bloodGroup) { this.bloodGroup = bloodGroup; }
    
    public String getAddressLine1() { return addressLine1; }
    public void setAddressLine1(String addressLine1) { this.addressLine1 = addressLine1; }
    
    public String getAddressLine2() { return addressLine2; }
    public void setAddressLine2(String addressLine2) { this.addressLine2 = addressLine2; }
    
    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }
    
    public String getState() { return state; }
    public void setState(String state) { this.state = state; }
    
    public String getPostalCode() { return postalCode; }
    public void setPostalCode(String postalCode) { this.postalCode = postalCode; }
    
    public String getCountry() { return country; }
    public void setCountry(String country) { this.country = country; }
    
    public String getEmergencyContactName() { return emergencyContactName; }
    public void setEmergencyContactName(String emergencyContactName) { this.emergencyContactName = emergencyContactName; }
    
    public String getEmergencyContactPhone() { return emergencyContactPhone; }
    public void setEmergencyContactPhone(String emergencyContactPhone) { this.emergencyContactPhone = emergencyContactPhone; }
    
    public String getEmergencyContactRelation() { return emergencyContactRelation; }
    public void setEmergencyContactRelation(String emergencyContactRelation) { this.emergencyContactRelation = emergencyContactRelation; }
    
    public String getAllergies() { return allergies; }
    public void setAllergies(String allergies) { this.allergies = allergies; }
    
    public String getChronicConditions() { return chronicConditions; }
    public void setChronicConditions(String chronicConditions) { this.chronicConditions = chronicConditions; }
    
    public String getCurrentMedications() { return currentMedications; }
    public void setCurrentMedications(String currentMedications) { this.currentMedications = currentMedications; }
    
    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
    
    public String getProfilePictureUrl() { return profilePictureUrl; }
    public void setProfilePictureUrl(String profilePictureUrl) { this.profilePictureUrl = profilePictureUrl; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    
    // Builder Pattern
    public static class PatientDTOBuilder {
        private PatientDTO dto = new PatientDTO();
        
        public PatientDTOBuilder id(Long id) { dto.id = id; return this; }
        public PatientDTOBuilder userId(Long userId) { dto.userId = userId; return this; }
        public PatientDTOBuilder firstName(String firstName) { dto.firstName = firstName; return this; }
        public PatientDTOBuilder lastName(String lastName) { dto.lastName = lastName; return this; }
        public PatientDTOBuilder middleName(String middleName) { dto.middleName = middleName; return this; }
        public PatientDTOBuilder fullName(String fullName) { dto.fullName = fullName; return this; }
        public PatientDTOBuilder email(String email) { dto.email = email; return this; }
        public PatientDTOBuilder phoneNumber(String phoneNumber) { dto.phoneNumber = phoneNumber; return this; }
        public PatientDTOBuilder dateOfBirth(LocalDate dateOfBirth) { dto.dateOfBirth = dateOfBirth; return this; }
        public PatientDTOBuilder gender(String gender) { dto.gender = gender; return this; }
        public PatientDTOBuilder bloodGroup(String bloodGroup) { dto.bloodGroup = bloodGroup; return this; }
        public PatientDTOBuilder addressLine1(String addressLine1) { dto.addressLine1 = addressLine1; return this; }
        public PatientDTOBuilder addressLine2(String addressLine2) { dto.addressLine2 = addressLine2; return this; }
        public PatientDTOBuilder city(String city) { dto.city = city; return this; }
        public PatientDTOBuilder state(String state) { dto.state = state; return this; }
        public PatientDTOBuilder postalCode(String postalCode) { dto.postalCode = postalCode; return this; }
        public PatientDTOBuilder country(String country) { dto.country = country; return this; }
        public PatientDTOBuilder emergencyContactName(String name) { dto.emergencyContactName = name; return this; }
        public PatientDTOBuilder emergencyContactPhone(String phone) { dto.emergencyContactPhone = phone; return this; }
        public PatientDTOBuilder emergencyContactRelation(String relation) { dto.emergencyContactRelation = relation; return this; }
        public PatientDTOBuilder allergies(String allergies) { dto.allergies = allergies; return this; }
        public PatientDTOBuilder chronicConditions(String conditions) { dto.chronicConditions = conditions; return this; }
        public PatientDTOBuilder currentMedications(String medications) { dto.currentMedications = medications; return this; }
        public PatientDTOBuilder active(boolean active) { dto.active = active; return this; }
        public PatientDTOBuilder profilePictureUrl(String url) { dto.profilePictureUrl = url; return this; }
        public PatientDTOBuilder createdAt(LocalDateTime createdAt) { dto.createdAt = createdAt; return this; }
        public PatientDTOBuilder updatedAt(LocalDateTime updatedAt) { dto.updatedAt = updatedAt; return this; }
        
        public PatientDTO build() { return dto; }
    }
}