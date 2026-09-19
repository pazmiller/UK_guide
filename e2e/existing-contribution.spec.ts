import { test, expect } from '@playwright/test';
import type { ExistingEdit } from '../lib/contributions/change-contract';
import type { Page } from '@playwright/test';

async function chooseTilt( page: Page, intent = '修改资料' ) {
  await page.goto( '/contribute' );
  await page.waitForLoadState( 'networkidle' );
  await page.getByRole( 'button', { name: intent, exact: true } ).click();
  await page.getByRole( 'combobox', { name: '选择城市', exact: true } ).selectOption( 'nottingham' );
  await page.getByRole( 'combobox', { name: '选择现有条目', exact: true } ).selectOption( 'no-r3' );
}

test( 'unchanged edits are blocked; changing entry/region clears draft and uploaded files', async ( { page } ) => {
  await chooseTilt( page );
  await page.getByRole( 'button', { name: '提交审核', exact: true } ).click();
  await expect( page.getByText( '请先修改至少一项资料。', {exact: true} ) ).toBeVisible();
  await page.getByRole( 'textbox', {name: '简介', exact: true} ).fill( '只属于 Tilt 的草稿' );
  await page.locator( 'input[type=file]' ).setInputFiles( {name: 'draft.png', mimeType: 'image/png', buffer: Buffer.from( 'test' )} );
  await page.getByRole( 'checkbox' ).check();
  await page.getByRole( 'combobox', {name: '选择现有条目', exact: true} ).selectOption( 'no-r4' );
  await expect( page.getByRole( 'textbox', {name: '简介', exact: true} ) ).not.toHaveValue( '只属于 Tilt 的草稿' );
  await expect( page.getByRole( 'button', {name: '移除 draft.png'} ) ).toHaveCount( 0 );
  await expect( page.getByRole( 'checkbox' ) ).toHaveCount( 0 );
  await page.getByRole( 'button', {name: '欧洲大陆 / Europa', exact: true} ).click();
  await expect( page.getByRole( 'combobox', {name: '选择城市', exact: true} ) ).toHaveValue( '' );
  await expect( page.locator( 'textarea' ) ).toHaveCount( 0 );
} );

test( 'catalog failure can retry; rejected submission preserves draft for correction', async ( { page } ) => {
  let first = true;
  await page.route( '**/api/contributions/entries', route => {
    if ( first ) return route.fulfill( {status: 503, json: {error: '测试：资料暂不可用'}} );
    return route.continue();
  } );
  await page.goto( '/contribute' ); await page.waitForLoadState( 'networkidle' );
  await page.getByRole( 'button', {name: '修改资料', exact: true} ).click();
  await expect( page.getByRole( 'region', {name: '选择并编辑现有条目'} ).getByRole( 'alert' ) ).toContainText( '资料暂不可用' );
  first = false;
  await page.getByRole( 'button', {name: '重新载入', exact: true} ).click();
  await page.getByRole( 'combobox', {name: '选择城市', exact: true} ).selectOption( 'nottingham' );
  await page.getByRole( 'combobox', {name: '选择现有条目', exact: true} ).selectOption( 'no-r3' );
  const field = page.getByRole( 'textbox', {name: /^简介/} );
  await field.fill( '保留这段用户草稿' );
  await page.route( '**/api/contributions', route => route.fulfill( {status: 409, json: {error: '原资料已更新，请重新选择。'}} ) );
  await page.getByRole( 'button', {name: '提交审核', exact: true} ).click();
  await expect( page.getByRole( 'status' ).filter( {hasText: '原资料已更新'} ) ).toBeVisible();
  await expect( field ).toHaveValue( '保留这段用户草稿' );
  await expect( page.getByRole( 'button', {name: '提交审核', exact: true} ) ).toBeEnabled();
} );

