import React, { useState } from "react";
import Navbar from "./components/common/Navbar";
import SearchDoctors from "./components/appointments/SearchDoctors";
import AppointmentList from "./components/appointments/AppointmentList";

function App() {
  const [activeTab, setActiveTab] = useState("search");
  const [patientId, setPatientId] = useState(1);

  const normalizedPatientId = Number(patientId) || 1;

  return (
    <div>
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="container">
        <div className="card" style={{ marginBottom: "20px" }}>
          <h2 className="card-title">Appointment Context</h2>
          <div className="form-group" style={{ maxWidth: "280px" }}>
            <label>Patient ID</label>
            <input
              type="number"
              min="1"
              className="form-control"
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
            />
          </div>
          <p style={{ marginBottom: 0 }}>
            Use the patient profile ID you created in the backend.
          </p>
        </div>

        {activeTab === "search" && (
          <SearchDoctors patientId={normalizedPatientId} />
        )}
        {activeTab === "my-appointments" && (
          <AppointmentList patientId={normalizedPatientId} />
        )}
      </div>
    </div>
  );
}

export default App;