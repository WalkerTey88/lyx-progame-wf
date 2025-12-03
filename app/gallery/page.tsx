import Image from 'next/image';

/**
 * Gallery page displaying images from the farm.
 */

const galleryImages = [
  { src: '/images/farm.jpg', alt: 'Farm overview' },
  { src: '/images/cottage.jpg', alt: 'Farm cottage' },
  { src: '/images/lodge.jpg', alt: 'Lodge suite' },
  { src: '/images/camping.jpg', alt: 'Camping pitch' },
  { src: '/images/feeding.jpg', alt: 'Animal feeding' },
  { src: '/images/harvest.jpg', alt: 'Fresh produce harvest' },
  { src: '/images/tour.jpg', alt: 'Guided farm tour' },
];

export default function GalleryPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl md:text-3xl font-semibold">Gallery</h1>
      <p className="text-sm md:text-base text-neutral-700 max-w-2xl">
        Explore images of Walter Farm's environment, animals, activities and accommodation.
      </p>
      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
        {galleryImages.map((img, index) => (
          <div key={index} className="relative h-48 rounded-lg overflow-hidden">
            <Image
              src={img.src}
              alt={img.alt}
              fill
              className="object-cover"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
