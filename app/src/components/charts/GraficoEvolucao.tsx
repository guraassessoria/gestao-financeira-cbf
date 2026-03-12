'use client'

import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
// nomeMes utility available if needed

interface PontoGrafico {
  periodo: string
  atual: number
  anterior?: number
}

interface GraficoEvolucaoProps {
  dados: PontoGrafico[]
  tipo?: 'barra' | 'linha'
  titulo?: string
  labelAtual: string
  labelAnterior?: string
  moeda?: string
  altura?: number
}

function formatarEixoY(valor: number): string {
  if (Math.abs(valor) >= 1_000_000) return `${(valor / 1_000_000).toFixed(1)}M`
  if (Math.abs(valor) >= 1_000) return `${(valor / 1_000).toFixed(0)}K`
  return String(valor)
}

const COLORS = {
  atual: '#16a34a',
  anterior: '#94a3b8',
}

export default function GraficoEvolucao({
  dados,
  tipo = 'barra',
  titulo,
  labelAtual,
  labelAnterior,
  moeda = 'BRL',
  altura = 280,
}: GraficoEvolucaoProps) {
  const tooltipFormatter = (valor: number) => {
    const locale = moeda === 'BRL' ? 'pt-BR' : 'en-US'
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: moeda,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(valor)
  }

  const Chart = tipo === 'linha' ? LineChart : BarChart

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      {titulo && (
        <h3 className="text-sm font-semibold text-gray-700 mb-4">{titulo}</h3>
      )}
      <ResponsiveContainer width="100%" height={altura}>
        <Chart data={dados} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis
            dataKey="periodo"
            tick={{ fontSize: 11, fill: '#64748b' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tickFormatter={formatarEixoY}
            tick={{ fontSize: 11, fill: '#64748b' }}
            axisLine={false}
            tickLine={false}
            width={55}
          />
          <Tooltip
            formatter={(value, name) => [
              tooltipFormatter(typeof value === 'number' ? value : 0),
              name,
            ]}
            contentStyle={{
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              fontSize: '12px',
            }}
          />
          <Legend
            wrapperStyle={{ fontSize: '12px', paddingTop: '12px' }}
          />

          {tipo === 'barra' ? (
            <>
              <Bar
                dataKey="atual"
                name={labelAtual}
                fill={COLORS.atual}
                radius={[3, 3, 0, 0]}
                maxBarSize={40}
              />
              {labelAnterior && (
                <Bar
                  dataKey="anterior"
                  name={labelAnterior}
                  fill={COLORS.anterior}
                  radius={[3, 3, 0, 0]}
                  maxBarSize={40}
                />
              )}
            </>
          ) : (
            <>
              <Line
                type="monotone"
                dataKey="atual"
                name={labelAtual}
                stroke={COLORS.atual}
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
              {labelAnterior && (
                <Line
                  type="monotone"
                  dataKey="anterior"
                  name={labelAnterior}
                  stroke={COLORS.anterior}
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={{ r: 3 }}
                />
              )}
            </>
          )}
        </Chart>
      </ResponsiveContainer>
    </div>
  )
}
