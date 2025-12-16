// Demo subscription plans for TechGila
// These are fallback plans when API doesn't return any

import type { SubscriptionPlan } from "./api";

export const DEMO_SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 1,
    name: "Starter",
    slug: "starter",
    description: "Perfect for individual developers and small projects",
    price: "0",
    currency: "USD",
    interval: "month",
    trial_days: 0,
    features: [
      "5 AI-prioritized builds per day",
      "Basic test insights",
      "Email notifications",
      "Community support",
      "1 project",
    ],
    is_active: true,
  },
  {
    id: 2,
    name: "Professional",
    slug: "professional",
    description: "For growing teams that need more power",
    price: "29.99",
    currency: "USD",
    interval: "month",
    trial_days: 14,
    features: [
      "Unlimited AI-prioritized builds",
      "Advanced test analytics",
      "Real-time notifications",
      "Priority support",
      "10 projects",
      "Team collaboration",
      "Custom queue rules",
      "API access",
    ],
    is_active: true,
  },
  {
    id: 3,
    name: "Enterprise",
    slug: "enterprise",
    description: "For large organizations with advanced needs",
    price: "99.99",
    currency: "USD",
    interval: "month",
    trial_days: 30,
    features: [
      "Everything in Professional",
      "Unlimited projects",
      "Advanced AI insights",
      "Custom integrations",
      "Dedicated support",
      "SLA guarantee",
      "SSO/SAML support",
      "Audit logs",
      "Custom reporting",
      "On-premise deployment option",
    ],
    is_active: true,
  },
];

export const DEFAULT_PLAN_SLUG = "starter";
