export default function FacilitiesPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-bold">Facilities</h1>
      <p className="text-gray-600">Facilities available for visitors.</p>

      <div className="grid md:grid-cols-4 gap-10">
        <div className="text-center p-6 border rounded-lg shadow-sm">
          Facility A
        </div>
        <div className="text-center p-6 border rounded-lg shadow-sm">
          Facility B
        </div>
        <div className="text-center p-6 border rounded-lg shadow-sm">
          Facility C
        </div>
        <div className="text-center p-6 border rounded-lg shadow-sm">
          Facility D
        </div>
      </div>
    </div>
  );
}
