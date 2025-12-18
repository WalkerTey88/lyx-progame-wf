import crypto from 'crypto';
import axios from 'axios';

export interface FPXBank {
  code: string;
  name: string;
  status: 'online' | 'offline' | 'maintenance';
  b2bSupported: boolean;
}

export interface FPXPaymentRequest {
  bookingId: string;
  amount: number;
  customerEmail: string;
  customerName: string;
  bankCode: string;
  transactionType: 'B2C' | 'B2B';
  companyName?: string; // B2B专用
}

export interface FPXPaymentResponse {
  fpxTxnId: string;
  fpxSellerOrderNo: string;
  fpxTxnTime: string;
  fpxSellerExOrderNo: string;
  fpxTxnCurrency: string;
  fpxTxnAmount: string;
  fpxCheckSum: string;
  redirectUrl: string;
}

export class FPXPaymentService {
  private merchantId: string;
  private merchantAccount: string;
  private secretKey: string;
  private baseUrl: string;
  private bankList: FPXBank[] = [];
  private lastBankListUpdate: Date | null = null;

  constructor() {
    this.merchantId = process.env.FPX_MERCHANT_ID || 'YOUR_FPX_MERCHANT_ID';
    this.merchantAccount = process.env.FPX_MERCHANT_ACCOUNT || 'YOUR_FPX_ACCOUNT';
    this.secretKey = process.env.FPX_SECRET_KEY || 'YOUR_FPX_SECRET_KEY';
    this.baseUrl = process.env.NODE_ENV === 'production'
      ? 'https://www.mepsfpx.com.my/FPXMain/sellerPspApplication.jsp'
      : 'https://uat.mepsfpx.com.my/FPXMain/sellerPspApplication.jsp';
  }

  // 1. 银行列表动态获取（带缓存）
  async getBankList(forceRefresh = false): Promise<FPXBank[]> {
    const cacheDuration = 24 * 60 * 60 * 1000; // 24小时
    if (!forceRefresh && this.lastBankListUpdate &&
      (Date.now() - this.lastBankListUpdate.getTime()) < cacheDuration && this.bankList.length > 0) {
      return this.bankList;
    }

    // 模拟从FPX API或配置获取银行列表
    this.bankList = [
      { code: 'ABB0233', name: 'Affin Bank', status: 'online', b2bSupported: true },
      { code: 'ABMB0212', name: 'Alliance Bank', status: 'online', b2bSupported: true },
      { code: 'AGRO01', name: 'Agro Bank', status: 'online', b2bSupported: false },
      { code: 'AMBB0209', name: 'AmBank', status: 'online', b2bSupported: true },
      { code: 'BIMB0340', name: 'Bank Islam', status: 'online', b2bSupported: true },
      { code: 'BMMB0341', name: 'Bank Muamalat', status: 'online', b2bSupported: true },
      { code: 'BKRM0602', name: 'Bank Rakyat', status: 'online', b2bSupported: true },
      { code: 'BSN0601', name: 'BSN', status: 'online', b2bSupported: false },
      { code: 'BCBB0235', name: 'CIMB Clicks', status: 'online', b2bSupported: true },
      { code: 'HLB0224', name: 'Hong Leong Bank', status: 'online', b2bSupported: true },
      { code: 'HSBC0223', name: 'HSBC Bank', status: 'online', b2bSupported: true },
      { code: 'KFH0346', name: 'Kuwait Finance House', status: 'online', b2bSupported: true },
      { code: 'MB2U0227', name: 'Maybank2u', status: 'online', b2bSupported: true },
      { code: 'OCBC0229', name: 'OCBC Bank', status: 'online', b2bSupported: true },
      { code: 'PBB0233', name: 'Public Bank', status: 'online', b2bSupported: true },
      { code: 'RHB0218', name: 'RHB Bank', status: 'online', b2bSupported: true },
      { code: 'SCB0216', name: 'Standard Chartered', status: 'online', b2bSupported: true },
      { code: 'UOB0226', name: 'UOB Bank', status: 'online', b2bSupported: true },
    ];

    this.lastBankListUpdate = new Date();
    console.log(`FPX bank list updated. Total banks: ${this.bankList.length}`);
    return this.bankList;
  }

