// app/gallery/page.tsx
import Image from "next/image";

const galleryItems = [
  {
    src: "/images/walters-farm/entrance-main.jpg",
    title: "Entrance & signage",
    category: "Around the farm",
  },
  {
    src: "/images/walters-farm/mini-zoo-animals.jpg",
    title: "Mini zoo animals & feeding",
    category: "Mini zoo",
  },
  {
    src: "/images/walters-farm/water-park-main.jpg",
    title: "Kids water park",
    category: "Water park",
  },
  {
    src: "/images/walters-farm/activities-atv.jpg",
    title: "ATV rides",
    category: "Outdoor activities",
  },
  {
    src: "/images/walters-farm/accommodation-chalet-exterior.jpg",
    title: "Colourful chalets",
    category: "Accommodation",
  },
  {
    src: "/images/walters-farm/accommodation-room-family.jpg",
    title: "Family room interior",
    category: "Accommodation",
  },
  {
    src: "/images/walters-farm/food-court-overview.jpg",
    title: "Food court & café",
    category: "Food & drinks",
  },
  {
    src: "/images/walters-farm/facilities-playground.jpg",
    title: "Playground",
    category: "Facilities",
  },
  {
    src: "/images/walters-farm/facilities-parking.jpg",
    title: "Parking area",
    category: "Facilities",
  },
  {
    src: "/images/walters-farm/location-map-static.jpg",
    title: "Location overview",
    category: "Map & access",
  },
];

export default function GalleryPage() {
  return (
    <main className="bg-white">
      {/* Hero */}
      <section className="bg-emerald-700 text-white">
        <div className="mx-auto max-w-6xl px-4 py-12 md:py-16">
          <h1 className="text-3xl font-bold md:text-4xl">
            Walters Farm Segamat Gallery
          </h1>
          <p className="mt-3 max-w-2xl text-sm md:text-base text-emerald-50">
            A visual overview of what to expect at Walters Farm Segamat – from
            mini zoo and water park to chalets, food court and facilities.
          </p>
        </div>
      </section>

      {/* Grid */}
      <section className="mx-auto max-w-6xl px-4 py-10 md:py-14">
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {galleryItems.map((item) => (
            <figure
              key={item.src}
              className="group overflow-hidden rounded-xl border bg-white shadow-sm"
            >
              <div className="relative h-52">
                <Image
                  src={item.src}
                  alt={item.title}
                  fill
                  className="object-cover transition-transform duration-200 group-hover:scale-105"
                />
              </div>
              <figcaption className="p-3">
                <p className="text-sm font-semibold text-gray-900">
                  {item.title}
                </p>
                <p className="mt-1 text-xs text-gray-600">{item.category}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>
    </main>
  );
}
