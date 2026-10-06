import { expect, test, type Page } from '@playwright/test';
import { JOURNEY_STATIONS } from '../lib/heroJourney';

function hero( page: Page )
{
  return page.locator( 'section[data-mode]' ).first();
}

async function scrollHeroTo( page: Page, fraction: number )
{
  await page.evaluate( f =>
  {
    const section = document.querySelector<HTMLElement>( 'section[data-mode]' )!;
    window.scrollTo( { top: ( section.offsetHeight - window.innerHeight ) * f, behavior: 'instant' } );
  }, fraction );
}

test( 'scrolling the pinned hero turns the flag into a station map', async ( { page } ) => {
  await page.goto( '/' );
  const section = hero( page );
  await expect( section ).not.toHaveAttribute( 'data-mode', 'pending' );
  test.skip( await section.getAttribute( 'data-mode' ) === 'static', 'No WebGL in this browser' );

  await expect( page.getByRole( 'heading', { level: 1 } ) ).toContainText( 'Great Britain' );
  await expect( page.getByRole( 'link', { name: 'Explore Attractions' } ) ).toBeVisible();

  await scrollHeroTo( page, 0.8 );
  await expect( section ).toHaveAttribute( 'data-phase', 'map' );
  const stations = page.getByRole( 'navigation', { name: '首页线路图' } );
  await expect( stations.getByRole( 'link' ) ).toHaveCount( JOURNEY_STATIONS.length );

  await stations.getByRole( 'link', { name: /Explore/ } ).click();
  await expect( page ).toHaveURL( /#explore$/ );
  await expect( page.locator( '#explore' ) ).toBeInViewport();

  // Back at the top the copy is interactive again
  await scrollHeroTo( page, 0 );
  await expect( section ).toHaveAttribute( 'data-phase', 'flag' );
  await page.getByRole( 'link', { name: 'Explore Attractions' } ).click();
  await expect( page ).toHaveURL( /\/london\/attractions$/ );
} );

test( 'reduced motion keeps the classic one-screen hero', async ( { page } ) => {
  await page.emulateMedia( { reducedMotion: 'reduce' } );
  await page.goto( '/' );
  const section = hero( page );
  await expect( section ).toHaveAttribute( 'data-mode', 'static' );
  const height = await section.evaluate( el => el.getBoundingClientRect().height );
  expect( height ).toBeLessThanOrEqual( Math.max( 600, page.viewportSize()!.height ) + 1 );
  await expect( page.getByRole( 'navigation', { name: '首页线路图' } ) ).toHaveCount( 0 );
  await expect( page.getByRole( 'link', { name: 'Explore Attractions' } ) ).toBeVisible();
} );

test( 'past the hero, the rail follows the sections and jumps between stations', async ( { page } ) => {
  await page.setViewportSize( { width: 1440, height: 900 } );
  await page.goto( '/' );
  const rail = page.locator( 'nav[aria-label="页面线路"]' );
  await expect( rail ).toHaveAttribute( 'data-visible', 'false' );

  for ( const station of JOURNEY_STATIONS )
  {
    await page.locator( `#${station.id}` ).evaluate( el => window.scrollTo( { top: el.getBoundingClientRect().top + window.scrollY - 120, behavior: 'instant' } ) );
    await expect( rail ).toHaveAttribute( 'data-visible', 'true' );
    await expect( rail.locator( '[aria-current="location"]' ) ).toHaveText( station.zh );
  }

  await rail.getByRole( 'link', { name: JOURNEY_STATIONS[ 1 ].zh } ).click();
  await expect( page ).toHaveURL( new RegExp( `#${JOURNEY_STATIONS[ 1 ].id}$` ) );
  await expect( page.locator( `#${JOURNEY_STATIONS[ 1 ].id}` ) ).toBeInViewport();
} );
