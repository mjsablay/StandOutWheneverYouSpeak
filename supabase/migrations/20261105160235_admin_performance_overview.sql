-- One authorized read for the month-end queue, using the same calculation as
-- finalization. No assessment evidence or write operation is exposed here.
create function public.admin_performance_overview(period date)
returns jsonb language plpgsql stable security definer set search_path = '' as $$
begin
  if auth.uid() is null or not private.is_admin() then
    raise exception 'Administrator access required.' using errcode = '42501';
  end if;
  if period is null or extract(day from period) <> 1 then
    raise exception 'Choose a calendar month.';
  end if;
  return (
    with candidates as materialized (
      select p.id, p.display_name, p.email, p.tier, p.status,
        private.performance_snapshot(p.id, period) as snapshot
      from public.profiles p
      where (p.status = 'approved' and (p.tier = 'circle' or p.role = 'admin'))
        or exists(select 1 from public.performance_presentations s where s.user_id = p.id)
    ), rows as (
      select c.id, c.display_name, c.email, c.tier, c.status,
        (c.snapshot->>'count')::int as presentation_count,
        (c.snapshot->>'new_presentations')::int as new_presentations,
        (c.snapshot->>'current')::numeric as current_score,
        coalesce(a.points, round((c.snapshot->>'current')::numeric * 20, 2)) as points,
        case when a.id is not null then 'finalized'
          when (c.snapshot->>'count')::int < 3 then 'baseline_needed'
          when (c.snapshot->>'count')::int < 5 then 'window_needed'
          when (c.snapshot->>'new_presentations')::int = 0 then 'no_new_presentation'
          when period >= date_trunc('month', now() at time zone 'America/Toronto')::date then 'month_open'
          else 'ready' end as award_status
      from candidates c left join public.performance_awards a on a.user_id = c.id and a.month = period
    ) select coalesce(jsonb_agg(to_jsonb(r) order by
      case r.award_status when 'ready' then 0 when 'month_open' then 1 when 'finalized' then 3 else 2 end,
      lower(coalesce(nullif(r.display_name,''), r.email)), r.id), '[]'::jsonb) from rows r
  );
end;
$$;
revoke all on function public.admin_performance_overview(date) from public, anon;
grant execute on function public.admin_performance_overview(date) to authenticated;
