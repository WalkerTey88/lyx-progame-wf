import { apiGet } from "@/lib/api";
import { Gallery } from "@/types/walter";

export default async function GalleryPage() {
  const images = await apiGet<Gallery[]>("/api/gallery");

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="max-w-6xl mx-auto px-4 py-10">
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900">
            Walter Farm Gallery
          </h1>
          <p className="mt-3 text-gray-600 max-w-2xl mx-auto">
            A look at our rooms, the farm surroundings, and the peaceful countryside in Segamat.
          </p>
        </div>

        {images.length === 0 ? (
          <p className="text-center text-gray-500">
            No photos yet. Please upload some through the admin interface.
          </p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((img) => (
              <figure
                key={img.id}
                className="group relative overflow-hidden rounded-2xl bg-white shadow-sm"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.imageUrl}
                  alt={img.description || "Walter Farm photo"}
                  className="h-40 w-full object-cover transition-transform duration-200 group-hover:scale-105"
                />
                {img.description && (
                  <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent px-2 py-2">
                    <p className="text-xs text-white line-clamp-2">
                      {img.description}
                    </p>
                  </figcaption>
                )}
              </figure>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
