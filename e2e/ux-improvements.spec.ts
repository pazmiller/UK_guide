import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { build } from 'esbuild';

test.beforeEach(async({page})=>{
  await page.route('**/api/news', route=>route.fulfill({status:503,json:{error:'Offline fixture'}}));
});

for(const width of [390,1440]) test(`carriage can be skipped and the choice survives reload at ${width}`,async({page})=>{
  await page.setViewportSize({width,height:900});
  await page.goto('/');
  const carriage=page.locator('[data-view]');
  await carriage.getByRole('button',{name:'快速浏览 · 跳过动画'}).click();
  await expect(carriage).toHaveAttribute('data-view','quick');
  await expect(carriage.getByRole('link',{name:/London/})).toBeVisible();
  expect(await carriage.evaluate(el=>el.clientHeight)).toBeLessThan(900);
  const start=await page.evaluate(()=>scrollY);
  await page.waitForTimeout(1600);
  expect(await page.evaluate(()=>scrollY)).toBe(start);
  for(const selector of ['[class*="windows"]','[class*="handles"] span','[class*="panorama"]']) {
    expect(await carriage.locator(selector).first().evaluate(el=>getComputedStyle(el).animationName)).toBe('none');
  }
  await page.screenshot({path:`/tmp/ux-carriage-quick-${width}.png`});
  await page.reload();
  await expect(carriage).toHaveAttribute('data-view','quick');
  await carriage.getByRole('button',{name:'沉浸漫游',exact:true}).click();
  await expect(carriage).toHaveAttribute('data-view','immersive');
  if(width===1440) await expect(carriage).toHaveAttribute('data-playback','playing');
  await page.screenshot({path:`/tmp/ux-carriage-${width}.png`});
});

test('restaurant query shares its URL, composes with cuisine, preserves deep links and supports history',async({page})=>{
  await page.goto('/london/restaurants');
  const search=page.getByRole('search',{name:'餐厅搜索'});
  await search.getByRole('searchbox').fill(' KILN ');
  await search.getByRole('button',{name:'搜索',exact:true}).click();
  await expect(page).toHaveURL(/q=KILN/);
  await expect(search.getByRole('status')).toContainText('找到 1 家');
  await page.getByRole('button',{name:'Italian',exact:true}).click();
  await expect(search.getByRole('status')).toContainText('找到 0 家');
  await page.goBack();
  await expect(search.getByRole('status')).toContainText('找到 1 家');
  await page.reload();
  await expect(search.getByRole('searchbox')).toHaveValue('KILN');
  await page.goto('/london/restaurants?q=KILN&restaurant=kiln');
  await expect(page.getByRole('heading',{name:'Kiln',level:2,exact:true})).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('heading',{name:'Kiln',level:2,exact:true})).toHaveCount(0);
  await expect(search.getByRole('status')).toContainText('找到 1 家');
  await search.getByRole('button',{name:'清空条件'}).click();
  await expect(page).not.toHaveURL(/[?&]q=/);
});

test('calendar export can be imported locally without any upload',async({page})=>{
  const errors:string[]=[];
  page.on('pageerror',error=>errors.push(error.message));
  const writes:string[]=[];
  page.on('request',request=>{if(request.method()!=='GET') writes.push(request.url());});
  await page.goto('/furcon');
  await page.waitForLoadState('networkidle');
  const calendar=page.getByRole('region',{name:'兽聚日历'});
  const downloadPromise=page.waitForEvent('download');
  await calendar.getByRole('button',{name:/导出筛选内未结束/}).click();
  const download=await downloadPromise;
  const path=await download.path();
  const text=await readFile(path!,'utf8');
  expect(text).toContain('BEGIN:VCALENDAR');
  await calendar.getByText('读取本地 .ics 日历',{exact:true}).click();
  await calendar.getByLabel('选择 ICS 文件',{exact:false}).setInputFiles({name:'events.ics',mimeType:'text/calendar',buffer:Buffer.from(text)});
  await expect(calendar.getByRole('status')).toContainText('本地预览');
  await calendar.getByRole('button',{name:'清除预览'}).click();
  await expect(calendar.getByText(/本地预览 ·/)).toHaveCount(0);
  await calendar.getByLabel('选择 ICS 文件',{exact:false}).setInputFiles({name:'bad.ics',mimeType:'text/calendar',buffer:Buffer.from('broken')});
  await expect(calendar.getByRole('alert')).toContainText('读取失败');
  expect(writes.filter(url=>url.includes('/api/'))).toEqual([]);
  expect(errors).toEqual([]);
  await calendar.scrollIntoViewIfNeeded();
  await calendar.evaluate(el=>window.scrollTo({top:scrollY+el.getBoundingClientRect().top-110,behavior:'instant'}));
  await page.screenshot({path:'/tmp/ux-calendar.png'});
});

