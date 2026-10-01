import { test, expect, type Page } from '@playwright/test';
import { build } from 'esbuild';
import { contributionSubmissionSchema, type ContributionSubmission } from '../lib/contributions/schema';
import { fieldLabels, type ChangeField } from '../lib/contributions/change-contract';

let script: string;
let queueScript: string;
const submissionHash = 'a'.repeat( 64 );
const restaurant = contributionSubmissionSchema.parse( {
  type: 'restaurant', intent: 'add', name: 'Gina Street food', city: 'Lodon', details: '巴勒斯坦风味餐厅',
  cuisine: 'Other', customCuisine: 'Palestinian', price: '£8-20', recommendReason: '味道可以', recommendSignatures: 'Today’s Platter',
  imageKeys: ['incoming/26/photo.webp'], imageRightsConfirmed: true,
} );
test.beforeAll( async () => {
  const output = await build( {
    stdin: { resolveDir: process.cwd(), loader: 'tsx', contents: `
      import React from 'react'; import {createRoot} from 'react-dom/client';
      import Editor from './components/AdminContributionEditor';
      createRoot(document.getElementById('editor-root')).render(<Editor issueNumber={26} submission={window.editFixture} submissionHash="${submissionHash}" onCancel={()=>{window.editCancelled=true}} onSaved={message=>{window.editSaved=message}}/>);
    ` },
    bundle: true, write: false, platform: 'browser', format: 'iife', define: { 'process.env.NODE_ENV': '"production"' },
  } );
  script = output.outputFiles[0].text;
  const queueOutput = await build( {
    stdin: { resolveDir: process.cwd(), loader: 'tsx', contents: `
      import React from 'react'; import {createRoot} from 'react-dom/client';
      import Queue from './components/AdminContributionQueue';
      const root=createRoot(document.getElementById('editor-root'));
      window.renderAdminQueue=issues=>root.render(<Queue issues={issues}/>);
      window.renderAdminQueue(window.queueEditFixtures);
    ` },
    bundle: true, write: false, platform: 'browser', format: 'iife', define: { 'process.env.NODE_ENV': '"production"' },
    plugins: [{ name: 'router', setup( builder ) {
      builder.onResolve( { filter: /^next\/navigation$/ }, () => ( { path: 'router', namespace: 'test' } ) );
      builder.onLoad( { filter: /.*/, namespace: 'test' }, () => ( { contents: 'export const useRouter=()=>({refresh:()=>{window.queueRefreshes=(window.queueRefreshes||0)+1;}});' } ) );
    } }],
  } );
  queueScript = queueOutput.outputFiles[0].text;
} );

