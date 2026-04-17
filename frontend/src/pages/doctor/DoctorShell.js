import React, { useEffect, useMemo, useState } from 'react';
import { Link, NavLink, Outlet, useParams } from 'react-router-dom';
import { getDoctorProfile } from '../../services/doctorService';

const DoctorShell = () => {
  const { doctorId } = useParams();

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [profile, setProfile] = useState(null);

  const doctorIdNum = useMemo(() => Number(doctorId), [doctorId]);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      if (!Number.isFinite(doctorIdNum) || doctorIdNum <= 0) {
        setLoadError('Invalid doctor id');
        setLoading(false);
        return;
      }

      setLoading(true);
      setLoadError(null);

      try {
        const res = await getDoctorProfile(doctorIdNum);
        if (!isMounted) return;
        setProfile(res.data);
      } catch (err) {
        console.error(err);
        if (!isMounted) return;
        const status = err?.response?.status;
        setLoadError(status === 404 ? 'Doctor not found' : 'Failed to load doctor data');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    load();

    return () => {
      isMounted = false;
    };
  }, [doctorIdNum]);

  const outletContext = useMemo(
    () => ({ doctorId: doctorIdNum, profile, setProfile }),
    [doctorIdNum, profile]
  );

  return (
    <div className="shell">
      <aside className="sidebar">
        <div>
          <h3 className="sidebarTitle">Doctor</h3>
          <div className="sidebarMeta">ID: {doctorId}</div>
        </div>
        <nav className="sidebarNav">
          <NavLink
            to="appointments"
            end
            className={({ isActive }) => `sidebarLink ${isActive ? 'sidebarLinkActive' : ''}`}
          >
            Appointments
          </NavLink>
          <NavLink
            to="prescriptions"
            className={({ isActive }) => `sidebarLink ${isActive ? 'sidebarLinkActive' : ''}`}
          >
            Prescriptions
          </NavLink>
          <NavLink
            to="profile"
            className={({ isActive }) => `sidebarLink ${isActive ? 'sidebarLinkActive' : ''}`}
          >
            Profile
          </NavLink>
        </nav>
        <div style={{ marginTop: '1rem' }}>
          <Link to="/doctor" style={{ color: 'white' }}>Switch doctor</Link>
        </div>
      </aside>

      <section className="content">
        {loading && <p>Loading doctor data...</p>}
        {!loading && loadError && (
          <div>
            <p style={{ color: 'red' }}>{loadError}</p>
            <Link to="/doctor">Go back</Link>
          </div>
        )}
        {!loading && !loadError && <Outlet context={outletContext} />}
      </section>
    </div>
  );
};

export default DoctorShell;
