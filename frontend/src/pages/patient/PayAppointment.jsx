import { useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import toast from 'react-hot-toast';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';
import { env } from '../../lib/env';
import { useAuth } from '../../hooks/useAuth';
import { confirmPaymentForAppointment, getAppointment } from '../../services/appointment.service';
import { getDoctorProfile } from '../../services/doctor.service';
import { createPaymentIntent, isAppointmentPaid } from '../../services/payment.service';

const stripePromise = env.stripePublishableKey ? loadStripe(env.stripePublishableKey) : null;

function CheckoutForm({ appointmentId, intent }) {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [submitting, setSubmitting] = useState(false);

  const confirmMutation = useMutation({
    mutationFn: (payload) => confirmPaymentForAppointment(appointmentId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['patientAppointments'] });
      qc.invalidateQueries({ queryKey: ['appointment', appointmentId] });
    },
  });

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        if (!stripe || !elements) return;

        setSubmitting(true);
        try {
          const result = await stripe.confirmPayment({
            elements,
            confirmParams: {
              return_url: `${window.location.origin}/patient/pay/${appointmentId}`,
            },
            redirect: 'if_required',
          });

          if (result.error) {
            toast.error(result.error.message || 'Payment failed');
            return;
          }

          const paymentIntentId = result.paymentIntent?.id || intent?.paymentIntentId;
          if (!paymentIntentId) {
            toast.error('Missing payment intent ID');
            return;
          }

          await confirmMutation.mutateAsync({
            paymentIntentId,
            transactionId: intent?.transactionId || null,
          });

          toast.success('Payment confirmed');
          navigate('/patient/appointments', { replace: true });
        } catch (err) {
          toast.error(err?.response?.data?.message || err?.message || 'Payment confirmation failed');
        } finally {
          setSubmitting(false);
        }
      }}
      className="space-y-4"
    >
      <PaymentElement />
      <Button disabled={!stripe || !elements || submitting || confirmMutation.isPending}>
        {submitting || confirmMutation.isPending ? (
          <span className="inline-flex items-center gap-2">
            <Spinner /> Processing
          </span>
        ) : (
          'Pay now'
        )}
      </Button>
    </form>
  );
}

export default function PayAppointment() {
  const { appointmentId } = useParams();
  const { userId } = useAuth();
  const location = useLocation();

  const idNum = Number(appointmentId);
  const initial = location.state || {};

  const appointmentQuery = useQuery({
    queryKey: ['appointment', idNum],
    queryFn: () => getAppointment(idNum),
    enabled: Number.isFinite(idNum) && idNum > 0,
  });

  const doctorId = appointmentQuery.data?.doctorId;

  const doctorQuery = useQuery({
    queryKey: ['doctorProfile', doctorId],
    queryFn: () => getDoctorProfile(doctorId),
    enabled: Boolean(doctorId),
  });

  const paidQuery = useQuery({
    queryKey: ['isPaid', idNum],
    queryFn: () => isAppointmentPaid(idNum),
    enabled: Number.isFinite(idNum) && idNum > 0,
    staleTime: 10_000,
  });

  const isPaid = Boolean(paidQuery.data?.isPaid);

  const amount = useMemo(() => {
    const d = doctorQuery.data;
    const raw = d?.consultationFee ?? d?.fee ?? d?.price ?? null;
    const num = raw == null ? null : Number(raw);
    return Number.isFinite(num) && num > 0 ? num : 1500;
  }, [doctorQuery.data]);

  const intentPayload = useMemo(() => {
    if (!Number.isFinite(idNum) || idNum <= 0) return null;
    if (!userId) return null;
    return {
      appointmentId: idNum,
      patientId: Number(userId),
      amount,
      currency: 'LKR',
    };
  }, [amount, idNum, userId]);

  const intentQuery = useQuery({
    queryKey: ['paymentIntent', idNum],
    queryFn: () => createPaymentIntent(intentPayload),
    enabled: Boolean(intentPayload) && !isPaid,
    staleTime: 60_000,
  });

  const intent = intentQuery.data?.clientSecret ? intentQuery.data : initial;

  const clientSecret = intent?.clientSecret;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Pay for appointment</h1>
        <p className="mt-1 text-sm text-slate-600">Complete payment to confirm your booking.</p>
      </div>

      {!env.stripePublishableKey ? (
        <Card>
          <div className="text-sm text-rose-600">Missing `VITE_STRIPE_PUBLISHABLE_KEY` in the frontend environment.</div>
        </Card>
      ) : null}

      <Card>
        {appointmentQuery.isLoading ? (
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Spinner /> Loading appointment
          </div>
        ) : appointmentQuery.error ? (
          <div className="text-sm text-rose-600">Failed to load appointment.</div>
        ) : (
          <div className="text-sm text-slate-700">
            <div className="font-semibold">Appointment #{appointmentQuery.data?.id}</div>
            <div className="mt-1">Doctor: {appointmentQuery.data?.doctorName || doctorQuery.data?.name || '—'}</div>
            <div className="mt-1">Time: {appointmentQuery.data?.appointmentTime || '—'}</div>
            <div className="mt-1">Amount: {amount} LKR</div>
          </div>
        )}
      </Card>

      <Card>
        {paidQuery.isLoading ? (
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Spinner /> Checking payment
          </div>
        ) : isPaid ? (
          <div className="text-sm text-slate-700">
            <div className="font-semibold">Already paid</div>
            <div className="mt-1 text-sm text-slate-600">This appointment is marked as paid in the payment service.</div>
          </div>
        ) : !stripePromise ? (
          <div className="text-sm text-rose-600">Stripe failed to initialize.</div>
        ) : intentQuery.isLoading && !clientSecret ? (
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Spinner /> Preparing payment
          </div>
        ) : intentQuery.error && !clientSecret ? (
          <div className="text-sm text-rose-600">Failed to prepare payment.</div>
        ) : !clientSecret ? (
          <div className="text-sm text-rose-600">Missing client secret.</div>
        ) : (
          <Elements stripe={stripePromise} options={{ clientSecret }}>
            <CheckoutForm appointmentId={idNum} intent={intent} />
          </Elements>
        )}
      </Card>
    </div>
  );
}
