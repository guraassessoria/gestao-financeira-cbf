import { NextResponse } from 'next/server'

const mockDRAData = [
  {
    codigo: 'SL',
    descricao: 'SUPERÁVIT LÍQUIDO DO EXERCÍCIO',
    nivel: 1,
    nivel_visualizacao: 1,
    valor_atual: 80_000_000,
    valor_anterior: 71_000_000,
  },
  {
    codigo: 'OCI',
    descricao: 'OUTROS RESULTADOS ABRANGENTES',
    nivel: 1,
    nivel_visualizacao: 1,
    valor_atual: -2_500_000,
    valor_anterior: 1_200_000,
    filhos: [
      {
        codigo: 'OCI01',
        descricao: 'Ajuste de Avaliação Patrimonial',
        nivel: 2,
        nivel_visualizacao: 2,
        valor_atual: -1_800_000,
        valor_anterior: 800_000,
      },
      {
        codigo: 'OCI02',
        descricao: 'Ganhos/Perdas Atuariais sobre Plano de Benefícios',
        nivel: 2,
        nivel_visualizacao: 2,
        valor_atual: -700_000,
        valor_anterior: 400_000,
      },
    ],
  },
  {
    codigo: 'RA',
    descricao: 'RESULTADO ABRANGENTE TOTAL',
    nivel: 1,
    nivel_visualizacao: 1,
    valor_atual: 77_500_000,
    valor_anterior: 72_200_000,
  },
]

export async function GET() {
  return NextResponse.json({ data: mockDRAData, fonte: 'mock' })
}
