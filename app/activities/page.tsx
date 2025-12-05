import { apiGet } from "@/lib/api";
import { Activity } from "@/types/walter";

export default async function ActivitiesPage() {
  const activities = await apiGet<Activity[]>("/api/activities");

  return (
    <main className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
      <section className="max-w-5xl mx-auto px-4 py-10">
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900">
            Farm Activities
          </h1>
          <p className="mt-3 text-gray-600 max-w-2xl mx-auto">
            Join our family-friendly activities at Walter Farm: feeding animals, nature walks, and more.
          </p>
        </div>

        {activities.length === 0 ? (
          <p className="text-center text-gray-500">
            No activities available at the moment.
          </p>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => (
              <article
                key={activity.id}
                className="bg-white/90 rounded-2xl border border-gray-100 shadow-sm px-4 py-4 md:px-6 md:py-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-lg font-semibold text-gray-900">
                      {activity.name}
                    </h2>
                    {!activity.available && (
                      <span className="inline-flex items-center rounded-full bg-red-100 text-red-700 px-2 py-0.5 text-xs font-medium">
                        Unavailable
                      </span>
                    )}
                  </div>
                  {activity.description && (
                    <p className="text-sm text-gray-600">
                      {activity.description}
                    </p>
                  )}
                  {(activity.startTime || activity.endTime) && (
                    <p className="mt-2 text-xs text-gray-500">
                      {activity.startTime && (
                        <span>
                          Start:{" "}
                          {new Date(activity.startTime).toLocaleString()}
                        </span>
                      )}
                      {activity.startTime && activity.endTime && <span> · </span>}
                      {activity.endTime && (
                        <span>
                          End: {new Date(activity.endTime).toLocaleString()}
                        </span>
                      )}
                    </p>
                  )}
                </div>

                <div className="text-right min-w-[120px]">
                  {activity.price != null ? (
                    <>
                      <p className="text-sm text-gray-500">Price</p>
                      <p className="text-xl font-bold text-amber-700">
                        RM {activity.price.toFixed(2)}
                      </p>
                    </>
                  ) : (
                    <p className="text-sm font-semibold text-green-700">
                      Free activity
                    </p>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