test( 'an AI-failed Hiba submission can edit restaurant text, save a new version and explicitly restart review', async ( { page } ) => {
  const requests: Array<{ action: string; edits?: Record<string, string> }> = [];
  const hiba = { ...restaurant, name: 'Hiba Street Food', city: '10 Tottenham St, London W1T 4RD', customCuisine: 'Palestein', price: '£10-20' };
  const issue = {
    number: 27, submission: hiba, submissionHash, title: hiba.name,
    url: 'https://github.com/owner/private/issues/27', createdAt: '2026-09-30T10:12:08Z', labels: ['status:manual-review'],
    review: { report: {
      version: 1, issueNumber: 27, pullRequestNumber: 30, headSha: 'b'.repeat( 40 ), baseSha: 'c'.repeat( 40 ),
      runId: '123', evaluatedAt: '2026-09-30T13:52:22Z', deterministicPassed: true, sourceRecall: 1,
      dynamicCasePassed: true, judgeScores: [90.7, 89.3], judgeAverage: 90, threshold: 95,
      failures: ['Judge average 90.00% is below 95%'], explanation: '有 AI 疑点，需要人工确认。',
    }, eligible: true, message: '程序检查通过，可人工审核。', prUrl: 'https://github.com/owner/public/pull/30' },
  };
  await page.route( '**/api/news', route => route.fulfill( { status: 503, json: {} } ) );
  await page.route( '**/api/admin/contributions/27', async route => {
    requests.push( route.request().postDataJSON() );
    await route.fulfill( { json: { ok: true, revision: 2 } } );
  } );
  await page.goto( '/' ); await page.waitForLoadState( 'networkidle' );
  await page.evaluate( data => {
    document.body.innerHTML = '<main id="editor-root" style="max-width:1100px;margin:auto;padding:16px"></main>';
    Object.assign( window, { queueEditFixtures: [data] } );
  }, issue );
  await page.addScriptTag( { content: queueScript } );
  await expect( page.getByRole( 'button', { name: '强制通过 AI 审核', exact: true } ) ).toBeEnabled();
  await page.getByRole( 'button', { name: '编辑投稿内容', exact: true } ).click();
  await expect( page.getByRole( 'button', { name: '强制通过 AI 审核', exact: true } ) ).toHaveCount( 0 );
  const edits = {
    name: 'Hiba Street Food London', city: 'London', details: '管理员确认的餐厅简介。',
    customCuisine: 'Palestinian', price: '£12-20', recommendReason: '味道不错，甜品美味。',
    recommendSignatures: "Today's Platter\nBaklawa, mint tea", sourceUrl: 'https://example.com/hiba',
  };
  for ( const [label, field] of [
    ['名称 / 主题', 'name'], ['城市 / 地区', 'city'], ['投稿内容', 'details'], ['自定义菜系（英文）', 'customCuisine'],
    ['价位', 'price'], ['推荐理由', 'recommendReason'], ['推荐招牌菜', 'recommendSignatures'], ['来源链接（选填）', 'sourceUrl'],
  ] as const ) await page.getByRole( 'textbox', { name: label, exact: true } ).fill( edits[field] );
  await confirmation( page ).check(); await save( page ).click();
  await expect.poll( () => requests.length ).toBe( 1 );
  expect( requests[0] ).toEqual( { action: 'save-submission', submissionHash, edits } );
  await expect( page.getByRole( 'status' ) ).toContainText( '投稿已保存' );
  const revised = { ...issue, submission: { ...hiba, ...edits, revision: 2 }, submissionHash: 'd'.repeat( 64 ), labels: ['status:submitted'], review: null };
  await page.evaluate( data => Reflect.get( window, 'renderAdminQueue' )( [data] ), revised );
  await expect( page.getByRole( 'heading', { name: edits.name, exact: true } ) ).toBeVisible();
  await expect( page.getByText( '第 2 版', { exact: true } ) ).toBeVisible();
  await expect( page.getByRole( 'region', { name: 'AI 评分与人工审核' } ) ).toHaveCount( 0 );
  await expect( page.getByRole( 'button', { name: '强制通过 AI 审核', exact: true } ) ).toHaveCount( 0 );
  expect( requests ).toHaveLength( 1 );
  await page.getByRole( 'button', { name: '重新 AI 审核', exact: true } ).click();
  await expect.poll( () => requests.length ).toBe( 2 );
  expect( requests[1] ).toEqual( { action: 'accept' } );
  await expect( page.getByRole( 'status' ) ).toContainText( '已交给 Agent 重新处理' );
  expect( requests.some( request => request.action === 'manual-approve' ) ).toBe( false );
} );
async function mount( page: Page, submission: ContributionSubmission = restaurant ) {
  await page.route( '**/api/news', route => route.fulfill( { status: 503, json: {} } ) );
  await page.goto( '/' );
  await page.waitForLoadState( 'networkidle' );
  await page.evaluate( data => {
    document.body.innerHTML = '<main id="editor-root" style="max-width:900px;margin:auto;padding:16px"></main>';
    Object.assign( window, { editFixture: data } );
  }, submission );
  await page.addScriptTag( { content: script } );
  await expect( page.getByRole( 'form', { name: '编辑投稿内容' } ) ).toBeVisible();
}
const confirmation = ( page: Page ) => page.getByRole( 'checkbox', { name: /我确认保存将使旧审批/ } );
const save = ( page: Page ) => page.getByRole( 'button', { name: '保存修改', exact: true } );
function existingSubmission( intent: 'update' | 'image' = 'update' ): ContributionSubmission {
  return {
    ...restaurant, name: 'Tilt', city: 'nottingham', intent,
    existingEdit: {
      target: { city: 'nottingham', region: 'uk', category: 'restaurant', id: 'nottingham-restaurant-tilt', name: 'Tilt', section: 'Nottingham｜诺丁汉', sourcePath: 'src/DATA.json' },
      before: Object.fromEntries( Object.keys( fieldLabels ).map( field => [field, field === 'summary' ? '旧简介' : field === 'price' ? '£20-30' : field === 'address' ? '9 Pelham St' : ''] ) ) as Record<ChangeField, string>,
      changes: intent === 'update' ? [{ field: 'summary', after: '投稿的新简介' }, { field: 'price', after: '£25-35' }] : [],
    },
  };
}

