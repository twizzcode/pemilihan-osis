"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  XAxis,
  YAxis,
} from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { TallyRow } from "@/lib/queries";

const chartConfig = {
  total: { label: "Suara" },
  male: { label: "Putra", color: "var(--chart-1)" },
  female: { label: "Putri", color: "var(--chart-2)" },
} satisfies ChartConfig;

type ChartRow = TallyRow & { label: string };

export function ResultsChart({ data }: { data: TallyRow[] }) {
  const hasData = data.length > 0 && data.some((d) => d.total > 0);

  if (!hasData) {
    return (
      <div className="flex h-[280px] items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
        Belum ada data suara untuk ditampilkan.
      </div>
    );
  }

  const rows: ChartRow[] = data.map((d) => ({
    ...d,
    label: `${d.gender === "male" ? "P" : "W"}${d.number}`,
  }));

  return (
    <ChartContainer config={chartConfig} className="h-[280px] w-full">
      <BarChart accessibilityLayer data={rows} margin={{ left: -16, top: 8 }}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          allowDecimals={false}
          width={32}
        />
        <ChartTooltip
          cursor={{ fill: "var(--muted)", opacity: 0.4 }}
          content={
            <ChartTooltipContent
              hideLabel
              formatter={(value, _name, item) => (
                <div className="flex w-full items-center justify-between gap-4">
                  <span>
                    {item?.payload?.gender === "male" ? "Putra" : "Putri"} No.{" "}
                    {item?.payload?.number} · {item?.payload?.chairName}
                  </span>
                  <span className="font-mono font-medium tabular-nums">
                    {value} suara
                  </span>
                </div>
              )}
            />
          }
        />
        <Bar dataKey="total" radius={[6, 6, 0, 0]} maxBarSize={72}>
          {rows.map((entry) => (
            <Cell
              key={entry.candidateId}
              fill={
                entry.gender === "male" ? "var(--chart-1)" : "var(--chart-2)"
              }
            />
          ))}
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}