test( 'attraction update carries explicit empty field and never shows cuisine controls', async ( { page } ) => {
  await page.goto( '/contribute' ); await page.waitForLoadState( 'networkidle' );
  await page.getByRole( 'button', {name: '景点', exact: true} ).click();
  await page.getByRole( 'button', {name: '修改资料', exact: true} ).click();
  await page.getByRole( 'combobox', {name: '选择城市', exact: true} ).selectOption( 'wiltshire' );
  await page.getByRole( 'combobox', {name: '选择现有条目', exact: true} ).selectOption( 'wiltshire-attraction-avebury' );
  await expect( page.getByRole( 'textbox', {name: '菜系', exact: true} ) ).toHaveCount( 0 );
  await page.getByRole( 'textbox', {name: '地址', exact: true} ).fill( '' );
  let changes: ExistingEdit['changes'] | undefined;
  await page.route( '**/api/contributions', async route => { changes = route.request().postDataJSON().existingEdit.changes; await route.fulfill( {status: 201, json: {message: '测试成功'}} ); } );
  await page.getByRole( 'button', {name: '提交审核', exact: true} ).click();
  await expect( page.getByText( '测试成功', {exact: true} ) ).toBeVisible();
  expect( changes ).toEqual( [{field: 'address', after: ''}] );
} );

for ( const width of [360, 1280] ) test( `existing Tilt update and image-only flow at ${width}px`, async ( { page } ) => {
  test.setTimeout( 90000 );
  await page.setViewportSize( { width, height: 900 } );
  await page.goto( '/contribute' );
  await page.waitForLoadState( 'networkidle' );
  await page.getByRole( 'button', { name: '修改资料', exact: true } ).click();
  await page.getByRole( 'combobox', { name: '选择城市', exact: true } ).selectOption( 'nottingham' );
  await page.getByRole( 'combobox', { name: '选择现有条目', exact: true } ).selectOption( 'no-r3' );
  const editor = page.getByRole( 'region', { name: '选择并编辑现有条目' } );
  await expect( editor.getByText( 'Cocktail Bar', { exact: true } ) ).toBeVisible();
  await expect( editor.locator( 'dd' ).filter( { hasText: '9 Pelham St, Nottingham, NG1 2EH' } ) ).toBeVisible();
  const notes = page.getByRole( 'textbox', { name: '详情正文 / 备注', exact: true } );
  const original = await notes.inputValue();
  expect( original ).toContain( '门头很小' );
  expect( await page.evaluate( () => document.documentElement.scrollWidth <= window.innerWidth ) ).toBe( true );
  await editor.screenshot( { path: `/tmp/contribution-tilt-${width}.png` } );
  await notes.fill( original + ' 新的到访记录。' );
  let payload: { existingEdit: ExistingEdit; imageKeys: string[] } | undefined;
  // Only the external-write endpoint is mocked; the catalog is served by the real app.
  await page.route( '**/api/contributions', async route => { payload = route.request().postDataJSON(); await route.fulfill( { status: 201, json: { message: '测试投稿已接收' } } ); } );
  await page.getByRole( 'button', { name: '提交审核', exact: true } ).click();
  await expect( page.getByText( '测试投稿已接收', { exact: true } ) ).toBeVisible();
  expect( payload?.existingEdit.target.id ).toBe( 'no-r3' );
  expect( payload?.existingEdit.changes ).toEqual( [{field: 'notes', after: original + ' 新的到访记录。'}] );
  await page.getByRole( 'button', { name: '补充图片', exact: true } ).click();
  await page.getByRole( 'combobox', { name: '选择城市', exact: true } ).selectOption( 'nottingham' );
  await page.getByRole( 'combobox', { name: '选择现有条目', exact: true } ).selectOption( 'no-r3' );
  await expect( page.locator( 'textarea' ) ).toHaveCount( 0 );
  await page.getByRole( 'button', { name: '提交审核', exact: true } ).click();
  await expect( page.getByText( '请上传至少一张新图片。', { exact: true } ) ).toBeVisible();
  await page.route( '**/api/contributions/uploads', route => route.fulfill( { json: { key: 'incoming/test/image.png', uploadUrl: 'http://127.0.0.1:3100/test-upload' } } ) );
  await page.route( '**/test-upload', route => route.fulfill( { status: 200 } ) );
  await page.locator( 'input[type=file]' ).setInputFiles( { name: 'image.png', mimeType: 'image/png', buffer: Buffer.from( 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=', 'base64' ) } );
  await page.getByRole( 'checkbox' ).check();
  await page.getByRole( 'button', { name: '提交审核', exact: true } ).click();
  await expect( page.getByText( '测试投稿已接收', { exact: true } ) ).toBeVisible();
  expect( payload?.existingEdit.changes ).toEqual( [] );
  expect( payload?.imageKeys ).toEqual( ['incoming/test/image.png'] );
  expect( await page.evaluate( () => document.documentElement.scrollWidth <= window.innerWidth ) ).toBe( true );
} );
