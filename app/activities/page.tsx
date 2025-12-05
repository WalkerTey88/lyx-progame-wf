import { apiGet } from "@/lib/api";
import { Activity } from "@/types/walter";

export default async function ActivitiesPage() {
  const activities = await apiGet<Activity[]>("/api/activities");

  return (
    <section className="p-6">
      <h1 className="text-3xl font-bold mb-4">Activities</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {activities.map(act => (
          <div key={act.id} className="border p-4 rounded shadow">
            <h2 className="text-xl font-semibold">{act.name}</h2>
            <p>{act.description}</p>
            <p className="font-bold mt-2">
              {act.price ? `RM ${act.price}` : "Free"}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
