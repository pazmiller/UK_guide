import { expect, test } from '@playwright/test';

test( 'desktop receipts print in order over a shorter scroll and reverse with the scroll', async ( { page } ) =>
{
  await page.setViewportSize( { width: 1440, height: 900 } );
  await page.emulateMedia( { reducedMotion: 'no-preference' } );
  await page.goto( '/' );
  const receipts = page.getByRole( 'list', { name: '推荐餐厅小票' } );
  const buttons = receipts.getByRole( 'button' );
  const scroller = page.locator( '[class*="EatsReceipts"][class*="scroller"]' );
  const stage = scroller.locator( '[class*="stage"]' );
  expect( await scroller.evaluate( el => el.getBoundingClientRect().height / innerHeight ) ).toBeCloseTo( 2.2 );

  const scrollTo = ( fraction: number ) => scroller.evaluate( ( el, f ) =>
  {
    const top = el.getBoundingClientRect().top + scrollY;
    window.scrollTo( { top: top + ( el.clientHeight - innerHeight ) * f, behavior: 'instant' } );
  }, fraction );
  const progress = ( index: number ) => buttons.nth( index ).evaluate( el =>
    el.getAnimations()[ 0 ]?.effect?.getComputedTiming().progress ?? -1 );

  for ( const [ fraction, active ] of [ [ 0.2, 0 ], [ 0.44, 1 ], [ 0.66, 2 ] ] as const )
  {
    await scrollTo( fraction );
    await expect.poll( () => progress( active ) ).toBeGreaterThan( 0 );
    expect( await progress( active ) ).toBeLessThan( 1 );
    for ( let i = 0; i < active; i++ ) expect( await progress( i ) ).toBe( 1 );
    for ( let i = active + 1; i < 3; i++ ) expect( await progress( i ) ).toBe( 0 );
    expect( await stage.evaluate( el => el.getBoundingClientRect().top ) ).toBeCloseTo( 0, 0 );
  }
  await scrollTo( 0.9 );
  for ( let i = 0; i < 3; i++ ) await expect.poll( () => progress( i ) ).toBe( 1 );
  await page.screenshot( { path: '/tmp/eats-shorter-print-desktop.png' } );

  await scrollTo( 0.44 );
  await expect.poll( () => progress( 1 ) ).toBeLessThan( 1 );
  expect( await progress( 1 ) ).toBeGreaterThan( 0 );
  await expect.poll( () => progress( 2 ) ).toBe( 0 );

  await scrollTo( 0.9 );
  await expect.poll( () => progress( 2 ) ).toBe( 1 );
  await buttons.nth( 2 ).click();
  const detail = page.getByRole( 'heading', { name: 'Kiln', exact: true } );
  await expect( detail ).toBeVisible();
  await page.keyboard.press( 'Escape' );
  await expect( detail ).toHaveCount( 0 );

  await scroller.evaluate( el => window.scrollTo( { top: el.getBoundingClientRect().top + scrollY + el.clientHeight, behavior: 'instant' } ) );
  await expect( page.locator( '#news' ) ).toBeInViewport();
} );

for ( const mode of [ 'mobile', 'reduced-motion' ] as const )
{
  test( `${mode} receipts keep a natural layout without desktop pinning`, async ( { page } ) =>
  {
    await page.setViewportSize( { width: mode === 'mobile' ? 390 : 1440, height: 900 } );
    await page.emulateMedia( { reducedMotion: mode === 'mobile' ? 'no-preference' : 'reduce' } );
    await page.goto( '/' );
    const scroller = page.locator( '[class*="EatsReceipts"][class*="scroller"]' );
    expect( await scroller.locator( '[class*="stage"]' ).evaluate( el => getComputedStyle( el ).position ) ).toBe( 'static' );
    const receipts = page.getByRole( 'list', { name: '推荐餐厅小票' } );
    const last = receipts.getByRole( 'button' ).last();
    await last.scrollIntoViewIfNeeded();
    await last.click();
    await expect( page.getByRole( 'heading', { name: 'Kiln', exact: true } ) ).toBeVisible();
  } );
}
