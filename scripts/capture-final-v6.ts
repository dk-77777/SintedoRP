import {chromium} from '@playwright/test';
import {previewState} from './preview-data';
import {mkdir,writeFile} from 'node:fs/promises';
const dir='artifacts/cinematic-v6/final';await mkdir(dir,{recursive:true});
const b=await chromium.launch({executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH||'/usr/bin/chromium'});const results:unknown[]=[];
for(const width of [375,390,768,1024,1440]){
 const p=await b.newPage({viewport:{width,height:960},reducedMotion:'reduce'});await p.route('**/api/**',r=>r.fulfill({contentType:'application/json',body:JSON.stringify(previewState('publico'))}));
 await p.goto('http://localhost:3000');await p.waitForFunction(()=>document.querySelector('main')?.getAttribute('aria-busy')==='false');
 await p.evaluate(async()=>{for(const image of document.images)image.loading='eager';await Promise.all(Array.from(document.images).map(i=>i.decode()));await document.fonts.ready});
 await p.screenshot({path:dir+`/home-${width}.png`,fullPage:true});results.push({width,overflow:await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth)});await p.close();
}await b.close();await writeFile(dir+'/results.json',JSON.stringify(results,null,2));console.log(results);
