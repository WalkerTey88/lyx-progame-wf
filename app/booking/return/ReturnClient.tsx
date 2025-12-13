"use client";

// app/booking/return/ReturnClient.tsx
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";

type BookingStatus =
  | "PENDING"
  | "PAYMENT_PENDING"
  | "PAID"
  | "PAYMENT_FAILED"
  | "EXPIRED"
  | "CANCELLED"
  | "COMPLETED"
  | "UNKNOWN";

function isFinalStatus(s: BookingStatus) {
  return (
    s === "PAID" ||
    s === "COMPLETED" ||
    s === "PAYMENT_FAILED" ||
    s === "EXPIRED" ||
    s === "CANCELLED"
  );
}

export default function ReturnClient() {
  const searchParams = useSearchParams();

  const bookingId = useMemo(() => {
    const v = searchParams.get("bookingId");
    return v ? String(v) : null;
  }, [searchParams]);

  const [status, setStatus] = useState<BookingStatus>("UNKNOWN");
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const timerRef = useRef<number | null>(null);
  const stopRef = useRef<boolean>(false);

  useEffect(() => {
    stopRef.current = false;

    if (!bookingId) {
      setLoading(false);
      setStatus("UNKNOWN");
      setErrorMsg("URL 缺少 bookingId。请从支付链接回跳，或手动带上 bookingId。");
      return;
    }

    const fetchStatusOnce = async (): Promise<BookingStatus> => {
      const res = await fetch(`/api/booking?id=${encodeURIComponent(bookingId)}`, {
        cache: "no-store",
      });

      const json = await res.json().catch(() => null);

      if (!res.ok) {
        const msg =
          (json && (json.error || json.message)) || `Request failed: ${res.status}`;
        throw new Error(msg);
      }

      const s = (json?.data?.status ? String(json.data.status) : "UNKNOWN") as BookingStatus;
      return s;
    };

    const startPolling = async () => {
      setLoading(true);
      setErrorMsg(null);

      try {
        const first = await fetchStatusOnce();
        setStatus(first);
        setLoading(false);

        if (isFinalStatus(first)) return;

        let attempts = 0;
        const maxAttempts = 30; // 60 秒

        const tick = async () => {
          if (stopRef.current) return;

          attempts += 1;

          try {
            const next = await fetchStatusOnce();
            setStatus(next);

            if (isFinalStatus(next)) return;

            if (attempts >= maxAttempts) {
              setErrorMsg("状态确认超时：Webhook 可能未到达或仍在排队。请稍后刷新。");
              return;
            }

            timerRef.current = window.setTimeout(tick, 2000);
          } catch (e: any) {
            setErrorMsg(e?.message || "Failed to fetch booking status.");
            if (attempts < maxAttempts) {
              timerRef.current = window.setTimeout(tick, 2000);
            }
          }
        };

        timerRef.current = window.setTimeout(tick, 2000);
      } catch (e: any) {
        setLoading(false);
        setStatus("UNKNOWN");
        setErrorMsg(e?.message || "Failed to fetch booking status.");
      }
    };

    startPolling();

    return () => {
      stopRef.current = true;
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [bookingId]);

  const copyLink = async () => {
    try {
      const url = bookingId
        ? `${window.location.origin}/booking/return?bookingId=${encodeURIComponent(bookingId)}`
        : window.location.href;
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore
    }
  };

  const renderStatus = () => {
    if (loading) return <p>正在加载订单状态...</p>;
    if (!bookingId) return <p>无效的订单编号。</p>;

    if (errorMsg) {
      return <p className="text-red-600 font-semibold">❌ {errorMsg}</p>;
    }

    switch (status) {
      case "PAID":
      case "COMPLETED":
        return (
          <p className="text-green-600 font-semibold">
            ✅ 付款成功。订单已确认（以 webhook 为准）。
          </p>
        );
      case "PAYMENT_PENDING":
      case "PENDING":
        return (
          <div className="space-y-2">
            <p className="text-yellow-600 font-semibold">
              ⏳ 正在确认付款（等待 webhook 同步），请稍候。
            </p>
            <p className="text-xs text-gray-500">
              说明：即使你“付款成功”，也可能出现“支付页不自动回跳”。这种情况下请回到这里手动刷新。
            </p>
          </div>
        );
      case "PAYMENT_FAILED":
      case "CANCELLED":
      case "EXPIRED":
        return (
          <p className="text-red-600 font-semibold">
            ❌ 付款失败/已取消/已过期。请重新发起预订或联系客服处理。
          </p>
        );
      default:
        return (
          <p className="text-gray-600 font-semibold">
            无法获取订单状态，请联系客户服务。
          </p>
        );
    }
  };

  return (
    <div className="max-w-xl mx-auto py-12 px-4 text-center">
      <h1 className="text-2xl font-bold mb-6">订单支付结果</h1>

      {renderStatus()}

      {bookingId && (
        <p className="mt-3 text-sm text-gray-500">
          Booking ID: <span className="font-mono">{bookingId}</span>
        </p>
      )}

      <div className="mt-6 flex flex-col items-center justify-center gap-3">
        <div className="flex items-center justify-center gap-4">
          <Link href="/" className="text-blue-600 underline">
            返回首页
          </Link>

          {bookingId && (
            <button className="text-blue-600 underline" onClick={() => window.location.reload()}>
              手动刷新
            </button>
          )}
        </div>

        {bookingId && (
          <button className="text-xs text-gray-600 underline" onClick={copyLink} type="button">
            {copied ? "已复制链接" : "复制这个结果页链接（用于：支付页不回跳时手动打开）"}
          </button>
        )}
      </div>
    </div>
  );
}