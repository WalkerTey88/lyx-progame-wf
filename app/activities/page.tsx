// app/activities/page.tsx
import { Activity } from "@/types/walter";

async function fetchActivities(): Promise<Activity[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/api/activities`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch activities");
  }

  return res.json();
}

export default async function ActivitiesPage() {
  const activities = await fetchActivities();

  return (
    <main className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-6">Activities</h1>
      <p className="text-gray-600 mb-8">
        Join our farm activities and experience the nature around Walter Farm.
      </p>

      <div className="space-y-4">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className="border rounded-xl bg-white p-4 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between"
          >
            <div>
              <h2 className="text-xl font-semibold mb-1">
                {activity.name}
                {!activity.available && (
                  <span className="ml-2 text-xs font-normal text-red-600">
                    (Currently unavailable)
                  </span>
                )}
              </h2>
              {activity.description && (
                <p className="text-gray-600 text-sm mb-2">{activity.description}</p>
              )}
              {(activity.startTime || activity.endTime) && (
                <p className="text-xs text-gray-500">
                  {activity.startTime && (
                    <span>From: {new Date(activity.startTime).toLocaleString()}</span>
                  )}
                  {activity.startTime && activity.endTime && <span> · </span>}
                  {activity.endTime && (
                    <span>To: {new Date(activity.endTime).toLocaleString()}</span>
                  )}
                </p>
              )}
            </div>

            <div className="mt-3 md:mt-0 text-right">
              {activity.price != null && (
                <p className="font-bold text-green-700">
                  RM {activity.price.toFixed(2)}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
