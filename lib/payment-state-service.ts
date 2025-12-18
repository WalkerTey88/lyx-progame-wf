import { PrismaClient } from '@prisma/client';
import { PaymentStatus } from './payment-status';
import { Redis } from 'ioredis';

const prisma = new PrismaClient();

export class PaymentStateService {
  private redis: Redis;
  private retryConfig = {
    maxAttempts: 5,
    backoffFactor: 2,
    initialDelay: 1000,
  };

  constructor(redisClient?: Redis) {
    this.redis = redisClient || new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
  }

  // 核心状态转换方法
  async transitionPayment(paymentId: string, toStatus: PaymentStatus, metadata?: any): Promise<boolean> {
    const lockKey = `payment:transition:lock:${paymentId}`;
    const acquired = await this.redis.set(lockKey, '1', 'EX', 10, 'NX');
    if (!acquired) {
      throw new Error(`Concurrent transition attempt detected for payment ${paymentId}.`);
    }

    try {
      const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
      if (!payment) {
        throw new Error(`Payment ${paymentId} not found.`);
      }

      const fromStatus = payment.status as PaymentStatus;
      if (!PaymentStateMachine.canTransition(fromStatus, toStatus)) {
        throw new Error(`Invalid state transition from ${fromStatus} to ${toStatus}.`);
      }

      await prisma.payment.update({
        where: { id: paymentId },
        data: {
          status: toStatus,
          metadata: { ...(payment.metadata as any), ...metadata, lastTransition: new Date().toISOString() },
          updatedAt: new Date(),
        },
      });

      console.log(`Payment ${paymentId} transitioned from ${fromStatus} to ${toStatus}.`);
      return true;
    } finally {
      await this.redis.del(lockKey);
    }
  }

  // 超时自动关闭逻辑
  async expirePendingPayments(): Promise<{ expired: number }> {
    const now = new Date();
    const expiredPayments = await prisma.payment.updateMany({
      where: {
        status: PaymentStatus.PENDING,
        expiresAt: { lt: now },
      },
      data: {
        status: PaymentStatus.EXPIRED,
        metadata: { expiredAt: now.toISOString() },
      },
    });
    console.log(`Expired ${expiredPayments.count} pending payments.`);
    return { expired: expiredPayments.count };
  }

  // 回调重试机制
  async retryWebhookProcessing(paymentId: string, webhookData: any): Promise<void> {
    const retryKey = `payment:webhook:retry:${paymentId}`;
    const attempt = await this.redis.incr(retryKey);

    if (attempt > this.retryConfig.maxAttempts) {
      console.error(`Max retry attempts (${this.retryConfig.maxAttempts}) exceeded for payment ${paymentId}.`);
      await this.redis.del(retryKey);
      return;
    }

    const delay = this.retryConfig.initialDelay * Math.pow(this.retryConfig.backoffFactor, attempt - 1);
    console.log(`Scheduling webhook retry ${attempt} for payment ${paymentId} in ${delay}ms.`);

    setTimeout(async () => {
      try {
        // 模拟或实际执行webhook处理
        await this.processWebhookWithRetry(paymentId, webhookData);
        await this.redis.del(retryKey);
      } catch (error) {
        console.error(`Retry attempt ${attempt} failed for payment ${paymentId}:`, error);
        // 下次重试将由递增的attempt触发
      }
    }, delay);
  }

  private async processWebhookWithRetry(paymentId: string, webhookData: any): Promise<void> {
    console.log(`Processing webhook for payment ${paymentId}:`, webhookData);
    // 实际业务逻辑：更新订单、发货等
    await prisma.payment.update({
      where: { id: paymentId },
      data: {
        metadata: { ...webhookData, processedAt: new Date().toISOString() },
      },
    });
  }

  // 启动定时任务
  startScheduledTasks(): void {
    // 每5分钟检查一次过期支付
    setInterval(async () => {
      try {
        await this.expirePendingPayments();
      } catch (error) {
        console.error('Error in expirePendingPayments task:', error);
      }
    }, 5 * 60 * 1000); // 5分钟

    console.log('Payment state scheduled tasks started.');
  }
}