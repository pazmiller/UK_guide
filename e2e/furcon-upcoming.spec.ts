import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';

test('Furcon shows only unexpired activities in its list, months, counts and calendar', async ( { page } ) => {
  await page.goto( '/furcon' );
  await page.waitForLoadState( 'networkidle' );
  const today = ( await page.getByRole( 'navigation', { name: 'Furcon index' } ).innerText() ).match( /\d{4}-\d{2}-\d{2}/ )![0];
  const source = await readFile( 'components/FurconIndex.tsx', 'utf8' );
  const data = JSON.parse( source.match( /const DATA: Furcon\[\] = (\[[\s\S]*?\]);/ )![1] ) as Array<{ name: string; end: string; start: string; cancelled: boolean }>;
  const expected = data.filter( event => event.end >= today && !event.cancelled && event.name !== 'Futerkon 2026' );
  const results = page.getByRole( 'region', { name: '兽展列表', exact: true } );
  await expect( results.locator( 'article' ) ).toHaveCount( expected.length );
  const names = await results.locator( 'h3 a' ).evaluateAll( links => links.map( link => link.firstChild?.textContent ) );
  expect( names ).toEqual( expected.map( event => event.name ) );
  await expect( results ).not.toContainText( '活动已结束' );
  await expect( results ).not.toContainText( '已取消' );
  const total = page.getByText( '未结束场次 / upcoming', { exact: true } ).locator( '..' );
  await expect( total ).toContainText( `${expected.length}场` );

  const months = page.getByRole( 'region', { name: '按月份筛选' } ).getByRole( 'button' );
  expect( await months.count() ).toBe( new Set( expected.map( event => event.start.slice( 0, 7 ) ) ).size );
  const lfmDates = await page.getByLabel( 'London Furs 2026 日期' ).locator( 'time' ).evaluateAll( elements => elements.map( element => element.getAttribute( 'datetime' )! ) );
  expect( lfmDates.every( date => date >= today ) ).toBe( true );

  await page.getByRole( 'searchbox', { name: '搜索兽展' } ).fill( 'Futerkon 2026' );
  await expect( results.locator( 'article' ) ).toHaveCount( 0 );
  await expect( results ).toContainText( '没有符合条件的兽展' );
  await expect( page.getByRole( 'button', { name: /导出筛选内未结束活动/ } ) ).toBeDisabled();
  await page.getByRole( 'searchbox', { name: '搜索兽展' } ).fill( '' );
  await expect( results.locator( 'article' ) ).toHaveCount( expected.length );
});
