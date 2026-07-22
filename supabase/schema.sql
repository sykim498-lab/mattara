create table public.restaurant_submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  region text not null,
  address text not null,
  menu text not null,
  description text not null,
  tags text[] not null default '{}',
  image_url text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now()
);

alter table public.restaurant_submissions enable row level security;

create policy "Users can create their own submissions"
on public.restaurant_submissions for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Users can view their own submissions"
on public.restaurant_submissions for select
to authenticated
using (auth.uid() = user_id);
