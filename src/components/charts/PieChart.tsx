'use client'

import {
  PieChart as RePieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { Moeda } from '@/lib/types'
import { abbreviateCurrency, formatPercent } from '@/lib/formatters'

interface PieChartProps {
  data: { name: string; value: number; color: string }[]
  moeda?: Moeda
  height?: number
}

function CustomTooltip({ active, payload, moeda }: {
  active?: boolean
  payload?: { name: string; value: number; payload: { color: string } }[]
  moeda: Moeda
}) {
  if (!active || !payload?.length) return null
  const p = payload[0]
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
      <p className="font-semibold text-gray-800">{p.name}</p>
      <p className="text-sm text-gray-600">{abbreviateCurrency(p.value, moeda)}</p>
    </div>
  )
}

export default function PieChart({ data, moeda = 'BRL', height = 300 }: PieChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RePieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={2}
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip moeda={moeda} />} />
        <Legend />
      </RePieChart>
    </ResponsiveContainer>
  )
}
