export default function HomePage() {
  return (
    <div className="space-y-20">

      <section className="relative py-20 text-center bg-gray-100 rounded-xl">
        <h1 className="text-5xl font-bold">Walter Farm</h1>
        <p className="mt-4 text-lg text-gray-600">
          A peaceful farm experience located in Segamat, Johor.
        </p>
      </section>

      <section className="grid md:grid-cols-3 gap-10">
        <div className="p-6 border rounded-lg shadow-sm">
          <h3 className="text-xl font-semibold">Farm Stay</h3>
          <p className="text-gray-600 mt-2">
            Room information and stay experience overview.
          </p>
        </div>

        <div className="p-6 border rounded-lg shadow-sm">
          <h3 className="text-xl font-semibold">Activities</h3>
          <p className="text-gray-600 mt-2">
            Activities available at Walter Farm.
          </p>
        </div>

        <div className="p-6 border rounded-lg shadow-sm">
          <h3 className="text-xl font-semibold">Family Friendly</h3>
          <p className="text-gray-600 mt-2">
            Facilities suitable for family visits.
          </p>
        </div>
      </section>

      <section className="space-y-4 max-w-3xl mx-auto text-center">
        <h2 className="text-3xl font-bold">About Walter Farm</h2>
        <p className="text-gray-700">
          This block will contain official information about Walter Farm.
        </p>
      </section>
    </div>
  );
}
