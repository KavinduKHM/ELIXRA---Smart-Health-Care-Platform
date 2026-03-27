package com.healthcare.patient_service.dto;

public class PatientStatsDTO {
    
    private long totalPatients;
    private long activePatients;
    private long inactivePatients;
    private long patientsRegisteredThisMonth;
    private long patientsRegisteredToday;
    private long totalDocuments;
    private long totalPrescriptions;
    
    // Gender distribution
    private long maleCount;
    private long femaleCount;
    private long otherCount;
    
    // Blood group distribution
    private long bloodGroupAPositive;
    private long bloodGroupANegative;
    private long bloodGroupBPositive;
    private long bloodGroupBNegative;
    private long bloodGroupOPositive;
    private long bloodGroupONegative;
    private long bloodGroupABPositive;
    private long bloodGroupABNegative;
    
    public PatientStatsDTO() {}
    
    // Builder
    public static PatientStatsDTOBuilder builder() {
        return new PatientStatsDTOBuilder();
    }
    
    // Getters
    public long getTotalPatients() { return totalPatients; }
    public long getActivePatients() { return activePatients; }
    public long getInactivePatients() { return inactivePatients; }
    public long getPatientsRegisteredThisMonth() { return patientsRegisteredThisMonth; }
    public long getPatientsRegisteredToday() { return patientsRegisteredToday; }
    public long getTotalDocuments() { return totalDocuments; }
    public long getTotalPrescriptions() { return totalPrescriptions; }
    public long getMaleCount() { return maleCount; }
    public long getFemaleCount() { return femaleCount; }
    public long getOtherCount() { return otherCount; }
    public long getBloodGroupAPositive() { return bloodGroupAPositive; }
    public long getBloodGroupANegative() { return bloodGroupANegative; }
    public long getBloodGroupBPositive() { return bloodGroupBPositive; }
    public long getBloodGroupBNegative() { return bloodGroupBNegative; }
    public long getBloodGroupOPositive() { return bloodGroupOPositive; }
    public long getBloodGroupONegative() { return bloodGroupONegative; }
    public long getBloodGroupABPositive() { return bloodGroupABPositive; }
    public long getBloodGroupABNegative() { return bloodGroupABNegative; }
    
    // Setters
    public void setTotalPatients(long totalPatients) { this.totalPatients = totalPatients; }
    public void setActivePatients(long activePatients) { this.activePatients = activePatients; }
    public void setInactivePatients(long inactivePatients) { this.inactivePatients = inactivePatients; }
    public void setPatientsRegisteredThisMonth(long patientsRegisteredThisMonth) { this.patientsRegisteredThisMonth = patientsRegisteredThisMonth; }
    public void setPatientsRegisteredToday(long patientsRegisteredToday) { this.patientsRegisteredToday = patientsRegisteredToday; }
    public void setTotalDocuments(long totalDocuments) { this.totalDocuments = totalDocuments; }
    public void setTotalPrescriptions(long totalPrescriptions) { this.totalPrescriptions = totalPrescriptions; }
    public void setMaleCount(long maleCount) { this.maleCount = maleCount; }
    public void setFemaleCount(long femaleCount) { this.femaleCount = femaleCount; }
    public void setOtherCount(long otherCount) { this.otherCount = otherCount; }
    public void setBloodGroupAPositive(long bloodGroupAPositive) { this.bloodGroupAPositive = bloodGroupAPositive; }
    public void setBloodGroupANegative(long bloodGroupANegative) { this.bloodGroupANegative = bloodGroupANegative; }
    public void setBloodGroupBPositive(long bloodGroupBPositive) { this.bloodGroupBPositive = bloodGroupBPositive; }
    public void setBloodGroupBNegative(long bloodGroupBNegative) { this.bloodGroupBNegative = bloodGroupBNegative; }
    public void setBloodGroupOPositive(long bloodGroupOPositive) { this.bloodGroupOPositive = bloodGroupOPositive; }
    public void setBloodGroupONegative(long bloodGroupONegative) { this.bloodGroupONegative = bloodGroupONegative; }
    public void setBloodGroupABPositive(long bloodGroupABPositive) { this.bloodGroupABPositive = bloodGroupABPositive; }
    public void setBloodGroupABNegative(long bloodGroupABNegative) { this.bloodGroupABNegative = bloodGroupABNegative; }
    
    // Builder Class
    public static class PatientStatsDTOBuilder {
        private PatientStatsDTO dto = new PatientStatsDTO();
        
        public PatientStatsDTOBuilder totalPatients(long totalPatients) { dto.totalPatients = totalPatients; return this; }
        public PatientStatsDTOBuilder activePatients(long activePatients) { dto.activePatients = activePatients; return this; }
        public PatientStatsDTOBuilder inactivePatients(long inactivePatients) { dto.inactivePatients = inactivePatients; return this; }
        public PatientStatsDTOBuilder patientsRegisteredThisMonth(long patientsRegisteredThisMonth) { dto.patientsRegisteredThisMonth = patientsRegisteredThisMonth; return this; }
        public PatientStatsDTOBuilder patientsRegisteredToday(long patientsRegisteredToday) { dto.patientsRegisteredToday = patientsRegisteredToday; return this; }
        public PatientStatsDTOBuilder totalDocuments(long totalDocuments) { dto.totalDocuments = totalDocuments; return this; }
        public PatientStatsDTOBuilder totalPrescriptions(long totalPrescriptions) { dto.totalPrescriptions = totalPrescriptions; return this; }
        public PatientStatsDTOBuilder maleCount(long maleCount) { dto.maleCount = maleCount; return this; }
        public PatientStatsDTOBuilder femaleCount(long femaleCount) { dto.femaleCount = femaleCount; return this; }
        public PatientStatsDTOBuilder otherCount(long otherCount) { dto.otherCount = otherCount; return this; }
        public PatientStatsDTOBuilder bloodGroupAPositive(long count) { dto.bloodGroupAPositive = count; return this; }
        public PatientStatsDTOBuilder bloodGroupANegative(long count) { dto.bloodGroupANegative = count; return this; }
        public PatientStatsDTOBuilder bloodGroupBPositive(long count) { dto.bloodGroupBPositive = count; return this; }
        public PatientStatsDTOBuilder bloodGroupBNegative(long count) { dto.bloodGroupBNegative = count; return this; }
        public PatientStatsDTOBuilder bloodGroupOPositive(long count) { dto.bloodGroupOPositive = count; return this; }
        public PatientStatsDTOBuilder bloodGroupONegative(long count) { dto.bloodGroupONegative = count; return this; }
        public PatientStatsDTOBuilder bloodGroupABPositive(long count) { dto.bloodGroupABPositive = count; return this; }
        public PatientStatsDTOBuilder bloodGroupABNegative(long count) { dto.bloodGroupABNegative = count; return this; }
        
        public PatientStatsDTO build() { return dto; }
    }
}