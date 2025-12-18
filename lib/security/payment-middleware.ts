import { NextRequest, NextResponse } from 'next/server';
import { Redis } from 'ioredis';
import { SignatureValidator } from './signature-validator';

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
const TAMPER_PROOF_SECRET = process.env.TAMPER_PROOF_SECRET || 'your_tamper_proof_secret_change_in_prod';

export async function amountValidationMiddleware(request: NextRequest) {
  if (request.method !== 'POST') {
    return NextResponse.next();
  }

  const url = new URL(request.url);
  if (!url.pathname.includes('/api/payments/')) {
    return NextResponse.next();
  }

  try {
    const body = await request.clone().json();
    const { orderId, amount, currency, signature, timestamp } = body;

    if (!orderId || !amount || !currency || !signature || !timestamp) {
      return NextResponse.json(
        { error: 'Missing required security fields.' },
        { status: 400 }
      );
    }

    const isValid = SignatureValidator.verifyTamperProofSignature(
      orderId,
      amount,
      currency,
      timestamp,
      signature,
      TAMPER_PROOF_SECRET
    );

    if (!isValid) {
      console.error(`Tamper attempt detected for order ${orderId}.`);
      return NextResponse.json(
        { error: 'Invalid request signature. Possible tampering detected.' },
        { status: 401 }
      );
    }

    // 金额合理性检查（示例：不超过100万）
    if (amount > 1000000) {
      return NextResponse.json(
        { error: 'Amount exceeds maximum limit.' },
        { status: 400 }
      );
    }

    return NextResponse.next();
  } catch (error) {
    console.error('Error in amount validation middleware:', error);
    return NextResponse.json(
      { error: 'Internal server error during validation.' },
      { status: 500 }
    );
  }
}

export async function concurrencyLockMiddleware(request: NextRequest) {
  const url = new URL(request.url);
  const pathname = url.pathname;

  // 只对支付创建和状态更新端点加锁
  const lockPatterns = [
    /\/api\/payments\/stripe\/create$/,
    /\/api\/payments\/fpx\/create$/,
    /\/api\/payments\/.+\/webhook$/,
    /\/api\/payments\/.+\/status$/,
  ];

  const shouldLock = lockPatterns.some(pattern => pattern.test(pathname));
  if (!shouldLock) {
    return NextResponse.next();
  }

  try {
    const body = await request.clone().json();
    const orderId = body.orderId || body.bookingId;

    if (!orderId) {
      return NextResponse.next();
    }

    const lockKey = `payment:req:lock:${orderId}`;
    const lockDuration = 15; // 秒

    // 尝试获取分布式锁
    const acquired = await redis.set(lockKey, '1', 'EX', lockDuration, 'NX');
    if (!acquired) {
      return NextResponse.json(
        {
          error: 'A payment operation for this order is already in progress. Please try again shortly.',
          code: 'CONCURRENT_PAYMENT_ATTEMPT',
        },
        { status: 429 }
      );
    }

    // 将锁Key注入请求头，供后续处理完成后释放
    const response = await NextResponse.next();
    response.headers.set('X-Payment-Lock-Key', lockKey);
    return response;
  } catch (error) {
    console.error('Error in concurrency lock middleware:', error);
    return NextResponse.next();
  }
}

// 锁释放工具函数（应在支付处理最终完成后调用）
export async function releasePaymentLock(lockKey: string): Promise<void> {
  try {
    await redis.del(lockKey);
    console.log(`Released payment lock: ${lockKey}`);
  } catch (error) {
    console.error(`Error releasing lock ${lockKey}:`, error);
  }
}