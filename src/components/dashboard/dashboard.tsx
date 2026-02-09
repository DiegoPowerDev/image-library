"use client";

import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useMemo, useState } from "react";
export const description = "A stacked bar chart with a legend";
export const iframeHeight = "600px";
export const containerClassName =
  "[&>div]:w-full [&>div]:max-w-md flex items-center justify-center min-h-svh";

const chartData = [
  { date: "2024-07-15", running: 450, swimming: 300 },
  { date: "2024-07-16", running: 380, swimming: 420 },
  { date: "2024-07-17", running: 520, swimming: 120 },
  { date: "2024-07-18", running: 140, swimming: 550 },
  { date: "2024-07-19", running: 600, swimming: 350 },
  { date: "2024-07-20", running: 480, swimming: 400 },
  { date: "2024-07-21", running: 480, swimming: 400 },
];

const chartConfig = {
  running: {
    label: "Running",
    color: "var(--chart-1)",
  },
  swimming: {
    label: "Swimming",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

export const description2 = "Resumen mensual";
const chartData2 = [
  { date: "2024-04-01", ventas: 222, instalaciones: 150 },
  { date: "2024-04-02", ventas: 97, instalaciones: 180 },
  { date: "2024-04-03", ventas: 167, instalaciones: 120 },
  { date: "2024-04-04", ventas: 242, instalaciones: 260 },
  { date: "2024-04-05", ventas: 373, instalaciones: 290 },
  { date: "2024-04-06", ventas: 301, instalaciones: 340 },
  { date: "2024-04-07", ventas: 245, instalaciones: 180 },
  { date: "2024-04-08", ventas: 409, instalaciones: 320 },
  { date: "2024-04-09", ventas: 59, instalaciones: 110 },
  { date: "2024-04-10", ventas: 261, instalaciones: 190 },
  { date: "2024-04-11", ventas: 327, instalaciones: 350 },
  { date: "2024-04-12", ventas: 292, instalaciones: 210 },
  { date: "2024-04-13", ventas: 342, instalaciones: 380 },
  { date: "2024-04-14", ventas: 137, instalaciones: 220 },
  { date: "2024-04-15", ventas: 120, instalaciones: 170 },
  { date: "2024-04-16", ventas: 138, instalaciones: 190 },
  { date: "2024-04-17", ventas: 446, instalaciones: 360 },
  { date: "2024-04-18", ventas: 364, instalaciones: 410 },
  { date: "2024-04-19", ventas: 243, instalaciones: 180 },
  { date: "2024-04-20", ventas: 89, instalaciones: 150 },
  { date: "2024-04-21", ventas: 137, instalaciones: 200 },
  { date: "2024-04-22", ventas: 224, instalaciones: 170 },
  { date: "2024-04-23", ventas: 138, instalaciones: 230 },
  { date: "2024-04-24", ventas: 387, instalaciones: 290 },
  { date: "2024-04-25", ventas: 215, instalaciones: 250 },
  { date: "2024-04-26", ventas: 75, instalaciones: 130 },
  { date: "2024-04-27", ventas: 383, instalaciones: 420 },
  { date: "2024-04-28", ventas: 122, instalaciones: 180 },
  { date: "2024-04-29", ventas: 315, instalaciones: 240 },
  { date: "2024-04-30", ventas: 454, instalaciones: 380 },
  { date: "2024-05-01", ventas: 165, instalaciones: 220 },
  { date: "2024-05-02", ventas: 293, instalaciones: 310 },
  { date: "2024-05-03", ventas: 247, instalaciones: 190 },
  { date: "2024-05-04", ventas: 385, instalaciones: 420 },
  { date: "2024-05-05", ventas: 481, instalaciones: 390 },
  { date: "2024-05-06", ventas: 498, instalaciones: 520 },
  { date: "2024-05-07", ventas: 388, instalaciones: 300 },
  { date: "2024-05-08", ventas: 149, instalaciones: 210 },
  { date: "2024-05-09", ventas: 227, instalaciones: 180 },
  { date: "2024-05-10", ventas: 293, instalaciones: 330 },
  { date: "2024-05-11", ventas: 335, instalaciones: 270 },
  { date: "2024-05-12", ventas: 197, instalaciones: 240 },
  { date: "2024-05-13", ventas: 197, instalaciones: 160 },
  { date: "2024-05-14", ventas: 448, instalaciones: 490 },
  { date: "2024-05-15", ventas: 473, instalaciones: 380 },
  { date: "2024-05-16", ventas: 338, instalaciones: 400 },
  { date: "2024-05-17", ventas: 499, instalaciones: 420 },
  { date: "2024-05-18", ventas: 315, instalaciones: 350 },
  { date: "2024-05-19", ventas: 235, instalaciones: 180 },
  { date: "2024-05-20", ventas: 177, instalaciones: 230 },
  { date: "2024-05-21", ventas: 82, instalaciones: 140 },
  { date: "2024-05-22", ventas: 81, instalaciones: 120 },
  { date: "2024-05-23", ventas: 252, instalaciones: 290 },
  { date: "2024-05-24", ventas: 294, instalaciones: 220 },
  { date: "2024-05-25", ventas: 201, instalaciones: 250 },
  { date: "2024-05-26", ventas: 213, instalaciones: 170 },
  { date: "2024-05-27", ventas: 420, instalaciones: 460 },
  { date: "2024-05-28", ventas: 233, instalaciones: 190 },
  { date: "2024-05-29", ventas: 78, instalaciones: 130 },
  { date: "2024-05-30", ventas: 340, instalaciones: 280 },
  { date: "2024-05-31", ventas: 178, instalaciones: 230 },
  { date: "2024-06-01", ventas: 178, instalaciones: 200 },
  { date: "2024-06-02", ventas: 470, instalaciones: 410 },
  { date: "2024-06-03", ventas: 103, instalaciones: 160 },
  { date: "2024-06-04", ventas: 439, instalaciones: 380 },
  { date: "2024-06-05", ventas: 88, instalaciones: 140 },
  { date: "2024-06-06", ventas: 294, instalaciones: 250 },
  { date: "2024-06-07", ventas: 323, instalaciones: 370 },
  { date: "2024-06-08", ventas: 385, instalaciones: 320 },
  { date: "2024-06-09", ventas: 438, instalaciones: 480 },
  { date: "2024-06-10", ventas: 155, instalaciones: 200 },
  { date: "2024-06-11", ventas: 92, instalaciones: 150 },
  { date: "2024-06-12", ventas: 492, instalaciones: 420 },
  { date: "2024-06-13", ventas: 81, instalaciones: 130 },
  { date: "2024-06-14", ventas: 426, instalaciones: 380 },
  { date: "2024-06-15", ventas: 307, instalaciones: 350 },
  { date: "2024-06-16", ventas: 371, instalaciones: 310 },
  { date: "2024-06-17", ventas: 475, instalaciones: 520 },
  { date: "2024-06-18", ventas: 107, instalaciones: 170 },
  { date: "2024-06-19", ventas: 341, instalaciones: 290 },
  { date: "2024-06-20", ventas: 408, instalaciones: 450 },
  { date: "2024-06-21", ventas: 169, instalaciones: 210 },
  { date: "2024-06-22", ventas: 317, instalaciones: 270 },
  { date: "2024-06-23", ventas: 480, instalaciones: 530 },
  { date: "2024-06-24", ventas: 132, instalaciones: 180 },
  { date: "2024-06-25", ventas: 141, instalaciones: 190 },
  { date: "2024-06-26", ventas: 434, instalaciones: 380 },
  { date: "2024-06-27", ventas: 448, instalaciones: 490 },
  { date: "2024-06-28", ventas: 149, instalaciones: 200 },
  { date: "2024-06-29", ventas: 103, instalaciones: 160 },
  { date: "2024-06-30", ventas: 446, instalaciones: 400 },
];
const chartConfig2 = {
  views: {
    label: "Page Views",
  },
  ventas: {
    label: "ventas",
    color: "var(--chart-2)",
  },
  instalaciones: {
    label: "instalaciones",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

export default function Dashboard() {
  const [activeChart, setActiveChart] =
    useState<keyof typeof chartConfig2>("ventas");
  const total = useMemo(
    () => ({
      ventas: chartData2.reduce((acc, curr) => acc + curr.ventas, 0),
      instalaciones: chartData2.reduce(
        (acc, curr) => acc + curr.instalaciones,
        0
      ),
    }),
    []
  );

  return (
    <div className="w-full h-full flex items-center justify-center px-12">
      <div className="w-full h-full grid grid-cols-3 grid-flow-row gap-2 justify-center items-center">
        <Card className="bg-black text-white">
          <CardHeader>
            <CardTitle>Ventas del dia</CardTitle>
            <CardDescription>Datos actualizados en tiempo real</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig}>
              <BarChart accessibilityLayer data={chartData}>
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  tickFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      weekday: "short",
                    });
                  }}
                />
                <Bar
                  dataKey="running"
                  stackId="a"
                  fill="var(--color-running)"
                  radius={[0, 0, 4, 4]}
                />
                <Bar
                  dataKey="swimming"
                  stackId="a"
                  fill="var(--color-swimming)"
                  radius={[4, 4, 0, 0]}
                />
                <ChartTooltip
                  labelClassName="text-black"
                  content={<ChartTooltipContent />}
                  cursor={false}
                  defaultIndex={1}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="bg-black text-white">
          <CardHeader>
            <CardTitle>Ventas de la semana</CardTitle>
            <CardDescription>Datos actualizados en tiempo real</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig}>
              <BarChart accessibilityLayer data={chartData}>
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  tickFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      weekday: "short",
                    });
                  }}
                />
                <Bar
                  dataKey="running"
                  stackId="a"
                  fill="var(--color-running)"
                  radius={[0, 0, 4, 4]}
                />
                <Bar
                  dataKey="swimming"
                  stackId="a"
                  fill="var(--color-swimming)"
                  radius={[4, 4, 0, 0]}
                />
                <ChartTooltip
                  labelClassName="text-black"
                  content={<ChartTooltipContent />}
                  cursor={false}
                  defaultIndex={1}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="bg-black text-white">
          <CardHeader>
            <CardTitle>Ventas del mes</CardTitle>
            <CardDescription>Datos actualizados en tiempo real</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig}>
              <BarChart accessibilityLayer data={chartData}>
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  tickFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      weekday: "short",
                    });
                  }}
                />
                <Bar
                  dataKey="running"
                  stackId="a"
                  fill="var(--color-running)"
                  radius={[0, 0, 4, 4]}
                />
                <Bar
                  dataKey="swimming"
                  stackId="a"
                  fill="var(--color-swimming)"
                  radius={[4, 4, 0, 0]}
                />
                <ChartTooltip
                  labelClassName="text-black"
                  content={<ChartTooltipContent />}
                  cursor={false}
                  defaultIndex={1}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="py-0 col-span-3 bg-black text-white">
          <CardHeader className="flex flex-col items-stretch border-b !p-0 sm:flex-row">
            <div className="flex flex-1 flex-col justify-center gap-1 px-6 pt-4 pb-3 sm:!py-0">
              <CardTitle>Estadistica</CardTitle>
              <CardDescription>Resumen mensual</CardDescription>
            </div>
            <div className="flex">
              {["ventas", "instalaciones"].map((key) => {
                const chart = key as keyof typeof chartConfig2;
                return (
                  <button
                    key={chart}
                    data-active={activeChart === chart}
                    className="data-[active=true]:bg-muted/50 relative z-30 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l sm:border-t-0 sm:border-l sm:px-8 sm:py-6"
                    onClick={() => setActiveChart(chart)}
                  >
                    <span className=" text-xs">
                      {chartConfig2[chart].label}
                    </span>
                    <span className="text-lg leading-none font-bold sm:text-3xl">
                      {total[key as keyof typeof total].toLocaleString()}
                    </span>
                  </button>
                );
              })}
            </div>
          </CardHeader>
          <CardContent className="px-2 sm:p-6">
            <ChartContainer
              config={chartConfig2}
              className="aspect-auto h-[250px] w-full"
            >
              <BarChart
                accessibilityLayer
                data={chartData2}
                margin={{
                  left: 12,
                  right: 12,
                }}
              >
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  minTickGap={32}
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return date.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    });
                  }}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      className="w-[150px]"
                      nameKey="views"
                      labelFormatter={(value) => {
                        return new Date(value).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        });
                      }}
                    />
                  }
                />
                <Bar
                  dataKey={activeChart}
                  fill={`var(--color-${activeChart})`}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
