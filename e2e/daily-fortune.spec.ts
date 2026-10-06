import { expect, test } from '@playwright/test';
import { FORTUNES, FORTUNE_KEY } from '../lib/dailyFortune';

test.beforeEach( async ( { page } ) => {
  await page.clock.install( { time: new Date( '2026-09-08T12:00:00Z' ) } );
  await page.route( '**/api/news', route => route.fulfill( { status: 503, json: { error: 'Test offline' } } ) );
} );

test( 'saves before animation, resists rapid clicks and survives reload and reopening', async ( { page, context } ) => {
  await page.goto( '/' );
  const widget = page.getByRole( 'group', { name: '每日运势' } );
  const draw = widget.getByRole( 'button', { name: '抽取今日运势' } );
  await draw.click();
  await expect( widget ).toHaveAttribute( 'data-drawing', 'true' );
  const saved = await page.evaluate( key => localStorage.getItem( key ), FORTUNE_KEY );
  expect( JSON.parse( saved! ).date ).toBe( '2026-09-08' );
  await widget.locator( 'button' ).first().evaluate( el => {
    for ( let i = 0; i < 5; i++ ) el.dispatchEvent( new MouseEvent( 'click', { bubbles: true, detail: 1 } ) );
  } );
  expect( await page.evaluate( key => localStorage.getItem( key ), FORTUNE_KEY ) ).toBe( saved );
  await page.reload();
  await expect( widget.getByRole( 'button', { name: /查看今日运势/ } ) ).toBeEnabled();
  await widget.getByRole( 'button', { name: /查看今日运势/ } ).click();
  await expect( page.getByRole( 'region', { name: '今日签文' } ) ).toBeVisible();
  expect( await page.evaluate( key => localStorage.getItem( key ), FORTUNE_KEY ) ).toBe( saved );
  const url = page.url();
  await page.close();
  const reopened = await context.newPage();
  await reopened.clock.install( { time: new Date( '2026-09-08T12:00:00Z' ) } );
  await reopened.goto( url );
  await expect( reopened.getByRole( 'button', { name: /查看今日运势/ } ) ).toBeVisible();
} );

test( 'a pointer draw shakes the tube, lifts the slip and reveals the result', async ( { page } ) => {
  await page.goto( '/' );
  const widget = page.getByRole( 'group', { name: '每日运势' } );
  await widget.getByRole( 'button', { name: '抽取今日运势' } ).click();
  await expect( widget ).toHaveAttribute( 'data-drawing', 'true' );
  const animations = await widget.evaluate( el => el.getAnimations( { subtree: true } ).map( animation => ( animation as CSSAnimation ).animationName ).filter( Boolean ) );
  expect( animations.some( name => name.includes( 'shake' ) ) ).toBe( true );
  expect( animations.some( name => name.includes( 'emerge' ) ) ).toBe( true );
  await expect( page.getByRole( 'region', { name: '今日签文' } ) ).toBeVisible();
  await expect( widget ).toHaveAttribute( 'data-drawing', 'false' );
  await expect( widget ).toHaveAttribute( 'data-drawn', 'true' );
} );

test( 'rolls over at UK midnight with the page left open', async ( { page } ) => {
  await page.clock.setSystemTime( new Date( '2026-09-08T22:59:59Z' ) );
  await page.addInitScript( key => localStorage.setItem( key, JSON.stringify( { version: 1, date: '2026-09-08', result: 'high' } ) ), FORTUNE_KEY );
  await page.goto( '/' );
  await expect( page.getByRole( 'button', { name: '查看今日运势：上', exact: true } ) ).toBeEnabled();
  await page.clock.setSystemTime( new Date( '2026-09-08T23:00:01Z' ) );
  await page.clock.runFor( 1100 );
  await page.getByRole( 'button', { name: '抽取今日运势' } ).click();
  await expect.poll( async () => JSON.parse( ( await page.evaluate( key => localStorage.getItem( key ), FORTUNE_KEY ) )! ).date ).toBe( '2026-09-09' );
} );

test( 'two tabs drawing simultaneously share one result', async ( { page, context } ) => {
  await page.goto( '/' );
  const other = await context.newPage();
  await other.clock.install( { time: new Date( '2026-09-08T12:00:00Z' ) } );
  await other.goto( page.url() );
  for ( const tab of [ page, other ] ) await expect( tab.getByRole( 'button', { name: '抽取今日运势' } ) ).toBeEnabled();
  await Promise.all( [ page, other ].map( tab => tab.getByRole( 'group', { name: '每日运势' } ).locator( 'button' ).first().evaluate( el => ( el as HTMLButtonElement ).click() ) ) );
  const first = page.getByRole( 'button', { name: /查看今日运势/ } );
  const second = other.getByRole( 'button', { name: /查看今日运势/ } );
  await expect( first ).toBeEnabled();
  await expect( second ).toHaveAttribute( 'aria-label', ( await first.getAttribute( 'aria-label' ) )! );
} );

