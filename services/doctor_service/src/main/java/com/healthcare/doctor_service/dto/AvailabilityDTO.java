package com.healthcare.doctor_service.dto;

import com.healthcare.doctor_service.model.Availability;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AvailabilityDTO {

    private Long id;
    private Long doctorId;
    private LocalDate availableDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private Integer slotDuration;
    private Availability.AvailabilityStatus status;

    /**
     * Convert Availability entity to DTO
     */
    public static AvailabilityDTO fromEntity(Availability availability) {
        if (availability == null) {
            return null;
        }

        return AvailabilityDTO.builder()
                .id(availability.getId())
                .doctorId(availability.getDoctor() != null ? availability.getDoctor().getId() : null)
                .availableDate(availability.getAvailableDate())
                .startTime(availability.getStartTime())
                .endTime(availability.getEndTime())
                .slotDuration(availability.getSlotDuration())
                .status(availability.getStatus())
                .build();
    }
}