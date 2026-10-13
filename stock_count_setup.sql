-- ============================================================
-- Stock Count module — run once in the Supabase SQL editor
-- (Dashboard → SQL → New query → paste → Run)
-- ============================================================

-- Items each staff role keys in on their phone.
create table if not exists count_items (
  id           text primary key,
  name         text not null,
  inventory_id text,
  unit         text not null default 'pcs',
  roles        jsonb not null default '[]'::jsonb,
  section      text not null default 'Kitchen',
  active       boolean not null default true,
  created_at timestamptz not null default now()
);

alter table count_items add column if not exists inventory_id text;

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
create index if not exists stock_counts_count_date_idx on stock_counts (count_date);

-- A staff member can submit one sheet per role and Nairobi calendar day.
create unique index if not exists stock_counts_one_per_staff_day_idx
  on stock_counts (count_date, staff_id, lower(role));

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'count_items_roles_array') then
    alter table count_items add constraint count_items_roles_array
      check (jsonb_typeof(roles) = 'array');
  end if;
  if not exists (select 1 from pg_constraint where conname = 'stock_counts_entries_array') then
    alter table stock_counts add constraint stock_counts_entries_array
      check (jsonb_typeof(entries) = 'array');
  end if;
  if not exists (select 1 from pg_constraint where conname = 'stock_counts_count_date_format') then
    alter table stock_counts add constraint stock_counts_count_date_format
      check (count_date ~ '^\d{4}-\d{2}-\d{2}$');
  end if;
end $$;

-- Link exact legacy checklist names where possible. New/admin-created rows
-- should set inventory_id explicitly instead of relying on names.
update count_items ci
set inventory_id = i.id
from inventory i
where ci.inventory_id is null
  and lower(trim(ci.name)) = lower(trim(i.name));

alter table count_items enable row level security;
alter table stock_counts enable row level security;

-- The legacy PIN login is not a Supabase Auth session, so count_items still
-- needs its existing write policy until login is migrated to Supabase Auth.
-- Stock history is otherwise append-only: writes go through the validating RPC.
drop policy if exists "count_items_all" on count_items;
create policy "count_items_all" on count_items for all using (true) with check (true);

drop policy if exists "stock_counts_all" on stock_counts;
drop policy if exists "stock_counts_read" on stock_counts;
create policy "stock_counts_read" on stock_counts for select using (true);
drop policy if exists "stock_counts_insert" on stock_counts;
create policy "stock_counts_insert" on stock_counts for insert with check (
  exists (
    select 1 from users u
    where u.id = stock_counts.staff_id
      and lower(trim(u.role)) = lower(trim(stock_counts.role))
  )
);

-- The client cannot update inventory and the history row independently.
-- This function validates the count, derives staff identity from users, and
-- applies linked inventory changes in the same transaction as the insert.
create or replace function public.submit_stock_count(p_count jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  staff_role text;
  staff_name_value text;
  staff_id_value text := nullif(trim(p_count->>'staffId'), '');
  count_date_value text := nullif(trim(p_count->>'countDate'), '');
  entry jsonb;
  closing_value numeric;
  inventory_id_value text;
begin
  if nullif(trim(p_count->>'id'), '') is null then
    raise exception 'A count id is required';
  end if;
  if staff_id_value is null or count_date_value is null
     or count_date_value !~ '^\d{4}-\d{2}-\d{2}$' then
    raise exception 'A valid staff id and count date are required';
  end if;
  if jsonb_typeof(p_count->'entries') <> 'array'
     or jsonb_array_length(p_count->'entries') = 0 then
    raise exception 'At least one count entry is required';
  end if;

  select initcap(trim(u.role)), u.name
    into staff_role, staff_name_value
    from users u
   where u.id = staff_id_value;
  if staff_role is null then
    raise exception 'Unknown staff member';
  end if;

  for entry in select value from jsonb_array_elements(p_count->'entries') loop
    if nullif(trim(entry->>'itemId'), '') is null then
      raise exception 'Every entry must identify a count item';
    end if;
    if not (entry ?& array['opening', 'purchased', 'sold', 'closing'])
       or (entry->>'opening') !~ '^\d+(\.\d+)?$'
       or (entry->>'purchased') !~ '^\d+(\.\d+)?$'
       or (entry->>'sold') !~ '^\d+(\.\d+)?$'
       or (entry->>'closing') !~ '^\d+(\.\d+)?$' then
      raise exception 'Every stock value must be a non-negative number';
    end if;
    if not exists (select 1 from count_items where id = entry->>'itemId' and active) then
      raise exception 'Count item is inactive or does not exist';
    end if;
    if not exists (
      select 1
        from count_items ci
       where ci.id = entry->>'itemId'
         and exists (
           select 1 from jsonb_array_elements_text(ci.roles) assigned_role
            where lower(trim(assigned_role)) = lower(trim(staff_role))
         )
    ) then
      raise exception 'Count item is not assigned to this staff role';
    end if;
    if (entry->>'opening')::numeric < 0
       or (entry->>'purchased')::numeric < 0
       or (entry->>'sold')::numeric < 0
       or (entry->>'closing')::numeric < 0 then
      raise exception 'Stock values cannot be negative';
    end if;
    closing_value := (entry->>'closing')::numeric;
    select ci.inventory_id into inventory_id_value
      from count_items ci where ci.id = entry->>'itemId';
    if inventory_id_value is not null then
      update inventory set quantity = closing_value where id = inventory_id_value;
    end if;
  end loop;

  insert into stock_counts (id, date, count_date, role, staff_id, staff_name, entries, note)
  values (
    p_count->>'id', now(), count_date_value, staff_role, staff_id_value,
    staff_name_value, p_count->'entries', nullif(p_count->>'note', '')
  );
end;
$$;

revoke all on function public.submit_stock_count(jsonb) from public;
grant execute on function public.submit_stock_count(jsonb) to anon, authenticated;
