import React, { useState } from "react";
import {
  searchDoctors,
  getAvailableSlots,
  bookAppointment,
} from "../../services/api";

const SearchDoctors = ({ patientId = 1 }) => {
  const [specialty, setSpecialty] = useState("");
  const [doctorName, setDoctorName] = useState("");
  const [searchDate, setSearchDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [symptoms, setSymptoms] = useState("");
  const [showBookingModal, setShowBookingModal] = useState(false);

  const normalizeDoctor = (doctor) => ({
    ...doctor,
    availableSlots: doctor.availableSlots ?? doctor.slots,
  });

  const loadDoctors = async (override = {}) => {
    const nextSpecialty = override.specialty ?? specialty;
    const nextDoctorName = override.doctorName ?? doctorName;
    const nextSearchDate = override.searchDate ?? searchDate;

    setLoading(true);
    setError("");

    try {
      const results = await searchDoctors(
        nextSpecialty,
        nextDoctorName,
        nextSearchDate,
      );
      const normalizedResults = (results || []).map(normalizeDoctor);
      setDoctors(normalizedResults);

      if (normalizedResults.length === 0) {
        setError("No doctors found matching your criteria");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setDoctors([]);
    await loadDoctors();
  };

  const handleViewSlots = async (doctor) => {
    setLoading(true);
    setError("");
    try {
      const slots = await getAvailableSlots(doctor.id, `${searchDate}T00:00:00`);
      setDoctors((currentDoctors) =>
        currentDoctors.map((currentDoctor) =>
          currentDoctor.id === doctor.id
            ? { ...currentDoctor, availableSlots: slots || [] }
            : currentDoctor,
        ),
      );
    } catch (err) {
      setError("Failed to load available slots");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSlot = (doctor, slot) => {
    setSelectedDoctor(doctor);
    setSelectedSlot(slot);
    setShowBookingModal(true);
  };

  const handleBookAppointment = async () => {
    if (!symptoms.trim()) {
      setError("Please describe your symptoms");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const appointmentData = {
        patientId: Number(patientId) || 1,
        doctorId: selectedDoctor.id,
        appointmentTime: selectedSlot.startTime,
        durationMinutes: 30,
        symptoms: symptoms,
        notes: `Booked for ${getDoctorName(selectedDoctor)}`,
      };

      const result = await bookAppointment(appointmentData);
      setSuccess(
        `Appointment booked successfully! Appointment ID: ${result.id}`,
      );
      setShowBookingModal(false);
      setSelectedDoctor(null);
      setSelectedSlot(null);
      setSymptoms("");

      await loadDoctors();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getDoctorName = (doctor) =>
    doctor.name || [doctor.firstName, doctor.lastName].filter(Boolean).join(" ");

  const getSlots = (doctor) => doctor.availableSlots ?? doctor.slots;

  return (
    <div className="card">
      <h2 className="card-title">Find a Doctor</h2>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <form onSubmit={handleSearch}>
        <div className="row">
          <div className="col">
            <div className="form-group">
              <label>Specialty</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g., Cardiology, Neurology"
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
              />
            </div>
          </div>
          <div className="col">
            <div className="form-group">
              <label>Doctor Name (Optional)</label>
              <input
                type="text"
                className="form-control"
                placeholder="Doctor name"
                value={doctorName}
                onChange={(e) => setDoctorName(e.target.value)}
              />
            </div>
          </div>
          <div className="col">
            <div className="form-group">
              <label>Appointment Date</label>
              <input
                type="date"
                className="form-control"
                value={searchDate}
                onChange={(e) => setSearchDate(e.target.value)}
              />
            </div>
          </div>
          <div className="col">
            <div className="form-group">
              <label>&nbsp;</label>
              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: "100%" }}
              >
                Search
              </button>
            </div>
          </div>
        </div>
      </form>

      {loading && <div className="loading">Loading...</div>}

      {doctors.length > 0 && (
        <div>
          <h3 style={{ marginTop: "20px" }}>
            Search Results ({doctors.length} doctors found)
          </h3>
          {doctors.map((doctor) => (
            <div key={doctor.id} className="doctor-card">
              <div className="doctor-name">{getDoctorName(doctor)}</div>
              <div className="doctor-specialty">{doctor.specialty}</div>
              <div className="doctor-fee">
                Consultation Fee: LKR {doctor.consultationFee}
              </div>
              <div>Experience: {doctor.experienceYears} years</div>
              <div>Qualification: {doctor.qualification}</div>
              {doctor.rating != null && <div>Rating: {doctor.rating}</div>}

              {!Array.isArray(getSlots(doctor)) ? (
                <button
                  className="btn btn-primary"
                  style={{ marginTop: "10px" }}
                  onClick={() => handleViewSlots(doctor)}
                >
                  View Available Slots
                </button>
              ) : (
                <div>
                  <h4 style={{ marginTop: "15px" }}>Available Time Slots:</h4>
                  <div className="time-slots">
                    {getSlots(doctor).length === 0 ? (
                      <span>No available slots for today</span>
                    ) : (
                      getSlots(doctor).map((slot, idx) => (
                        <div
                          key={idx}
                          className={`time-slot ${slot.isBooked ? "booked" : ""}`}
                          onClick={() =>
                            !slot.isBooked && handleSelectSlot(doctor, slot)
                          }
                        >
                          {new Date(slot.startTime).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Booking Modal */}
      {showBookingModal && selectedDoctor && selectedSlot && (
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
            <h3>Confirm Appointment</h3>
            <p>
              <strong>Doctor:</strong> {getDoctorName(selectedDoctor)}
            </p>
            <p>
              <strong>Specialty:</strong> {selectedDoctor.specialty}
            </p>
            <p>
              <strong>Date & Time:</strong>{" "}
              {new Date(selectedSlot.startTime).toLocaleString()}
            </p>
            <p>
              <strong>Fee:</strong> LKR {selectedDoctor.consultationFee}
            </p>

            <div className="form-group">
              <label>Symptoms / Reason for visit:</label>
              <textarea
                className="form-control"
                rows="3"
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                placeholder="Please describe your symptoms..."
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
                onClick={() => setShowBookingModal(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn-success"
                onClick={handleBookAppointment}
              >
                Confirm Booking
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchDoctors;
