export default function ActivitiesPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-bold">Activities</h1>
      <p className="text-gray-600">Activities visitors can participate in.</p>

      <div className="grid md:grid-cols-3 gap-10">
        <div className="border rounded-lg p-6 shadow-sm">
          <h3 className="text-xl font-semibold">Activity A</h3>
          <p className="text-gray-600 mt-2">Placeholder description.</p>
        </div>

        <div className="border rounded-lg p-6 shadow-sm">
          <h3 className="text-xl font-semibold">Activity B</h3>
          <p className="text-gray-600 mt-2">Placeholder description.</p>
        </div>

        <div className="border rounded-lg p-6 shadow-sm">
          <h3 className="text-xl font-semibold">Activity C</h3>
          <p className="text-gray-600 mt-2">Placeholder description.</p>
        </div>
      </div>
    </div>
  );
}
