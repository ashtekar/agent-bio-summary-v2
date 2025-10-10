'use client';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export default function Card({ children, className = '' }: CardProps) {
  return (
    <div className={`bg-slate-800 rounded-lg border border-slate-700 p-6 ${className}`}>
      {children}
    </div>
  );
}

