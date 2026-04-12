package com.healthcare.telemedicine.scheduler;

import com.healthcare.telemedicine.service.TelemedicineService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * Scheduled tasks for managing video sessions.
 *
 * Runs periodic jobs to:
 * - Check for missed sessions (scheduled but never started)
 * - Clean up old session data (optional)
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class SessionScheduler {

    private final TelemedicineService telemedicineService;

    /**
     * Runs every 5 minutes to check for missed sessions.
     * Marks sessions that were scheduled to start but never did as MISSED.
     */
    @Scheduled(fixedDelay = 300000)  // 5 minutes in milliseconds
    public void checkMissedSessions() {
        log.debug("Running missed sessions check...");

        try {
            telemedicineService.processMissedSessions();
        } catch (Exception e) {
            log.error("Error checking missed sessions: {}", e.getMessage(), e);
        }
    }

    /**
     * Runs every hour to log active session count.
     * Useful for monitoring.
     */
    @Scheduled(cron = "0 0 * * * *")  // Every hour
    public void logActiveSessions() {
        // This could be expanded to send metrics to monitoring system
        log.info("Active sessions check completed");
    }
}