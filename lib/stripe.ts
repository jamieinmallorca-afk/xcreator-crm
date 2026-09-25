import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
})

export const PLANS = {
  free: {
    name: 'Free',
    price: 0,
    priceId: null,
    subscriberLimit: 100,
    features: ['Up to 100 subscribers', 'Health scores', 'Daily sync'],
  },
  pro: {
    name: 'Pro',
    price: 29,
    priceId: process.env.STRIPE_PRO_PRICE_ID!,
    subscriberLimit: 1000,
    features: ['Up to 1,000 subscribers', 'Health scores', 'Churn risk alerts', 'Win-back suggestions', 'Daily sync'],
  },
  scale: {
    name: 'Scale',
    price: 79,
    priceId: process.env.STRIPE_SCALE_PRICE_ID!,
    subscriberLimit: 5000,
    features: ['Up to 5,000 subscribers', 'Everything in Pro', 'Priority support', 'Cohort analysis'],
  },
} as const

export type PlanKey = keyof typeof PLANS
