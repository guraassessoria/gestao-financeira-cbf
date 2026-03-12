import { NextRequest, NextResponse } from 'next/server'
import { writeFile, unlink } from 'fs/promises'
import { tmpdir } from 'os'
import { join } from 'path'
import { getServerSession } from 'next-auth'
import { parseCTTTS } from '@/lib/csv-parsers'
import { createServiceClient } from '@/lib/supabase'
import { authOptions } from '@/lib/auth'

export async function POST(request: NextRequest) {
  let tempPath: string | null = null

  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'Nenhum arquivo fornecido' }, { status: 400 })
    }
    if (!file.name.endsWith('.csv')) {
      return NextResponse.json({ error: 'Arquivo deve ser CSV' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    tempPath = join(tmpdir(), `ctt-${Date.now()}.csv`)
    await writeFile(tempPath, buffer)

    const result = await parseCTTTS(tempPath)
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    const ccs = (result.data as any[]) || []
    if (ccs.length === 0) {
      return NextResponse.json(
        { error: 'Nenhum centro de custo encontrado no arquivo' },
        { status: 400 }
      )
    }

    const supabase = createServiceClient()

    const records = ccs.map((c: any) => ({
      filial: c.filial,
      cod_cc: c.cod_cc,
      descricao: c.descricao,
      classe: c.classe,
      cond_normal: c.cond_normal,
      cc_superior: c.cc_superior,
      bloqueado: c.bloqueado,
    }))

    const { error } = await supabase
      .from('centros_custo')
      .upsert(records, { onConflict: 'filial,cod_cc' })

    if (error) {
      return NextResponse.json(
        { error: `Erro ao salvar centros de custo: ${error.message}` },
        { status: 500 }
      )
    }

    await supabase.from('upload_logs').insert({
      nome_arquivo: file.name,
      tipo_arquivo: 'CTT',
      total_lancamentos: ccs.length,
      status: 'ok',
      uploaded_by: session.user.id,
    })

    return NextResponse.json({ success: true, totalCC: ccs.length })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro interno' },
      { status: 500 }
    )
  } finally {
    if (tempPath) await unlink(tempPath).catch(() => undefined)
  }
}
