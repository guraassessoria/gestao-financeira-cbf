'use client'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { PeriodoTipo } from '@/types/financeiro'

interface PeriodoSelectorProps {
  ano: number
  mes?: number
  trimestre?: number
  periodo: PeriodoTipo
  onAnoChange: (ano: number) => void
  onMesChange?: (mes: number) => void
  onTrimestreChange?: (trimestre: number) => void
  onPeriodoChange: (periodo: PeriodoTipo) => void
}

const ANOS = [2025, 2024, 2023, 2022]
const MESES = [
  { value: 1, label: 'Janeiro' }, { value: 2, label: 'Fevereiro' },
  { value: 3, label: 'Março' }, { value: 4, label: 'Abril' },
  { value: 5, label: 'Maio' }, { value: 6, label: 'Junho' },
  { value: 7, label: 'Julho' }, { value: 8, label: 'Agosto' },
  { value: 9, label: 'Setembro' }, { value: 10, label: 'Outubro' },
  { value: 11, label: 'Novembro' }, { value: 12, label: 'Dezembro' },
]
const TRIMESTRES = [
  { value: 1, label: '1º Tri (Jan–Mar)' }, { value: 2, label: '2º Tri (Abr–Jun)' },
  { value: 3, label: '3º Tri (Jul–Set)' }, { value: 4, label: '4º Tri (Out–Dez)' },
]

export function PeriodoSelector({
  ano, mes, trimestre, periodo,
  onAnoChange, onMesChange, onTrimestreChange, onPeriodoChange,
}: PeriodoSelectorProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Tabs value={periodo} onValueChange={(v) => onPeriodoChange(v as PeriodoTipo)}>
        <TabsList>
          <TabsTrigger value="mensal">Mensal</TabsTrigger>
          <TabsTrigger value="trimestral">Trimestral</TabsTrigger>
          <TabsTrigger value="anual">Anual</TabsTrigger>
        </TabsList>
      </Tabs>

      <Select value={String(ano)} onValueChange={(v) => onAnoChange(Number(v))}>
        <SelectTrigger className="w-28">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {ANOS.map((a) => (
            <SelectItem key={a} value={String(a)}>{a}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {periodo === 'mensal' && onMesChange && (
        <Select value={String(mes ?? 1)} onValueChange={(v) => onMesChange(Number(v))}>
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {MESES.map((m) => (
              <SelectItem key={m.value} value={String(m.value)}>{m.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {periodo === 'trimestral' && onTrimestreChange && (
        <Select value={String(trimestre ?? 1)} onValueChange={(v) => onTrimestreChange(Number(v))}>
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TRIMESTRES.map((t) => (
              <SelectItem key={t.value} value={String(t.value)}>{t.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  )
}
