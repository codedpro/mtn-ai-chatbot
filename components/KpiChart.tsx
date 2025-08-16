// components/KpiChart.tsx
"use client";

import { ArrowUp, ArrowDown } from "lucide-react";
import { format, parseISO } from "date-fns";
import {
  CartesianGrid,
  LabelList,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltipContent,
} from "@/components/ui/chart";

interface KpiRecord {
  time: string;
  [key: string]: number | string;
}

interface KpiChartProps {
  kpi: string;
  data: KpiRecord[];
}

export function KpiChart({ kpi, data }: KpiChartProps) {
  /* ──────────  data prep  ────────── */
  const sorted = [...data].sort(
    (a, b) => new Date(a.time).getTime() - new Date(b.time).getTime()
  );
  const values = sorted.map((d) => Number(d[kpi] ?? 0));
  const n = values.length;

  const first = values[0] ?? 0;
  const last = values[n - 1] ?? 0;
  const diff = last - first;
  const pct = first ? (diff / first) * 100 : 0;
  const avg = n ? values.reduce((s, v) => s + v, 0) / n : 0;

  let min = first,
    max = first;
  let minT = sorted[0]?.time,
    maxT = sorted[0]?.time;
  values.forEach((v, i) => {
    if (v < min) {
      min = v;
      minT = sorted[i].time;
    }
    if (v > max) {
      max = v;
      maxT = sorted[i].time;
    }
  });

  const std =
    n > 1
      ? Math.sqrt(values.reduce((s, v) => s + (v - avg) ** 2, 0) / (n - 1))
      : 0;

  const rangeLabel =
    n > 1
      ? `${format(parseISO(sorted[0].time), "MMM d")} – ${format(
          parseISO(sorted[n - 1].time),
          "MMM d"
        )}`
      : n === 1
      ? format(parseISO(sorted[0].time), "MMM d, HH:mm")
      : "";

  /* ──────────  helpers  ────────── */
  const fmt2 = (x: number) => x.toFixed(2);

  const chartConfig: ChartConfig = {
    [kpi]: {
      label: kpi.charAt(0).toUpperCase() + kpi.slice(1),
      color: "hsl(var(--chart-1))",
    },
  };

  /* ──────────  UI  ────────── */
  return (
    <Card className="w-full max-w-3xl  my-8">
      {/* Header */}
      <CardHeader className="pb-2">
        <div className="flex w-full items-center">
          <CardTitle className="capitalize text-lg">{kpi}</CardTitle>
          <span className="ml-auto text-sm text-muted-foreground">
            {rangeLabel}
          </span>
        </div>
      </CardHeader>

      {/* Chart */}
      <CardContent className="relative px-4 pt-0 overflow-hidden">
        {n ? (
          <ChartContainer config={chartConfig}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={sorted}
                margin={{ top: 28, right: 8, left: 8, bottom: 2 }}
              >
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis
                  dataKey="time"
                  axisLine={false}
                  tickLine={false}
                  tickMargin={8}
                  tick={{ fontSize: 11 }}
                  tickFormatter={(t) => format(parseISO(t), "yyyy-MM-dd")}
                />
                <YAxis
                  // lock Y-axis to the exact data range
                  domain={[min, max]}
                  tick={{ fontSize: 11 }}
                  tickFormatter={(v) => fmt2(Number(v))}
                  width={40}
                />
                <RechartsTooltip
                  cursor={false}
                  formatter={(v) => fmt2(Number(v))}
                  labelFormatter={(t) => format(parseISO(t), "PPpp")}
                  content={<ChartTooltipContent indicator="line" />}
                />
                <Line
                  dataKey={kpi}
                  type="monotone"
                  stroke={`var(--color-${kpi})`}
                  strokeWidth={2}
                  dot={{ r: 3, fill: `var(--color-${kpi})` }}
                  activeDot={{ r: 6 }}
                >
                  <LabelList
                    position="top"
                    fontSize={10}
                    offset={6}
                    formatter={(v) => fmt2(Number(v))}
                    className="fill-foreground"
                  />
                </Line>
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        ) : (
          <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
            No data available
          </div>
        )}
      </CardContent>

      {/* Stats */}
      {n > 0 && (
        <CardFooter className="border-t border-muted/30  px-2 overflow-x-auto">
          <div className="inline-grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <Stat label="Current" value={fmt2(last)} />
            <Stat
              label="Change"
              value={`${fmt2(Math.abs(pct))}%`}
              extraIcon={
                diff >= 0 ? <ArrowUp size={16} /> : <ArrowDown size={16} />
              }
              color={diff >= 0 ? "text-green-600" : "text-red-600"}
            />
            <Stat label="Average" value={fmt2(avg)} />
            <Stat
              label="Min"
              value={fmt2(min)}
              sub={minT && format(parseISO(minT), "MMM d")}
            />
            <Stat
              label="Max"
              value={fmt2(max)}
              sub={maxT && format(parseISO(maxT), "MMM d")}
            />
            <Stat label="Std Dev" value={fmt2(std)} />
          </div>
        </CardFooter>
      )}
    </Card>
  );
}

type StatProps = {
  label: string;
  value: string;
  sub?: string;
  extraIcon?: React.ReactNode;
  color?: string;
};

function Stat({ label, value, sub, extraIcon, color }: StatProps) {
  return (
    <div className="flex flex-col items-center p-3 bg-muted/10 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-150">
      <div className="text-[0.625rem] uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div
        className={`mt-1 flex items-center text-lg font-bold ${
          color ?? "text-foreground"
        }`}
      >
        {extraIcon}
        <span className="ml-1">{value}</span>
      </div>
      {sub && (
        <div className="mt-0.5 text-[0.65rem] text-muted-foreground">{sub}</div>
      )}
    </div>
  );
}
