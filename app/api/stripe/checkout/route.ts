import { NextRequest, NextResponse } from 'next/server'
import { stripe, PLANS, PlanKey } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase'
import { getSession } from '@/lib/session'

export async function POST(request: NextRequest) {
  const session = getSession()
  if (!session) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const { plan } = await request.json() as { plan: PlanKey }
  const planConfig = PLANS[plan]

  if (!planConfig || !planConfig.priceId) {
    return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
  }

  const db = createAdminClient()
  const { data: profile } = await db
    .from('profiles')
    .select('stripe_customer_id, x_username')
    .eq('id', session.userId)
    .single()

  let customerId = profile?.stripe_customer_id

  // Create Stripe customer if not exists
  if (!customerId) {
    const customer = await stripe.customers.create({
      metadata: {
        profile_id: session.userId,
        x_username: session.xUsername,
      },
    })
    customerId = customer.id
    await db.from('profiles').update({ stripe_customer_id: customerId }).eq('id', session.userId)
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL!

  const checkoutSession = await stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ['card'],
    line_items: [{ price: planConfig.priceId, quantity: 1 }],
    mode: 'subscription',
    success_url: `${appUrl}/dashboard?upgraded=true`,
    cancel_url: `${appUrl}/dashboard`,
    metadata: { profile_id: session.userId, plan },
  })

  return NextResponse.json({ url: checkoutSession.url })
}
