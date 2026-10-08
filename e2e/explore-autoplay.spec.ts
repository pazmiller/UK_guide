import { expect, test, type Page } from '@playwright/test';

const carriage = ( page: Page ) => page.locator( '[class*="ExploreCarriage"][class*="scroller"]' );
const scrollY = ( page: Page ) => page.evaluate( () => window.scrollY );
const enterRide = ( page: Page, progress = 0.1 ) => carriage( page ).evaluate( ( el, fraction ) =>
{
  const top = el.getBoundingClientRect().top + window.scrollY;
  window.scrollTo( { top: top + ( el.clientHeight - window.innerHeight ) * fraction, behavior: 'instant' } );
}, progress );

test.beforeEach( async ( { page } ) =>
{
  await page.setViewportSize( { width: 1440, height: 900 } );
  await page.goto( '/' );
  await expect( carriage( page ).getByRole( 'button', { name: '开始游览' } ) ).toBeAttached();
  await page.clock.install();
} );

test( 'starts only at the carriage, advances without input, and can pause and resume', async ( { page } ) =>
{
  const initial = await scrollY( page );
  await page.clock.runFor( 1500 );
  expect( await scrollY( page ) ).toBe( initial );
  await enterRide( page );
  const arrival = await scrollY( page );
  await page.clock.runFor( 2500 );
  await expect( carriage( page ) ).toHaveAttribute( 'data-playback', 'playing' );
  expect( await scrollY( page ) ).toBeGreaterThan( arrival + 30 );
  await expect( carriage( page ).getByRole( 'heading', { name: /Explore/ } ) ).toBeInViewport();

  await carriage( page ).getByRole( 'button', { name: '暂停游览' } ).click();
  const pausedAt = await scrollY( page );
  await page.clock.runFor( 1500 );
  expect( await scrollY( page ) ).toBe( pausedAt );
  await carriage( page ).getByRole( 'button', { name: '继续游览' } ).click();
  await page.clock.runFor( 1500 );
  expect( await scrollY( page ) ).toBeGreaterThan( pausedAt + 20 );
} );

test( 'wheel input takes over immediately and the ride resumes after another idle interval', async ( { page } ) =>
{
  await enterRide( page );
  await page.clock.runFor( 2000 );
  await expect( carriage( page ) ).toHaveAttribute( 'data-playback', 'playing' );
  await page.mouse.wheel( 0, 80 );
  await expect( carriage( page ) ).toHaveAttribute( 'data-playback', 'paused' );
  await page.clock.runFor( 500 );
  const manualPosition = await scrollY( page );
  expect( await scrollY( page ) ).toBe( manualPosition );
  await page.clock.runFor( 1500 );
  await expect( carriage( page ) ).toHaveAttribute( 'data-playback', 'playing' );
  expect( await scrollY( page ) ).toBeGreaterThan( manualPosition + 20 );
  await page.keyboard.press( 'Escape' );
  await expect( carriage( page ) ).toHaveAttribute( 'data-playback', 'paused' );
  const escapedAt = await scrollY( page );
  await page.clock.runFor( 1500 );
  expect( await scrollY( page ) ).toBe( escapedAt );
} );

for ( const [ phase, progress ] of [ [ 'London', 0.05 ], [ 'tunnel', 0.4 ], [ 'track building', 0.75 ], [ 'arrival', 0.96 ] ] as const )
{
  test( `idle autoplay starts at ${phase}, not just the first visit`, async ( { page } ) =>
  {
    await enterRide( page, progress );
    await page.clock.runFor( 100 );
    const arrivedAt = await scrollY( page );
    await page.clock.runFor( 700 );
    expect( await scrollY( page ) ).toBe( arrivedAt );
    await expect( carriage( page ) ).not.toHaveAttribute( 'data-playback', 'playing' );
    await page.clock.runFor( 1500 );
    await expect( carriage( page ) ).toHaveAttribute( 'data-playback', 'playing' );
    expect( await scrollY( page ) ).toBeGreaterThan( arrivedAt + 20 );
  } );
}

