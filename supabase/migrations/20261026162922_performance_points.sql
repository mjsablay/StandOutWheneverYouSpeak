-- Performance-only pilot. Existing activity points and billing are unchanged.
-- Dates/month boundaries use America/Toronto. Scores are human-assessed until
-- delivery coaching exists. No baseline awards, eye-contact score or chat points.
create table public.performance_presentations (
  id uuid primary key,
  sequence_no bigint generated always as identity unique,
  user_id uuid not null references public.profiles(id) on delete cascade,
  assessed_on date not null,
  title text not null check (length(trim(title)) between 1 and 160),
  frame numeric not null check (frame between 1 and 5 and scale(frame) <= 1),
  staying numeric not null check (staying between 1 and 5 and scale(staying) <= 1),
  delivery numeric not null check (delivery between 1 and 5 and scale(delivery) <= 1),
  evidence text not null check (length(trim(evidence)) between 10 and 2000),
  rubric_version text not null default 'fmd-human-v1',
  recorded_by uuid not null,
  recorded_at timestamptz not null default clock_timestamp()
);
create index performance_presentations_user_date on public.performance_presentations(user_id, assessed_on, sequence_no);
create table public.performance_awards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  month date not null check (extract(day from month) = 1),
  current_score numeric not null check (current_score between 1 and 5),
  points numeric(5,2) not null check (points between 20 and 100),
  presentation_ids uuid[] not null check (cardinality(presentation_ids) = 5),
  rule_version text not null default 'best3of5-monthly-v1',
  awarded_by uuid not null,
  awarded_at timestamptz not null default now(),
  unique (user_id, month)
);
alter table public.performance_presentations enable row level security;
alter table public.performance_awards enable row level security;
revoke all on public.performance_presentations, public.performance_awards from public, anon, authenticated;
grant select on public.performance_presentations, public.performance_awards to authenticated;
create policy performance_presentations_read on public.performance_presentations for select to authenticated
using (user_id = (select auth.uid()) or (select private.is_admin()));
create policy performance_awards_read on public.performance_awards for select to authenticated
using (user_id = (select auth.uid()) or (select private.is_admin()));

-- Not exposed to REST; every public entry point authorizes before calling.
create function private.performance_snapshot(subject uuid, period date)
returns jsonb language sql stable set search_path = '' as $$
  with ordered as (
    select p.*, (frame + staying + delivery)/3 as overall,
      row_number() over(order by assessed_on, sequence_no) as ordinal
    from public.performance_presentations p
    where user_id = subject and assessed_on < (period + interval '1 month')::date
  ), recent as (
    select * from ordered order by ordinal desc limit 5
  ), best as (
    select * from recent order by overall desc, ordinal desc limit 3
  )
  select jsonb_build_object(
    'count', (select count(*) from ordered),
    'baseline', case when (select count(*) from ordered) >= 3 then
      (select avg(overall) from ordered where ordinal <= 3) end,
    'current', case when (select count(*) from recent) = 5 then (select avg(overall) from best) end,
    'new_presentations', (select count(*) from ordered where ordinal > 3 and assessed_on >= period),
    'presentation_ids', coalesce((select jsonb_agg(id order by ordinal desc) from recent), '[]'::jsonb),
    'best_ids', coalesce((select jsonb_agg(id order by overall desc, ordinal desc) from best), '[]'::jsonb)
  );
$$;
revoke all on function private.performance_snapshot(uuid,date) from public, anon, authenticated;

create function public.performance_report(subject uuid default auth.uid(), period date default date_trunc('month', now() at time zone 'America/Toronto')::date)
returns jsonb language plpgsql stable security definer set search_path = '' as $$
begin
  if auth.uid() is null or subject is null or not (subject = auth.uid() or private.is_admin()) then
    raise exception 'You can only view your own performance.' using errcode = '42501';
  end if;
  if period is null or extract(day from period) <> 1 then raise exception 'Choose a calendar month.'; end if;
  return jsonb_build_object(
    'snapshot', private.performance_snapshot(subject, period),
    'presentations', coalesce((select jsonb_agg(to_jsonb(p) order by assessed_on, sequence_no) from public.performance_presentations p where user_id = subject), '[]'::jsonb),
    'awards', coalesce((select jsonb_agg(to_jsonb(a) order by month desc) from public.performance_awards a where user_id = subject), '[]'::jsonb)
  );
