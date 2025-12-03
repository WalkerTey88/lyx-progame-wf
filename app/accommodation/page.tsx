import Image from 'next/image';

/**
 * 住宿列表页面。
 * 展示农场提供的不同住宿选项以及简要说明。
 */
const accommodations = [
  {
    id: 1,
    title: 'Farm Cottage',
    description:
      'A cozy cottage with two bedrooms, private bathroom and a small veranda overlooking the orchard.',
    image: '/images/cottage.jpg',
  },
  {
    id: 2,
    title: 'Lodge Suite',
    description:
      'Spacious lodge featuring a king‑size bed, en‑suite bathroom, and a lounge area perfect for families.',
    image: '/images/lodge.jpg',
  },
  {
    id: 3,
    title: 'Camping Pitch',
    description:
      'Bring your own tent or rent one of ours. Enjoy open skies and campfire evenings on dedicated pitches.',
    image: '/images/camping.jpg',
  },
];

export default function AccommodationPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-2xl md:text-3xl font-semibold">Accommodation</h1>
      <p className="text-sm md:text-base text-neutral-700 max-w-2xl">
        Choose from a range of farm‑style stays designed for couples, families and groups. Each accommodation type offers unique amenities and a comfortable base from which to explore Walter Farm.
      </p>
      <div className="grid md:grid-cols-2 gap-6">
        {accommodations.map((item) => (
          <div key={item.id} className="overflow-hidden rounded-lg border bg-white shadow-sm">
            <div className="relative h-40">
              <Image
                src={item.image}
                alt={item.title}
                fill
                className="object-cover"
              />
            </div>
            <div className="p-4 space-y-2">
              <h3 className="text-lg font-semibold text-brandDark">{item.title}</h3>
              <p className="text-neutral-600 text-sm">{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
