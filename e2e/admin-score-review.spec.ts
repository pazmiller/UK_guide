import { test, expect } from '@playwright/test';
import { build } from 'esbuild';
import { readFile, readdir } from 'node:fs/promises';

let script: string;
let css: string;
test.beforeAll( async () => {
  const bundle = await build( {
    stdin: { contents: `
      import React from 'react';
      import { createRoot } from 'react-dom/client';
      import Review from './components/ContributionScoreReview';
      const report = {version:1,issueNumber:24,pullRequestNumber:26,headSha:'a'.repeat(40),baseSha:'b'.repeat(40),runId:'123',evaluatedAt:'2026-09-13T00:00:00Z',deterministicPassed:true,sourceRecall:1,dynamicCasePassed:true,judgeScores:[90.14,88.96],judgeAverage:89.55,threshold:95,failures:['Judge average 89.55% is below 95%'],explanation:'AI 评分说明摘录（各轮最低分题目，不一定是本次投稿）：回答添加了上下文未提及的价格。'};
      window.actions=[];
      window.renderReview=(mode)=>createRoot(document.getElementById('root')).render(<Review review={{report:mode==='missing'?null:report,eligible:mode==='eligible',prUrl:'https://github.com/owner/public/pull/26',message:mode==='eligible'?'仅 Judge 分数未达标，其他检查已通过。':'缺少可信记录或 PR 已发生变化，请重新评估。'}} canApprove={true} canReevaluate={true} busy={false} onApprove={(sha,reason)=>window.actions.push({sha,reason})} onReevaluate={()=>window.actions.push({reevaluate:true})}/>);
    `, loader:'tsx', resolveDir:process.cwd() }, bundle:true, write:false, platform:'browser', format:'iife', define:{'process.env.NODE_ENV':'"production"'},
  } );
  script=bundle.outputFiles[0].text;
  const folder='.next/static/chunks';
  css=(await Promise.all((await readdir(folder)).filter(name=>name.endsWith('.css')).map(name=>readFile(`${folder}/${name}`,'utf8')))).join('\n');
} );

for ( const width of [360,1280] ) {
  test( `requires an explicit reason before manual Ready at ${width}px`, async ({page}) => {
    await page.setViewportSize({width,height:1000});
    await page.route('**/api/news',route=>route.fulfill({status:503,json:{error:'Offline fixture'}}));
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.evaluate(()=>{document.body.innerHTML='<main id="root" style="max-width:900px;margin:auto"></main>'; document.body.style.cssText='background:#F6F8FC;padding:20px;font-family:var(--font-noto-sans-sc),sans-serif';});
    await page.addStyleTag({content:css}); await page.addScriptTag({content:script});
    await page.evaluate(()=> (window as unknown as {renderReview:(mode:string)=>void}).renderReview('eligible'));
    await page.waitForLoadState('networkidle');
    await expect(page.getByText('89.55',{exact:true})).toBeVisible();
    await page.getByRole('button',{name:'人工放行到 Ready'}).click();
    const confirm=page.getByRole('button',{name:'确认人工放行'});
    await expect(confirm).toBeDisabled();
    await page.getByRole('textbox',{name:'人工放行理由（必填）'}).fill('已检查 PR，接受这次评分偏差。');
    await confirm.click();
    const actions=await page.evaluate(()=> (window as unknown as {actions:unknown[]}).actions);
    expect(actions).toEqual([{sha:'a'.repeat(40),reason:'已检查 PR，接受这次评分偏差。'}]);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
    await page.screenshot({path:`/tmp/admin-score-${width}.png`,fullPage:true});
  } );
}
for(const mode of ['missing','stale']) {
  test(`${mode} evidence never offers the override button`,async({page})=>{
    await page.setContent('<div id="root"></div>'); await page.addScriptTag({content:script});
    await page.evaluate(mode=>(window as unknown as {renderReview:(mode:string)=>void}).renderReview(mode),mode);
    await expect(page.getByRole('heading',{name:'AI 评分与人工审核'})).toBeVisible();
    await expect(page.getByRole('button',{name:'人工放行到 Ready'})).toHaveCount(0);
    await expect(page.getByRole('button',{name:'重新评估现有 PR'})).toBeVisible();
  });
}
