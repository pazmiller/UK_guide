import { expect, test } from '@playwright/test';

for ( const width of [ 1440, 768, 390, 320 ] )
{
  test( `London street and navigation fit at ${width}px`, async ( { page } ) =>
  {
    await page.setViewportSize( { width, height: 900 } );
    const errors: string[] = [];
    page.on( 'pageerror', error => errors.push( error.message ) );
    await page.goto( '/london' );
    const hero = page.getByRole( 'region', { name: 'LONDON.' } );
    await expect( hero ).toHaveAttribute( 'data-scene', 'ready' );
    await expect( hero ).toHaveAttribute( 'data-motion', 'running' );
    await page.evaluate( () => document.fonts.ready );
    const logo = hero.locator( 'img[src="/logos/cffa-transparent.png"]' );
    await expect( logo ).toHaveCount( 1 );
    if ( width > 380 )
    {
      await expect( logo ).toBeVisible();
      await expect.poll( () => logo.evaluate( el => ( el as HTMLImageElement ).naturalWidth ) ).toBeGreaterThan( 0 );
      const size = ( await logo.boundingBox() )!;
      const ratio = await logo.evaluate( el => ( el as HTMLImageElement ).naturalWidth / ( el as HTMLImageElement ).naturalHeight );
      expect( size.width / size.height ).toBeCloseTo( ratio, 2 );
      const title = ( await hero.getByRole( 'heading' ).boundingBox() )!;
      expect( size.x ).toBeGreaterThan( title.x + title.width );
    } else await expect( logo ).toBeHidden();
    await expect( hero.getByRole( 'button', { name: /街景动画/ } ) ).toHaveCount( 0 );
    await expect( hero.getByText( '欢迎来到伦敦' ) ).toHaveCount( 0 );
    await expect( hero.getByRole( 'link', { name: /找餐厅/ } ) ).toHaveAttribute( 'href', '/london/restaurants' );
    await expect( hero.getByRole( 'link', { name: /逛景点/ } ) ).toHaveAttribute( 'href', '/london/attractions' );
    expect( await page.evaluate( () => document.documentElement.scrollWidth <= innerWidth ) ).toBe( true );
    const heading = ( await hero.getByRole( 'heading' ).boundingBox() )!;
    const links = ( await hero.getByRole( 'navigation', { name: '探索伦敦', exact: true } ).boundingBox() )!;
    expect( heading.y + heading.height ).toBeLessThan( links.y );
    expect( links.x ).toBeGreaterThanOrEqual( 0 );
    expect( links.x + links.width ).toBeLessThanOrEqual( width );
    await hero.screenshot( { path: `/tmp/london-street-${width}.png` } );
    expect( errors ).toEqual( [] );
  } );
}

test( 'street moves and sleeps offscreen or with reduced motion', async ( { page } ) =>
{
  await page.goto( '/london' );
  const hero = page.getByRole( 'region', { name: 'LONDON.' } );
  await expect( hero ).toHaveAttribute( 'data-scene', 'ready' );
  const canvas = hero.locator( 'canvas' );
  await page.evaluate( () => document.fonts.ready );
  const bounds = ( await canvas.boundingBox() )!;
  // Compare the street itself, excluding the global navbar, chat button and control labels.
  const clip = { x: bounds.x + bounds.width * .05, y: bounds.y + bounds.height * .4, width: bounds.width * .9, height: bounds.height * .26 };
  const moving = await page.screenshot( { clip } );
  await page.waitForTimeout( 300 );
  expect( ( await page.screenshot( { clip } ) ).equals( moving ) ).toBe( false );
  await page.evaluate( () => scrollTo( 0, 2000 ) );
  await expect( hero ).toHaveAttribute( 'data-motion', 'paused' );
  await page.evaluate( () => scrollTo( 0, 0 ) );
  await expect( hero ).toHaveAttribute( 'data-motion', 'running' );
  await page.emulateMedia( { reducedMotion: 'reduce' } );
  await expect( hero ).toHaveAttribute( 'data-scene', 'static' );
  await expect( hero ).toHaveAttribute( 'data-motion', 'paused' );
  await expect( canvas ).toBeHidden();
  await page.emulateMedia( { reducedMotion: 'no-preference' } );
  await expect( hero ).toHaveAttribute( 'data-motion', 'running' );
} );

test( 'reduced motion starts with a static poster and no WebGL context', async ( { page } ) =>
{
  await page.emulateMedia( { reducedMotion: 'reduce' } );
  await page.goto( '/london' );
  const hero = page.getByRole( 'region', { name: 'LONDON.' } );
  await expect( hero ).toHaveAttribute( 'data-scene', 'static' );
  await expect( hero.getByRole( 'button' ) ).toHaveCount( 0 );
  await expect( hero.locator( 'canvas' ) ).toBeHidden();
  expect( await hero.locator( 'canvas' ).evaluate( el => ( el as HTMLCanvasElement ).width ) ).toBe( 300 );
  await hero.screenshot( { path: '/tmp/london-street-reduced-motion.png' } );
} );

