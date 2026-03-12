import { type ClassValue, clsx } from 'clsx'

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

export function calcularVariacao(atual: number, anterior: number) {
  if (anterior === 0) return null
  return ((atual - anterior) / Math.abs(anterior)) * 100
}

export function calcularVariacaoAbsoluta(atual: number, anterior: number) {
  return atual - anterior
}

export function getQualitativa(variacao: number | null, positivoQuandoSobe = true): string {
  if (variacao === null) return '—'
  const bom = positivoQuandoSobe ? variacao > 0 : variacao < 0
  if (Math.abs(variacao) < 2) return '→ Estável'
  return bom ? '▲ Favorável' : '▼ Desfavorável'
}

export const MESES_PT = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

export const TRIMESTRES = ['1T', '2T', '3T', '4T']

export function getMesesTrimestre(trimestre: number): number[] {
  return [trimestre * 3 - 2, trimestre * 3 - 1, trimestre * 3]
}
