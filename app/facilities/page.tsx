/**
 * Facilities page describing physical amenities at the farm.
 */

export default function FacilitiesPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl md:text-3xl font-semibold">Facilities</h1>
      <p className="text-sm md:text-base text-neutral-700 max-w-2xl">
        Walter Farm offers a variety of facilities to ensure you have a comfortable and enjoyable visit. Below is an overview of what we provide for our guests.
      </p>
      <ul className="list-disc list-inside space-y-2 text-neutral-700">
        <li><strong>Parking:</strong> Free on‑site parking for cars and buses.</li>
        <li><strong>Rest Areas:</strong> Shaded seating areas and picnic spots around the farm.</li>
        <li><strong>Animal Enclosures:</strong> Safe and accessible areas where you can observe and feed our animals.</li>
        <li><strong>Café:</strong> A farm‑to‑table café serving freshly prepared meals and beverages.</li>
        <li><strong>Event Spaces:</strong> Dedicated spaces for birthdays, family gatherings and corporate retreats.</li>
        <li><strong>Farm Shop:</strong> Purchase our seasonal produce, homemade jams and souvenirs to take home.</li>
      </ul>
    </div>
  );
}
