-- Supabase 대시보드 → SQL Editor 에 통째로 붙여넣고 Run 하세요. (한 번만)

-- 질문별 A/B 투표 수
create table if not exists public.balance_votes (
  question_id int primary key,
  a_count bigint not null default 0,
  b_count bigint not null default 0
);

-- 브라우저(anon)는 읽기만 가능, 직접 수정 불가
alter table public.balance_votes enable row level security;
drop policy if exists "anyone can read votes" on public.balance_votes;
create policy "anyone can read votes" on public.balance_votes
  for select to anon, authenticated using (true);

-- 투표는 이 함수로만: 1표씩만 올릴 수 있고, 올린 뒤 최신 집계를 돌려줌
create or replace function public.cast_vote(qid int, pick text)
returns table (out_a bigint, out_b bigint)
language plpgsql
security definer
set search_path = public
as $$
begin
  if pick not in ('a', 'b') then
    raise exception 'pick must be a or b';
  end if;
  if qid < 0 or qid > 999 then
    raise exception 'invalid question id';
  end if;

  insert into balance_votes as v (question_id, a_count, b_count)
  values (qid, (pick = 'a')::int, (pick = 'b')::int)
  on conflict (question_id) do update
    set a_count = v.a_count + excluded.a_count,
        b_count = v.b_count + excluded.b_count;

  return query
    select v.a_count, v.b_count from balance_votes v where v.question_id = qid;
end;
$$;

grant execute on function public.cast_vote(int, text) to anon, authenticated;
