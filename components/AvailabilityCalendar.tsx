"use client";

import useSWR from "swr";
import { apiGet } from "@/lib/api";

interface AvailabilityDay {
  date: string; // YYYY-MM-DD
  availableUnits: number;
  bookedUnits: number;
}

interface Props {
  roomId: number;
}

const fetchAvailability = (roomId: number) => {
  return apiGet<AvailabilityDay[]>(`/api/availability?roomId=${roomId}`);
};

export function AvailabilityCalendar({ roomId }: Props) {
  const { data, isLoading } = useSWR(
    roomId ? `/api/availability?roomId=${roomId}` : null,
    () => fetchAvailability(roomId)
  );

  if (isLoading) return <div>Loading availability...</div>;
  if (!data) return <div>No availability data.</div>;

  return (
    <div className="grid grid-cols-7 gap-2 text-xs">
      {data.map((day) => (
        <div
          key={day.date}
          className="border rounded-md p-2 bg-white flex flex-col gap-1"
        >
          <div className="font-semibold">{day.date}</div>
          <div>剩余：{day.availableUnits}</div>
          <div className="text-slate-500">已订：{day.bookedUnits}</div>
        </div>
      ))}
    </div>
  );
}
