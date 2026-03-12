import { NextRequest, NextResponse } from 'next/server'
import { writeFile, unlink } from 'fs/promises'
import { tmpdir } from 'os'
import { join } from 'path'
import { getServerSession } from 'next-auth'
import { parseCT2 } from '@/lib/python-runner'
import { createServiceClient } from '@/lib/supabase'
import { authOptions } from '@/lib/auth'
import type { LancamentoContabil } from '@/types'

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '100mb',
    },
  },
}

export async function POST(request: NextRequest) {
  let tempPath: string | null = null
  let uploadId: number | null = null

  try {
    // Verificar autenticação
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      )
    }

    const userId = session.user.id

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: 'Nenhum arquivo fornecido' },
        { status: 400 }
      )
    }

    // Validar nome do arquivo
    if (!file.name.endsWith('.csv')) {
      return NextResponse.json(
        { error: 'Arquivo deve ser CSV' },
        { status: 400 }
      )
    }

    // Salvar arquivo temporário
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const parsedTempDir = tmpdir()
    tempPath = join(parsedTempDir, `ct2-${Date.now()}.csv`)

    await writeFile(tempPath, buffer)

    // Fazer parse com Python
    const result = await parseCT2(tempPath)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }

    // Extrair array de lancamentos do resultado do parser
    const parseResult = result.data as any
    const lancamentos = (parseResult.lancamentos || []) as LancamentoContabil[]

    if (lancamentos.length === 0) {
      return NextResponse.json(
        { error: 'Nenhum lançamento válido encontrado no arquivo' },
        { status: 400 }
      )
    }

    // Criar cliente Supabase com service role (pode inserir sem RLS)
    const supabase = createServiceClient()

    // 1. Criar registro de upload com status 'processando'
    const uploadInsert = {
      nome_arquivo: file.name,
      tipo_arquivo: 'CT2',
      periodos: JSON.stringify(
        [...new Set(lancamentos.map((l) => l.periodo))].sort()
      ),
      total_lancamentos: lancamentos.length,
      total_valor: lancamentos.reduce((sum, l) => sum + l.valor, 0),
      status: 'processando',
      uploaded_by: userId,
    }

    const { data: uploadData, error: uploadError } = await supabase
      .from('upload_logs')
      .insert(uploadInsert)
      .select()
      .single()

    if (uploadError) {
      console.error('Erro ao criar upload_logs:', uploadError)
      return NextResponse.json(
        { error: `Erro ao registrar upload: ${uploadError.message}` },
        { status: 500 }
      )
    }

    uploadId = uploadData.id

    // 2. Inserir lancamentos em chunks de 1000 para evitar timeout
    const chunkSize = 1000
    const chunks = []

    for (let i = 0; i < lancamentos.length; i += chunkSize) {
      chunks.push(lancamentos.slice(i, i + chunkSize))
    }

    for (const chunk of chunks) {
      const lancamentoRecords = chunk.map((l) => ({
        filial: l.filial,
        data_lcto: l.dataLcto instanceof Date ? l.dataLcto.toISOString().split('T')[0] : l.dataLcto,
        periodo: l.periodo,
        numero_lote: l.numeroLote,
        sub_lote: l.subLote,
        numero_doc: l.numeroDoc,
        moeda: l.moeda || '01',
        tipo_lcto: l.tipoLcto,
        cta_debito: l.ctaDebito,
        cta_credito: l.ctaCredito,
        valor: l.valor,
        hist_pad: l.histPad,
        hist_lanc: l.histLanc,
        c_custo_deb: l.cCustoDeb,
        c_custo_crd: l.cCustoCrd,
        ocorren_deb: l.ocorrenDeb,
        ocorren_crd: l.ocorrenCrd,
        valor_moeda1: l.valorMoeda1,
        origem: 'upload',
        upload_id: uploadId,
      }))

      const { error: insertError } = await supabase
        .from('lancamentos_contabeis')
        .insert(lancamentoRecords)

      if (insertError) {
        // Atualizar upload_logs com erro
        await supabase
          .from('upload_logs')
          .update({
            status: 'erro',
            erros: JSON.stringify([insertError.message]),
          })
          .eq('id', uploadId)

        console.error('Erro ao inserir lancamentos:', insertError)
        return NextResponse.json(
          { error: `Erro ao processar lançamentos: ${insertError.message}` },
          { status: 500 }
        )
      }
    }

    // 3. Atualizar upload_logs com status 'ok'
    const { error: updateError } = await supabase
      .from('upload_logs')
      .update({
        status: 'ok',
      })
      .eq('id', uploadId)

    if (updateError) {
      console.error('Erro ao atualizar upload_logs:', updateError)
    }

    // Limpar arquivo temporário
    if (tempPath) {
      await unlink(tempPath).catch(() => {
        /* ignore */
      })
    }

    return NextResponse.json({
      success: true,
      uploadId,
      totalLancamentos: lancamentos.length,
      totalValor: lancamentos.reduce((sum, l) => sum + l.valor, 0),
    })
  } catch (error) {
    // Marcar upload como erro se foi criado
    if (uploadId) {
      try {
        const supabase = createServiceClient()
        await supabase
          .from('upload_logs')
          .update({
            status: 'erro',
            erros: JSON.stringify([
              error instanceof Error ? error.message : 'desconhecido',
            ]),
          })
          .eq('id', uploadId)
      } catch (err) {
        console.error('Erro ao atualizar status de upload:', err)
      }
    }

    console.error('Erro no upload:', error)
    return NextResponse.json(
      { error: `Erro interno: ${error instanceof Error ? error.message : 'desconhecido'}` },
      { status: 500 }
    )
  } finally {
    // Limpar arquivo temporário
    if (tempPath) {
      await unlink(tempPath).catch(() => {
        /* ignore */
      })
    }
  }
}
