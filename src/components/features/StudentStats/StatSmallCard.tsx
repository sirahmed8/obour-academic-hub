import React from "react";

interface StatSmallCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
}

export function StatSmallCard({ icon, label, value, color }: StatSmallCardProps) {
  return (
    <div className={`p-3 rounded-2xl ${color} flex flex-col gap-1 border`}>
      <span className="opacity-80">{icon}</span>
      <span className="text-xl font-black">{value}</span>
      <span className="text-[10px] font-bold uppercase tracking-tight">{label}</span>
    </div>
  );
}