for ( const method of [ 'getItem', 'setItem' ] )
{
  test( `storage ${method} denied: displays an honest warning and keeps this session's result`, async ( { page } ) => {
    await page.addInitScript( method => {
      Storage.prototype[method as 'getItem'] = () => { throw new DOMException( 'Blocked', 'SecurityError' ); };
    }, method );
    await page.emulateMedia( { reducedMotion: 'reduce' } );
    await page.goto( '/' );
    await page.getByRole( 'button', { name: '抽取今日运势' } ).click();
    const panel = page.getByRole( 'region', { name: '今日签文' } );
    await expect( panel ).toContainText( '浏览器未能保存，刷新后可能丢失' );
    const label = await page.getByRole( 'button', { name: /查看今日运势/ } ).getAttribute( 'aria-label' );
    await panel.getByRole( 'button', { name: '收起签文' } ).click();
    await page.getByRole( 'button', { name: /查看今日运势/ } ).click();
    await expect( page.getByRole( 'button', { name: /查看今日运势/ } ) ).toHaveAttribute( 'aria-label', label! );
  } );
}

test( 'corrupt storage recovers, reduced motion and keyboard do not shake', async ( { page } ) => {
  await page.addInitScript( key => localStorage.setItem( key, '{broken' ), FORTUNE_KEY );
  await page.goto( '/' );
  const draw = page.getByRole( 'button', { name: '抽取今日运势' } );
  await draw.focus();
  await page.keyboard.press( 'Enter' );
  const widget = page.getByRole( 'group', { name: '每日运势' } );
  await expect( widget ).toHaveAttribute( 'data-drawing', 'false' );
  await expect( page.getByRole( 'region', { name: '今日签文' } ) ).toBeVisible();
  await page.keyboard.press( 'Escape' );
  await expect( page.getByRole( 'region', { name: '今日签文' } ) ).toHaveCount( 0 );
  await expect( widget.locator( 'button' ).first() ).toBeFocused();
  await page.getByRole( 'button', { name: '进入阅读模式' } ).click();
  await expect( widget ).toBeHidden();
  await page.getByRole( 'button', { name: '合上报纸', exact: true } ).click();
  await expect( widget.getByRole( 'button', { name: /查看今日运势/ } ) ).toBeVisible();
} );

for ( const width of [ 1440, 390, 320 ] )
{
  test( `all seven fortunes fit the widget and panel at ${width}px`, async ( { page } ) => {
    await page.setViewportSize( { width, height: 1000 } );
    await page.emulateMedia( { reducedMotion: 'reduce' } );
    await page.goto( '/' );
    for ( const fortune of FORTUNES )
    {
      await page.evaluate( ( { key, result } ) => {
        localStorage.setItem( key, JSON.stringify( { version: 1, date: '2026-09-08', result } ) );
        window.dispatchEvent( new StorageEvent( 'storage', { key } ) );
      }, { key: FORTUNE_KEY, result: fortune.id } );
      const trigger = page.getByRole( 'button', { name: `查看今日运势：${fortune.label}`, exact: true } );
      await trigger.click();
      const panel = page.getByRole( 'region', { name: '今日签文' } );
      await expect( panel ).toBeVisible();
      await expect( panel.locator( 'strong' ) ).toHaveText( fortune.label );
      const news = page.getByRole( 'region', { name: /Quite shite innit/ } );
      const newsBox = ( await news.boundingBox() )!;
      const panelBox = ( await panel.boundingBox() )!;
      expect( panelBox.x ).toBeGreaterThanOrEqual( newsBox.x );
      expect( panelBox.x + panelBox.width ).toBeLessThanOrEqual( newsBox.x + newsBox.width );
      expect( panelBox.y + panelBox.height ).toBeLessThanOrEqual( newsBox.y + newsBox.height );
      expect( await news.evaluate( el => el.scrollWidth <= el.clientWidth ) ).toBe( true );
      if ( fortune.id === 'ultra' ) await page.screenshot( { path: `/tmp/fortune-${width}.png` } );
      await panel.getByRole( 'button', { name: '收起签文' } ).click();
    }
  } );
}
