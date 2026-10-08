import { expect, test, type Page } from '@playwright/test';

const carriage = ( page: Page ) => page.locator( '[class*="ExploreCarriage"][class*="scroller"]' );
const messages = ( page: Page ) => carriage( page ).locator( '[class*="tunnelMessage"]' );
const opacity = ( page: Page ) => messages( page ).first().evaluate( el => Number( getComputedStyle( el ).opacity ) );

const scrollRide = ( page: Page, progress: number ) => carriage( page ).evaluate( ( el, fraction ) =>
{
  const top = el.getBoundingClientRect().top + window.scrollY;
  window.scrollTo( { top: top + ( el.clientHeight - window.innerHeight ) * 0.62 * fraction, behavior: 'instant' } );
}, progress );

// Seek the real CSS animations together instead of waiting through the 28-second ride.
const seekTimedRide = ( page: Page, progress: number ) => carriage( page ).evaluate( ( el, fraction ) =>
{
  for ( const element of el.querySelectorAll( '[class*="panorama"], [class*="tunnelMessage"]' ) )
  {
    for ( const animation of element.getAnimations() )
    {
      animation.pause();
      animation.currentTime = 28_000 * fraction;
    }
  }
}, progress );

test( 'desktop tunnel copy follows scroll progress in both directions without covering city scenes', async ( { page } ) =>
{
  await page.setViewportSize( { width: 1440, height: 900 } );
  await page.goto( '/' );
  await page.evaluate( () => document.fonts.ready );
  await expect( messages( page ) ).toHaveCount( 3 );
  await scrollRide( page, 0.1 );
  await expect.poll( () => opacity( page ) ).toBe( 0 );
  await scrollRide( page, 0.64 );
  await expect.poll( () => opacity( page ) ).toBe( 1 );
  for ( const message of await messages( page ).all() ) await expect( message ).toBeInViewport();
  await page.screenshot( { path: test.info().outputPath( 'tunnel-desktop.png' ) } );
  await scrollRide( page, 0.9 );
  await expect.poll( () => opacity( page ) ).toBe( 0 );
  await scrollRide( page, 0.64 );
  await expect.poll( () => opacity( page ) ).toBe( 1 );
} );

test( 'a narrow phone shows one readable tunnel message on the timed ride', async ( { page } ) =>
{
  await page.setViewportSize( { width: 320, height: 740 } );
  await page.goto( '/' );
  await carriage( page ).scrollIntoViewIfNeeded();
  await seekTimedRide( page, 0.64 );
  await expect.poll( () => opacity( page ) ).toBe( 1 );
  await expect( messages( page ).nth( 1 ) ).toBeHidden();
  await expect( messages( page ).nth( 2 ) ).toBeHidden();
  const textFits = await messages( page ).first().evaluate( el =>
  {
    const text = el.querySelector( 'p' )!;
    const window = el.parentElement!.getBoundingClientRect();
    const bounds = text.getBoundingClientRect();
    return text.scrollWidth <= el.clientWidth && bounds.left >= window.left && bounds.right <= window.right;
  } );
  expect( textFits ).toBe( true );
  await carriage( page ).screenshot( { path: test.info().outputPath( 'tunnel-phone.png' ) } );
  await seekTimedRide( page, 0.9 );
  await expect.poll( () => opacity( page ) ).toBe( 0 );
} );

test( 'returning to the collapsed carriage keeps copy and scenery on the same timed ride', async ( { page } ) =>
{
  await page.setViewportSize( { width: 1440, height: 900 } );
  await page.goto( '/' );
  await page.locator( '#news' ).evaluate( el => window.scrollTo( { top: el.getBoundingClientRect().top + window.scrollY, behavior: 'instant' } ) );
  await page.mouse.move( 720, 450 );
  await page.mouse.wheel( 0, -300 );
  await expect( carriage( page ) ).toHaveAttribute( 'data-collapsed', 'true' );
  await seekTimedRide( page, 0.64 );
  await expect.poll( () => opacity( page ) ).toBe( 1 );
  expect( await messages( page ).first().evaluate( el => el.getAnimations()[ 0 ].effect!.getTiming().duration ) ).toBe( 28_000 );
  await seekTimedRide( page, 0.1 );
  await expect.poll( () => opacity( page ) ).toBe( 0 );
} );

test( 'reduced motion keeps the static city view without tunnel text or new animation', async ( { page } ) =>
{
  await page.emulateMedia( { reducedMotion: 'reduce' } );
  await page.goto( '/' );
  expect( await messages( page ).first().evaluate( el => el.getAnimations().length ) ).toBe( 0 );
  expect( await opacity( page ) ).toBe( 0 );
  expect( await carriage( page ).locator( '[class*="panorama"]' ).first().evaluate( el => el.getAnimations().length ) ).toBe( 0 );
  await expect( page.getByRole( 'list', { name: '城市探索路线' } ).getByRole( 'link' ) ).toHaveCount( 4 );
} );
