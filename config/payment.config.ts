// 完整的支付模块配置
export const PaymentConfig = {
  // 基础配置
  defaultCurrency: 'MYR',
  supportedCurrencies: ['MYR', 'SGD', 'USD', 'EUR'] as const,

  // 超时与重试配置
  paymentTimeoutHours: 24,
  webhookRetryConfig: {
    maxAttempts: 5,
    initialDelayMs: 1000,
    backoffFactor: 2,
    maxDelayMs: 300000, // 5分钟
  },

  // 渠道特定配置
  channels: {
    stripe: {
      enabled: true,
      minAmount: 1,
      maxAmount: 1000000,
      allowedCountries: ['MY', 'SG', 'US', 'GB', 'AU'],
      webhookTolerance: 300, // 签名时间戳容差（秒）
    },
    fpx: {
      enabled: true,
      minAmount: 1,
      maxAmount: 30000, // B2C限额
      maxAmountB2B: 1000000, // B2B限额
      banksRefreshIntervalHours: 24,
      production: {
        baseUrl: 'https://www.mepsfpx.com.my/FPXMain',
        sellerId: process.env.FPX_MERCHANT_ID || 'YOUR_FPX_MERCHANT_ID',
      },
      sandbox: {
        baseUrl: 'https://uat.mepsfpx.com.my/FPXMain',
        sellerId: process.env.FPX_SANDBOX_MERCHANT_ID || 'TEST_MERCHANT_ID',
      },
    },
    tng: {
      enabled: true,
      minAmount: 0.01,
      maxAmount: 1000,
      appScheme: 'touchngo://payment',
      webUrl: 'https://payment.touchngo.com.my',
      lowBalanceThreshold: 10, // RM
    },
    duitnow: {
      enabled: true,
      minAmount: 1,
      maxAmount: 5000,
      qrExpiryMinutes: 10,
      proxyExpiryMinutes: 30,
      banks: ['ABB0233', 'ABMB0212', 'AMBB0209', 'BCBB0235', 'HLB0224', 'MB2U0227', 'PBB0233', 'RHB0218', 'UOB0226'],
    },
  },

  // 路由策略配置
  routing: {
    rules: [
      {
        condition: { maxAmount: 20, currency: 'MYR' },
        priority: ['tng', 'duitnow', 'fpx'],
        reason: '小额交易优化电子钱包',
      },
      {
        condition: { minAmount: 5001, currency: 'MYR' },
        priority: ['fpx'],
        reason: '大额交易使用FPX银行转账',
      },
      {
        condition: { businessType: 'B2B' },
        priority: ['fpx'],
        reason: 'B2B交易仅支持FPX',
      },
      {
        condition: { currency: { $ne: 'MYR' } },
        priority: ['stripe'],
        reason: '非令吉交易使用Stripe国际卡',
      },
    ],
    fallbackChannel: 'stripe',
  },

  // 安全配置
  security: {
    tamperProofSecret: process.env.TAMPER_PROOF_SECRET || 'change_this_in_production',
    signatureToleranceMs: 5 * 60 * 1000, // 5分钟
    concurrencyLockTtlSeconds: 15,
  },

  // 对账配置
  reconciliation: {
    schedule: '0 2 * * *', // 每天凌晨2点 (Cron表达式)
    retentionDays: 90,
    channels: ['fpx', 'tng', 'duitnow', 'stripe'] as const,
  },

  // 监控与告警
  monitoring: {
    successRateThreshold: 0.95, // 低于95%触发告警
    avgCallbackTimeThreshold: 5000, // 5秒
    webhookFailureThreshold: 10, // 连续失败次数
    alertEmails: process.env.PAYMENT_ALERT_EMAILS?.split(',') || [],
  },
} as const;

export type PaymentChannel = keyof typeof PaymentConfig.channels;
export type PaymentCurrency = typeof PaymentConfig.supportedCurrencies[number];