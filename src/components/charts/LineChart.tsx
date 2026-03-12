'use client'

import {
  LineChart as ReLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { Moeda } from '@/lib/types'
import { abbreviateCurrency } from '@/lib/formatters'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface LineChartProps {
  data: any[]
  lines: { key: string; label: string; color: string }[]
  xKey: string
  moeda?: Moeda
  height?: number
}

function CustomTooltip({ active, payload, label, moeda }: {
  active?: boolean
  payload?: { name: string; value: number; color: string }[]
  label?: string
  moeda: Moeda
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
      <p className="font-semibold text-gray-800 mb-2">{label}</p>
      {payload.map((p) => (
        <p key={p.name} className="text-sm" style={{ color: p.color }}>
          {p.name}: {abbreviateCurrency(p.value, moeda)}
        </p>
      ))}
    </div>
  )
}

export default function LineChart({ data, lines, xKey, moeda = 'BRL', height = 300 }: LineChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <ReLineChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey={xKey} tick={{ fontSize: 12 }} />
        <YAxis
          tickFormatter={(v) => abbreviateCurrency(v, moeda)}
          tick={{ fontSize: 11 }}
          width={80}
        />
        <Tooltip content={<CustomTooltip moeda={moeda} />} />
        <Legend />
        {lines.map((line) => (
          <Line
            key={line.key}
            type="monotone"
            dataKey={line.key}
            name={line.label}
            stroke={line.color}
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
        ))}
      </ReLineChart>
    </ResponsiveContainer>
  )
}
