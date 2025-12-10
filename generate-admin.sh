#!/usr/bin/env bash
# 一键生成 Walter Farm Admin 前端 TSX 文件
# 生成路径：./walter-farm-v2/app/admin/...

set -e

ROOT="walter-farm-v2"

echo ">>> 创建目录结构：$ROOT/app/admin/..."
mkdir -p "$ROOT/app/admin/login"
mkdir -p "$ROOT/app/admin/dashboard"
mkdir -p "$ROOT/app/admin/rooms/[id]/edit"
mkdir -p "$ROOT/app/admin/rooms/[id]/calendar"
mkdir -p "$ROOT/app/admin/rooms"
mkdir -p "$ROOT/app/admin/bookings"

########################################
# 1. app/admin/login/page.tsx
########################################
cat <<'EOF' > "$ROOT/app/admin/login/page.tsx"
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      if (!res.ok) {
        setError("Invalid credentials. 帐号或密码错误。");
      } else {
        router.push("/admin/dashboard");
      }
    } catch (err: any) {
      setError(err.message ?? "Login failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-sm space-y-4">
      <h1 className="text-2xl font-bold">Admin Login 后台登录</h1>
      <form
        onSubmit={onSubmit}
        className="bg-white border rounded-xl p-4 shadow-sm space-y-3"
      >
        <div>
          <label className="block text-xs font-medium mb-1">Email 帐号</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={onChange}
            className="w-full border rounded-md px-2 py-1 text-sm"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">
            Password 密码
          </label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={onChange}
            className="w-full border rounded-md px-2 py-1 text-sm"
            required
          />
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="mt-2 inline-flex items-center justify-center px-4 py-2 rounded-md bg-slate-900 text-white text-sm disabled:opacity-60"
        >
          {submitting ? "Logging in 登录中..." : "Login 登录"}
        </button>
        {error && <div className="text-xs text-red-600 mt-2">{error}</div>}
      </form>
      <p className="text-xs text-slate-600">
        默认管理员帐号和密码来自数据库 AdminUser（通过 Prisma seed 生成）。
      </p>
    </div>
  );
}
EOF

########################################
# 2. app/admin/dashboard/page.tsx
########################################
cat <<'EOF' > "$ROOT/app/admin/dashboard/page.tsx"
"use client";

import useSWR from "swr";
import type { ApiListResponse, Booking, Room } from "@/types/walter";
import { apiGet } from "@/lib/api";
import { useRouter } from "next/navigation";

const fetchRooms = () => apiGet<ApiListResponse<Room>>("/api/rooms");
const fetchBookings = () => apiGet<ApiListResponse<Booking>>("/api/bookings");

