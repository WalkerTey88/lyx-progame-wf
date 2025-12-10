import { ReactNode } from 'react';

interface CardProps {
  title: string;
  children: ReactNode;
}

export default function Card({ title, children }: CardProps) {
  return (
    <div className="border rounded-lg p-4 shadow-sm bg-white">
      <h2 className="font-semibold text-lg mb-2">{title}</h2>
      <div>{children}</div>
    </div>
  );
}
