/**
 * 关于我们页面。
 * 介绍 Walter Farm 的故事、使命和设施。
 */
export default function AboutPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-2xl md:text-3xl font-semibold">About Walter Farm</h1>
      <section className="space-y-4 max-w-3xl">
        <p className="text-neutral-700 text-sm md:text-base">
          Walter Farm was founded with a simple idea: to create a place where families and
          communities can reconnect with nature and understand where their food comes from. Nestled
          in the rolling hills of Segamat, our farm is home to a variety of animals, orchards and
          vegetable gardens.
        </p>
        <p className="text-neutral-700 text-sm md:text-base">
          We believe in sustainable farming practices and strive to educate visitors about
          eco‑friendly agriculture. Whether you are feeding our goats, harvesting seasonal produce or
          learning about composting, every activity is designed to inspire and delight.
        </p>
        <p className="text-neutral-700 text-sm md:text-base">
          Our facilities include comfortable accommodation, a farm‑to‑table café and spaces for
          events such as birthdays, family gatherings and corporate retreats. Come join us and
          experience rural life at its best.
        </p>
      </section>
    </div>
  );
}