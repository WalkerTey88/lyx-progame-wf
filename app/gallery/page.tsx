import { apiGet } from "@/lib/api";
import { Gallery } from "@/types/walter";

export default async function GalleryPage() {
  const images = await apiGet<Gallery[]>("/api/gallery");

  return (
    <section className="p-6">
      <h1 className="text-3xl font-bold mb-4">Gallery</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {images.map(img => (
          <div key={img.id}>
            <img src={img.imageUrl} className="rounded shadow" />
          </div>
        ))}
      </div>
    </section>
  );
}
