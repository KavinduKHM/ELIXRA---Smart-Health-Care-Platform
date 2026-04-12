package com.healthcare.patient_service.model;

import jakarta.persistence.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "patients")
@EntityListeners(AuditingEntityListener.class)
public class Patient {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "user_id", unique = true, nullable = false)
    private Long userId;
    
    @Column(name = "first_name", nullable = false)
    private String firstName;
    
    @Column(name = "last_name", nullable = false)
    private String lastName;
    
    @Column(name = "middle_name")
    private String middleName;
    
    @Column(unique = true, nullable = false)
    private String email;
    
    @Column(name = "phone_number", unique = true)
    private String phoneNumber;
    
    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;
    
    private String gender;
    
    @Column(name = "blood_group")
    private String bloodGroup;
    
    @Column(name = "address_line1")
    private String addressLine1;
    
    @Column(name = "address_line2")
    private String addressLine2;
    
    private String city;
    private String state;
    
    @Column(name = "postal_code")
    private String postalCode;
    
    private String country;
    
    @Column(name = "emergency_contact_name")
    private String emergencyContactName;
    
    @Column(name = "emergency_contact_phone")
    private String emergencyContactPhone;
    
    @Column(name = "emergency_contact_relation")
    private String emergencyContactRelation;
    
    @Column(length = 1000)
    private String allergies;
    
    @Column(name = "chronic_conditions", length = 1000)
    private String chronicConditions;
    
    @Column(name = "current_medications", length = 1000)
    private String currentMedications;
    
    private boolean active = true;
    
    @Column(name = "profile_picture_url")
    private String profilePictureUrl;
    
    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @OneToMany(mappedBy = "patient", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<MedicalDocument> documents = new ArrayList<>();
    
    @OneToMany(mappedBy = "patient", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Prescription> prescriptions = new ArrayList<>();
    
    @OneToMany(mappedBy = "patient", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<MedicalHistory> medicalHistories = new ArrayList<>();
    
    public Patient() {}
    
    public static PatientBuilder builder() {
        return new PatientBuilder();
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
    
    public List<MedicalDocument> getDocuments() { return documents; }
    public void setDocuments(List<MedicalDocument> documents) { this.documents = documents; }
    
    public List<Prescription> getPrescriptions() { return prescriptions; }
    public void setPrescriptions(List<Prescription> prescriptions) { this.prescriptions = prescriptions; }
    
    public List<MedicalHistory> getMedicalHistories() { return medicalHistories; }
    public void setMedicalHistories(List<MedicalHistory> medicalHistories) { this.medicalHistories = medicalHistories; }
    
    public String getFullName() {
        return firstName + " " + (middleName != null ? middleName + " " : "") + lastName;
    }
    
    // Builder Pattern
    public static class PatientBuilder {
        private Patient patient = new Patient();
        
        public PatientBuilder id(Long id) { patient.id = id; return this; }
        public PatientBuilder userId(Long userId) { patient.userId = userId; return this; }
        public PatientBuilder firstName(String firstName) { patient.firstName = firstName; return this; }
        public PatientBuilder lastName(String lastName) { patient.lastName = lastName; return this; }
        public PatientBuilder middleName(String middleName) { patient.middleName = middleName; return this; }
        public PatientBuilder email(String email) { patient.email = email; return this; }
        public PatientBuilder phoneNumber(String phoneNumber) { patient.phoneNumber = phoneNumber; return this; }
        public PatientBuilder dateOfBirth(LocalDate dateOfBirth) { patient.dateOfBirth = dateOfBirth; return this; }
        public PatientBuilder gender(String gender) { patient.gender = gender; return this; }
        public PatientBuilder bloodGroup(String bloodGroup) { patient.bloodGroup = bloodGroup; return this; }
        public PatientBuilder addressLine1(String addressLine1) { patient.addressLine1 = addressLine1; return this; }
        public PatientBuilder addressLine2(String addressLine2) { patient.addressLine2 = addressLine2; return this; }
        public PatientBuilder city(String city) { patient.city = city; return this; }
        public PatientBuilder state(String state) { patient.state = state; return this; }
        public PatientBuilder postalCode(String postalCode) { patient.postalCode = postalCode; return this; }
        public PatientBuilder country(String country) { patient.country = country; return this; }
        public PatientBuilder emergencyContactName(String name) { patient.emergencyContactName = name; return this; }
        public PatientBuilder emergencyContactPhone(String phone) { patient.emergencyContactPhone = phone; return this; }
        public PatientBuilder emergencyContactRelation(String relation) { patient.emergencyContactRelation = relation; return this; }
        public PatientBuilder allergies(String allergies) { patient.allergies = allergies; return this; }
        public PatientBuilder chronicConditions(String conditions) { patient.chronicConditions = conditions; return this; }
        public PatientBuilder currentMedications(String medications) { patient.currentMedications = medications; return this; }
        public PatientBuilder active(boolean active) { patient.active = active; return this; }
        public PatientBuilder profilePictureUrl(String url) { patient.profilePictureUrl = url; return this; }
        public PatientBuilder createdAt(LocalDateTime createdAt) { patient.createdAt = createdAt; return this; }
        public PatientBuilder updatedAt(LocalDateTime updatedAt) { patient.updatedAt = updatedAt; return this; }
        
        public Patient build() { return patient; }
    }
}