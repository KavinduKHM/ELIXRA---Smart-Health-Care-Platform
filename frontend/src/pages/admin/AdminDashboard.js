import React, { useEffect, useState } from 'react';
import { getPendingDoctors, rejectDoctor, verifyDoctor } from '../../services/doctorService';
import {
  FiAlertCircle,
  FiCheckCircle,
  FiClock,
  FiGrid,
  FiHelpCircle,
  FiRefreshCw,
  FiSettings,
  FiUsers,
  FiXCircle,
} from 'react-icons/fi';
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

  const renderDoctorName = (doctor) =>
    doctor.fullName || `${doctor.firstName || ''} ${doctor.lastName || ''}`.trim() || 'Doctor';

  const renderInitials = (doctor) => {
    const name = renderDoctorName(doctor)
      .replace(/^Dr\.?\s+/i, '')
      .trim();
    const parts = name.split(/\s+/).filter(Boolean);
    const first = parts[0]?.[0] || 'D';
    const second = parts[1]?.[0] || 'R';
    return `${first}${second}`.toUpperCase();
  };

  return (
    <div className="adminDashboardRoot">
      <aside className="adminSidebar">
        <h2>ADMIN PORTAL</h2>
        <p>Clinical Editorial v1.0</p>
        <nav className="adminSidebarNav">
          <a className="adminSidebarItem" href="#dashboard"><FiGrid /> Dashboard</a>
          <a className="adminSidebarItem adminSidebarItemActive" href="#verification"><FiCheckCircle /> Doctor Verification</a>
          <a className="adminSidebarItem" href="#staff"><FiUsers /> Staff Management</a>
          <a className="adminSidebarItem" href="#settings"><FiSettings /> Settings</a>
        </nav>
        <div className="adminSidebarFooter">
          <div className="adminSidebarItem"><FiHelpCircle /> Support</div>
          <div className="adminSidebarLogout"><FiXCircle /> Logout</div>
        </div>
      </aside>

      <main className="adminMain">
        <section className="adminDashboardHeader" id="dashboard">
          <div>
            <h1>Admin Dashboard</h1>
            <p>Review and moderate doctor registrations with status PENDING.</p>
          </div>
          <button type="button" className="adminRefreshBtn" onClick={loadPendingDoctors} disabled={loading}>
            <FiRefreshCw /> Refresh
          </button>
        </section>

        {error ? <div className="adminDashboardError"><FiAlertCircle /> {error}</div> : null}

        <div className="adminContentGrid">
          <section className="adminPendingSection" id="verification">
            <h2><span className="adminSectionAccent" />Pending Doctor Registrations ({pendingDoctors.length})</h2>

            {loading ? (
              <div className="adminStateCard">Loading pending doctors...</div>
            ) : pendingDoctors.length === 0 ? (
              <div className="adminStateCard">No pending doctors found.</div>
            ) : (
              <div className="adminDoctorList">
                {pendingDoctors.map((doctor) => {
                  const isBusy = busyDoctorId === doctor.id;
                  return (
                    <article key={doctor.id} className="adminDoctorCard">
                      <div className="adminDoctorTop">
                        <div className="adminDoctorAvatar">{renderInitials(doctor)}</div>
                        <div className="adminDoctorSummary">
                          <div className="adminDoctorHeaderLine">
                            <h3>{renderDoctorName(doctor)}</h3>
                            <span className="adminDoctorBadge">ID: {doctor.id}</span>
                          </div>
                          <div className="adminDoctorTags">
                            <span>{doctor.specialty || 'General'}</span>
                            <span>{doctor.experienceYears ?? 0} years experience</span>
                          </div>
                          <div className="adminDoctorMetaGrid">
                            <p><small>Email Address</small><strong>{doctor.email || '-'}</strong></p>
                            <p><small>Phone Number</small><strong>{doctor.phoneNumber || '-'}</strong></p>
                            <p><small>Qualification</small><strong>{doctor.qualification || '-'}</strong></p>
                          </div>
                        </div>
                      </div>

                      <div className="adminDoctorBottom">
                        <p className="adminSubmittedText"><FiClock /> Submitted for verification</p>
                        <div className="adminDoctorActions">
                          <button
                            type="button"
                            className="adminRejectBtn"
                            onClick={() => handleAction(doctor.id, 'reject')}
                            disabled={isBusy}
                          >
                            {isBusy ? 'Processing...' : 'Reject'}
                          </button>
                          <button
                            type="button"
                            className="adminVerifyBtn"
                            onClick={() => handleAction(doctor.id, 'verify')}
                            disabled={isBusy}
                          >
                            <FiCheckCircle /> {isBusy ? 'Processing...' : 'Verify Doctor'}
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>

          <aside className="adminStatsColumn">
            <section className="adminQueueCard">
              <p>VERIFICATION QUEUE</p>
              <h3>{pendingDoctors.length < 10 ? `0${pendingDoctors.length}` : pendingDoctors.length}</h3>
              <span>Doctors currently awaiting manual review</span>
            </section>

            <section className="adminGuidelineCard">
              <h4>Verification Guidelines</h4>
              <ul>
                <li><FiCheckCircle /> Cross-verify Medical Council ID</li>
                <li><FiCheckCircle /> Validate qualification documents</li>
                <li><FiCheckCircle /> Confirm clinical experience years</li>
              </ul>
            </section>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;

