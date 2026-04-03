package com.healthcare.doctor_service.controller;

import com.healthcare.doctor_service.client.TelemedicineClient;
import com.healthcare.doctor_service.dto.telemedicine.*;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = DoctorVideoSessionController.class)
class DoctorVideoSessionControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private TelemedicineClient telemedicineClient;

    @Test
    void join_returns200() throws Exception {
        JoinSessionResponse resp = new JoinSessionResponse();
        resp.setSessionId(1L);
        resp.setChannelName("appointment_1");
        resp.setToken("token");
        resp.setAppId("appId");
        resp.setUserId(200L);
        resp.setUserRole("DOCTOR");
        resp.setAppointmentId(1L);
        resp.setSessionActive(true);

        when(telemedicineClient.joinSession(any())).thenReturn(resp);

        mockMvc.perform(post("/api/doctors/video/sessions/join")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"sessionId\":1,\"doctorId\":200}"))
                .andExpect(status().isOk());
    }
}

