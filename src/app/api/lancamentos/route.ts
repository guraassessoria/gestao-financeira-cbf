import { NextResponse } from 'next/server'
import { mockDadosMensais } from '@/lib/mock-data'

export async function GET() {
  return NextResponse.json({ data: mockDadosMensais, fonte: 'mock' })
}
