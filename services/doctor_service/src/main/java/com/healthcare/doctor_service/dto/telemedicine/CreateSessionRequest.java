package com.healthcare.doctor_service.dto.telemedicine;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class CreateSessionRequest {
    private Long appointmentId;
    private Long patientId;
    private Long doctorId;
    private LocalDateTime scheduledStartTime;
}


