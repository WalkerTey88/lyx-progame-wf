'use client';

import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useRouter } from 'next/navigation';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

function CheckoutForm({ bookingId, amount }: { bookingId: string; amount: number }) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'succeeded' | 'failed'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      const { error: submitError } = await elements.submit();
      if (submitError) {
        setError(submitError.message || 'Payment form error');
        setProcessing(false);
        return;
      }

      const response = await fetch('/api/payments/stripe/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId, amount })
      });

      const result = await response.json();

      if (!result.success) {
        setError(result.error || 'Payment failed');
        setProcessing(false);
        return;
      }

      const { error: confirmError } = await stripe.confirmPayment({
        elements,
        clientSecret: result.clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/booking/return/${bookingId}`,
        },
        redirect: 'if_required'
      });

      if (confirmError) {
        setError(confirmError.message || 'Payment confirmation failed');
        setPaymentStatus('failed');
      } else {
        setPaymentStatus('succeeded');
        
        setTimeout(() => {
          router.push(`/booking/return/${bookingId}?status=success`);
        }, 3000);
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
      setPaymentStatus('failed');
    } finally {
      setProcessing(false);
    }
  };

  if (paymentStatus === 'succeeded') {
    return (
      <div className="text-center py-8">
        <div className="text-green-500 text-4xl mb-4">✓</div>
        <h2 className="text-2xl font-bold mb-2">Payment Successful!</h2>
        <p className="text-gray-600">Redirecting to booking confirmation...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">Payment Details</h3>
        <PaymentElement />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || processing}
        className={`w-full py-3 px-4 rounded-lg font-medium ${
          !stripe || processing
            ? 'bg-gray-300 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700 text-white'
        }`}
      >
        {processing ? 'Processing...' : `Pay MYR ${amount.toFixed(2)}`}
      </button>

      <div className="text-sm text-gray-500 text-center">
        <p>Your payment is secured with Stripe</p>
        <div className="flex justify-center space-x-4 mt-2">
          <span>🔒 Secure</span>
          <span>💳 Cards Accepted</span>
          <span>🔄 Instant Confirmation</span>
        </div>
      </div>
    </form>
  );
}

export default function PayClient({ bookingId, amount }: { bookingId: string; amount: number }) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initializePayment = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/payments/stripe/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId, amount })
      });

      const result = await response.json();

      if (result.success) {
        setClientSecret(result.clientSecret);
      } else {
        setError(result.error || 'Failed to initialize payment');
      }
    } catch (err: any) {
      setError(err.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  if (!clientSecret) {
    return (
      <div className="max-w-md mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Complete Your Payment</h1>
          <p className="text-gray-600 mb-6">
            Total amount: <span className="font-bold text-xl">MYR ${amount.toFixed(2)}</span>
          </p>
          
          <button
            onClick={initializePayment}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-8 rounded-lg disabled:opacity-50"
          >
            {loading ? 'Preparing payment...' : 'Proceed to Payment'}
          </button>
          
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded">
              {error}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <Elements stripe={stripePromise} options={{ clientSecret }}>
        <CheckoutForm bookingId={bookingId} amount={amount} />
      </Elements>
    </div>
  );
}
