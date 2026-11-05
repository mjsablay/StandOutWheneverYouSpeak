// Local REST/auth adapter for the real Next UI and isolated Postgres functions.
// Auth is a fixed test double, not a Supabase Auth emulator. Binds loopback only.
import http from 'node:http';
import { randomUUID, createHmac } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';
const db = new PGlite();
const users = ['admin','member','other'].map((name,i) => ({id:randomUUID(),email:`${name}@example.invalid`,display_name:['Test Coach','Alex Learner','Sam Learner'][i],role:i===0?'admin':'member',tier:'circle',status:'approved',aud:'authenticated',app_metadata:{provider:'email'},user_metadata:{},created_at:new Date().toISOString()}));
await db.exec(`create role anon; create role authenticated; create schema auth; create schema private;
create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
grant usage on schema auth, private to authenticated;
create table profiles(id uuid primary key,email text,display_name text,role text,tier text,status text);
create function private.is_admin() returns boolean language sql stable security definer set search_path='' as $$ select exists(select 1 from public.profiles where id=auth.uid() and role='admin') $$;`);
for (const u of users) await db.query('insert into profiles values ($1,$2,$3,$4,$5,$6)', [u.id,u.email,u.display_name,u.role,u.tier,u.status]);
for (const name of ['20261026162922_performance_points.sql','20261105160235_admin_performance_overview.sql']) await db.exec(await readFile(new URL(`../supabase/migrations/${name}`,import.meta.url),'utf8'));
const today = new Intl.DateTimeFormat('en-CA',{timeZone:'America/Toronto',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
const [year,month]=today.split('-').map(Number);
const prior=new Date(Date.UTC(year,month-2,1)).toISOString().slice(0,10);
await db.query("select set_config('request.jwt.claim.sub',$1,false)",[users[0].id]);
await db.exec('set role authenticated');
for (const score of [2.7,2.6,2.5,3.2]) await db.query('select record_performance_presentation($1,$2,$3,$4,$5,$5,$5,$6)',[randomUUID(),users[1].id,prior,`Practice ${score}`,score,'Clear conclusion; pause before each supporting point.']);
await db.exec('reset role');
const secret=randomUUID();
function token(u) { const h=Buffer.from(JSON.stringify({alg:'HS256',typ:'JWT'})).toString('base64url'); const p=Buffer.from(JSON.stringify({sub:u.id,aud:'authenticated',role:'authenticated',exp:Math.floor(Date.now()/1000)+86400,iat:Math.floor(Date.now()/1000),email:u.email})).toString('base64url'); return `${h}.${p}.${createHmac('sha256',secret).update(`${h}.${p}`).digest('base64url')}`; }
const tokens=new Map(users.map(u=>[token(u),u]));
const rpcs={
 admin_performance_overview:['period'],performance_report:['subject','period'],
 record_performance_presentation:['request_id','subject','assessed','presentation_title','frame_score','staying_score','delivery_score','assessment_evidence'],
 finalize_performance_month:['subject','period'],
};
let queue=Promise.resolve();
const server=http.createServer((req,res)=>{queue=queue.then(()=>handle(req,res)).catch(e=>{console.error(e.message);if(!res.headersSent)res.writeHead(500);res.end();});});
async function handle(req,res) {
 const origin=req.headers.origin;
 if(origin && origin!=='http://localhost:3102'){res.writeHead(403);res.end();return;}
 res.setHeader('Access-Control-Allow-Origin','http://localhost:3102');res.setHeader('Access-Control-Allow-Headers','authorization,apikey,content-type,x-client-info,prefer,range,x-supabase-api-version,accept-profile,content-profile,x-retry-count');res.setHeader('Access-Control-Allow-Methods','GET,POST,HEAD,OPTIONS');res.setHeader('Content-Type','application/json');
 const send=(status,data)=>{res.writeHead(status);res.end(JSON.stringify(data));};
 if(req.method==='OPTIONS'){send(200,{});return;}
 const url=new URL(req.url,'http://localhost:3302');
 let raw='';for await(const chunk of req)raw+=chunk;
 const body=raw?JSON.parse(raw):{};
 const access=req.headers.authorization?.replace(/^Bearer /i,''); const u=tokens.get(access); console.log(req.method, url.pathname, u?.email ?? 'anon');
 if(url.pathname==='/auth/v1/token'){
  const found=users.find(x=>x.email===body.email);
  if(!found||body.password!=='isolated-test-only'){send(400,{message:'Test account required'});return;}
  const access_token=[...tokens.entries()].find(([,v])=>v.id===found.id)[0];
  send(200,{access_token,token_type:'bearer',expires_in:86400,refresh_token:found.id,user:found});return;
 }
 if(url.pathname==='/auth/v1/user'){send(u?200:401,u??{message:'Not signed in'});return;}
 if(url.pathname==='/auth/v1/logout'){send(204,null);return;}
 if(url.pathname==='/rest/v1/profiles'){
  if(!u){send(401,{message:'Sign in'});return;}
  const id=url.searchParams.get('id')?.replace(/^eq\./,'');
  const visible=users.filter(x=>(u.role==='admin'||x.id===u.id)&&(!id||x.id===id));
  send(200,req.headers.accept?.includes('object')?(visible[0]??null):visible);return;
 }
 const rpc=url.pathname.replace('/rest/v1/rpc/','');
 if(rpcs[rpc]){
  try{
   await db.exec('reset role');await db.query("select set_config('request.jwt.claim.sub',$1,false)",[u?.id??'']);await db.exec(`set role ${u?'authenticated':'anon'}`);
   const args=rpcs[rpc];const params=args.map(k=>body[k]??(k==='subject'?u?.id:null));
   const r=await db.query(`select public.${rpc}(${args.map((_,i)=>`$${i+1}`).join(',')}) as result`,params);
   console.log(`${u?.email??'anon'} ${rpc}: OK`);send(200,r.rows[0].result);
  }catch(e){console.log(`${u?.email??'anon'} ${rpc}: ${e.code}`);send(e.code==='42501'?403:400,{message:e.message,code:e.code});}
  return;
 }
 if(req.method==='GET'||req.method==='HEAD'){res.setHeader('Content-Range','*/0');send(200,[]);return;}
 send(404,{message:'Unsupported test endpoint'});
}
server.listen(3302,'127.0.0.1',()=>console.log(`Isolated API ready on http://localhost:3302; seed month ${prior}. Next UI should use port 3102.`));
