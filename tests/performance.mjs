import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { PGlite } from '@electric-sql/pglite';
import ts from 'typescript';
const helper = ts.transpileModule(await readFile(new URL('../lib/performance.ts', import.meta.url), 'utf8'), { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
const { performanceLevel } = await import(`data:text/javascript;base64,${Buffer.from(helper).toString('base64')}`);
assert.equal(performanceLevel(null,null,0),'Establishing baseline');
assert.equal(performanceLevel(2.6,3.5,245),'Expert');
assert.equal(performanceLevel(2.6,3.4,245),'Intermediate');
assert.equal(performanceLevel(4.4,4.5,380),'Distinguished');
assert.equal(performanceLevel(4.4,4.4,500),'Rock Star');
assert.equal(performanceLevel(2.6,2.7,900),'Novice');

// A real isolated Postgres engine: no production data or credentials.
const db = new PGlite();
const admin = randomUUID(), member = randomUUID(), other = randomUUID(), free = randomUUID();
await db.exec(`
  create role anon; create role authenticated;
  create schema auth; create schema private;
  create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
  grant usage on schema auth, private to authenticated;
  create table public.profiles (id uuid primary key, role text, tier text, status text);
  create function private.is_admin() returns boolean language sql stable security definer set search_path='' as $$ select exists(select 1 from public.profiles where id=auth.uid() and role='admin') $$;
  insert into public.profiles values ('${admin}','admin','circle','approved'),('${member}','member','circle','approved'),('${other}','member','circle','approved'),('${free}','member','free','approved');
`);
await db.exec(await readFile(new URL('../supabase/migrations/20261026162922_performance_points.sql', import.meta.url), 'utf8'));
const actor = async id => { await db.exec('reset role'); await db.query("select set_config('request.jwt.claim.sub',$1,false)", [id]); await db.exec('set role authenticated'); };
const report = async (id = member, period = '2020-01-01') => (await db.query('select public.performance_report($1,$2) as r', [id, period])).rows[0].r;
const record = async (score, date = '2020-01-10', id = randomUUID(), who = member) => {
  await db.query('select public.record_performance_presentation($1,$2,$3,$4,$5,$6,$7,$8)', [id, who, date, 'Practice presentation', score, score, score, 'Observed full spoken presentation with specific coaching evidence.']);
  return id;
};
const finalize = async (period = '2020-01-01') => (await db.query('select public.finalize_performance_month($1,$2) as id', [member,period])).rows[0].id;
const rejects = async (fn, text) => assert.rejects(fn, new RegExp(text, 'i'));
await actor(admin);
assert.equal((await report()).snapshot.baseline, null);
await record(2.7); await record(2.6);
assert.equal((await report()).snapshot.baseline, null);
await record(2.5);
let r = await report(); assert.equal(r.snapshot.baseline, 2.6); assert.equal(r.snapshot.current, null); assert.equal(r.snapshot.new_presentations,0);
await rejects(finalize, 'Five scored');
await record(3.2); await record(3.3);
r = await report(); assert.equal(r.snapshot.count, 5); assert.ok(Math.abs(r.snapshot.current - (2.7+3.2+3.3)/3) < 1e-12);
await record(3.4); await record(3.5); const retryId = await record(3.6);
await record(3.6,'2020-01-10',retryId); // network retry cannot add a second row
r = await report(); assert.equal(r.presentations.length,8); assert.equal(r.snapshot.baseline,2.6); assert.equal(r.snapshot.current,3.5);
assert.equal(r.snapshot.presentation_ids.length,5); assert.equal(r.snapshot.best_ids.length,3);
await rejects(()=>record(2,'2020-01-10',retryId),'already used');
await rejects(()=>record(6), 'check constraint'); await rejects(()=>record(3.55), 'check constraint');
await rejects(()=>record(3,'2019-12-31'),'date order');
await rejects(()=>record(3,'2099-01-01'),'future');
await rejects(()=>record(3,'2020-01-10',randomUUID(),free),'requires an approved');
await rejects(()=>finalize('2099-01-01'),'completed calendar');
const awardId = await finalize(); assert.equal(await finalize(), awardId);
r = await report(); assert.equal(r.awards.length,1); assert.equal(r.awards[0].points,70); assert.equal(r.awards[0].current_score,3.5);
await rejects(()=>record(4), 'finalized');
await rejects(()=>finalize('2020-02-01'),'No new');
await record(1,'2020-03-01'); // newest five drop 3.2; weaker new attempt doesn't immediately reduce best three
assert.equal((await report(member,'2020-03-01')).snapshot.current,3.5);
await record(1,'2020-03-02'); await record(1,'2020-03-03');
assert.ok(Math.abs((await report(member,'2020-03-01')).snapshot.current - 2.7) < 1e-12); // latest window now 3.5,3.6,1,1,1
assert.equal((await report()).snapshot.current,3.5); // historical snapshot unchanged
await finalize('2020-03-01');
assert.equal((await report()).awards.find(a=>a.month==='2020-03-01').points,54);
await actor(member);
assert.equal((await report()).presentations.length,11);
await rejects(()=>record(5), 'Administrator'); await rejects(finalize,'Administrator');
await rejects(()=>report(other), 'only view your own');
assert.equal((await db.query('select count(*)::int n from public.performance_presentations')).rows[0].n,11);
await rejects(()=>db.exec("update public.performance_presentations set frame=5"),'permission denied');
await rejects(()=>db.exec("delete from public.performance_awards"),'permission denied');
await rejects(()=>db.query("select private.performance_snapshot($1,$2)",[member,'2020-01-01']),'permission denied');
await actor(other);
assert.equal((await db.query('select count(*)::int n from public.performance_presentations')).rows[0].n,0);
assert.equal((await db.query('select count(*)::int n from public.performance_awards')).rows[0].n,0);
await db.exec('reset role; set role anon');
await rejects(()=>report(member), 'permission denied');
await rejects(()=>db.exec('select * from public.performance_presentations'),'permission denied');
await db.close();
console.log('PASS: baseline, best-three/latest-five, historical cutoffs, monthly awards, retries, validation, RPC permissions and RLS isolation.');
