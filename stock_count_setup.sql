-- ============================================================
-- Stock Count module — run once in the Supabase SQL editor
-- (Dashboard → SQL → New query → paste → Run)
-- ============================================================

-- Items each staff role keys in on their phone.
create table if not exists count_items (
  id       text primary key,
  name     text not null,
  unit     text not null default 'pcs',
  roles    jsonb not null default '[]'::jsonb,
  section  text not null default 'Kitchen',
  active   boolean not null default true,
  created_at timestamptz not null default now()
);

-- One submitted count sheet per submission (entries stored as JSON).
create table if not exists stock_counts (
  id         text primary key,
  date       timestamptz not null default now(),
  count_date text not null,
  role       text not null,
  staff_id   text not null,
  staff_name text not null,
  entries    jsonb not null default '[]'::jsonb,
  note       text,
  created_at timestamptz not null default now()
);

create index if not exists stock_counts_date_idx on stock_counts (date desc);

alter table count_items enable row level security;
alter table stock_counts enable row level security;

-- The app talks with the anon key (same as the existing tables), so allow
-- full access for now — the data is not user-sensitive beyond stock numbers.
drop policy if exists "count_items_all" on count_items;
create policy "count_items_all" on count_items for all using (true) with check (true);

drop policy if exists "stock_counts_all" on stock_counts;
create policy "stock_counts_all" on stock_counts for all using (true) with check (true);
