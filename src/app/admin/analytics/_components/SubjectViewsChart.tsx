"use client";

import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface SubjectViewsChartProps {
  data: { name: string; views: number }[];
}

export default function SubjectViewsChart({ data }: SubjectViewsChartProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="w-full h-[450px] bg-muted/10 animate-pulse rounded-xl" />;

  return (
    <ResponsiveContainer width="99%" height={450} minWidth={0} minHeight={0} debounce={100}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" vertical={false} />
        <XAxis
          dataKey="name"
          className="text-xs font-medium"
          tick={{ fill: "hsl(var(--muted-foreground))" }}
          axisLine={false}
          tickLine={false}
          dy={10}
        />
        <YAxis
          className="text-xs font-medium"
          tick={{ fill: "hsl(var(--muted-foreground))" }}
          axisLine={false}
          tickLine={false}
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
        <Bar dataKey="views" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} barSize={40} />
      </BarChart>
    </ResponsiveContainer>
  );
}
