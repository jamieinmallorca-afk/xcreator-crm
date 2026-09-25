export const PLANS = {
  free: {
    name: 'Free',
    price: 0,
    priceId: null,
    features: ['Up to 100 subscribers', 'Basic health scores', 'Daily sync'],
  },
  pro: {
    name: 'Pro',
    price: 29,
    priceId: process.env.STRIPE_PRO_PRICE_ID!,
    features: ['Up to 1,000 subscribers', 'Advanced health scores', 'Churn alerts', 'Priority support'],
  },
  scale: {
    name: 'Scale',
    price: 79,
    priceId: process.env.STRIPE_SCALE_PRICE_ID!,
    features: ['Up to 5,000 subscribers', 'All Pro features', 'Custom alerts', 'API access'],
  },
} as const

export type PlanKey = keyof typeof PLANS
