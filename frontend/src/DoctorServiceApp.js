import React, { useState } from "react";
import DoctorDashboard from "./components/doctor/DoctorDashboard";
import AvailabilityManager from "./components/doctor/AvailabilityManager";
import IssuePrescription from "./components/doctor/IssuePrescription";
import VideoConsultation from "./components/doctor/VideoConsultation";
import AppointmentRequests from "./components/doctor/AppointmentRequests";

const tabs = [
  { key: "profile", label: "Doctor Profile" },
  { key: "availability", label: "Availability" },
  { key: "prescriptions", label: "Prescriptions" },
  { key: "video", label: "Video" },
  { key: "appointments", label: "Appointments" }
];

function DoctorServiceApp() {
  const [activeTab, setActiveTab] = useState("profile");

  return (
    <main className="container">
      <header>
        <h1>ELIXRA Doctor Frontend</h1>
        <p>Frontend scaffolding connected to `services/doctor_service` endpoints.</p>
      </header>

      <nav className="tab-row">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            className={activeTab === tab.key ? "active" : ""}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {activeTab === "profile" && <DoctorDashboard />}
      {activeTab === "availability" && <AvailabilityManager />}
      {activeTab === "prescriptions" && <IssuePrescription />}
      {activeTab === "video" && <VideoConsultation />}
      {activeTab === "appointments" && <AppointmentRequests />}
    </main>
  );
}

export default DoctorServiceApp;

