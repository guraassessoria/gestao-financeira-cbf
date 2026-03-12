import { NextRequest, NextResponse } from 'next/server'
import { writeFile, unlink } from 'fs/promises'
import { tmpdir } from 'os'
import { join } from 'path'
import { getServerSession } from 'next-auth'
import { parseCV0 } from '@/lib/python-runner'
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
    tempPath = join(tmpdir(), `cv0-${Date.now()}.csv`)
    await writeFile(tempPath, buffer)

    const result = await parseCV0(tempPath)
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    const entidades = (result.data as any[]) || []
    if (entidades.length === 0) {
      return NextResponse.json({ error: 'Nenhuma entidade encontrada no arquivo' }, { status: 400 })
    }

    const supabase = createServiceClient()

    const records = entidades.map((e: any) => ({
      filial: e.filial,
      plano_contab: e.plano_contab,
      item: e.item,
      codigo: e.codigo,
      descricao: e.descricao,
      classe: e.classe,
      cond_normal: e.cond_normal,
      bloqueada: e.bloqueada,
    }))

    const { error } = await supabase
      .from('entidades_dre')
      .upsert(records, { onConflict: 'filial,codigo' })

    if (error) {
      return NextResponse.json(
        { error: `Erro ao salvar entidades: ${error.message}` },
        { status: 500 }
      )
    }

    await supabase.from('upload_logs').insert({
      nome_arquivo: file.name,
      tipo_arquivo: 'CV0',
      total_lancamentos: entidades.length,
      status: 'ok',
      uploaded_by: session.user.id,
    })

    return NextResponse.json({ success: true, totalEntidades: entidades.length })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro interno' },
      { status: 500 }
    )
  } finally {
    if (tempPath) await unlink(tempPath).catch(() => undefined)
  }
}
