import { NextRequest, NextResponse } from 'next/server'
import { writeFile, unlink } from 'fs/promises'
import { tmpdir } from 'os'
import { join } from 'path'
import { getServerSession } from 'next-auth'
import { parseDeParaDRETS } from '@/lib/csv-parsers'
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

    tempPath = join(tmpdir(), `de-para-dre-${Date.now()}.csv`)
    await writeFile(tempPath, Buffer.from(await file.arrayBuffer()))

    const result = await parseDeParaDRETS(tempPath)
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    const parsed = result.data as any
    const mappings = (parsed.mappings || []) as any[]

    if (mappings.length === 0) {
      return NextResponse.json({ error: 'Nenhum mapeamento válido encontrado no arquivo' }, { status: 400 })
    }

    const supabase = createServiceClient()

    const { error } = await supabase
      .from('de_para_dre')
      .upsert(mappings, { onConflict: 'codigo_conta_contabil,codigo_centro_custo' })

    if (error) {
      return NextResponse.json({ error: `Erro ao salvar de-para DRE: ${error.message}` }, { status: 500 })
    }

    await supabase.from('upload_logs').insert({
      nome_arquivo: file.name,
      tipo_arquivo: 'DPDRE',
      total_lancamentos: mappings.length,
      status: 'ok',
      uploaded_by: session.user.id,
      erros: JSON.stringify(parsed.erros || []),
    })

    return NextResponse.json({
      success: true,
      totalDePara: mappings.length,
      erros: parsed.erros || [],
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro interno' },
      { status: 500 }
    )
  } finally {
    if (tempPath) {
      await unlink(tempPath).catch(() => undefined)
    }
  }
}
