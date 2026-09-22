import { test, expect } from '@playwright/test';
import { build } from 'esbuild';

let script: string;
test.beforeAll( async () => {
  const output = await build( {
    stdin: { resolveDir: process.cwd(), loader: 'tsx', contents: `
      import React from 'react'; import {createRoot} from 'react-dom/client';
      import Queue from './components/AdminContributionQueue';
      const variants=[['restaurant','add'],['attraction','add'],['university','add'],['avoid','add'],['tip','other'],['restaurant','update'],['attraction','image'],['restaurant','add','status:failed'],['restaurant','add','status:agent-running']];
      const issues=variants.map(([type,intent,status='status:submitted'],index)=>({number:26+index,title:'Entry '+index,url:'https://github.com/owner/private/issues/'+(26+index),createdAt:'2026-09-22T00:00:00Z',labels:[status],submission:{type,intent,name:'Entry '+index,city:'London',region:'uk',details:'投稿原文',cuisine:'Palestinian',price:'£8-20',recommendReason:'味道可以',recommendSignatures:'Today’s Platter',imageKeys:[],imageCaptions:[],rating:4,studyYear:'2026',studyStage:'硕士',studyProgram:'Test'}}));
      for(const [index,status,readyPrUrl] of [[9,'status:ready','https://github.com/pazmiller/UK_guide/pull/40'],[10,'status:manual-ready','https://github.com/pazmiller/UK_guide/pull/41'],[11,'status:ready',null],[12,'status:failed','https://github.com/pazmiller/UK_guide/pull/42']]) issues.push({...issues[0],number:26+index,labels:[status],readyPrUrl,submission:{...issues[0].submission,name:'Entry '+index}});
      createRoot(document.getElementById('queue-root')).render(<Queue issues={issues}/>);
    ` },
    bundle: true, write: false, platform: 'browser', format: 'iife', define: { 'process.env.NODE_ENV': '"production"' },
    plugins: [{ name: 'router', setup( b ) {
      b.onResolve( { filter: /^next\/navigation$/ }, () => ({ path: 'router', namespace: 'test' }) );
      b.onLoad( { filter: /.*/, namespace: 'test' }, () => ({ contents: 'export const useRouter=()=>({refresh:()=>{}});' }) );
    } }],
  } );
  script = output.outputFiles[0].text;
} );

for ( const width of [360, 1280] ) test( `admin starts new submissions but keeps field approval for edits at ${width}px`, async ( { page } ) => {
  const actions: Array<{ issue: string; body: Record<string, unknown> }> = [];
  await page.setViewportSize( { width, height: 1000 } );
  await page.route( '**/admin-routing-fixture', route => route.fulfill( { contentType: 'text/html', body: '<main id="queue-root"></main>' } ) );
  await page.route( '**/api/admin/contributions/*', async route => {
    actions.push( { issue: route.request().url().split( '/' ).at( -1 )!, body: route.request().postDataJSON() } );
    await route.fulfill( { json: { ok: true } } );
  } );
  await page.goto( '/admin-routing-fixture' );
  await page.waitForLoadState( 'networkidle' );
  await page.addScriptTag( { content: script } );
  const entry = ( index: number ) => page.locator( 'article' ).filter( { has: page.getByRole( 'heading', { name: `Entry ${index}`, exact: true } ) } );
  await expect( page.getByRole( 'heading', { name: 'Entry 0', exact: true } ) ).toBeVisible();
  await expect( page.getByText( /此操作需要人工处理/ ) ).toHaveCount( 0 );
  for ( const index of [0, 1, 2, 3] ) {
    await entry( index ).getByRole( 'button', { name: '交给 Agent 处理' } ).click();
    await expect.poll( () => actions.length ).toBe( index + 1 );
    expect( actions[index] ).toEqual( { issue: String( 26 + index ), body: { action: 'accept' } } );
  }
  await entry( 4 ).getByRole( 'button', { name: '交给 Agent 处理' } ).click();
  await expect( entry( 4 ).getByRole( 'button', { name: '确认并启动' } ) ).toBeDisabled();
  expect( actions ).toHaveLength( 4 );
  await entry( 4 ).getByRole( 'combobox' ).selectOption( 'guide' );
  await entry( 4 ).getByRole( 'button', { name: '确认并启动' } ).click();
  await expect.poll( () => actions.length ).toBe( 5 );
  expect( actions[4] ).toEqual( { issue: '30', body: { action: 'accept', tipRouting: 'guide' } } );
  for ( const index of [5, 6] ) {
    await expect( entry( index ).getByRole( 'button', { name: '交给 Agent 处理' } ) ).toHaveCount( 0 );
    await expect( entry( index ).getByRole( 'button', { name: '载入目标并确认修改' } ) ).toBeVisible();
  }
  await entry( 7 ).getByRole( 'button', { name: '重新处理', exact: true } ).click();
  await expect.poll( () => actions.length ).toBe( 6 );
  expect( actions[5] ).toEqual( { issue: '33', body: { action: 'accept' } } );
  await expect( entry( 8 ).getByRole( 'button', { name: /交给 Agent|重新处理/ } ) ).toHaveCount( 0 );
  await expect( entry( 9 ).getByText( '自动检查已通过，可以审核并合并', { exact: true } ) ).toBeVisible();
  await expect( entry( 9 ).getByRole( 'link', { name: '打开网站 PR，审核并合并' } ) ).toHaveAttribute( 'href', 'https://github.com/pazmiller/UK_guide/pull/40' );
  await expect( entry( 9 ).getByRole( 'link', { name: '打开网站 PR，审核并合并' } ) ).toHaveAttribute( 'target', '_blank' );
  await expect( entry( 10 ).getByText( '已人工放行，可以审核并合并', { exact: true } ) ).toBeVisible();
  await expect( entry( 10 ).getByText( /人工放行不代表 AI 评分通过/ ) ).toBeVisible();
  for ( const index of [11, 12] ) await expect( entry( index ).getByRole( 'link', { name: '打开网站 PR，审核并合并' } ) ).toHaveCount( 0 );
  await expect( entry( 11 ).getByText( '暂未找到可审核的 Ready PR，请刷新后重试。', { exact: true } ) ).toBeVisible();
} );
