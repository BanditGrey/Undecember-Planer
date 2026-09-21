-- Run in the Supabase SQL editor (free tier is enough). Then set VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY
-- as GitHub Actions secrets (deploy.yml passes them to `vite build`).
create table if not exists public.builds (
  id text primary key,
  title text not null check (char_length(title) <= 80),
  author text not null default 'anon' check (char_length(author) <= 40),
  stat text not null check (stat in ('STR','DEX','INT','HYBRID')),
  season text not null default '',
  skills text[] not null default '{}',
  notes text not null default '' check (char_length(notes) <= 2000),
  code text not null check (char_length(code) <= 20000),
  votes int not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists builds_skills_idx on public.builds using gin (skills);
create index if not exists builds_votes_idx on public.builds (votes desc);
create table if not exists public.build_votes (build_id text references public.builds(id) on delete cascade, voter uuid not null, primary key (build_id, voter));

alter table public.builds enable row level security;
alter table public.build_votes enable row level security;
create policy "public read" on public.builds for select using (true);
create policy "anon insert" on public.builds for insert with check (true);
-- no update/delete for anon: votes only change through the RPC below (security definer)
create or replace function public.vote_build(p_build text, p_voter uuid) returns void
language plpgsql security definer set search_path = public as $$
begin
  insert into build_votes(build_id, voter) values (p_build, p_voter);
  update builds set votes = votes + 1 where id = p_build;
exception when unique_violation then null; -- already voted
end $$;
grant execute on function public.vote_build(text, uuid) to anon;
