export default function BookingPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-bold">Booking</h1>
      <p className="text-gray-600">Booking steps and instructions.</p>

      <div className="space-y-4">
        <div className="p-4 border rounded-lg shadow-sm">Step 1: Choose date</div>
        <div className="p-4 border rounded-lg shadow-sm">Step 2: Choose room</div>
        <div className="p-4 border rounded-lg shadow-sm">Step 3: Confirm details</div>
      </div>
    </div>
  );
}
