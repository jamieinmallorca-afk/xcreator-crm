-- XCreator CRM — Supabase Schema
-- Run this in your Supabase SQL editor

-- Users (linked to X accounts)
create table users (
  id uuid primary key default gen_random_uuid(),
  x_user_id text unique not null,
  x_username text not null,
  x_display_name text,
  x_access_token text,
  x_refresh_token text,
  x_token_expires_at timestamptz,
  stripe_customer_id text,
  plan text default 'free' check (plan in ('free', 'pro', 'scale')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Subscribers (paid X subscribers of each creator)
create table subscribers (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid references users(id) on delete cascade,
  x_subscriber_id text not null,
  x_username text,
  x_display_name text,
  tier text,
  subscribed_at timestamptz,
  last_seen_at timestamptz,
  health_score integer default 100 check (health_score >= 0 and health_score <= 100),
  churn_risk text default 'low' check (churn_risk in ('low', 'medium', 'high')),
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(creator_id, x_subscriber_id)
);

-- Engagement events (interactions between subscriber and creator content)
create table engagement_events (
  id uuid primary key default gen_random_uuid(),
  subscriber_id uuid references subscribers(id) on delete cascade,
  event_type text not null check (event_type in ('like', 'reply', 'dm_open', 'dm_reply', 'retweet', 'view')),
  post_type text check (post_type in ('thread', 'video', 'poll', 'image', 'text', 'exclusive')),
  post_id text,
  occurred_at timestamptz not null,
  created_at timestamptz default now()
);

-- Health score history (daily snapshots)
create table health_score_history (
  id uuid primary key default gen_random_uuid(),
  subscriber_id uuid references subscribers(id) on delete cascade,
  score integer not null,
  churn_risk text not null,
  recorded_at date not null,
  unique(subscriber_id, recorded_at)
);

-- Win-back DM campaigns
create table winback_campaigns (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid references users(id) on delete cascade,
  name text not null,
  trigger_risk_level text not null check (trigger_risk_level in ('medium', 'high')),
  trigger_days_inactive integer not null default 30,
  message_template text not null,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- Win-back DM sends
create table winback_sends (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid references winback_campaigns(id),
  subscriber_id uuid references subscribers(id),
  sent_at timestamptz default now(),
  dm_id text,
  outcome text check (outcome in ('sent', 'failed', 'bounced', 'converted', 'cancelled'))
);

-- Revenue snapshots (daily)
create table revenue_snapshots (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid references users(id) on delete cascade,
  snapshot_date date not null,
  active_subscribers integer default 0,
  mrr_cents integer default 0,
  new_subscribers integer default 0,
  churned_subscribers integer default 0,
  unique(creator_id, snapshot_date)
);

-- RLS policies
alter table users enable row level security;
alter table subscribers enable row level security;
alter table engagement_events enable row level security;
alter table health_score_history enable row level security;
alter table winback_campaigns enable row level security;
alter table winback_sends enable row level security;
alter table revenue_snapshots enable row level security;

-- Indexes
create index idx_subscribers_creator_id on subscribers(creator_id);
create index idx_subscribers_health_score on subscribers(health_score);
create index idx_subscribers_churn_risk on subscribers(churn_risk);
create index idx_engagement_subscriber on engagement_events(subscriber_id, occurred_at desc);
create index idx_health_history on health_score_history(subscriber_id, recorded_at desc);
create index idx_revenue_creator on revenue_snapshots(creator_id, snapshot_date desc);
