import { NextRequest, NextResponse } from 'next/server'
import { writeFile, unlink } from 'fs/promises'
import { tmpdir } from 'os'
import { join } from 'path'
import { getServerSession } from 'next-auth'
import { parseEstruturaDRE } from '@/lib/python-runner'
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

    tempPath = join(tmpdir(), `estrutura-dre-${Date.now()}.csv`)
    await writeFile(tempPath, Buffer.from(await file.arrayBuffer()))

    const result = await parseEstruturaDRE(tempPath)
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    const parsed = result.data as any
    const linhas = (parsed.linhas || []) as any[]

    if (linhas.length === 0) {
      return NextResponse.json({ error: 'Nenhuma linha válida encontrada no arquivo' }, { status: 400 })
    }

    const supabase = createServiceClient()

    const { error } = await supabase
      .from('estrutura_dre')
      .upsert(linhas, { onConflict: 'codigo_conta' })

    if (error) {
      return NextResponse.json({ error: `Erro ao salvar estrutura DRE: ${error.message}` }, { status: 500 })
    }

    await supabase.from('upload_logs').insert({
      nome_arquivo: file.name,
      tipo_arquivo: 'EDRE',
      total_lancamentos: linhas.length,
      status: 'ok',
      uploaded_by: session.user.id,
      erros: JSON.stringify(parsed.erros || []),
    })

    return NextResponse.json({
      success: true,
      totalEstrutura: linhas.length,
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