test( 'real arrow-key arrival does not permanently cancel departure', async ( { page } ) =>
{
  await page.clock.resume();
  await carriage( page ).evaluate( el => window.scrollTo( { top: window.scrollY + el.getBoundingClientRect().top - 200, behavior: 'instant' } ) );
  for ( let i = 0; i < 10; i++ )
  {
    await page.keyboard.press( 'ArrowDown' );
    await page.waitForTimeout( 120 );
  }
  await expect( carriage( page ) ).toHaveAttribute( 'data-playback', 'playing' );
} );

test( 'a held pointer prevents departure but releasing it allows idle autoplay', async ( { page } ) =>
{
  await enterRide( page );
  await page.clock.runFor( 200 );
  await page.mouse.move( 720, 450 );
  await page.mouse.down();
  const heldAt = await scrollY( page );
  await page.clock.runFor( 1500 );
  expect( await scrollY( page ) ).toBe( heldAt );
  await expect( carriage( page ) ).not.toHaveAttribute( 'data-playback', 'playing' );
  await page.mouse.up();
  await page.clock.runFor( 1900 );
  await expect( carriage( page ) ).toHaveAttribute( 'data-playback', 'playing' );
  expect( await scrollY( page ) ).toBeGreaterThan( heldAt + 20 );
} );

test( 'stops at the destination and never pulls the reader into the next section', async ( { page } ) =>
{
  await enterRide( page, 0.995 );
  await page.clock.runFor( 2500 );
  await expect( carriage( page ).getByRole( 'button', { name: '行程结束' } ) ).toBeDisabled();
  const remaining = await carriage( page ).evaluate( el => el.getBoundingClientRect().bottom - window.innerHeight );
  expect( Math.abs( remaining ) ).toBeLessThanOrEqual( 1 );
  const finalPosition = await scrollY( page );
  await page.clock.runFor( 2000 );
  expect( await scrollY( page ) ).toBe( finalPosition );
} );

test( 'leaving the carriage stops autoplay, including after the return layout collapses', async ( { page } ) =>
{
  await enterRide( page );
  await page.clock.runFor( 2000 );
  await expect( carriage( page ) ).toHaveAttribute( 'data-playback', 'playing' );
  await page.locator( '#news' ).evaluate( el => window.scrollTo( { top: el.getBoundingClientRect().top + window.scrollY, behavior: 'instant' } ) );
  await page.clock.runFor( 300 );
  await expect( carriage( page ) ).toHaveAttribute( 'data-playback', 'paused' );
  await page.clock.resume();
  await page.mouse.move( 720, 450 );
  await page.mouse.wheel( 0, -100 );
  await expect( carriage( page ) ).toHaveAttribute( 'data-collapsed', 'true' );
  await expect( carriage( page ).getByRole( 'button', { name: '继续游览' } ) ).toBeHidden();
} );

test( 'reduced motion and phones never scroll the page automatically', async ( { page } ) =>
{
  await page.emulateMedia( { reducedMotion: 'reduce' } );
  await carriage( page ).scrollIntoViewIfNeeded();
  const reducedPosition = await scrollY( page );
  await page.clock.runFor( 2500 );
  expect( await scrollY( page ) ).toBe( reducedPosition );
  await expect( carriage( page ).getByRole( 'button' ) ).toHaveCount( 0 );

  await page.emulateMedia( { reducedMotion: 'no-preference' } );
  await page.setViewportSize( { width: 390, height: 844 } );
  await carriage( page ).scrollIntoViewIfNeeded();
  const phonePosition = await scrollY( page );
  await page.clock.runFor( 2500 );
  expect( await scrollY( page ) ).toBe( phonePosition );
  await expect( carriage( page ).getByRole( 'button' ) ).toHaveCount( 0 );
} );
