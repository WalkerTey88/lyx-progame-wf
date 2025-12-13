-- Walter Farm: Add HitPay payments (FPX / TNG / DuitNow via HitPay checkout)
-- Safe-ish migration for Postgres (Neon / Vercel). Uses DO blocks to avoid duplicate_object errors.

-- 1) Extend existing BookingStatus enum
DO $$
BEGIN
  ALTER TYPE "BookingStatus" ADD VALUE 'PAYMENT_PENDING';
EXCEPTION WHEN duplicate_object THEN NULL;
END$$;

DO $$
BEGIN
  ALTER TYPE "BookingStatus" ADD VALUE 'PAYMENT_FAILED';
EXCEPTION WHEN duplicate_object THEN NULL;
END$$;

DO $$
BEGIN
  ALTER TYPE "BookingStatus" ADD VALUE 'EXPIRED';
EXCEPTION WHEN duplicate_object THEN NULL;
END$$;

-- 2) Create payment enums (if not exists)
DO $$
BEGIN
  CREATE TYPE "PaymentProvider" AS ENUM ('HITPAY');
EXCEPTION WHEN duplicate_object THEN NULL;
END$$;

DO $$
BEGIN
  CREATE TYPE "PaymentChannel" AS ENUM ('ONLINE', 'OFFLINE');
EXCEPTION WHEN duplicate_object THEN NULL;
END$$;

DO $$
BEGIN
  CREATE TYPE "PaymentStatus" AS ENUM ('CREATED', 'PENDING', 'COMPLETED', 'FAILED', 'EXPIRED', 'CANCELLED');
EXCEPTION WHEN duplicate_object THEN NULL;
END$$;

-- 3) Create Payment table
CREATE TABLE IF NOT EXISTS "Payment" (
  "id" TEXT NOT NULL,
  "bookingId" TEXT NOT NULL,
  "provider" "PaymentProvider" NOT NULL,
  "channel" "PaymentChannel" NOT NULL DEFAULT 'ONLINE',
  "status" "PaymentStatus" NOT NULL DEFAULT 'CREATED',
  "amount" INTEGER NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'MYR',
  "providerPaymentRequestId" TEXT NOT NULL,
  "providerPaymentId" TEXT,
  "checkoutUrl" TEXT,
  "idempotencyKey" TEXT,
  "rawCreateResponse" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- Uniques
CREATE UNIQUE INDEX IF NOT EXISTS "Payment_providerPaymentRequestId_key" ON "Payment"("providerPaymentRequestId");
CREATE UNIQUE INDEX IF NOT EXISTS "Payment_idempotencyKey_key" ON "Payment"("idempotencyKey");

-- Indexes
CREATE INDEX IF NOT EXISTS "Payment_bookingId_status_idx" ON "Payment"("bookingId","status");
CREATE INDEX IF NOT EXISTS "Payment_provider_providerPaymentRequestId_idx" ON "Payment"("provider","providerPaymentRequestId");

-- FK
DO $$
BEGIN
  ALTER TABLE "Payment"
    ADD CONSTRAINT "Payment_bookingId_fkey"
    FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END$$;

-- 4) Create PaymentEvent table
CREATE TABLE IF NOT EXISTS "PaymentEvent" (
  "id" TEXT NOT NULL,
  "provider" "PaymentProvider" NOT NULL,
  "providerPaymentRequestId" TEXT NOT NULL,
  "providerPaymentId" TEXT,
  "status" TEXT,
  "payloadHash" TEXT NOT NULL,
  "rawBody" TEXT NOT NULL,
  "parsed" JSONB,
  "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "paymentId" TEXT,
  CONSTRAINT "PaymentEvent_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "PaymentEvent_payloadHash_key" ON "PaymentEvent"("payloadHash");
CREATE INDEX IF NOT EXISTS "PaymentEvent_provider_providerPaymentRequestId_idx" ON "PaymentEvent"("provider","providerPaymentRequestId");
CREATE INDEX IF NOT EXISTS "PaymentEvent_receivedAt_idx" ON "PaymentEvent"("receivedAt");

DO $$
BEGIN
  ALTER TABLE "PaymentEvent"
    ADD CONSTRAINT "PaymentEvent_paymentId_fkey"
    FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END$$;
