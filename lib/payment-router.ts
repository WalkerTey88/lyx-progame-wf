import { FPXBank, FPXPaymentService } from './payment-providers/fpx-service';

export interface PaymentRouteRequest {
  amount: number;
  currency: string;
  userId?: string;
  userHistory?: {
    successRates: Record<string, number>; // channel -> success rate
    lastUsedChannel?: string;
  };
  country: string;
  businessType?: 'B2C' | 'B2B';
}

export interface PaymentRouteResult {
  recommendedChannel: string;
  channelDetails: any;
  reason: string;
  estimatedSuccessRate: number;
}

export class PaymentRouter {
  private fpxService: FPXPaymentService;

  constructor() {
    this.fpxService = new FPXPaymentService();
  }

  async determineBestChannel(request: PaymentRouteRequest): Promise<PaymentRouteResult> {
    const { amount, currency, userId, userHistory, country, businessType } = request;

    // 规则1: 国家/货币锁定
    if (country !== 'MY' || currency !== 'MYR') {
      return {
        recommendedChannel: 'stripe',
        channelDetails: { type: 'international_card' },
        reason: 'Non-Malaysia transaction, default to Stripe for international cards.',
        estimatedSuccessRate: 0.85,
      };
    }

    // 规则2: 金额分段
    if (amount <= 20) {
      // 小额推荐TNG电子钱包
      return {
        recommendedChannel: 'tng',
        channelDetails: { type: 'ewallet', subType: 'touchngo' },
        reason: 'Small amount (< RM20) optimized for Touch \'n Go e-wallet.',
        estimatedSuccessRate: userHistory?.successRates['tng'] || 0.92,
      };
    } else if (amount <= 5000) {
      // 中等金额，根据用户历史成功率选择
      const candidateChannels = [
        { channel: 'fpx', baseRate: 0.95 },
        { channel: 'duitnow', baseRate: 0.93 },
        { channel: 'stripe', baseRate: 0.88 },
      ];

      const scoredChannels = candidateChannels.map(c => ({
        ...c,
        userRate: userHistory?.successRates[c.channel] || c.baseRate,
        finalScore: (userHistory?.successRates[c.channel] || c.baseRate) * this.getChannelHealth(c.channel),
      }));

      scoredChannels.sort((a, b) => b.finalScore - a.finalScore);
      const best = scoredChannels[0];

      return {
        recommendedChannel: best.channel,
        channelDetails: await this.getChannelDetails(best.channel, amount, businessType),
        reason: `Selected based on highest combined score (user history & system health).`,
        estimatedSuccessRate: best.finalScore,
      };
    } else {
      // 大金额，优先FPX B2B（如果适用）或可靠银行
      const banks = await this.fpxService.getBankList();
      const reliableBanks = banks.filter(b => b.status === 'online' && b.b2bSupported);
      const bestBank = reliableBanks[0] || banks[0];

      return {
        recommendedChannel: 'fpx',
        channelDetails: {
          type: 'online_banking',
          bankCode: bestBank.code,
          bankName: bestBank.name,
          transactionType: businessType === 'B2B' ? 'B2B' : 'B2C',
        },
        reason: `Large amount (> RM5000). Using reliable bank: ${bestBank.name}.`,
        estimatedSuccessRate: 0.97,
      };
    }
  }

  private getChannelHealth(channel: string): number {
    // 模拟从监控系统获取渠道健康度（1.0为完全健康）
    const healthMap: Record<string, number> = {
      'fpx': 0.99,
      'duitnow': 0.98,
      'tng': 0.96,
      'stripe': 0.99,
    };
    return healthMap[channel] || 0.95;
  }

  private async getChannelDetails(channel: string, amount: number, businessType?: string): Promise<any> {
    switch (channel) {
      case 'fpx':
        const banks = await this.fpxService.getBankList();
        const availableBanks = banks.filter(b => b.status === 'online');
        const supportsB2B = businessType === 'B2B' ? availableBanks.filter(b => b.b2bSupported) : availableBanks;
        return {
          availableBanks: supportsB2B,
          transactionLimit: businessType === 'B2B' ? 'No limit' : 'RM 30,000 per transaction',
          processingTime: 'Real-time',
        };
      case 'duitnow':
        return {
          types: ['QR', 'Proxy'],
          limit: 'RM 5,000 per day',
          processingTime: 'Instant',
        };
      case 'tng':
        return {
          types: ['App', 'Web', 'Direct Carrier Billing'],
          limit: 'RM 1,000 per transaction',
          processingTime: 'Instant',
          lowBalanceRedirect: true,
        };
      case 'stripe':
        return {
          cardNetworks: ['Visa', 'MasterCard', 'Amex'],
          limit: 'Depends on card',
          processingTime: '2-5 business days',
        };
      default:
        return {};
    }
  }
}