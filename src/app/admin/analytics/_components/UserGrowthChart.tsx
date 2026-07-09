"use client";

import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface UserGrowthChartProps {
  data: { name: string; users: number }[];
}

export default function UserGrowthChart({ data }: UserGrowthChartProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="w-full h-[300px] bg-muted/10 animate-pulse rounded-xl" />;

  return (
    <ResponsiveContainer width="99%" height={300} minWidth={0} minHeight={0} debounce={100}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
        <XAxis
          dataKey="name"
          axisLine={false}
          tickLine={false}
          tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
          dy={10}
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
        />
        <Tooltip
          cursor={{ fill: "hsl(var(--muted)/0.2)" }}
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            borderColor: "hsl(var(--border))",
            borderRadius: "12px",
          }}
          itemStyle={{ color: "hsl(var(--primary))", fontWeight: "bold" }}
        />
        <Bar dataKey="users" radius={[6, 6, 0, 0]} barSize={40}>
          {data.map((_, index) => (
            <Cell
              key={`cell-${index}`}
              fill={`hsl(var(--primary) / ${0.6 + (index / data.length) * 0.4})`}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
