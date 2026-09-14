import { test, expect } from '@playwright/test';
import { build } from 'esbuild';

let script: string;
test.beforeAll( async () => {
  const output = await build( { stdin: { resolveDir: process.cwd(), loader: 'tsx', contents: `
    import React from 'react'; import { createRoot } from 'react-dom/client';
    import Approval from './components/ContributionChangeApproval';
    createRoot(document.getElementById('approval-root')).render(<Approval issueNumber={24} submission={{type:'attraction',intent:'update',name:'Avebury',city:'Wiltshire',details:'这是一个40分钟外的2号巨石阵。',imageKeys:[]}} />);
  ` }, bundle: true, write: false, platform: 'browser', format: 'iife', define: { 'process.env.NODE_ENV': '"production"' }, plugins: [{ name: 'router', setup( builder ) {
    builder.onResolve( { filter: /^next\/navigation$/ }, () => ( { path: 'router', namespace: 'test' } ) );
    builder.onLoad( { filter: /.*/, namespace: 'test' }, () => ( { contents: 'export const useRouter=()=>({refresh:()=>{}});' } ) );
  } }] } );
  script = output.outputFiles[0].text;
} );
for ( const width of [360, 1280] ) test( `explicit target, fields and reconfirmation required at ${width}px`, async ( { page } ) => {
  const actions: Record<string, unknown>[] = [];
  await page.setViewportSize( { width, height: 1000 } );
  await page.route( '**/api/news', route => route.fulfill( { status: 503, json: {} } ) );
  await page.route( '**/api/admin/contributions/24', async route => {
    const body = route.request().postDataJSON(); actions.push( body );
    await route.fulfill( { json: body.action === 'prepare-change' ? { baseSha: 'b'.repeat( 40 ), submissionHash: 'a'.repeat( 64 ), imagePaths: [], candidates: [{ target: { city: 'wiltshire', region: 'uk', category: 'attraction', id: 'wiltshire-attraction-avebury', name: 'Avebury', section: 'Wiltshire｜威尔特郡（景点）', sourcePath: 'src/DATA.json' }, fields: { summary: '旧简介', address: 'SN8 1RD' } }] } : { ok: true } } );
  } );
  await page.goto( '/' );
  await page.waitForLoadState( 'networkidle' );
  await page.evaluate( () => { document.body.innerHTML = '<main id="approval-root" style="max-width:900px;margin:auto;padding:16px"></main>'; } );
  await page.addScriptTag( { content: script } );
  await page.getByRole( 'button', { name: '载入目标并确认修改' } ).click();
  await expect( page.getByRole( 'button', { name: '确认范围并启动 Agent' } ) ).toHaveCount( 0 );
  await page.getByRole( 'combobox' ).selectOption( '0' );
  const approve = page.getByRole( 'button', { name: '确认范围并启动 Agent' } );
  await expect( approve ).toBeDisabled();
  await page.getByRole( 'checkbox', { name: '简介', exact: true } ).check();
  await expect( page.getByRole( 'textbox', { name: '简介确认的新内容' } ) ).toHaveValue( '这是一个40分钟外的2号巨石阵。' );
  const confirm = page.getByRole( 'checkbox', { name: /我已核对/ } );
  await confirm.check();
  await page.getByRole( 'textbox', { name: '简介确认的新内容' } ).fill( '2号巨石阵' );
  await expect( confirm ).not.toBeChecked();
  await expect( approve ).toBeDisabled();
  await confirm.check(); await approve.click();
  await expect.poll( () => actions.length ).toBe( 2 );
  expect( actions[1] ).toMatchObject( { action: 'accept', change: { target: { id: 'wiltshire-attraction-avebury' }, fields: [{ field: 'summary', before: '旧简介', after: '2号巨石阵' }] } } );
  expect( await page.evaluate( () => document.documentElement.scrollWidth <= innerWidth ) ).toBe( true );
} );
