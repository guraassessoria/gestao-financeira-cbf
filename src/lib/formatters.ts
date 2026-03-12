import { Moeda } from './types'

export function formatCurrency(value: number, moeda: Moeda = 'BRL'): string {
  if (moeda === 'USD') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)
  }
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

export function formatPercent(value: number | null | undefined): string {
  if (value === null || value === undefined) return '—'
  const sign = value > 0 ? '+' : ''
  return `${sign}${new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value)}%`
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return ''
  // Handle DD/MM/YYYY format from TOTVS
  const parts = dateStr.split('/')
  if (parts.length === 3) {
    return `${parts[0]}/${parts[1]}/${parts[2]}`
  }
  return dateStr
}

export function parseBrazilianNumber(value: string): number {
  if (!value || value.trim() === '') return 0
  // Remove thousand separators and convert decimal comma to dot
  const cleaned = value.replace(/\./g, '').replace(',', '.')
  const num = parseFloat(cleaned)
  return isNaN(num) ? 0 : num
}

export function abbreviateCurrency(value: number, moeda: Moeda = 'BRL'): string {
  const prefix = moeda === 'BRL' ? 'R$ ' : 'US$ '
  const abs = Math.abs(value)
  const sign = value < 0 ? '-' : ''
  if (abs >= 1_000_000_000) {
    return `${sign}${prefix}${formatNumber(abs / 1_000_000_000)}B`
  }
  if (abs >= 1_000_000) {
    return `${sign}${prefix}${formatNumber(abs / 1_000_000)}M`
  }
  if (abs >= 1_000) {
    return `${sign}${prefix}${formatNumber(abs / 1_000)}K`
  }
  return `${sign}${prefix}${formatNumber(abs)}`
}
