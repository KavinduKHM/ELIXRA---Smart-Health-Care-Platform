import React from 'react';
import { useOutletContext } from 'react-router-dom';
import PatientAppointments from '../../components/patient/PatientAppointments';
import BookAppointment from '../../components/patient/BookAppointment';
import AISymptomCheckerChatbot from '../../components/patient/AISymptomCheckerChatbot';

const PatientAppointmentsBookPage = () => {
  const { patientId } = useOutletContext();

  return (
    <div>
      <h1>Appointments</h1>
      <AISymptomCheckerChatbot />
      <PatientAppointments patientId={patientId} />
      <BookAppointment patientId={patientId} />
    </div>
  );
};

export default PatientAppointmentsBookPage;
