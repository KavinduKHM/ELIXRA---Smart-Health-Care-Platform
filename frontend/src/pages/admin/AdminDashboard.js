import React, { useEffect, useState } from 'react';
import { getPendingDoctors, rejectDoctor, verifyDoctor } from '../../services/doctorService';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [pendingDoctors, setPendingDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyDoctorId, setBusyDoctorId] = useState(null);
  const [error, setError] = useState('');

  const loadPendingDoctors = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await getPendingDoctors();
      setPendingDoctors(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      const message = err?.response?.data?.message || 'Failed to load pending doctors.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPendingDoctors();
  }, []);

  const handleAction = async (doctorId, action) => {
    setBusyDoctorId(doctorId);
    setError('');
    try {
      if (action === 'verify') {
        await verifyDoctor(doctorId);
      } else {
        await rejectDoctor(doctorId);
      }
      setPendingDoctors((prev) => prev.filter((doctor) => doctor.id !== doctorId));
    } catch (err) {
      const message = err?.response?.data?.message || `Failed to ${action} doctor.`;
      setError(message);
    } finally {
      setBusyDoctorId(null);
    }
  };

  return (
    <div className="adminDashboardRoot">
      <section className="adminDashboardHeader card">
        <h1 className="cardTitle">Admin Dashboard</h1>
        <p className="muted">Review and moderate doctor registrations with status PENDING.</p>
      </section>

      <section className="card adminDashboardBody">
        <div className="adminDashboardTopRow">
          <h2 className="cardTitle">Pending Doctors ({pendingDoctors.length})</h2>
          <button type="button" onClick={loadPendingDoctors} disabled={loading}>Refresh</button>
        </div>

        {error ? <div className="adminDashboardError">{error}</div> : null}

        {loading ? (
          <p className="muted">Loading pending doctors...</p>
        ) : pendingDoctors.length === 0 ? (
          <p className="muted">No pending doctors found.</p>
        ) : (
          <div className="adminDoctorList">
            {pendingDoctors.map((doctor) => {
              const isBusy = busyDoctorId === doctor.id;
              return (
                <article key={doctor.id} className="adminDoctorCard">
                  <div>
                    <h3>{doctor.fullName || `${doctor.firstName || ''} ${doctor.lastName || ''}`.trim() || 'Doctor'}</h3>
                    <p><strong>ID:</strong> {doctor.id}</p>
                    <p><strong>Email:</strong> {doctor.email || '-'}</p>
                    <p><strong>Phone:</strong> {doctor.phoneNumber || '-'}</p>
                    <p><strong>Specialty:</strong> {doctor.specialty || '-'}</p>
                    <p><strong>Qualification:</strong> {doctor.qualification || '-'}</p>
                    <p><strong>Experience:</strong> {doctor.experienceYears ?? 0} years</p>
                  </div>
                  <div className="adminDoctorActions">
                    <button
                      type="button"
                      className="adminVerifyBtn"
                      onClick={() => handleAction(doctor.id, 'verify')}
                      disabled={isBusy}
                    >
                      {isBusy ? 'Processing...' : 'Verify'}
                    </button>
                    <button
                      type="button"
                      className="adminRejectBtn"
                      onClick={() => handleAction(doctor.id, 'reject')}
                      disabled={isBusy}
                    >
                      {isBusy ? 'Processing...' : 'Reject'}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

export default AdminDashboard;

