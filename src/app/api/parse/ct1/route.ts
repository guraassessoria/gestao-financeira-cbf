import { NextRequest, NextResponse } from 'next/server'
import { writeFile, unlink } from 'fs/promises'
import { tmpdir } from 'os'
import { join } from 'path'
import { getServerSession } from 'next-auth'
import { parseCT1 } from '@/lib/python-runner'
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
    tempPath = join(tmpdir(), `ct1-${Date.now()}.csv`)
    await writeFile(tempPath, buffer)

    const result = await parseCT1(tempPath)
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    const contas = (result.data as any[]) || []
    if (contas.length === 0) {
      return NextResponse.json({ error: 'Nenhuma conta encontrada no arquivo' }, { status: 400 })
    }

    const supabase = createServiceClient()

    // Upsert contas (atualiza se já existir pelo índice filial+cod_conta)
    const records = contas.map((c: any) => ({
      filial: c.filial,
      cod_conta: c.cod_conta,
      descricao: c.descricao,
      classe: c.classe,
      cond_normal: c.cond_normal,
      cta_superior: c.cta_superior,
      aceita_cc: c.aceita_cc,
      aceita_item: c.aceita_item,
      aceita_clvl: c.aceita_clvl,
      nivel: c.nivel,
    }))

    const { error } = await supabase
      .from('contas_contabeis')
      .upsert(records, { onConflict: 'filial,cod_conta' })

    if (error) {
      return NextResponse.json(
        { error: `Erro ao salvar contas: ${error.message}` },
        { status: 500 }
      )
    }

    // Registrar no upload_log
    await supabase.from('upload_logs').insert({
      nome_arquivo: file.name,
      tipo_arquivo: 'CT1',
      total_lancamentos: contas.length,
      status: 'ok',
      uploaded_by: session.user.id,
    })

    return NextResponse.json({ success: true, totalContas: contas.length })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro interno' },
      { status: 500 }
    )
  } finally {
    if (tempPath) await unlink(tempPath).catch(() => undefined)
  }
}
