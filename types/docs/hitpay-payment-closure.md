# HitPay Payment Closure (FPX + Touch 'n Go + DuitNow)

This project integrates **HitPay Payment Request API** to support Malaysia-friendly payment methods (shown in HitPay checkout based on your dashboard configuration).

## Booking State Machine Rules

### BookingStatus
- `PENDING`: booking created, payment not started (rare; normally we immediately create HitPay payment request)
- `PAYMENT_PENDING`: payment request created; waiting for webhook confirmation
- `PAID`: payment confirmed by webhook (source of truth)
- `PAYMENT_FAILED`: webhook reported failed/canceled
- `EXPIRED`: webhook reported expired
- `CANCELLED`: booking cancelled by admin
- `COMPLETED`: stay completed by admin

### Transitions (source of truth)
- `PENDING` -> `PAYMENT_PENDING`: when creating a HitPay payment request
- `PAYMENT_PENDING` -> `PAID`: when webhook status = `completed`
- `PAYMENT_PENDING` -> `PAYMENT_FAILED`: webhook status = `failed` / `canceled`
- `PAYMENT_PENDING` -> `EXPIRED`: webhook status = `expired`
- `PAYMENT_FAILED` / `EXPIRED` -> `PAYMENT_PENDING`: when user clicks “Pay again” (creates a new payment request)
- `PAID` -> `COMPLETED`: admin marks stay as completed
- Any -> `CANCELLED`: admin cancellation (does not delete record)

## API Routes

### Create booking + auto-create payment
- `POST /api/booking`
  - returns: `checkoutUrl` + `payment`

### Create HitPay payment request (manual / retry)
- `POST /api/payments/hitpay/create`
  - body: `{ "bookingId": "...", "idempotencyKey": "..." }`
  - returns: `{ data: { checkoutUrl, providerPaymentRequestId, ... } }`

### Payment status (polling)
- `GET /api/payments/hitpay/status?bookingId=...`
- `GET /api/payments/hitpay/status?bookingId=...&refresh=true` (server pulls latest from HitPay as fallback)

### Webhook (v1 form-urlencoded + HMAC using HITPAY_SALT)
- `POST /api/webhooks/hitpay`

## Idempotency / Replay Protection

- `PaymentEvent.payloadHash` is unique (sha256 of raw webhook body). This prevents double-processing the same webhook payload.
- `Payment.idempotencyKey` is unique. Booking flow uses `HP:{bookingId}` so duplicate calls do not create multiple active payments.

## Required Environment Variables

See `.env.example`. Minimum:
- `DATABASE_URL`
- `APP_BASE_URL` (or `NEXT_PUBLIC_SITE_URL`)
- `HITPAY_API_BASE_URL`
- `HITPAY_API_KEY`
- `HITPAY_SALT`

## Verification (Codespaces)

1) Install + generate:
```bash
npm ci
npx prisma generate
npx prisma migrate dev
npm run build
```

2) Run dev:
```bash
npm run dev
```

3) Create a booking from UI and ensure it redirects to HitPay checkout.

4) After payment, ensure webhook updates booking to `PAID`.
