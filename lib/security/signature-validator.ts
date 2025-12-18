import crypto from 'crypto';
import { createHmac } from 'crypto';

export class SignatureValidator {
  // 通用HMAC SHA256验证
  static verifyHMACSHA256(data: string, signature: string, secret: string): boolean {
    const expectedSignature = createHmac('sha256', secret)
      .update(data)
      .digest('hex');
    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature, 'hex'),
      Buffer.from(signature, 'hex')
    );
  }

  // FPX特定签名验证（已在FPX服务中实现，此为独立工具方法）
  static verifyFPXSignature(params: Record<string, string>, secretKey: string): boolean {
    const checkSum = params['fpx_checkSum'];
    if (!checkSum) return false;

    const fields = Object.keys(params)
      .filter(key => key !== 'fpx_checkSum' && params[key] !== '')
      .sort();

    const signingString = fields
      .map(key => `${key}=${params[key]}`)
      .join('|') + secretKey;

    const calculatedChecksum = crypto
      .createHash('sha256')
      .update(signingString)
      .digest('hex')
      .toUpperCase();

    return crypto.timingSafeEqual(
      Buffer.from(calculatedChecksum, 'hex'),
      Buffer.from(checkSum, 'hex')
    );
  }

  // 生成防篡改签名（用于前端提交金额验证）
  static generateTamperProofSignature(
    orderId: string,
    amount: number,
    currency: string,
    timestamp: number,
    secret: string
  ): string {
    const data = `${orderId}|${amount}|${currency}|${timestamp}`;
    return createHmac('sha256', secret)
      .update(data)
      .digest('hex');
  }

  // 验证防篡改签名
  static verifyTamperProofSignature(
    orderId: string,
    amount: number,
    currency: string,
    timestamp: number,
    receivedSignature: string,
    secret: string,
    toleranceMs: number = 5 * 60 * 1000 // 默认5分钟有效期
  ): boolean {
    // 检查时间戳是否在有效期内
    const now = Date.now();
    if (Math.abs(now - timestamp) > toleranceMs) {
      console.error('Signature timestamp expired or invalid.');
      return false;
    }

    const expectedSignature = this.generateTamperProofSignature(
      orderId,
      amount,
      currency,
      timestamp,
      secret
    );

    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature, 'hex'),
      Buffer.from(receivedSignature, 'hex')
    );
  }

  // 验证TNG回调签名
  static verifyTNGSignature(
    payload: any,
    signatureHeader: string,
    publicKey: string
  ): boolean {
    // TNG通常使用RSA签名
    const verifier = crypto.createVerify('SHA256');
    verifier.update(JSON.stringify(payload));
    return verifier.verify(publicKey, signatureHeader, 'base64');
  }

  // 验证DuitNow回调
  static verifyDuitNowSignature(
    queryString: string,
    signature: string,
    apiKey: string
  ): boolean {
    const expectedSignature = createHmac('sha512', apiKey)
      .update(queryString)
      .digest('hex');
    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature, 'hex'),
      Buffer.from(signature, 'hex')
    );
  }
}