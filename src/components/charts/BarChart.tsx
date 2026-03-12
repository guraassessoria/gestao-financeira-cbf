'use client'

import {
  BarChart as ReBarChart,
  Bar,
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
interface BarChartProps {
  data: any[]
  bars: { key: string; label: string; color: string }[]
  xKey: string
  moeda?: Moeda
  height?: number
}

function formatYAxis(value: number, moeda: Moeda = 'BRL') {
  return abbreviateCurrency(value, moeda)
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

export default function BarChart({ data, bars, xKey, moeda = 'BRL', height = 300 }: BarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <ReBarChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey={xKey} tick={{ fontSize: 12 }} />
        <YAxis
          tickFormatter={(v) => formatYAxis(v, moeda)}
          tick={{ fontSize: 11 }}
          width={80}
        />
        <Tooltip content={<CustomTooltip moeda={moeda} />} />
        <Legend />
        {bars.map((bar) => (
          <Bar key={bar.key} dataKey={bar.key} name={bar.label} fill={bar.color} radius={[4, 4, 0, 0]} />
        ))}
      </ReBarChart>
    </ResponsiveContainer>
  )
}