end;
$$;

create function public.record_performance_presentation(request_id uuid, subject uuid, assessed date, presentation_title text, frame_score numeric, staying_score numeric, delivery_score numeric, assessment_evidence text)
returns uuid language plpgsql security definer set search_path = '' as $$
declare prior public.performance_presentations;
begin
  if auth.uid() is null or not private.is_admin() then raise exception 'Administrator access required.' using errcode = '42501'; end if;
  -- Serializes recording and finalization for one member, including retries.
  perform 1 from public.profiles where id = subject for update;
  if not found then raise exception 'Member not found.'; end if;
  select * into prior from public.performance_presentations where id = request_id;
  if found then
    if prior.user_id = subject and prior.assessed_on = assessed and prior.title = trim(presentation_title)
      and prior.frame = frame_score and prior.staying = staying_score and prior.delivery = delivery_score
      and prior.evidence = trim(assessment_evidence) then return prior.id; end if;
    raise exception 'This submission ID was already used. Reload before recording another presentation.';
  end if;
  if not exists(select 1 from public.profiles where id = subject and status = 'approved' and (tier = 'circle' or role = 'admin')) then
    raise exception 'Scoring pilot requires an approved Speakers’ Circle member.';
  end if;
  if assessed is null or assessed > (now() at time zone 'America/Toronto')::date then raise exception 'Presentation date cannot be in the future.'; end if;
  if assessed < (select max(assessed_on) from public.performance_presentations where user_id = subject) then
    raise exception 'Record presentations in date order to preserve the baseline.';
  end if;
  if exists(select 1 from public.performance_awards where user_id = subject and assessed < (month + interval '1 month')::date) then
    raise exception 'That period is finalized. An administrator must arrange an audited correction.';
  end if;
  insert into public.performance_presentations(id,user_id,assessed_on,title,frame,staying,delivery,evidence,recorded_by)
    values(request_id,subject,assessed,trim(presentation_title),frame_score,staying_score,delivery_score,trim(assessment_evidence),auth.uid());
  return request_id;
end;
$$;

create function public.finalize_performance_month(subject uuid, period date)
returns uuid language plpgsql security definer set search_path = '' as $$
declare snapshot jsonb; existing uuid; awarded uuid;
begin
  if auth.uid() is null or not private.is_admin() then raise exception 'Administrator access required.' using errcode = '42501'; end if;
  if period is null or extract(day from period) <> 1 or period >= date_trunc('month',now() at time zone 'America/Toronto')::date then
    raise exception 'Only a completed calendar month can be finalized.';
  end if;
  perform 1 from public.profiles where id = subject for update;
  if not found then raise exception 'Member not found.'; end if;
  select id into existing from public.performance_awards where user_id = subject and month = period;
  if found then return existing; end if;
  snapshot := private.performance_snapshot(subject,period);
  if (snapshot->>'current') is null then raise exception 'Five scored presentations are needed before a monthly award.'; end if;
  if (snapshot->>'new_presentations')::int < 1 then raise exception 'No new post-baseline presentation in this month.'; end if;
  insert into public.performance_awards(user_id,month,current_score,points,presentation_ids,awarded_by)
  values(subject,period,(snapshot->>'current')::numeric,round((snapshot->>'current')::numeric * 20,2),
    array(select jsonb_array_elements_text(snapshot->'presentation_ids')::uuid),auth.uid()) returning id into awarded;
  return awarded;
end;
$$;
revoke all on function public.performance_report(uuid,date), public.record_performance_presentation(uuid,uuid,date,text,numeric,numeric,numeric,text), public.finalize_performance_month(uuid,date) from public, anon;
grant execute on function public.performance_report(uuid,date), public.record_performance_presentation(uuid,uuid,date,text,numeric,numeric,numeric,text), public.finalize_performance_month(uuid,date) to authenticated;
