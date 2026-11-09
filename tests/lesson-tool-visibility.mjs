import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import ts from 'typescript';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
const require=createRequire(import.meta.url);
let fullAccess=false;
const lesson={slug:'test',number:'01',title:'Test lesson',summary:'Summary',materials:[{file:'test.pdf'}],practice:{},video:null};
const mocks={
 'next/link': {default:({children,...props})=>React.createElement('a',props,children)},
 'next/navigation':{usePathname:()=>'/courses/test/lessons/test',useParams:()=>({slug:'test',lesson:'test'}),useRouter:()=>({replace:()=>{}})},
 '@/lib/access':{useAccess:()=>({fullAccess})},
 // Real admin permissions stay true even while the presented audience is free.
 '@/lib/mock-auth':{useAuth:()=>({user:{id:'admin'},loading:false,hasFullAccess:true})},
 '@/lib/progress':{useProgress:()=>({hasPassed:()=>true,hasWatched:()=>false,markWatched:()=>{}})},
 '@/lib/courses':{getLesson:()=>({lesson,course:{name:'Test course',lessons:[lesson]},index:0,prev:null,next:null}),FREE_PREVIEW_COUNT:6,videoUrl:()=>null},
 '@/components/Quiz':{hasQuiz:()=>true},
 '@/components/VideoPlayer':{default:()=>React.createElement('div',null,'Video player')},
 '@/components/ui':{Wrap:({children})=>React.createElement('div',null,children),Section:({children})=>React.createElement('section',null,children),PageSkeleton:()=>null},
};
async function load(path){const code=ts.transpileModule(await readFile(new URL(path,import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText;const exports={};new Function('require','exports',code)(name=>mocks[name]?{__esModule:true,...mocks[name]}:require(name),exports);return exports.default;}
const Shell=await load('../app/courses/[slug]/lessons/[lesson]/LessonShell.tsx');
const Video=await load('../app/courses/[slug]/lessons/[lesson]/page.tsx');
for(const allowed of [false,true]){
 fullAccess=allowed;
 const html=renderToStaticMarkup(React.createElement(Shell,null,React.createElement(Video)));
 assert.equal(html.includes('>Workbook<'),allowed);
 assert.equal(html.includes('>Katya<'),allowed);
 assert.equal(html.includes('Practise with the AI coach'),allowed);
 assert.ok(html.includes('>Video<')&&html.includes('>Quiz<'));
}
console.log('PASS: actual lesson components hide Workbook, Katya and coaching CTA in free-member preview despite real admin permissions; Circle view retains them; Video and Quiz remain.');
