import { NextRequest, NextResponse } from 'next/server';
import { paymentService } from '@/lib/payment-service';
import { headers } from 'next/headers';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const rawBody = await request.text();
    
    const headersList = await headers();
    const signature = headersList.get('stripe-signature');
    
    if (!signature) {
      console.error('Missing stripe-signature header');
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 400 }
      );
    }
    
    console.log('Stripe webhook received:', {
      bodyLength: rawBody.length,
      signature: signature.substring(0, 30) + '...',
      timestamp: new Date().toISOString()
    });
    
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;
    const success = await paymentService.handleWebhookEvent(
      rawBody,
      signature,
      webhookSecret
    );
    
    const duration = Date.now() - startTime;
    
    if (success) {
      return NextResponse.json(
        { received: true, duration },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { error: 'Webhook processing failed', duration },
        { status: 400 }
      );
    }
    
  } catch (error: any) {
    const duration = Date.now() - startTime;
    
    console.error('Webhook processing error:', {
      error: error.message,
      stack: error.stack,
      duration
    });
    
    return NextResponse.json(
      { error: 'Webhook handler failed', duration },
      { status: 500 }
    );
  }
}
