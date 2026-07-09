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

interface ResourceDownloadsChartProps {
  data: { name: string; downloads: number }[];
}

const COLORS = ["#3B82F6", "#8B5CF6", "#EC4899", "#10B981", "#F59E0B"];

export default function ResourceDownloadsChart({ data }: ResourceDownloadsChartProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="w-full h-[450px] bg-muted/10 animate-pulse rounded-xl" />;

  return (
    <ResponsiveContainer width="99%" height={450} minWidth={0} minHeight={0} debounce={100}>
      <BarChart data={data} layout="vertical" margin={{ top: 10, right: 30, left: 40, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" horizontal={false} />
        <XAxis
          type="number"
          className="text-xs font-medium"
          tick={{ fill: "hsl(var(--muted-foreground))" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          type="category"
          dataKey="name"
          className="text-xs font-medium"
          tick={{ fill: "hsl(var(--muted-foreground))" }}
          axisLine={false}
          tickLine={false}
          width={80}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "12px",
            boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
          }}
          labelStyle={{
            color: "hsl(var(--foreground))",
            fontWeight: "bold",
            marginBottom: "4px",
          }}
          itemStyle={{ color: "hsl(var(--primary))" }}
          cursor={{ fill: "hsl(var(--primary) / 0.1)" }}
        />
        <Bar dataKey="downloads" radius={[0, 6, 6, 0]} barSize={20}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
