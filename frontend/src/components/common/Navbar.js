import React from "react";

const Navbar = ({ activeTab, setActiveTab }) => {
  const navButtonStyle = (isActive) => ({
    background: "none",
    border: "none",
    color: isActive ? "#ffffff" : "inherit",
    cursor: "pointer",
    font: "inherit",
    padding: 0,
    textDecoration: isActive ? "underline" : "none",
  });

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <button
          type="button"
          style={navButtonStyle(activeTab === "search")}
          onClick={() => setActiveTab("search")}
        >
          Healthcare Platform
        </button>
      </div>
      <div className="navbar-links">
        <button
          type="button"
          style={navButtonStyle(activeTab === "search")}
          onClick={() => setActiveTab("search")}
        >
          Search Doctors
        </button>
        <button
          type="button"
          style={navButtonStyle(activeTab === "my-appointments")}
          onClick={() => setActiveTab("my-appointments")}
        >
          My Appointments
        </button>
      </div>
    </nav>
  );
};

export default Navbar;