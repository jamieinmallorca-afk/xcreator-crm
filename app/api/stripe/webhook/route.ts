import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase'


const SUBSCRIBER_LIMITS: Record<string, number> = {
  pro: 1000,
  scale: 5000,
}

export async function POST(request: NextRequest) {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')!

  let event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err: any) {
    console.error('Webhook signature failed:', err.message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const db = createAdminClient()

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as any
      const profileId = session.metadata?.profile_id
      const plan = session.metadata?.plan

      if (profileId && plan) {
        await db.from('profiles').update({
          subscription_tier: plan,
          subscriber_limit: SUBSCRIBER_LIMITS[plan] ?? 100,
          stripe_subscription_id: session.subscription,
        }).eq('id', profileId)
      }
      break
    }

    case 'customer.subscription.updated': {
      const sub = event.data.object as any
      const customer = await stripe.customers.retrieve(sub.customer as string)
      const profileId = (customer as any).metadata?.profile_id

      if (profileId) {
        const isActive = sub.status === 'active'
        const plan = isActive ? (sub.metadata?.plan ?? 'free') : 'free'
        await db.from('profiles').update({
          subscription_tier: plan,
          subscriber_limit: isActive ? (SUBSCRIBER_LIMITS[plan] ?? 100) : 100,
        }).eq('id', profileId)
      }
      break
    }

    case 'customer.subscription.deleted': {
      const sub = event.data.object as any
      const customer = await stripe.customers.retrieve(sub.customer as string)
      const profileId = (customer as any).metadata?.profile_id

      if (profileId) {
        await db.from('profiles').update({
          subscription_tier: 'free',
          subscriber_limit: 100,
          stripe_subscription_id: null,
        }).eq('id', profileId)
      }
      break
    }
  }

  return NextResponse.json({ received: true })
}
