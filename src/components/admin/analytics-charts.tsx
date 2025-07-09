"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, PieChart, Pie, Cell } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, type ChartConfig } from '@/components/ui/chart';

interface ChartProps {
    data: any[];
    config: ChartConfig;
}

export function GenerationsChart({ data, config }: ChartProps) {
    return (
        <ChartContainer config={config} className="min-h-[200px] w-full">
            <BarChart accessibilityLayer data={data}>
                <CartesianGrid vertical={false} />
                <XAxis
                    dataKey="day"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                    tickFormatter={(value) => value.slice(0, 3)}
                />
                <YAxis />
                <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent />}
                />
                <Bar dataKey="generations" fill="var(--color-generations)" radius={4} />
            </BarChart>
        </ChartContainer>
    );
}

export function LanguagePieChart({ data, config }: ChartProps) {
    return (
        <ChartContainer config={config} className="mx-auto aspect-square max-h-[250px]">
            <PieChart>
                <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                />
                <Pie
                    data={data}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={60}
                    strokeWidth={5}
                >
                {data.map((entry) => (
                    <Cell key={`cell-${entry.name}`} fill={entry.fill} />
                ))}
                </Pie>
                <ChartLegend
                    content={<ChartLegendContent nameKey="name" />}
                    className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
                />
            </PieChart>
        </ChartContainer>
    );
}
