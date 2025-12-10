interface HeroProps {
  title: string;
  subtitle: string;
}

export default function Hero({ title, subtitle }: HeroProps) {
  return (
    <div className="py-12 text-center bg-brand text-white rounded-lg mb-6">
      <h1 className="text-3xl font-bold mb-2">{title}</h1>
      <p className="text-lg opacity-90">{subtitle}</p>
    </div>
  );
}