test( 'shop links work with keyboard and open the matching cafe detail', async ( { page } ) =>
{
  await page.goto( '/london' );
  const links = page.getByRole( 'navigation', { name: '街景餐厅快捷链接' } ).getByRole( 'link' );
  await expect( links ).toHaveCount( 18 );
  const arome = links.filter( { hasText: 'Arôme Bakery' } );
  await arome.focus();
  await expect( arome ).toBeVisible();
  await page.keyboard.press( 'Enter' );
  await expect( page ).toHaveURL( /\/london\/restaurants\?restaurant=arome-bakery$/ );
  await expect( page.getByRole( 'heading', { name: 'Arôme Bakery', exact: true, level: 2 } ) ).toBeVisible();
} );

test( 'clicking a visible canvas shop navigates to its restaurant detail', async ( { page } ) =>
{
  await page.setViewportSize( { width: 1440, height: 900 } );
  await page.goto( '/london' );
  const hero = page.getByRole( 'region', { name: 'LONDON.' } );
  await expect( hero ).toHaveAttribute( 'data-scene', 'ready' );
  const canvas = hero.locator( 'canvas' );
  const bounds = ( await canvas.boundingBox() )!;
  let target: { x: number; y: number } | undefined;
  for ( let y = .5; y < .85 && !target; y += .05 )
    for ( let x = .1; x < .9 && !target; x += .05 )
    {
      const point = { x: bounds.x + bounds.width * x, y: bounds.y + bounds.height * y };
      await page.mouse.move( point.x, point.y );
      await page.waitForTimeout( 100 );
      if ( await canvas.evaluate( el => el.style.cursor === 'pointer' ) ) target = point;
    }
  expect( target ).toBeDefined();
  await expect( hero ).toHaveAttribute( 'data-motion', 'running' );
  await page.mouse.click( target!.x, target!.y );
  await expect( page ).toHaveURL( /\/london\/restaurants\?restaurant=[\w-]+$/ );
  // The detail panel has a level-two title; cards use level-three titles.
  await expect( page.locator( 'h2' ).filter( { hasText: /Kopitiam|Kiln|CERU|YiQi|Lahpet|Vasiniko|ZIMA|Crudo|云南|东园|Dishoom|Cheli|Arôme|Truedan|Gelupo|Nostos|Madura|Javad/ } ) ).toBeVisible();
} );

test( 'continuous pointer events keep the street running', async ( { page } ) =>
{
  await page.goto( '/london' );
  const hero = page.getByRole( 'region', { name: 'LONDON.' } );
  await expect( hero ).toHaveAttribute( 'data-scene', 'ready' );
  const canvas = hero.locator( 'canvas' );
  const before = await canvas.screenshot();
  const duration = await canvas.evaluate( el =>
  {
    const bounds = el.getBoundingClientRect();
    const start = performance.now();
    for ( let index = 0; index < 1000; index++ )
      el.dispatchEvent( new PointerEvent( 'pointermove', {
        pointerType: 'mouse', clientX: bounds.x + bounds.width * ( index % 100 ) / 100,
        clientY: bounds.y + bounds.height * .7,
      } ) );
    return performance.now() - start;
  } );
  console.log( `1000 pointer events: ${duration.toFixed( 1 )}ms` );
  await page.waitForTimeout( 300 );
  await expect( hero ).toHaveAttribute( 'data-motion', 'running' );
  expect( ( await canvas.screenshot() ).equals( before ) ).toBe( false );
} );

test( 'WebGL unavailable still leaves a usable London poster', async ( { page } ) =>
{
  await page.addInitScript( () =>
  {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function( this: HTMLCanvasElement, kind: string, ...args: unknown[] )
    {
      if ( kind === 'webgl2' || kind === 'webgl' ) return null;
      return Reflect.apply( original, this, [ kind, ...args ] );
    } as typeof original;
  } );
  await page.goto( '/london' );
  const hero = page.getByRole( 'region', { name: 'LONDON.' } );
  await expect( hero ).toHaveAttribute( 'data-scene', 'static' );
  await expect( hero.getByRole( 'heading' ) ).toBeVisible();
  await hero.getByRole( 'link', { name: /逛景点/ } ).click();
  await expect( page ).toHaveURL( /\/london\/attractions$/ );
} );

test( 'without JavaScript the poster and links are server-rendered', async ( { browser } ) =>
{
  const context = await browser.newContext( { javaScriptEnabled: false } );
  const page = await context.newPage();
  await page.goto( '/london' );
  const hero = page.getByRole( 'region', { name: 'LONDON.' } );
  await expect( hero.getByRole( 'heading' ) ).toBeVisible();
  await expect( hero.getByRole( 'link', { name: /找餐厅/ } ) ).toBeVisible();
  await context.close();
} );
