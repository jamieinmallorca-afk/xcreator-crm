import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'
import { getSession } from '@/lib/session'

// GET /api/winback/templates
export async function GET() {
  const session = getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const db = createAdminClient()
  const { data, error } = await db
    .from('dm_templates')
    .select('*')
    .eq('profile_id', session.userId)
    .order('created_at', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ templates: data })
}

// POST /api/winback/templates  — create
export async function POST(req: NextRequest) {
  const session = getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { name, message, trigger_score } = await req.json() as {
    name: string
    message: string
    trigger_score: number
  }

  if (!name?.trim() || !message?.trim()) {
    return NextResponse.json({ error: 'Name and message are required' }, { status: 400 })
  }

  const db = createAdminClient()
  const { data, error } = await db
    .from('dm_templates')
    .insert({ profile_id: session.userId, name, message, trigger_score: trigger_score ?? 30 })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ template: data }, { status: 201 })
}
