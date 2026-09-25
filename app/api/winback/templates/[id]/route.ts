import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'
import { getSession } from '@/lib/session'

// PATCH /api/winback/templates/[id]
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const updates = await req.json() as Partial<{
    name: string
    message: string
    trigger_score: number
    is_active: boolean
  }>

  const db = createAdminClient()
  const { data, error } = await db
    .from('dm_templates')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', params.id)
    .eq('profile_id', session.userId) // ensure ownership
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ template: data })
}

// DELETE /api/winback/templates/[id]
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const db = createAdminClient()
  const { error } = await db
    .from('dm_templates')
    .delete()
    .eq('id', params.id)
    .eq('profile_id', session.userId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