  // 2. 请求生成和签名
  async createPayment(request: FPXPaymentRequest): Promise<FPXPaymentResponse> {
    const banks = await this.getBankList();
    const selectedBank = banks.find(b => b.code === request.bankCode);
    if (!selectedBank) {
      throw new Error(`Invalid FPX bank code: ${request.bankCode}`);
    }
    if (request.transactionType === 'B2B' && !selectedBank.b2bSupported) {
      throw new Error(`Bank ${selectedBank.name} does not support B2B transactions.`);
    }

    const fpxSellerOrderNo = `WF${Date.now()}${Math.random().toString(36).substr(2, 5)}`.toUpperCase();
    const fpxTxnTime = new Date().toISOString().replace(/[-:T]/g, '').split('.')[0] + '00';
    const fpxTxnAmount = request.amount.toFixed(2);
    const fpxTxnCurrency = 'MYR';
    const fpxSellerExOrderNo = request.bookingId;
    const fpxSellerId = this.merchantId;
    const fpxSellerBankCode = request.bankCode;
    const fpxProductDesc = `Payment for Booking #${request.bookingId}`;
    const fpxTxnType = request.transactionType; // B2C or B2B
    const fpxB2BCustomerName = request.transactionType === 'B2B' ? request.companyName : '';

    // 生成签名
    const signatureString = [
      fpxSellerBankCode,
      fpxSellerExOrderNo,
      fpxSellerId,
      fpxSellerOrderNo,
      fpxTxnAmount,
      fpxTxnCurrency,
      fpxTxnTime,
      this.secretKey,
    ].join('');

    const fpxCheckSum = crypto.createHash('sha256').update(signatureString).digest('hex').toUpperCase();

    const response: FPXPaymentResponse = {
      fpxTxnId: '', // 由FPX返回
      fpxSellerOrderNo,
      fpxTxnTime,
      fpxSellerExOrderNo,
      fpxTxnCurrency,
      fpxTxnAmount,
      fpxCheckSum,
      redirectUrl: `${this.baseUrl}?` + new URLSearchParams({
        fpx_sellerBankCode: fpxSellerBankCode,
        fpx_sellerExOrderNo: fpxSellerExOrderNo,
        fpx_sellerId: fpxSellerId,
        fpx_sellerOrderNo: fpxSellerOrderNo,
        fpx_txnAmount: fpxTxnAmount,
        fpx_txnCurrency: fpxTxnCurrency,
        fpx_txnTime: fpxTxnTime,
        fpx_productDesc: fpxProductDesc,
        fpx_txnType: fpxTxnType,
        fpx_b2bCustomerName: fpxB2BCustomerName,
        fpx_checkSum: fpxCheckSum,
      }).toString(),
    };

    console.log(`FPX payment created for booking ${request.bookingId}. Order: ${fpxSellerOrderNo}`);
    return response;
  }

  // 3. 回调验证（完整SHA2签名验证）
  verifyCallbackSignature(queryParams: Record<string, string>): boolean {
    const requiredFields = [
      'fpx_bankId',
      'fpx_checkSum',
      'fpx_creditAuthCode',
      'fpx_debitAuthCode',
      'fpx_fpxTxnId',
      'fpx_makerName',
      'fpx_msgToken',
      'fpx_msgType',
      'fpx_sellerExOrderNo',
      'fpx_sellerId',
      'fpx_sellerOrderNo',
      'fpx_txnAmount',
      'fpx_txnCurrency',
      'fpx_txnTime',
    ];

    for (const field of requiredFields) {
      if (!queryParams[field] || queryParams[field].trim() === '') {
        console.error(`Missing required field in FPX callback: ${field}`);
        return false;
      }
    }

    const receivedChecksum = queryParams['fpx_checkSum'];
    const fieldsForSigning = requiredFields.filter(f => f !== 'fpx_checkSum');

    const sortedValues = fieldsForSigning
      .map(field => `${field}=${queryParams[field]}`)
      .sort()
      .join('|');

    const signingString = `${sortedValues}${this.secretKey}`;
    const calculatedChecksum = crypto.createHash('sha256').update(signingString).digest('hex').toUpperCase();

    const isValid = crypto.timingSafeEqual(
      Buffer.from(calculatedChecksum, 'hex'),
      Buffer.from(receivedChecksum, 'hex')
    );

    if (!isValid) {
      console.error('FPX callback signature verification FAILED.');
    } else {
      console.log('FPX callback signature verification SUCCESS.');
    }
    return isValid;
  }

  // 4. 处理B2B/B2C回调差异
  async processCallback(queryParams: Record<string, string>): Promise<void> {
    const isValid = this.verifyCallbackSignature(queryParams);
    if (!isValid) {
      throw new Error('Invalid FPX callback signature.');
    }

    const sellerOrderNo = queryParams['fpx_sellerOrderNo'];
    const fpxTxnId = queryParams['fpx_fpxTxnId'];
    const txnAmount = queryParams['fpx_txnAmount'];
    const msgType = queryParams['fpx_msgType']; // AE - Success, CE - Failed
    const txnTime = queryParams['fpx_txnTime'];
    const bankId = queryParams['fpx_bankId'];

    const isB2B = bankId.includes('B2B');
    const paymentStatus = msgType === 'AE' ? 'succeeded' : 'failed';

    console.log(`FPX Callback Processed:
      Order: ${sellerOrderNo}
      FPX Txn ID: ${fpxTxnId}
      Amount: ${txnAmount}
      Status: ${paymentStatus}
      Type: ${isB2B ? 'B2B' : 'B2C'}
      Time: ${txnTime}
    `);

    // 此处应更新数据库中的支付状态，关联原始订单
    // await prisma.payment.update({...});
  }
}