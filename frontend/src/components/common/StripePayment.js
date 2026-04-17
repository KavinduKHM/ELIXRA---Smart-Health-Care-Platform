// src/components/common/StripePayment.js
import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import axios from 'axios';

const stripePublicKey = process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY;
const stripePromise = stripePublicKey ? loadStripe(stripePublicKey) : null;

const PaymentForm = ({ appointmentId, amount, clientSecret, onSuccess, onError }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!clientSecret) {
      const msg = 'Payment is not initialized (missing client secret). Please book the appointment first.';
      setError(msg);
      if (onError) onError(msg);
      return;
    }

    if (!stripe || !elements) return;

    setProcessing(true);
    const result = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: elements.getElement(CardElement),
      }
    });

    if (result.error) {
      setError(result.error.message);
      if (onError) onError(result.error.message);
    } else {
      if (result.paymentIntent.status === 'succeeded') {
        // Confirm payment with your backend
        try {
          await axios.post(`http://localhost:8084/api/appointments/${appointmentId}/confirm-payment`, {
            paymentIntentId: result.paymentIntent.id,
            transactionId: result.paymentIntent.id
          });
          if (onSuccess) onSuccess(result.paymentIntent);
        } catch (err) {
          console.error(err);
          setError('Payment confirmed but backend update failed');
        }
      }
    }
    setProcessing(false);
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': { color: '#aab7c4' },
      },
      invalid: { color: '#9e2146' },
    },
  };

  return (
    <form onSubmit={handleSubmit}>
      <CardElement options={cardElementOptions} />
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <button type="submit" disabled={!stripe || processing || !clientSecret} style={{ marginTop: '1rem' }}>
        {processing ? 'Processing...' : `Pay ${amount}`}
      </button>
    </form>
  );
};

const StripePayment = ({ appointmentId, amount, clientSecret, onSuccess, onError }) => {
  if (!stripePromise) {
    return (
      <p style={{ color: 'red' }}>
        Stripe publishable key is missing. Set REACT_APP_STRIPE_PUBLISHABLE_KEY in frontend/.env and restart the dev server.
      </p>
    );
  }

  if (!clientSecret) {
    return (
      <p style={{ color: 'red' }}>
        Payment is not initialized yet. Book the appointment to get a client secret.
      </p>
    );
  }

  return (
    <Elements stripe={stripePromise}>
      <PaymentForm
        appointmentId={appointmentId}
        amount={amount}
        clientSecret={clientSecret}
        onSuccess={onSuccess}
        onError={onError}
      />
    </Elements>
  );
};

export default StripePayment;