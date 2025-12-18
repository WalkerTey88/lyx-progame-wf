#!/bin/bash

echo "=== 最终修复支付系统 ==="

# 1. 检查当前语法错误
echo "1. 检查当前文件..."
cat -n app/booking/pay/[bookingid]/page.tsx 25 25

# 修复第25行（如果还有问题）
LINE25=$(sed -n '25p' app/booking/pay/[bookingid]/page.tsx)
if [[ "$LINE25" != *"const currency ="* ]]; then
  echo "修复第25行..."
  sed -i '25c\  const currency = (process.env.BOOKING_CURRENCY || "MYR").toUpperCase();' app/booking/pay/[bookingid]/page.tsx
fi

# 2. 更新所有状态引用
echo "2. 更新状态引用..."
# 确保使用正确的状态值
sed -i 's/"COMPLETED"/"SUCCEEDED"/g' lib/payment-service.ts
sed -i 's/"CONFIRMED"/"PAID"/g' lib/payment-service.ts

# 3. 更新 PaymentService 中的类型定义
echo "3. 更新类型定义..."
cat > /tmp/fix-types.ts << 'TYPES_EOF'
// 临时修复脚本
import fs from 'fs';

const filePath = 'lib/payment-service.ts';
let content = fs.readFileSync(filePath, 'utf8');

// 更新 PrismaPaymentStatus 类型
content = content.replace(
  /export type PrismaPaymentStatus =[^;]+;/,
  `export type PrismaPaymentStatus = 
  | "PENDING"
  | "PROCESSING"
  | "SUCCEEDED"
  | "FAILED"
  | "CANCELED";`
);

// 更新状态映射
content = content.replace(
  /const statusMap: Record<string, PrismaPaymentStatus> = \{([^}]+)\}/s,
  `const statusMap: Record<string, PrismaPaymentStatus> = {
  'paid': 'SUCCEEDED',
  'unpaid': 'PENDING',
  'no_payment_required': 'SUCCEEDED',
}`
);

fs.writeFileSync(filePath, content);
console.log('类型定义已更新');
TYPES_EOF

npx tsx /tmp/fix-types.ts 2>/dev/null || echo "使用备用方法..."

# 4. 手动更新状态映射
echo "4. 手动更新状态映射..."
sed -i '/const statusMap:/,/}/d' lib/payment-service.ts
sed -i '/const mappedStatus =/a\
    \/\/ 映射 Stripe 状态到我们的状态\
    const statusMap: Record<string, PrismaPaymentStatus> = {\
      \"paid\": \"SUCCEEDED\",\
      \"unpaid\": \"PENDING\",\
      \"no_payment_required\": \"SUCCEEDED\",\
    };\
    const mappedStatus = stripePaymentStatus \
      ? (statusMap[stripePaymentStatus] || \"FAILED\")\
      : \"FAILED\";' lib/payment-service.ts

# 需要删除原有的 mappedStatus 定义
sed -i '/const mappedStatus = stripePaymentStatus/,/\"FAILED\"/d' lib/payment-service.ts

# 5. 运行检查
echo "5. 运行最终检查..."
npx tsc --noEmit 2>&1 | grep -c "error TS" > /tmp/error-count.txt
ERROR_COUNT=$(cat /tmp/error-count.txt)

if [ "$ERROR_COUNT" -eq "0" ]; then
  echo "✓ 所有 TypeScript 错误已修复！"
else
  echo "⚠ 还有 $ERROR_COUNT 个错误"
  npx tsc --noEmit 2>&1 | grep -E "error TS" | head -10
fi

echo "=== 修复完成 ==="
