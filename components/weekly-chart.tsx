"use client"

import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from "recharts"

interface WeeklyChartProps {
  data: { day: string; emissions: number }[]
}

export function WeeklyChart({ data }: WeeklyChartProps) {
  const today = new Date()
  const currentDay = today.getDay()
  const todayIndex = currentDay === 0 ? 6 : currentDay - 1

  return (
    <div className="h-32 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} barCategoryGap="25%">
          <XAxis
            dataKey="day"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#64748B", fontSize: 11 }}
          />
          <YAxis hide />
          <Bar dataKey="emissions" radius={[4, 4, 0, 0]}>
            {data.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={index === todayIndex ? "#3B82F6" : "#1E293B"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