for ( const width of [360, 1280] ) test( `saves Lodon correction without starting Agent or replacing other fields at ${width}px`, async ( { page } ) => {
  const requests: unknown[] = [];
  await page.setViewportSize( { width, height: 1000 } );
  await page.route( '**/api/admin/contributions/*', async route => {
    requests.push( route.request().postDataJSON() );
    await route.fulfill( { json: { ok: true, revision: 2 } } );
  } );
  await mount( page );
  await expect( page.getByText( /已上传 1 张图片，保存时原样保留/ ) ).toBeVisible();
  await expect( save( page ) ).toBeDisabled();
  await page.getByRole( 'textbox', { name: '城市 / 地区', exact: true } ).fill( 'London' );
  await expect( save( page ) ).toBeDisabled();
  await confirmation( page ).check();
  await page.getByRole( 'textbox', { name: '城市 / 地区', exact: true } ).fill( 'Londo' );
  await expect( confirmation( page ) ).not.toBeChecked();
  await page.getByRole( 'textbox', { name: '城市 / 地区', exact: true } ).fill( 'London' );
  await confirmation( page ).check();
  await save( page ).click();
  await expect.poll( () => requests.length ).toBe( 1 );
  expect( requests[0] ).toEqual( { action: 'save-submission', submissionHash, edits: { city: 'London' } } );
  await expect.poll( () => page.evaluate( () => Reflect.get( window, 'editSaved' ) ) ).toContain( '请重新处理' );
  expect( await page.evaluate( () => document.documentElement.scrollWidth <= innerWidth ) ).toBe( true );
} );

test( 'a stale submission error preserves the draft and does not start the Agent', async ( { page } ) => {
  const requests: unknown[] = [];
  await page.route( '**/api/admin/contributions/*', async route => {
    requests.push( route.request().postDataJSON() );
    await route.fulfill( { status: 409, json: { error: '投稿已更新，请刷新后重新核对。' } } );
  } );
  await mount( page );
  await page.getByRole( 'textbox', { name: '城市 / 地区', exact: true } ).fill( 'London' );
  await confirmation( page ).check();
  await save( page ).click();
  await expect( page.getByRole( 'alert' ) ).toHaveText( '投稿已更新，请刷新后重新核对。' );
  await expect( page.getByRole( 'textbox', { name: '城市 / 地区', exact: true } ) ).toHaveValue( 'London' );
  await expect( page.getByRole( 'textbox', { name: '推荐理由', exact: true } ) ).toHaveValue( '味道可以' );
  expect( requests ).toHaveLength( 1 );
  expect( await page.evaluate( () => Reflect.get( window, 'editSaved' ) ) ).toBeUndefined();
} );

test( 'unchanged submissions cannot save and cancellation sends no request', async ( { page } ) => {
  const requests: unknown[] = [];
  await page.route( '**/api/admin/contributions/*', async route => { requests.push( route.request().postDataJSON() ); await route.fulfill( { json: { ok: true } } ); } );
  await mount( page );
  await confirmation( page ).check();
  await expect( save( page ) ).toBeDisabled();
  await page.getByRole( 'textbox', { name: '城市 / 地区', exact: true } ).fill( 'London' );
  await page.getByRole( 'button', { name: '取消编辑' } ).click();
  expect( requests ).toHaveLength( 0 );
  expect( await page.evaluate( () => Reflect.get( window, 'editCancelled' ) ) ).toBe( true );
} );

