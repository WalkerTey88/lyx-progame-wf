import Stripe from 'stripe';

export const getStripeClient = () => {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  
  if (!secretKey) {
    throw new Error('STRIPE_SECRET_KEY is not defined in environment variables');
  }
  
  return new Stripe(secretKey, {
    typescript: true,
    timeout: 10000,
    maxNetworkRetries: 2,
  });
};

export const verifyStripeSignature = async (
  body: string,
  signature: string
): Promise<Stripe.Event> => {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  
  if (!webhookSecret) {
    throw new Error('STRIPE_WEBHOOK_SECRET is not defined');
  }
  
  const stripe = getStripeClient();
  
  try {
    return stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error: any) {
    console.error('Stripe signature verification failed:', {
      error: error.message,
      signature: signature.substring(0, 50) + '...',
      bodyLength: body.length
    });
    throw error;
  }
};
