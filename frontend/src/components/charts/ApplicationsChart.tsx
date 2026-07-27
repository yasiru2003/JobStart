'use client'

import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'

const defaultData = [
  { week: 'W1', applications: 250, trend: 260 },
  { week: 'W2', applications: 330, trend: 345 },
  { week: 'W3', applications: 320, trend: 330 },
  { week: 'W4', applications: 400, trend: 410 },
  { week: 'W5', applications: 380, trend: 390 },
  { week: 'W6', applications: 450, trend: 460 },
  { week: 'W7', applications: 440, trend: 450 },
  { week: 'W8', applications: 520, trend: 500 },
]

export default function ApplicationsChart({ data = defaultData }: { data?: typeof defaultData }) {
  return (
    <div className="w-full h-[240px] pt-4">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <XAxis
            dataKey="week"
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'hsl(var(--muted))', fontSize: 12 }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'hsl(var(--muted))', fontSize: 12 }}
            hide
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-surface p-3 border border-border rounded-xl shadow-lg text-xs">
                    <p className="font-semibold text-foreground mb-1">{payload[0].payload.week}</p>
                    <p className="text-primary font-medium">
                      Applications: <span className="font-bold">{payload[0].value}</span>
                    </p>
                  </div>
                )
              }
              return null
            }}
          />
          <Bar
            dataKey="applications"
            fill="#0F766E"
            radius={[6, 6, 0, 0]}
            barSize={32}
          />
          <Line
            type="monotone"
            dataKey="trend"
            stroke="#F59E0B"
            strokeWidth={3}
            dot={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}