test( 'existing entries keep their identity and original snapshot while editing intended fields', async ( { page } ) => {
  const requests: Record<string, unknown>[] = [];
  await page.route( '**/api/admin/contributions/*', async route => { requests.push( route.request().postDataJSON() ); await route.fulfill( { json: { ok: true, revision: 2 } } ); } );
  await mount( page, existingSubmission() );
  await expect( page.getByText( 'ID：nottingham-restaurant-tilt', { exact: true } ) ).toBeVisible();
  await expect( page.getByRole( 'textbox', { name: '城市 / 地区', exact: true } ) ).toHaveCount( 0 );
  await expect( page.getByRole( 'textbox', { name: '名称 / 主题', exact: true } ) ).toHaveCount( 0 );
  await expect( page.getByRole( 'textbox', { name: '投稿内容', exact: true } ) ).toHaveCount( 0 );
  await page.getByRole( 'textbox', { name: '简介 · 新内容', exact: true } ).fill( '管理员更正后的简介' );
  await page.getByRole( 'textbox', { name: '价位 · 新内容', exact: true } ).fill( '£20-30' );
  await page.getByRole( 'textbox', { name: '地址 · 新内容', exact: true } ).fill( '10 Pelham St' );
  await confirmation( page ).check(); await save( page ).click();
  await expect.poll( () => requests.length ).toBe( 1 );
  expect( requests[0] ).toEqual( { action: 'save-submission', submissionHash, edits: { existingChanges: [{ field: 'summary', after: '管理员更正后的简介' }, { field: 'address', after: '10 Pelham St' }] } } );
} );

test( 'image-only requests keep their uploads and only allow editing the source link', async ( { page } ) => {
  const requests: unknown[] = [];
  await page.route( '**/api/admin/contributions/*', async route => { requests.push( route.request().postDataJSON() ); await route.fulfill( { json: { ok: true, revision: 2 } } ); } );
  await mount( page, existingSubmission( 'image' ) );
  await expect( page.getByRole( 'textbox' ) ).toHaveCount( 1 );
  await expect( page.getByText( /已上传 1 张图片/ ) ).toBeVisible();
  await page.getByRole( 'textbox', { name: '来源链接（选填）', exact: true } ).fill( 'https://example.com/source' );
  await confirmation( page ).check(); await save( page ).click();
  await expect.poll( () => requests.length ).toBe( 1 );
  expect( requests[0] ).toEqual( { action: 'save-submission', submissionHash, edits: { sourceUrl: 'https://example.com/source' } } );
} );

test( 'university review editing preserves school identity and changes only requested review fields', async ( { page } ) => {
  const requests: unknown[] = [];
  await page.route( '**/api/admin/contributions/*', async route => { requests.push( route.request().postDataJSON() ); await route.fulfill( { json: { ok: true, revision: 2 } } ); } );
  const university = contributionSubmissionSchema.parse( { type: 'university', intent: 'add', name: 'University of Exeter', universitySlug: 'university-of-exeter', details: '整体评价', studyStartYear: '2024', studyEndYear: '2025', studyStage: '硕士', studyProgram: 'Computer Science', rating: 4, universityPros: '环境好', universityCons: '坡多' } );
  await mount( page, university );
  await expect( page.getByText( 'University of Exeter', { exact: true } ) ).toBeVisible();
  await expect( page.getByRole( 'textbox', { name: '名称 / 主题', exact: true } ) ).toHaveCount( 0 );
  await page.getByRole( 'textbox', { name: '特别好之处', exact: true } ).fill( '校园环境好' );
  await page.getByRole( 'combobox', { name: '评分', exact: true } ).selectOption( '4.5' );
  await confirmation( page ).check(); await save( page ).click();
  await expect.poll( () => requests.length ).toBe( 1 );
  expect( requests[0] ).toEqual( { action: 'save-submission', submissionHash, edits: { universityPros: '校园环境好', rating: 4.5 } } );
} );

