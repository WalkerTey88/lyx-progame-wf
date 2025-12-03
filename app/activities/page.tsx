import Image from 'next/image';

/**
 * 活动页，展示农场可体验的活动列表。
 */
const activities = [
  {
    id: 1,
    title: 'Animal Feeding',
    description: 'Get up close with our friendly goats, chickens and rabbits while learning about their care.',
    image: '/images/feeding.jpg',
  },
  {
    id: 2,
    title: 'Guided Farm Tour',
    description:
      'Take a walking tour through our orchards and fields with a knowledgeable guide who will share insights into sustainable farming.',
    image: '/images/tour.jpg',
  },
  {
    id: 3,
    title: 'Fresh Produce Harvest',
    description:
      'Pick your own vegetables and fruits depending on the season. Great hands‑on fun for the whole family.',
    image: '/images/harvest.jpg',
  },
];

export default function ActivitiesPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-2xl md:text-3xl font-semibold">Activities</h1>
      <p className="text-sm md:text-base text-neutral-700 max-w-2xl">
        Immerse yourself in the farm life by participating in our curated activities. Whether you
        enjoy feeding animals, exploring nature or getting your hands dirty in the garden, there is
        something for everyone.
      </p>
      <div className="grid md:grid-cols-2 gap-6">
        {activities.map((activity) => (
          <div key={activity.id} className="overflow-hidden rounded-lg border bg-white shadow-sm">
            <div className="relative h-40">
              {/* TODO: 将图片替换为活动照片 */}
              <Image
                src={activity.image}
                alt={activity.title}
                fill
                className="object-cover"
              />
            </div>
            <div className="p-4 space-y-2">
              <h3 className="text-lg font-semibold text-brandDark">{activity.title}</h3>
              <p className="text-neutral-600 text-sm">{activity.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}