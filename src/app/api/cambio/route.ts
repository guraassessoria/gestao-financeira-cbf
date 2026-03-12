import { NextResponse } from 'next/server'

export async function GET() {
  // Mock exchange rate - in production would fetch from Supabase or external API
  return NextResponse.json({
    taxa_brl_usd: 5.12,
    data: new Date().toISOString().split('T')[0],
    fonte: 'mock',
  })
}
