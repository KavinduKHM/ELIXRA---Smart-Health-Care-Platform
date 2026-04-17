// src/components/patient/PatientAppointments.js
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { getUpcomingAppointmentsForPatient } from '../../services/appointmentService';
import { getDoctorProfile } from '../../services/doctorService';
import { getSessionsByAppointment } from '../../services/telemedicineService';
import SockJS from 'sockjs-client';
import { Client as StompClient } from '@stomp/stompjs';

const wsUrl = 'http://localhost:8085/ws';

const PatientAppointments = ({ patientId }) => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [doctorNameById, setDoctorNameById] = useState({});
  const [sessionActiveByAppointmentId, setSessionActiveByAppointmentId] = useState({});
  const [sessionAlert, setSessionAlert] = useState(null);

  const stompRef = useRef(null);
  const subscriptionsRef = useRef(new Map());

  useEffect(() => {
    if (!patientId) return;

    let isMounted = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await getUpcomingAppointmentsForPatient(patientId);
        if (!isMounted) return;
        setAppointments(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error(err);
        if (!isMounted) return;
        setError('Failed to load appointments');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    load();
    return () => {
      isMounted = false;
    };
  }, [patientId]);

  // Resolve doctor display names for appointments that only contain IDs / placeholders.
  useEffect(() => {
    const list = Array.isArray(appointments) ? appointments : [];
    const doctorIds = Array.from(
      new Set(
        list
          .map((apt) => apt?.doctorId)
          .filter((id) => id !== null && id !== undefined)
          .map((id) => Number(id))
          .filter((id) => Number.isFinite(id))
      )
    );

    const missing = doctorIds.filter((id) => !doctorNameById[id]);
    if (missing.length === 0) return;

    let cancelled = false;
    (async () => {
      try {
        const results = await Promise.all(
          missing.map(async (id) => {
            try {
              const res = await getDoctorProfile(id);
              const data = res?.data;
              const name =
                (data?.fullName && String(data.fullName).trim()) ||
                [data?.firstName, data?.lastName].filter(Boolean).join(' ').trim() ||
                null;
              return [id, name];
            } catch {
              return [id, null];
            }
          })
        );

        if (cancelled) return;
        setDoctorNameById((prev) => {
          const next = { ...prev };
          for (const [id, name] of results) {
            if (name) next[id] = name;
          }
          return next;
        });
      } catch {
        // ignore
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [appointments, doctorNameById]);

  // Load telemedicine session status for confirmed appointments.
  useEffect(() => {
    const confirmedAppointments = (Array.isArray(appointments) ? appointments : []).filter(
      (apt) => String(apt?.status || '').toUpperCase() === 'CONFIRMED'
    );

    const apptIds = confirmedAppointments
      .map((apt) => Number(apt?.id))
      .filter((id) => Number.isFinite(id));

    if (apptIds.length === 0) return;

    let cancelled = false;
    (async () => {
      try {
        const results = await Promise.all(
          apptIds.map(async (appointmentId) => {
            try {
              const res = await getSessionsByAppointment(appointmentId);
              const sessions = Array.isArray(res?.data) ? res.data : [];
              const active = sessions.some((s) => String(s?.status || '').toUpperCase() === 'ACTIVE');
              const channelName = sessions?.[0]?.channelName;
              return { appointmentId, active, channelName };
            } catch {
              return { appointmentId, active: false, channelName: null };
            }
          })
        );

        if (cancelled) return;

        setSessionActiveByAppointmentId((prev) => {
          const next = { ...prev };
          for (const r of results) {
            next[r.appointmentId] = Boolean(r.active);
          }
          return next;
        });
      } catch {
        // ignore
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [appointments]);

  // Live updates: listen for "doctor started session" websocket events.
  useEffect(() => {
    const confirmedAppointments = (Array.isArray(appointments) ? appointments : []).filter(
      (apt) => String(apt?.status || '').toUpperCase() === 'CONFIRMED'
    );
    if (confirmedAppointments.length === 0) return;

    const client = new StompClient({
      webSocketFactory: () => new SockJS(wsUrl),
      reconnectDelay: 1500,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      onConnect: () => {
        // Subscribe once per channel
        confirmedAppointments.forEach((apt) => {
          const channelName = `appointment_${apt.id}`;
          const topic = `/topic/video.session.${channelName}`;
          if (subscriptionsRef.current.has(topic)) return;

          const sub = client.subscribe(topic, (frame) => {
            try {
              const payload = JSON.parse(frame.body);
              if (payload?.type !== 'SESSION_STARTED') return;

              setSessionActiveByAppointmentId((prev) => ({
                ...prev,
                [Number(apt.id)]: true,
              }));

              const dId = apt?.doctorId;
              const resolvedDoctor =
                (dId != null && doctorNameById?.[Number(dId)]) ||
                (apt?.doctorName && String(apt.doctorName).trim()) ||
                'Doctor';

              setSessionAlert({
                appointmentId: apt.id,
                message: `${resolvedDoctor} has joined the video session. You can join now.`,
              });
            } catch {
              // ignore
            }
          });

          subscriptionsRef.current.set(topic, sub);
        });
      },
    });

    stompRef.current = client;
    client.activate();

    return () => {
      try {
        subscriptionsRef.current.forEach((sub) => {
          try {
            sub?.unsubscribe?.();
          } catch {
            // ignore
          }
        });
        subscriptionsRef.current.clear();
      } catch {
        // ignore
      }

      try {
        client.deactivate();
      } catch {
        // ignore
      }
      stompRef.current = null;
    };
  }, [appointments, doctorNameById]);

  const { pending, confirmed, other } = useMemo(() => {
    const list = Array.isArray(appointments) ? appointments : [];

    const pendingList = [];
    const confirmedList = [];
    const otherList = [];

    for (const apt of list) {
      const status = String(apt.status).toUpperCase();
      if (status === 'CONFIRMED') {
        confirmedList.push(apt);
      } else if (status === 'PENDING' || status === 'PENDING_PAYMENT' || status === 'RESCHEDULED') {
        pendingList.push(apt);
      } else {
        otherList.push(apt);
      }
    }

    return {
      pending: pendingList,
      confirmed: confirmedList,
      other: otherList,
    };
  }, [appointments]);

  const joinVideo = (apt) => {
    const channelName = `appointment_${apt.id}`;
    const url = `/video-call/${encodeURIComponent(channelName)}/${encodeURIComponent(patientId)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const renderAppointmentCard = (apt, category) => {
    const doctorId = apt?.doctorId;
    const resolvedDoctorName =
      (doctorId != null && doctorNameById?.[Number(doctorId)]) ||
      (apt?.doctorName && String(apt.doctorName).trim()) ||
      (doctorId != null ? `Doctor ${doctorId}` : 'Doctor');

    const doctorName = resolvedDoctorName.replace(/^Dr\.?\s+/i, '');
    const specialty = apt.doctorSpecialty || apt.specialty || 'Specialist';
    const timeLabel = apt.appointmentTime ? new Date(apt.appointmentTime).toLocaleString() : '—';

    const apptId = Number(apt?.id);
    const sessionActive = Number.isFinite(apptId) ? Boolean(sessionActiveByAppointmentId?.[apptId]) : false;
    const joinDisabled = category === 'confirmed' ? !sessionActive : false;

    return (
      <article key={apt.id} className="apt-card">
        <div className="apt-avatar" aria-hidden="true">{doctorName.charAt(0).toUpperCase()}</div>
        <div className="apt-content">
          <h4>{`Dr. ${doctorName}`}</h4>
          <p className="apt-specialty">{specialty}</p>
          <p className="apt-time">{timeLabel}</p>
        </div>
        <div className="apt-actions">
          <span className={`apt-badge apt-badge-${category}`}>{String(apt.status || '').replace('_', ' ') || category}</span>
          {category === 'confirmed' ? (
            <button type="button" className="apt-join-btn" onClick={() => joinVideo(apt)} disabled={joinDisabled}>
              {joinDisabled ? 'Waiting for doctor' : 'Join Video Session'}
            </button>
          ) : null}
        </div>
      </article>
    );
  };

  return (
    <div className="appointments-board">
      <h2 className="appointments-board-title">Appointments Timeline</h2>

      {sessionAlert ? (
        <div className="apt-session-alert" role="alert">
          <strong>Video session update:</strong> {sessionAlert.message}
        </div>
      ) : null}

      {loading && <p className="appointments-empty">Loading appointments...</p>}
      {error && <p className="appointments-error">{error}</p>}

      {!loading && !error && appointments.length === 0 && (
        <p className="appointments-empty">No upcoming appointments.</p>
      )}

      {!loading && !error && appointments.length > 0 && pending.length === 0 && confirmed.length === 0 && (
        <p className="appointments-empty">No pending/confirmed upcoming appointments.</p>
      )}

      {pending.length > 0 && (
        <div className="appointments-group">
          <h3 className="appointments-group-title appointments-group-title-pending">Pending</h3>
          <div className="appointments-stack">
            {pending.map((apt) => renderAppointmentCard(apt, 'pending'))}
          </div>
        </div>
      )}

      {confirmed.length > 0 && (
        <div className="appointments-group">
          <h3 className="appointments-group-title appointments-group-title-confirmed">Confirmed</h3>
          <div className="appointments-stack">
            {confirmed.map((apt) => renderAppointmentCard(apt, 'confirmed'))}
          </div>
        </div>
      )}

      {other.length > 0 && (
        <div className="appointments-group">
          <h3 className="appointments-group-title appointments-group-title-other">Other</h3>
          <div className="appointments-stack">
            {other.map((apt) => renderAppointmentCard(apt, 'other'))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientAppointments;
