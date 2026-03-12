import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { createServiceClient } from '@/lib/supabase'
import { authOptions } from '@/lib/auth'

export const maxDuration = 60

export interface CT2BatchRecord {
  filial: string
  data_lcto: string
  periodo: string
  numero_lote: string | null
  sub_lote: string | null
  numero_doc: string | null
  moeda: string
  tipo_lcto: string | null
  cta_debito: string | null
  cta_credito: string | null
  valor: number
  hist_pad: string | null
  hist_lanc: string | null
  c_custo_deb: string | null
  c_custo_crd: string | null
  ocorren_deb: string | null
  ocorren_crd: string | null
  valor_moeda1: number
}

export interface CT2BatchRequest {
  records: CT2BatchRecord[]
  batchIndex: number
  totalBatches?: number
  isFinal?: boolean
  uploadId?: number
  nomeArquivo?: string
  totalLancamentos?: number
  totalValor?: number
  periodos?: string[]
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }
    const userId = session.user.id
    const supabase = createServiceClient()

    const body: CT2BatchRequest = await request.json()
    const { records, batchIndex, totalBatches, isFinal, nomeArquivo, totalLancamentos, totalValor, periodos } = body
    let { uploadId } = body

    // Primeiro batch: criar log + deletar dados antigos
    if (batchIndex === 0) {
      // Criar registro de upload
      const { data: uploadData, error: uploadError } = await supabase
        .from('upload_logs')
        .insert({
          nome_arquivo: nomeArquivo || 'CT2.csv',
          tipo_arquivo: 'CT2',
          periodos: JSON.stringify((periodos || []).sort()),
          total_lancamentos: totalLancamentos || 0,
          total_valor: totalValor || 0,
          status: 'processando',
          uploaded_by: userId,
        })
        .select()
        .single()

      if (uploadError) {
        return NextResponse.json({ error: `Erro ao criar log de upload: ${uploadError.message}` }, { status: 500 })
      }
      uploadId = uploadData.id

      // Deletar todos os lançamentos existentes
      const { error: deleteError } = await supabase
        .from('lancamentos_contabeis')
        .delete()
        .not('id', 'is', null)

      if (deleteError) {
        await supabase.from('upload_logs').update({ status: 'erro', erros: JSON.stringify([deleteError.message]) }).eq('id', uploadId)
        return NextResponse.json({ error: `Erro ao limpar dados anteriores: ${deleteError.message}` }, { status: 500 })
      }
    }

    // Inserir registros do batch
    if (records.length > 0) {
      const lancamentoRecords = records.map((r) => ({
        ...r,
        origem: 'upload',
        upload_id: uploadId,
      }))

      const { error: insertError } = await supabase
        .from('lancamentos_contabeis')
        .insert(lancamentoRecords)

      if (insertError) {
        if (uploadId) {
          await supabase.from('upload_logs').update({ status: 'erro', erros: JSON.stringify([insertError.message]) }).eq('id', uploadId)
        }
        return NextResponse.json({ error: `Erro ao inserir lançamentos: ${insertError.message}` }, { status: 500 })
      }
    }

    // Último batch: marcar como concluído e persistir totais finais
    const shouldFinalize = isFinal === true || (typeof totalBatches === 'number' && batchIndex === totalBatches - 1)
    if (shouldFinalize && uploadId) {
      const updatePayload: {
        status: 'ok'
        total_lancamentos?: number
        total_valor?: number
        periodos?: string
      } = { status: 'ok' }

      if (typeof totalLancamentos === 'number') {
        updatePayload.total_lancamentos = totalLancamentos
      }
      if (typeof totalValor === 'number') {
        updatePayload.total_valor = totalValor
      }
      if (Array.isArray(periodos)) {
        updatePayload.periodos = JSON.stringify([...new Set(periodos)].sort())
      }

      await supabase.from('upload_logs').update(updatePayload).eq('id', uploadId)
    }

    return NextResponse.json({ success: true, uploadId, batchIndex, totalBatches, isFinal: shouldFinalize })
  } catch (error) {
    return NextResponse.json(
      { error: `Erro interno: ${error instanceof Error ? error.message : 'desconhecido'}` },
      { status: 500 }
    )
  }
}
