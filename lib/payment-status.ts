export enum PaymentStatus {
  PENDING = "pending",
  PROCESSING = "processing",
  SUCCESS = "succeeded",
  FAILED = "failed",
  EXPIRED = "expired",
  REFUNDED = "refunded",
  PARTIALLY_REFUNDED = "partially_refunded",
  CANCELLED = "cancelled",
}

export type PaymentStatusType = keyof typeof PaymentStatus;

export class PaymentStateMachine {
  private static validTransitions: Map<PaymentStatus, PaymentStatus[]> = new Map([
    [PaymentStatus.PENDING, [PaymentStatus.PROCESSING, PaymentStatus.EXPIRED, PaymentStatus.CANCELLED]],
    [PaymentStatus.PROCESSING, [PaymentStatus.SUCCESS, PaymentStatus.FAILED]],
    [PaymentStatus.SUCCESS, [PaymentStatus.REFUNDED, PaymentStatus.PARTIALLY_REFUNDED]],
    [PaymentStatus.FAILED, [PaymentStatus.PROCESSING]],
    [PaymentStatus.EXPIRED, []],
    [PaymentStatus.REFUNDED, []],
    [PaymentStatus.PARTIALLY_REFUNDED, [PaymentStatus.REFUNDED]],
    [PaymentStatus.CANCELLED, []],
  ]);

  static canTransition(from: PaymentStatus, to: PaymentStatus): boolean {
    const allowed = this.validTransitions.get(from);
    return allowed ? allowed.includes(to) : false;
  }

  static getAllowedTransitions(from: PaymentStatus): PaymentStatus[] {
    return this.validTransitions.get(from) || [];
  }
}