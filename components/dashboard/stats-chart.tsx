"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts";

interface StatsChartProps {
  gastos: number;
  vendas: number;
  lucro: number;
}

export function StatsChart({ gastos, vendas, lucro }: StatsChartProps) {
  // Filtra apenas os dados com valores maiores que 0
  const data = [
    { name: "Gastos", value: Math.abs(gastos), color: "#ef4444" },
    { name: "Vendas", value: vendas, color: "#22c55e" },
    { name: "Lucro", value: Math.max(0, lucro), color: "#f59e0b" },
  ].filter((item) => item.value > 0);

  // Se não houver dados, mostra apenas os gastos
  if (data.length === 0 && gastos !== 0) {
    data.push({ name: "Gastos", value: Math.abs(gastos), color: "#ef4444" });
  }

  return (
    <div className="h-[200px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
