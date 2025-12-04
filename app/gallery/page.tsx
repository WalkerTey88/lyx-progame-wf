// app/gallery/page.tsx
import { GalleryItem } from "@/types/walter";

async function fetchGallery(): Promise<GalleryItem[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/api/gallery`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch gallery");
  }

  return res.json();
}

export default async function GalleryPage() {
  const gallery = await fetchGallery();

  return (
    <main className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-6">Gallery</h1>
      <p className="text-gray-600 mb-8">
        A glimpse of Walter Farm, our rooms, and the surrounding nature.
      </p>

      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        {gallery.map((item) => (
          <figure
            key={item.id}
            className="border rounded-xl overflow-hidden bg-white shadow-sm"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.imageUrl}
              alt={item.description ?? "Walter Farm photo"}
              className="w-full h-48 object-cover"
            />
            {item.description && (
              <figcaption className="p-2 text-xs text-gray-600">
                {item.description}
              </figcaption>
            )}
          </figure>
        ))}
      </div>
    </main>
  );
}
