export default function GalleryPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-bold">Gallery</h1>
      <p className="text-gray-600">Photos of Walter Farm.</p>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-gray-200 h-48 rounded-lg"></div>
        <div className="bg-gray-200 h-48 rounded-lg"></div>
        <div className="bg-gray-200 h-48 rounded-lg"></div>
      </div>
    </div>
  );
}
