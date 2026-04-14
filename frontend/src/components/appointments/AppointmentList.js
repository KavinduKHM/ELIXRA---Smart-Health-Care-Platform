import React, { useState, useEffect } from "react";
import {
  getPatientAppointments,
  cancelAppointment,
  rescheduleAppointment,
} from "../../services/api";

const AppointmentList = ({ patientId = 1 }) => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [newDateTime, setNewDateTime] = useState("");
  const [rescheduleReason, setRescheduleReason] = useState("");

  const toDateTimeLocalValue = (value) => {
    if (!value) {
      return "";
    }

    const date = new Date(value);
    const pad = (input) => String(input).padStart(2, "0");

    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
      date.getDate(),
    )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  };

  const loadAppointments = async () => {
    setLoading(true);
    setError("");
    try {
      const result = await getPatientAppointments(patientId);
      setAppointments(Array.isArray(result) ? result : result?.content || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, [patientId]);

  const handleCancel = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this appointment?"))
      return;

    setLoading(true);
    try {
      await cancelAppointment(id, "Cancelled by patient");
      setSuccess("Appointment cancelled successfully");
      loadAppointments();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReschedule = async (appointment) => {
    setSelectedAppointment(appointment);
    setNewDateTime(toDateTimeLocalValue(appointment.appointmentTime));
    setShowRescheduleModal(true);
  };

  const submitReschedule = async () => {
    if (!newDateTime) {
      setError("Please select a new date and time");
      return;
    }

    setLoading(true);
    try {
      await rescheduleAppointment(
        selectedAppointment.id,
        newDateTime,
        rescheduleReason,
      );
      setSuccess("Appointment rescheduled successfully");
      setShowRescheduleModal(false);
      setSelectedAppointment(null);
      setNewDateTime("");
      setRescheduleReason("");
      loadAppointments();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "PENDING":
        return "status-pending";
      case "CONFIRMED":
        return "status-confirmed";
      case "CANCELLED":
        return "status-cancelled";
      case "COMPLETED":
        return "status-completed";
      default:
        return "";
    }
  };

  return (
    <div className="card">
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "12px",
        }}
      >
        <h2 className="card-title" style={{ marginBottom: 0 }}>
          My Appointments
        </h2>
        <button className="btn btn-primary" onClick={loadAppointments}>
          Refresh
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {loading && <div className="loading">Loading...</div>}

      {!loading && appointments.length === 0 && (
        <div className="alert alert-info">
          No appointments found. Search for doctors to book an appointment.
        </div>
      )}

      {appointments.map((appointment) => (
        <div key={appointment.id} className="appointment-item">
          <div className="appointment-info">
            <h4>{appointment.doctorName}</h4>
            <p>{appointment.doctorSpecialty}</p>
            <p>
              <strong>Date & Time:</strong>{" "}
              {new Date(appointment.appointmentTime).toLocaleString()}
            </p>
            <p>
              <strong>Status:</strong>{" "}
              <span className={getStatusClass(appointment.status)}>
                {appointment.status}
              </span>
            </p>
            {appointment.symptoms && (
              <p>
                <strong>Symptoms:</strong> {appointment.symptoms}
              </p>
            )}
            {appointment.consultationLink && (
              <p>
                <strong>Video Link:</strong>{" "}
                <a
                  href={appointment.consultationLink}
                  target="_blank"
                  rel="noreferrer"
                >
                  Join Consultation
                </a>
              </p>
            )}
          </div>
          <div className="appointment-actions">
            {(appointment.status === "PENDING" ||
              appointment.status === "CONFIRMED") && (
              <>
                <button
                  className="btn btn-warning"
                  style={{ marginRight: "10px" }}
                  onClick={() => handleReschedule(appointment)}
                >
                  Reschedule
                </button>
                <button
                  className="btn btn-danger"
                  onClick={() => handleCancel(appointment.id)}
                >
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>
      ))}

      {/* Reschedule Modal */}
      {showRescheduleModal && selectedAppointment && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <div className="card" style={{ width: "400px", maxWidth: "90%" }}>
            <h3>Reschedule Appointment</h3>
            <p>
              <strong>Doctor:</strong> {selectedAppointment.doctorName}
            </p>
            <p>
              <strong>Current Time:</strong>{" "}
              {new Date(selectedAppointment.appointmentTime).toLocaleString()}
            </p>

            <div className="form-group">
              <label>New Date & Time:</label>
              <input
                type="datetime-local"
                className="form-control"
                value={newDateTime}
                onChange={(e) => setNewDateTime(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Reason for rescheduling (Optional):</label>
              <textarea
                className="form-control"
                rows="2"
                value={rescheduleReason}
                onChange={(e) => setRescheduleReason(e.target.value)}
              />
            </div>

            <div
              style={{
                display: "flex",
                gap: "10px",
                justifyContent: "flex-end",
                marginTop: "20px",
              }}
            >
              <button
                className="btn"
                onClick={() => setShowRescheduleModal(false)}
              >
                Cancel
              </button>
              <button className="btn btn-primary" onClick={submitReschedule}>
                Confirm Reschedule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentList;