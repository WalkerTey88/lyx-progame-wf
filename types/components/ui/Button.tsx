import { ReactNode } from 'react';

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
}

export default function Button({ children, onClick, className }: ButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded bg-brand text-white hover:bg-brandDark transition ${className}`}
    >
      {children}
    </button>
  );
}
