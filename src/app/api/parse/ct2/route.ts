import { NextRequest, NextResponse } from 'next/server'
import { writeFile } from 'fs/promises'
import { tmpdir } from 'os'
import { join } from 'path'
import { parseCT2 } from '@/lib/python-runner'

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '100mb',
    },
  },
}

export async function POST(request: NextRequest) {
  try {
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
    const tempDir = tmpdir()
    const tempPath = join(tempDir, `ct2-${Date.now()}.csv`)

    await writeFile(tempPath, buffer)

    // Fazer parse com Python
    const result = await parseCT2(tempPath)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }

    // Retornar dados parseados
    return NextResponse.json({
      success: true,
      filename: file.name,
      data: result.data,
    })
  } catch (error) {
    console.error('Erro no upload:', error)
    return NextResponse.json(
      { error: `Erro interno: ${error instanceof Error ? error.message : 'desconhecido'}` },
      { status: 500 }
    )
  }
}