for ( const width of [360, 1280] ) test( `queue editing locks other actions, cancels cleanly, and refreshes after save at ${width}px`, async ( { page } ) => {
  const requests: unknown[] = [];
  let finishSave: ( () => void ) | undefined;
  await page.setViewportSize( { width, height: 1100 } );
  await page.route( '**/api/news', route => route.fulfill( { status: 503, json: {} } ) );
  await page.route( '**/api/admin/contributions/*', async route => {
    requests.push( route.request().postDataJSON() );
    await new Promise<void>( resolve => { finishSave = resolve; } );
    await route.fulfill( { json: { ok: true, revision: 2 } } );
  } );
  await page.goto( '/' );
  await page.waitForLoadState( 'networkidle' );
  const issue = ( number: number, submission: ContributionSubmission, status: string ) => ( {
    number, submission: { ...submission, imageKeys: [] }, submissionHash,
    title: submission.name, url: `https://github.com/owner/private/issues/${number}`,
    createdAt: '2026-09-23T00:00:00Z', labels: [status],
  } );
  await page.evaluate( issues => {
    document.body.innerHTML = '<main id="editor-root" style="max-width:1100px;margin:auto;padding:16px"></main>';
    Object.assign( window, { queueEditFixtures: issues } );
  }, [
    issue( 26, restaurant, 'status:failed' ),
    issue( 27, { ...restaurant, name: 'Another submission' }, 'status:submitted' ),
    issue( 28, existingSubmission(), 'status:submitted' ),
    issue( 29, { ...restaurant, name: 'Running submission' }, 'status:agent-running' ),
    issue( 30, { ...restaurant, name: 'Merged submission' }, 'status:merged' ),
  ] );
  await page.addScriptTag( { content: queueScript } );
  const entry = ( name: string ) => page.locator( 'article' ).filter( { has: page.getByRole( 'heading', { name, exact: true } ) } );
  const gina = entry( 'Gina Street food' );
  const other = entry( 'Another submission' );
  const tilt = entry( 'Tilt' );
  await expect( gina.getByRole( 'button', { name: '重新处理', exact: true } ) ).toBeEnabled();
  await expect( entry( 'Running submission' ).getByRole( 'button', { name: '编辑投稿内容', exact: true } ) ).toHaveCount( 0 );
  await expect( entry( 'Merged submission' ).getByRole( 'button', { name: '编辑投稿内容', exact: true } ) ).toHaveCount( 0 );
  await gina.getByRole( 'button', { name: '编辑投稿内容', exact: true } ).click();
  await expect( gina.getByRole( 'form', { name: '编辑投稿内容' } ) ).toBeVisible();
  await expect( gina.getByRole( 'button', { name: '重新处理', exact: true } ) ).toBeDisabled();
  await expect( gina.getByRole( 'button', { name: '关闭投稿', exact: true } ) ).toBeDisabled();
  await expect( other.getByRole( 'button', { name: '交给 Agent 处理', exact: true } ) ).toBeDisabled();
  await expect( other.getByRole( 'button', { name: '编辑投稿内容', exact: true } ) ).toBeDisabled();
  await expect( tilt.getByRole( 'button', { name: '载入目标并确认修改', exact: true } ) ).toHaveCount( 0 );
  await page.getByRole( 'textbox', { name: '城市 / 地区', exact: true } ).fill( 'London' );
  await page.getByRole( 'button', { name: '取消编辑', exact: true } ).click();
  await expect( page.getByRole( 'form', { name: '编辑投稿内容' } ) ).toHaveCount( 0 );
  await expect( gina.getByRole( 'button', { name: '重新处理', exact: true } ) ).toBeEnabled();
  await expect( other.getByRole( 'button', { name: '交给 Agent 处理', exact: true } ) ).toBeEnabled();
  await expect( tilt.getByRole( 'button', { name: '载入目标并确认修改', exact: true } ) ).toBeVisible();
  expect( requests ).toHaveLength( 0 );
  await gina.getByRole( 'button', { name: '编辑投稿内容', exact: true } ).click();
  await expect( page.getByRole( 'textbox', { name: '城市 / 地区', exact: true } ) ).toHaveValue( 'Lodon' );
  await page.getByRole( 'textbox', { name: '城市 / 地区', exact: true } ).fill( 'London' );
  await confirmation( page ).check();
  await save( page ).click();
  await expect.poll( () => requests.length ).toBe( 1 );
  await expect( page.getByRole( 'button', { name: '正在保存…', exact: true } ) ).toBeDisabled();
  await expect( page.getByRole( 'button', { name: '取消编辑', exact: true } ) ).toBeDisabled();
  await expect( gina.getByRole( 'button', { name: '重新处理', exact: true } ) ).toBeDisabled();
  finishSave!();
  await expect( page.getByRole( 'status' ) ).toContainText( '投稿已保存。旧审批与评分已失效，请重新处理。' );
  await expect( page.getByRole( 'form', { name: '编辑投稿内容' } ) ).toHaveCount( 0 );
  await expect.poll( () => page.evaluate( () => Reflect.get( window, 'queueRefreshes' ) ) ).toBe( 1 );
  expect( requests ).toEqual( [{ action: 'save-submission', submissionHash, edits: { city: 'London' } }] );
  expect( await page.evaluate( () => document.documentElement.scrollWidth <= innerWidth ) ).toBe( true );
} );
