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
      const messages = {
        eligible: '程序检查已通过；请核对内容差异和 AI 疑点／低评分。人工放行不会合并 PR。',
        updated: '新提交的程序检查已通过，请核对新的 AI 评分。',
        missing: '缺少可信的完整评估记录，请重新评估；不能仅凭历史平均分放行。',
        stale: 'PR 已关闭或提交/基线发生变化，旧评分不能用于放行，请重新评估。',
        'api-error': '评分详情暂时读取失败，请稍后重试；不能依据旧评分放行。',
        deterministic: '存在程序检查失败，不允许人工绕过。',
        'missing-but-eligible': '缺少完整评估记录。',
        'no-permission': '当前投稿状态不允许强制通过。',
        ready: 'PR 已为 Ready；原 AI 结论仍保留。',
      };
      window.actions=[];
      const root=createRoot(document.getElementById('root'));
      window.renderReview=(mode)=>root.render(<Review review={{
        report:['missing','api-error','missing-but-eligible'].includes(mode)?null:mode==='deterministic'?{...report,deterministicPassed:false,failures:['Expected one matching submission target, received two.','Judge average 89.55% is below 95%']}:mode==='updated'?{...report,headSha:'c'.repeat(40)}:report,
        eligible:['eligible','updated','missing-but-eligible','no-permission'].includes(mode),
        prUrl:'https://github.com/owner/public/pull/26',message:messages[mode],
      }} canApprove={!['no-permission','ready'].includes(mode)} showOverride={mode!=='ready'} canReevaluate={true} busy={false} onApprove={(sha,reason)=>window.actions.push({sha,reason})} onReevaluate={()=>window.actions.push({reevaluate:true})}/>);
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
    await expect(page.getByText('强制通过仅跳过 AI 评分／内容疑点；程序检查必须通过。只将当前 PR 标记 Ready，不会合并或上线。')).toBeVisible();
    await page.getByRole('button',{name:'强制通过 AI 审核',exact:true}).click();
    const confirm=page.getByRole('button',{name:'确认强制通过 AI 审核'});
    await expect(confirm).toBeDisabled();
    await page.getByRole('textbox',{name:'强制通过理由（必填）'}).fill('   ');
    await expect(confirm).toBeDisabled();
    await page.getByRole('textbox',{name:'强制通过理由（必填）'}).fill('已检查 PR，接受这次评分偏差。');
    await confirm.click();
    const actions=await page.evaluate(()=> (window as unknown as {actions:unknown[]}).actions);
    expect(actions).toEqual([{sha:'a'.repeat(40),reason:'已检查 PR，接受这次评分偏差。'}]);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
    await page.screenshot({path:`/tmp/admin-score-${width}.png`,fullPage:true});
  } );
}
for(const mode of ['missing','stale','api-error','deterministic','missing-but-eligible','no-permission']) {
  test(`${mode} evidence never enables force-pass`,async({page})=>{
    await page.setContent('<div id="root"></div>'); await page.addScriptTag({content:script});
    await page.evaluate(mode=>(window as unknown as {renderReview:(mode:string)=>void}).renderReview(mode),mode);
    await expect(page.getByRole('heading',{name:'AI 评分与人工审核'})).toBeVisible();
    await expect(page.getByRole('button',{name:'强制通过 AI 审核',exact:true})).toBeDisabled();
    await expect(page.getByRole('button',{name:'确认强制通过 AI 审核'})).toHaveCount(0);
    await expect(page.getByRole('button',{name:'重新审核现有 PR（不修改投稿）'})).toBeVisible();
    if(mode==='deterministic') {
      await expect(page.getByRole('heading',{name:'未通过的检查'})).toBeVisible();
      await expect(page.getByText('Expected one matching submission target, received two.',{exact:true})).toBeVisible();
      await expect(page.getByText('程序检查未通过，不能强制通过 AI 审核。请先修正检查报告指出的问题，再重新审核。')).toBeVisible();
    }
  });
}

test('rechecking an existing PR calls only reevaluate',async({page})=>{
  await page.setContent('<div id="root"></div>'); await page.addScriptTag({content:script});
  await page.evaluate(()=>(window as unknown as {renderReview:(mode:string)=>void}).renderReview('stale'));
  await page.getByRole('button',{name:'重新审核现有 PR（不修改投稿）'}).click();
  expect(await page.evaluate(()=>(window as unknown as {actions:unknown[]}).actions)).toEqual([{reevaluate:true}]);
});

test('a Ready PR does not offer force-pass again',async({page})=>{
  await page.setContent('<div id="root"></div>'); await page.addScriptTag({content:script});
  await page.evaluate(()=>(window as unknown as {renderReview:(mode:string)=>void}).renderReview('ready'));
  await expect(page.getByText('PR 已为 Ready；原 AI 结论仍保留。')).toBeVisible();
  await expect(page.getByRole('button',{name:'强制通过 AI 审核',exact:true})).toHaveCount(0);
  await expect(page.getByRole('button',{name:'重新审核现有 PR（不修改投稿）'})).toBeVisible();
});

test('losing eligibility closes the active force-pass confirmation',async({page})=>{
  await page.setContent('<div id="root"></div>'); await page.addScriptTag({content:script});
  await page.evaluate(()=>(window as unknown as {renderReview:(mode:string)=>void}).renderReview('eligible'));
  await page.getByRole('button',{name:'强制通过 AI 审核',exact:true}).click();
  await page.getByRole('textbox',{name:'强制通过理由（必填）'}).fill('已核对。');
  await page.evaluate(()=>(window as unknown as {renderReview:(mode:string)=>void}).renderReview('stale'));
  await expect(page.getByRole('button',{name:'确认强制通过 AI 审核'})).toHaveCount(0);
  await expect(page.getByRole('button',{name:'强制通过 AI 审核',exact:true})).toBeDisabled();
  expect(await page.evaluate(()=>(window as unknown as {actions:unknown[]}).actions)).toEqual([]);
});

test('a newly evaluated commit needs a new confirmation and reason',async({page})=>{
  await page.setContent('<div id="root"></div>'); await page.addScriptTag({content:script});
  await page.evaluate(()=>(window as unknown as {renderReview:(mode:string)=>void}).renderReview('eligible'));
  await page.getByRole('button',{name:'强制通过 AI 审核',exact:true}).click();
  await page.getByRole('textbox',{name:'强制通过理由（必填）'}).fill('仅确认旧提交。');
  await page.evaluate(()=>(window as unknown as {renderReview:(mode:string)=>void}).renderReview('updated'));
  await expect(page.getByRole('button',{name:'确认强制通过 AI 审核'})).toHaveCount(0);
  await page.getByRole('button',{name:'强制通过 AI 审核',exact:true}).click();
  await expect(page.getByRole('textbox',{name:'强制通过理由（必填）'})).toHaveValue('');
  await expect(page.getByRole('button',{name:'确认强制通过 AI 审核'})).toBeDisabled();
  expect(await page.evaluate(()=>(window as unknown as {actions:unknown[]}).actions)).toEqual([]);
});
