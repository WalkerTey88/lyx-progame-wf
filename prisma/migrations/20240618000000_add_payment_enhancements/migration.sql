-- 完整的支付模块增强SQL迁移脚本

-- 1. 为现有payments表添加缺失的字段（如果不存在）
ALTER TABLE "payments" 
ADD COLUMN IF NOT EXISTS "expires_at" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "channel_details" JSONB,
ADD COLUMN IF NOT EXISTS "failure_reason" TEXT,
ADD COLUMN IF NOT EXISTS "retry_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS "next_retry_at" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "reconciled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS "reconciliation_id" TEXT,
ADD COLUMN IF NOT EXISTS "tax_amount" DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS "tax_rate" DECIMAL(5,2);

-- 2. 创建支付渠道路由日志表
CREATE TABLE IF NOT EXISTS "payment_routing_logs" (
  "id" TEXT PRIMARY KEY,
  "booking_id" TEXT NOT NULL,
  "user_id" TEXT,
  "amount" DECIMAL(10,2) NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'MYR',
  "input_criteria" JSONB NOT NULL,
  "recommended_channel" TEXT NOT NULL,
  "selected_channel" TEXT NOT NULL,
  "reason" TEXT,
  "estimated_success_rate" DECIMAL(5,4),
  "actual_success" BOOLEAN,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 3. 创建对账批次表
CREATE TABLE IF NOT EXISTS "reconciliation_batches" (
  "id" TEXT PRIMARY KEY,
  "batch_date" DATE NOT NULL,
  "channel" TEXT NOT NULL,
  "file_url" TEXT,
  "total_count" INTEGER NOT NULL DEFAULT 0,
  "matched_count" INTEGER NOT NULL DEFAULT 0,
  "mismatch_count" INTEGER NOT NULL DEFAULT 0,
  "status" TEXT NOT NULL DEFAULT 'pending',
  "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "completed_at" TIMESTAMP(3),
  "error_message" TEXT
);

-- 4. 创建对账明细表
CREATE TABLE IF NOT EXISTS "reconciliation_details" (
  "id" TEXT PRIMARY KEY,
  "batch_id" TEXT NOT NULL REFERENCES "reconciliation_batches"("id") ON DELETE CASCADE,
  "external_id" TEXT,
  "payment_id" TEXT REFERENCES "payments"("id") ON DELETE SET NULL,
  "external_amount" DECIMAL(10,2) NOT NULL,
  "internal_amount" DECIMAL(10,2) NOT NULL,
  "transaction_date" TIMESTAMP(3) NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'pending',
  "discrepancy_type" TEXT,
  "discrepancy_reason" TEXT,
  "resolved" BOOLEAN NOT NULL DEFAULT false,
  "resolved_at" TIMESTAMP(3),
  "resolved_by" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 5. 创建支付重试队列表
CREATE TABLE IF NOT EXISTS "payment_retry_queue" (
  "id" TEXT PRIMARY KEY,
  "payment_id" TEXT NOT NULL REFERENCES "payments"("id") ON DELETE CASCADE,
  "webhook_data" JSONB NOT NULL,
  "attempt_number" INTEGER NOT NULL DEFAULT 1,
  "max_attempts" INTEGER NOT NULL DEFAULT 5,
  "scheduled_at" TIMESTAMP(3) NOT NULL,
  "last_attempt_at" TIMESTAMP(3),
  "last_error" TEXT,
  "status" TEXT NOT NULL DEFAULT 'pending',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 6. 创建税务配置表（用于马来西亚GST/SST）
CREATE TABLE IF NOT EXISTS "tax_configurations" (
  "id" TEXT PRIMARY KEY,
  "country" TEXT NOT NULL DEFAULT 'MY',
  "tax_type" TEXT NOT NULL, -- 'GST', 'SST'
  "rate" DECIMAL(5,2) NOT NULL,
  "effective_from" DATE NOT NULL,
  "effective_to" DATE,
  "description" TEXT,
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 7. 为关键字段添加索引以提高查询性能
CREATE INDEX IF NOT EXISTS "payments_expires_at_idx" ON "payments"("expires_at");
CREATE INDEX IF NOT EXISTS "payments_status_idx" ON "payments"("status");
CREATE INDEX IF NOT EXISTS "payments_channel_idx" ON "payments"("channel");
CREATE INDEX IF NOT EXISTS "payments_reconciled_idx" ON "payments"("reconciled");
CREATE INDEX IF NOT EXISTS "payment_routing_logs_booking_id_idx" ON "payment_routing_logs"("booking_id");
CREATE INDEX IF NOT EXISTS "payment_routing_logs_created_at_idx" ON "payment_routing_logs"("created_at");
CREATE INDEX IF NOT EXISTS "reconciliation_details_batch_id_idx" ON "reconciliation_details"("batch_id");
CREATE INDEX IF NOT EXISTS "reconciliation_details_external_id_idx" ON "reconciliation_details"("external_id");
CREATE INDEX IF NOT EXISTS "payment_retry_queue_scheduled_at_idx" ON "payment_retry_queue"("scheduled_at");
CREATE INDEX IF NOT EXISTS "payment_retry_queue_status_idx" ON "payment_retry_queue"("status");

-- 8. 插入马来西亚默认税务配置（示例）
INSERT INTO "tax_configurations" ("id", "country", "tax_type", "rate", "effective_from", "description")
VALUES 
  ('gst_my_2024', 'MY', 'GST', 6.00, '2024-01-01', 'Malaysia GST Standard Rate 2024'),
  ('sst_my_2024', 'MY', 'SST', 5.00, '2024-01-01', 'Malaysia SST Standard Rate 2024')
ON CONFLICT (id) DO NOTHING;

-- 9. 添加注释（PostgreSQL特有）
COMMENT ON TABLE "payment_routing_logs" IS 'Stores payment channel routing decisions for analysis and optimization.';
COMMENT ON TABLE "reconciliation_batches" IS 'Tracks daily automated reconciliation jobs with financial institutions.';
COMMENT ON TABLE "reconciliation_details" IS 'Detailed line items from reconciliation, showing matches and discrepancies.';
COMMENT ON TABLE "payment_retry_queue" IS 'Stores failed webhook callbacks for exponential backoff retry processing.';
COMMENT ON TABLE "tax_configurations" IS 'Configurable tax rates for different jurisdictions and tax types.';

-- 10. 创建用于自动过期支付的函数（PostgreSQL）
CREATE OR REPLACE FUNCTION expire_old_pending_payments()
RETURNS INTEGER AS $$
DECLARE
  expired_count INTEGER;
BEGIN
  UPDATE "payments"
  SET 
    status = 'expired',
    metadata = jsonb_set(
      COALESCE(metadata, '{}'::jsonb),
      '{expiredAt}',
      to_jsonb(NOW())
    )
  WHERE 
    status = 'pending' 
    AND expires_at < NOW()
    AND (metadata->>'expiredAt') IS NULL;
  
  GET DIAGNOSTICS expired_count = ROW_COUNT;
  RETURN expired_count;
END;
$$ LANGUAGE plpgsql;

-- 迁移完成提示
DO $$
BEGIN
  RAISE NOTICE 'Payment module database enhancements migration completed successfully.';
END $$;