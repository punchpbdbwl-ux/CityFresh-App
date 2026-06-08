/**
 * CityFresh — Configuration
 *
 * ─────────────────────────────────────────────────────────────────
 * HOW TO ENABLE REAL-TIME SYNC (Supabase)
 * ─────────────────────────────────────────────────────────────────
 *
 * 1. Go to https://supabase.com → sign up free → New project
 *
 * 2. Once the project is ready, go to:
 *    Project Settings → API
 *    Copy:
 *      • "Project URL"       → paste below as SUPABASE_URL
 *      • "anon public" key   → paste below as SUPABASE_ANON_KEY
 *
 * 3. In the Supabase dashboard go to SQL Editor and run this:
 *
 * ┌──────────────────────────────────────────────────────────────┐
 *
 *   create table if not exists cf_products (
 *     id          bigint primary key default extract(epoch from now())*1000,
 *     direct      text default 'ON',
 *     category    text,
 *     "productOdoo" text,
 *     "productTH"   text,
 *     "secondUom"   text,
 *     cost        numeric,
 *     size        text,
 *     variety     text,
 *     brand       text,
 *     origins     text,
 *     qty         integer default 0,
 *     unit        text,
 *     "retailPrice"  numeric,
 *     "onlinePrice"  numeric,
 *     "onlineTotal"  numeric,
 *     created_at  timestamptz default now(),
 *     updated_at  timestamptz
 *   );
 *
 *   create table if not exists cf_categories (
 *     id          bigint primary key default extract(epoch from now())*1000,
 *     name        text not null,
 *     bg          text default '#8BAC4A',
 *     fg          text default '#fff',
 *     "iconName"  text,
 *     created_at  timestamptz default now()
 *   );
 *
 *   -- Enable Row Level Security (open read/write for anon key)
 *   alter table cf_products   enable row level security;
 *   alter table cf_categories enable row level security;
 *
 *   create policy "allow all" on cf_products   for all using (true) with check (true);
 *   create policy "allow all" on cf_categories for all using (true) with check (true);
 *
 *   -- Enable real-time on both tables
 *   alter publication supabase_realtime add table cf_products;
 *   alter publication supabase_realtime add table cf_categories;
 *
 * └──────────────────────────────────────────────────────────────┘
 *
 * 4. Paste your credentials below, save, and open the app.
 *    All tabs/devices sharing the URL will sync in real time.
 *
 * ─────────────────────────────────────────────────────────────────
 * Leave both values as-is to keep using offline localStorage mode.
 * ─────────────────────────────────────────────────────────────────
 */

const CONFIG = {
  SUPABASE_URL:      'YOUR_SUPABASE_URL',       // e.g. 'https://abcdefgh.supabase.co'
  SUPABASE_ANON_KEY: 'YOUR_SUPABASE_ANON_KEY',  // e.g. 'eyJhbGci...'
};