export default function AdminDashboardPage() {
  const router = useRouter();
  const { data: roomsData } = useSWR("/api/rooms", fetchRooms);
  const { data: bookingsData } = useSWR("/api/bookings", fetchBookings);

  const rooms = roomsData?.data ?? [];
  const bookings = bookingsData?.data ?? [];

  const totalRevenue = bookings.reduce((sum, b) => {
    if (b.paymentStatus === "PAID") return sum + b.amount;
    return sum;
  }, 0);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Admin Dashboard 后台总览</h1>
        <button
          type="button"
          className="text-xs underline"
          onClick={async () => {
            await fetch("/api/auth/logout", { method: "POST" });
            router.push("/admin/login");
          }}
        >
          Logout 退出
        </button>
      </div>

      <section className="grid gap-4 md:grid-cols-4">
        <div className="bg-white border rounded-xl p-4 shadow-sm">
          <div className="text-xs text-slate-500 mb-1">Rooms 房型数量</div>
          <div className="text-2xl font-semibold">{rooms.length}</div>
        </div>
        <div className="bg-white border rounded-xl p-4 shadow-sm">
          <div className="text-xs text-slate-500 mb-1">Bookings 总预订</div>
          <div className="text-2xl font-semibold">{bookings.length}</div>
        </div>
        <div className="bg-white border rounded-xl p-4 shadow-sm">
          <div className="text-xs text-slate-500 mb-1">
            Paid Revenue 已支付收入 (RM)
          </div>
          <div className="text-2xl font-semibold">RM {totalRevenue}</div>
        </div>
        <div className="bg-white border rounded-xl p-4 shadow-sm text-xs">
          <div className="font-semibold mb-1">快捷入口</div>
          <div className="flex flex-col gap-1">
            <button
              type="button"
              className="underline text-left"
              onClick={() => router.push("/admin/rooms")}
            >
              管理房型 / Manage Rooms
            </button>
            <button
              type="button"
              className="underline text-left"
              onClick={() => router.push("/admin/bookings")}
            >
              管理预订 / Manage Bookings
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
EOF

########################################
# 3. app/admin/rooms/page.tsx
########################################
cat <<'EOF' > "$ROOT/app/admin/rooms/page.tsx"
"use client";

import { useState } from "react";
import useSWR from "swr";
import type { ApiListResponse, Room } from "@/types/walter";
import { apiGet } from "@/lib/api";
import { useRouter } from "next/navigation";

const fetchRooms = () => apiGet<ApiListResponse<Room>>("/api/admin/rooms");

export default function AdminRoomsPage() {
  const router = useRouter();
  const { data, mutate } = useSWR("/api/admin/rooms", fetchRooms);
  const rooms = data?.data ?? [];
  const [creating, setCreating] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    pricePerNight: 0,
    capacity: 2,
    bedType: "",
    totalUnits: 1
  });

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]:
        name === "pricePerNight" || name === "capacity" || name === "totalUnits"
          ? Number(value)
          : value
    }));
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!file) return null;
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
    if (!res.ok) throw new Error("Upload failed");
    const json = await res.json();
    return json.url as string;
  };

  const onCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      let imageUrl: string | null = null;
      if (file) imageUrl = await uploadImage();
      const res = await fetch("/api/admin/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, imageUrl })
      });
      if (!res.ok) throw new Error("Create room failed");
      setForm({
        name: "",
        slug: "",
        description: "",
        pricePerNight: 0,
        capacity: 2,
        bedType: "",
        totalUnits: 1
      });
      setFile(null);
      await mutate();
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  const onDelete = async (id: number) => {
    if (!confirm("确认删除房型？相关预订也会被删除。")) return;
    await fetch(`/api/admin/rooms/${id}`, { method: "DELETE" });
    await mutate();
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Manage Rooms 管理房型</h1>

      <form
        onSubmit={onCreate}
        className="bg-white border rounded-xl p-4 shadow-sm space-y-3"
      >
        <div className="font-semibold text-sm">新增房型</div>
        <div className="grid md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium mb-1">Name 名称</label>
            <input
              name="name"
              value={form.name}
              onChange={onChange}
              className="w-full border rounded-md px-2 py-1 text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Slug</label>
            <input
              name="slug"
              value={form.slug}
              onChange={onChange}
              className="w-full border rounded-md px-2 py-1 text-sm"
              required
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">Description 描述</label>
          <textarea
            name="description"
            value={form.description}
            onChange={onChange}
            className="w-full border rounded-md px-2 py-1 text-sm"
            rows={3}
            required
          />
        </div>
        <div className="grid md:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium mb-1">Price/Night</label>
            <input
              type="number"
              name="pricePerNight"
              value={form.pricePerNight}
              onChange={onChange}
              className="w-full border rounded-md px-2 py-1 text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Capacity 人数</label>
            <input
              type="number"
              name="capacity"
              value={form.capacity}
              onChange={onChange}
              className="w-full border rounded-md px-2 py-1 text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Total Units 间数</label>
            <input
              type="number"
              name="totalUnits"
              value={form.totalUnits}
              onChange={onChange}
              className="w-full border rounded-md px-2 py-1 text-sm"
              required
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">Bed Type 床型</label>
          <input
            name="bedType"
            value={form.bedType}
            onChange={onChange}
            className="w-full border rounded-md px-2 py-1 text-sm"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">Image 图片</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="text-xs"
          />
        </div>
        <button
          type="submit"
          disabled={creating}
          className="inline-flex items-center justify-center px-4 py-2 rounded-md bg-slate-900 text-white text-sm disabled:opacity-60"
        >
          {creating ? "Creating..." : "Create 新增"}
        </button>
      </form>

      <section className="bg-white border rounded-xl p-4 shadow-sm space-y-3">
        <div className="font-semibold text-sm">房型列表</div>
        <div className="space-y-2">
          {rooms.map((room) => (
            <div
              key={room.id}
              className="border rounded-lg p-3 flex flex-col md:flex-row md:items-center justify-between gap-2"
            >
              <div>
                <div className="font-semibold">
                  {room.name} (RM {room.pricePerNight}/night)
                </div>
                <div className="text-xs text-slate-600">
                  {room.capacity} pax · {room.bedType} · {room.totalUnits} units
                </div>
              </div>
              <div className="flex gap-2 text-xs">
                <button
                  type="button"
                  className="px-2 py-1 border rounded-md"
                  onClick={() => router.push(`/admin/rooms/${room.id}/edit`)}
                >
                  Edit 编辑
                </button>
                <button
                  type="button"
                  className="px-2 py-1 border rounded-md"
                  onClick={() => router.push(`/admin/rooms/${room.id}/calendar`)}
                >
                  Calendar 房态
                </button>
                <button
                  type="button"
                  className="px-2 py-1 border rounded-md text-red-600"
                  onClick={() => onDelete(room.id)}
                >
                  Delete 删除
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
EOF

########################################
# 4. app/admin/rooms/[id]/edit/page.tsx
########################################
cat <<'EOF' > "$ROOT/app/admin/rooms/[id]/edit/page.tsx"
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import type { ApiItemResponse, Room } from "@/types/walter";

export default function AdminRoomEditPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    pricePerNight: 0,
    capacity: 2,
    bedType: "",
    totalUnits: 1,
    imageUrl: ""
  });

  useEffect(() => {
    const load = async () => {
      const res = await fetch(`/api/rooms/${id}`);
      const json = (await res.json()) as ApiItemResponse<Room>;
      setRoom(json.data);
      setForm({
        name: json.data.name,
        slug: json.data.slug,
        description: json.data.description,
        pricePerNight: json.data.pricePerNight,
        capacity: json.data.capacity,
        bedType: json.data.bedType,
        totalUnits: json.data.totalUnits,
        imageUrl: json.data.imageUrl ?? ""
      });
      setLoading(false);
    };
    load();
  }, [id]);

  const onChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]:
        name === "pricePerNight" || name === "capacity" || name === "totalUnits"
          ? Number(value)
          : value
    }));
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!file) return form.imageUrl || null;
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
    if (!res.ok) throw new Error("Upload failed");
    const json = await res.json();
    return json.url as string;
  };

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    let imageUrl: string | null = await uploadImage();
    const res = await fetch(`/api/admin/rooms/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, imageUrl })
    });
    if (!res.ok) {
      alert("Update failed");
      return;
    }
    router.push("/admin/rooms");
  };

  if (loading || !room) return <div>Loading...</div>;

  return (
    <div className="space-y-4 max-w-xl">
      <h1 className="text-2xl font-bold">Edit Room 编辑房型</h1>
      <form
        onSubmit={onSave}
        className="bg-white border rounded-xl p-4 shadow-sm space-y-3"
      >
        <div className="grid md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium mb-1">Name 名称</label>
            <input
              name="name"
              value={form.name}
              onChange={onChange}
              className="w-full border rounded-md px-2 py-1 text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Slug</label>
            <input
              name="slug"
              value={form.slug}
              onChange={onChange}
              className="w-full border rounded-md px-2 py-1 text-sm"
              required
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">Description 描述</label>
          <textarea
            name="description"
            value={form.description}
            onChange={onChange}
            className="w-full border rounded-md px-2 py-1 text-sm"
            rows={3}
            required
          />
        </div>
        <div className="grid md:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium mb-1">Price/Night</label>
            <input
              type="number"
              name="pricePerNight"
              value={form.pricePerNight}
              onChange={onChange}
              className="w-full border rounded-md px-2 py-1 text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Capacity 人数</label>
            <input
              type="number"
              name="capacity"
              value={form.capacity}
              onChange={onChange}
              className="w-full border rounded-md px-2 py-1 text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Total Units 间数</label>
            <input
              type="number"
              name="totalUnits"
              value={form.totalUnits}
              onChange={onChange}
              className="w-full border rounded-md px-2 py-1 text-sm"
              required
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">Bed Type 床型</label>
          <input
            name="bedType"
            value={form.bedType}
            onChange={onChange}
            className="w-full border rounded-md px-2 py-1 text-sm"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">Image 图片</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="text-xs"
          />
          {form.imageUrl && (
            <img
              src={form.imageUrl}
              alt="room"
              className="mt-2 max-h-40 rounded-md border"
            />
          )}
        </div>
        <button
          type="submit"
          className="inline-flex items-center justify-center px-4 py-2 rounded-md bg-slate-900 text-white text-sm"
        >
          Save 保存
        </button>
      </form>
    </div>
  );
}
EOF

########################################
# 5. app/admin/rooms/[id]/calendar/page.tsx
########################################
cat <<'EOF' > "$ROOT/app/admin/rooms/[id]/calendar/page.tsx"
"use client";

import { useParams } from "next/navigation";
import { AvailabilityCalendar } from "@/components/AvailabilityCalendar";

export default function AdminRoomCalendarPage() {
  const params = useParams();
  const id = Number(params.id);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Room Calendar 房态日历</h1>
      <AvailabilityCalendar roomId={id} />
    </div>
  );
}
EOF

########################################
# 6. app/admin/bookings/page.tsx
########################################
cat <<'EOF' > "$ROOT/app/admin/bookings/page.tsx"
"use client";

import useSWR from "swr";
import type { ApiListResponse, Booking, Room } from "@/types/walter";
import { apiGet } from "@/lib/api";

const fetchBookings = () => apiGet<ApiListResponse<Booking>>("/api/bookings");
const fetchRooms = () => apiGet<ApiListResponse<Room>>("/api/rooms");

export default function AdminBookingsPage() {
  const { data: bookingsData, mutate } = useSWR("/api/bookings", fetchBookings);
  const { data: roomsData } = useSWR("/api/rooms", fetchRooms);

  const bookings = bookingsData?.data ?? [];
  const rooms = roomsData?.data ?? [];
  const roomMap = new Map(rooms.map((r) => [r.id, r.name]));

  const onUpdateStatus = async (
    id: number,
    status: string,
    paymentStatus?: string
  ) => {
    await fetch(`/api/admin/bookings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, paymentStatus })
    });
    await mutate();
  };

  const onRefund = async (id: number) => {
    if (!confirm("确认执行退款并取消订单？")) return;
    const res = await fetch(`/api/admin/bookings/${id}?action=refund`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({})
    });
    if (!res.ok) {
      alert("Refund failed");
      return;
    }
    await mutate();
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Manage Bookings 管理预订</h1>
      <div className="bg-white border rounded-xl p-4 shadow-sm">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b">
              <th className="py-2 text-left">ID</th>
              <th className="py-2 text-left">Guest</th>
              <th className="py-2 text-left">Room</th>
              <th className="py-2 text-left">Dates</th>
              <th className="py-2 text-left">Amount</th>
              <th className="py-2 text-left">Status</th>
              <th className="py-2 text-left">Payment</th>
              <th className="py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b.id} className="border-b">
                <td className="py-2">{b.id}</td>
                <td className="py-2">
                  {b.guestName}
                  <br />
                  <span className="text-[10px] text-slate-500">
                    {b.guestPhone} · {b.guestEmail}
                  </span>
                </td>
                <td className="py-2">{roomMap.get(b.roomId) ?? b.roomId}</td>
                <td className="py-2">
                  {b.checkIn.slice(0, 10)} → {b.checkOut.slice(0, 10)}
                </td>
                <td className="py-2">RM {b.amount}</td>
                <td className="py-2">{b.status}</td>
                <td className="py-2">{b.paymentStatus}</td>
                <td className="py-2">
                  <div className="flex flex-col gap-1">
                    <button
                      type="button"
                      className="px-2 py-1 border rounded-md"
                      onClick={() => onUpdateStatus(b.id, "CONFIRMED")}
                    >
                      Mark Confirmed
                    </button>
                    <button
                      type="button"
                      className="px-2 py-1 border rounded-md"
                      onClick={() => onUpdateStatus(b.id, "CANCELLED")}
                    >
                      Cancel 取消
                    </button>
                    <button
                      type="button"
                      className="px-2 py-1 border rounded-md text-red-600"
                      onClick={() => onRefund(b.id)}
                    >
                      Cancel & Refund 退款并取消
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
EOF

echo ">>> Admin TSX 已生成到 $ROOT/app/admin/"
echo "提示：你还需要确保已有以下依赖和文件："
echo " - types/walter.ts"
echo " - lib/api.ts"
echo " - components/AvailabilityCalendar.tsx"
echo " - 对应的 /api/* 后端路由和 Prisma 模型"
EOF

---

### 2）赋权 & 执行

在 Codespaces 终端执行：

```bash
chmod +x generate-admin.sh
./generate-admin.sh