test('a single-cuisine city still offers search and keyboard submission on a small screen',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await page.goto('/othercities/middlesbrough');
  const search=page.getByRole('search',{name:'餐厅搜索'});
  await search.getByRole('searchbox').fill('does not exist');
  await search.getByRole('searchbox').press('Enter');
  await expect(search.getByRole('status')).toContainText('找到 0 家');
  await search.getByRole('button',{name:'清空条件'}).click();
  await expect(search.getByRole('status')).toContainText('找到 1 家');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  await search.evaluate(el=>window.scrollTo({top:scrollY+el.getBoundingClientRect().top-110,behavior:'instant'}));
  await page.screenshot({path:'/tmp/ux-search-mobile.png'});
});

test('admin shows distinct next steps and never offers override for a program failure',async({page})=>{
  const bundle=await build({stdin:{resolveDir:process.cwd(),loader:'tsx',contents:`
    import React from 'react'; import {createRoot} from 'react-dom/client'; import Queue from './components/AdminContributionQueue';
    const base={title:'Test',url:'https://github.com/owner/private/issues/1',createdAt:'2026-11-07T00:00:00Z',submission:{type:'restaurant',intent:'add',name:'Test',region:'uk',city:'London',details:'Test',imageKeys:[],imageCaptions:[]}};
    const report={version:1,issueNumber:1,pullRequestNumber:1,headSha:'a'.repeat(40),baseSha:'b'.repeat(40),runId:'123',evaluatedAt:'2026-11-07T00:00:00Z',deterministicPassed:true,sourceRecall:1,dynamicCasePassed:true,judgeScores:[90,90],judgeAverage:90,threshold:95,failures:['Judge average 90.00% is below 95%'],explanation:'Test'};
    const issues=[
      {...base,number:1,labels:['status:failed'],review:{report:null,eligible:false,message:'Agent run failed before completion: image decoder failed',prUrl:null}},
      {...base,number:2,labels:['status:manual-review'],review:{report,eligible:true,message:'已核验',prUrl:'https://github.com/o/r/pull/2'}},
      {...base,number:3,labels:['status:ready'],publication:{state:'ready',prUrl:'https://github.com/o/r/pull/3',message:'当前可合并'}},
      {...base,number:4,labels:['status:merged'],publication:{state:'merged',prUrl:'https://github.com/o/r/pull/4',message:'等待生产证据'}},
      {...base,number:5,labels:['status:merged'],publication:{state:'live',prUrl:'https://github.com/o/r/pull/5',message:'部署成功'}}
    ]; createRoot(document.getElementById('fixture')).render(<Queue issues={issues}/>);
  `},bundle:true,write:false,platform:'browser',format:'iife',define:{'process.env.NODE_ENV':'"production"'},plugins:[{name:'router',setup(b){b.onResolve({filter:/^next\/navigation$/},()=>({path:'router',namespace:'test'}));b.onLoad({filter:/.*/,namespace:'test'},()=>({contents:'export const useRouter=()=>({refresh(){}});'}));}}]});
  await page.setContent('<main id="fixture"></main>');
  await page.addScriptTag({content:bundle.outputFiles[0].text});
  const cards=page.locator('article');
  await expect(cards.nth(0).getByText('程序处理失败',{exact:true})).toBeVisible();
  await expect(cards.nth(0).getByRole('button',{name:'强制通过 AI 审核',exact:true})).toHaveCount(0);
  await expect(cards.nth(1).getByRole('button',{name:'强制通过 AI 审核',exact:true})).toBeEnabled();
  await expect(cards.nth(2).getByText('PR 可合并 · 尚未上线',{exact:true})).toBeVisible();
  await expect(cards.nth(3).getByText('已合并 · 上线待核实',{exact:true})).toBeVisible();
  await expect(cards.nth(4).getByText('网站已上线',{exact:true})).toBeVisible();
});
