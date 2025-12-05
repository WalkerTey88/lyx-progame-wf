export default function AccommodationPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-bold">Accommodation</h1>
      <p className="text-gray-600">Overview of stay options at Walter Farm.</p>

      <div className="grid md:grid-cols-2 gap-10">
        <div className="border rounded-lg p-6 shadow-sm">
          <h2 className="text-2xl font-semibold">Room Type A</h2>
          <p className="text-gray-600 mt-2">Description placeholder.</p>
        </div>

        <div className="border rounded-lg p-6 shadow-sm">
          <h2 className="text-2xl font-semibold">Room Type B</h2>
          <p className="text-gray-600 mt-2">Description placeholder.</p>
        </div>
      </div>
    </div>
  );
}
