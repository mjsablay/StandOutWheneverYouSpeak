import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import ts from 'typescript';
import { AsyncLocalStorage } from 'node:async_hooks';
globalThis.AsyncLocalStorage = AsyncLocalStorage;
const require = createRequire(import.meta.url);
const { NextRequest } = require('next/server');
const { unstable_doesMiddlewareMatch } = require('next/experimental/testing/server');
let profile = null, signedIn = false;
const client = { auth: { getUser: async () => ({ data: { user: signedIn ? {id:'test'} : null } }) }, from: () => ({select: () => ({eq: () => ({maybeSingle: async () => ({data:profile})})})}) };
const source = await readFile(new URL('../proxy.ts',import.meta.url),'utf8');
const output = ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
const exports = {};
new Function('require','exports',output)((name)=>name==='@supabase/ssr'?{createServerClient:()=>client}:name==='@/lib/site'?{PRELAUNCH:true}:require(name),exports);
const paths=['/materials/preparation-2026-10/masterful-notes.pdf','/materials/speak-with-impact-coaching-rubric.pdf','/courses/leadership-voice/lessons/be-remarkable/workbook','/courses/leadership-voice/lessons/be-remarkable/practice','/preparation'];
for(const path of paths) {
 assert.equal(unstable_doesMiddlewareMatch({config:exports.config,nextConfig:{},url:'https://example.com'+path}),true);
 signedIn=false;profile=null;
 let r=await exports.proxy(new NextRequest('https://example.com'+path));assert.equal(new URL(r.headers.get('location')).pathname,'/request');
 for(const p of [{role:'member',tier:'free',status:'approved'},{role:'member',tier:'circle',status:'pending'},{role:'member',tier:'circle',status:'declined'},null]) {
  signedIn=true;profile=p;r=await exports.proxy(new NextRequest('https://example.com'+path));
  if(path.startsWith('/materials/')) assert.equal(r.status,403);else assert.equal(new URL(r.headers.get('location')).pathname,'/pricing');
 }
 for(const p of [{role:'member',tier:'circle',status:'approved'},{role:'admin',tier:'free',status:'approved'}]) {
  signedIn=true;profile=p;r=await exports.proxy(new NextRequest('https://example.com'+path));assert.equal(r.status,200);assert.equal(r.headers.get('cache-control'),'private, no-store');
 }
}
// Front Row retains ordinary lesson access.
signedIn=true;profile={role:'member',tier:'free',status:'approved'};
assert.equal((await exports.proxy(new NextRequest('https://example.com/courses/leadership-voice/lessons/be-remarkable'))).status,200);
console.log('PASS: real Proxy matcher and route guard deny anonymous/free/pending/declined access, allow Circle/admin, protect PDF paths, and preserve free lessons. Auth/profile lookup is mocked.');
