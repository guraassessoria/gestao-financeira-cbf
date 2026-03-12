import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { cn } from '@/lib/utils'
import type { LinhaFinanceira } from '@/types/financeiro'

interface TabelaFinanceiraProps {
  linhas: LinhaFinanceira[]
  moeda: 'BRL' | 'USD'
  titulo?: string
}

function formatCurrency(value: number, moeda: 'BRL' | 'USD'): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: moeda === 'BRL' ? 'BRL' : 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

function formatPercent(value: number | null): string {
  if (value === null) return '—'
  return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`
}

function LinhaRow({ linha, moeda, nivel = 0 }: { linha: LinhaFinanceira; moeda: 'BRL' | 'USD'; nivel?: number }) {
  const isSintetica = linha.tipo === 'sintetica'
  const variacaoPositiva = linha.variacao_absoluta >= 0
  
  return (
    <>
      <TableRow className={cn(
        'hover:bg-slate-50',
        isSintetica && nivel === 0 && 'bg-slate-100 font-semibold',
        isSintetica && nivel === 1 && 'bg-slate-50 font-medium',
      )}>
        <TableCell>
          <span style={{ paddingLeft: `${nivel * 16}px` }}>{linha.descricao}</span>
        </TableCell>
        <TableCell className="text-right font-mono">
          {formatCurrency(linha.valor_atual, moeda)}
        </TableCell>
        <TableCell className="text-right font-mono text-muted-foreground">
          {formatCurrency(linha.valor_anterior, moeda)}
        </TableCell>
        <TableCell className={cn('text-right font-mono', variacaoPositiva ? 'text-green-600' : 'text-red-600')}>
          {formatCurrency(linha.variacao_absoluta, moeda)}
        </TableCell>
        <TableCell className={cn('text-right font-mono', variacaoPositiva ? 'text-green-600' : 'text-red-600')}>
          {formatPercent(linha.variacao_percentual)}
        </TableCell>
      </TableRow>
      {linha.filho?.map((filho) => (
        <LinhaRow key={filho.codigo} linha={filho} moeda={moeda} nivel={nivel + 1} />
      ))}
    </>
  )
}

export function TabelaFinanceira({ linhas, moeda, titulo }: TabelaFinanceiraProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{titulo || 'Descrição'}</TableHead>
            <TableHead className="text-right">Exercício Atual</TableHead>
            <TableHead className="text-right">Exercício Anterior</TableHead>
            <TableHead className="text-right">Variação ({moeda === 'BRL' ? 'R$' : 'USD'})</TableHead>
            <TableHead className="text-right">Variação (%)</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {linhas.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                Nenhum dado disponível. Verifique o mapeamento contábil e os lançamentos importados.
              </TableCell>
            </TableRow>
          ) : (
            linhas.map((linha) => (
              <LinhaRow key={linha.codigo} linha={linha} moeda={moeda} />
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
