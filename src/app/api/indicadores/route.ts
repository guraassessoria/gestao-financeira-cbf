import { NextResponse } from 'next/server'
import { mockIndicadores } from '@/lib/mock-data'

export async function GET() {
  return NextResponse.json({ data: mockIndicadores, fonte: 'mock' })
}
