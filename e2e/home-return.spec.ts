import { expect, test, type Page } from '@playwright/test';

const carriage = ( page: Page ) => page.locator( '[class*="ExploreCarriage"][class*="scroller"]' );
const passport = ( page: Page ) => page.locator( '[class*="OnboardingPassport"][class*="scroller"]' );
const height = ( page: Page, which: typeof carriage ) => which( page ).evaluate( el => el.getBoundingClientRect().height );
const topOf = ( page: Page, selector: string ) => page.locator( selector ).evaluate( el => el.getBoundingClientRect().top );

test.beforeEach( async ( { page } ) =>
{
  await page.setViewportSize( { width: 1440, height: 900 } );
  await page.goto( '/' );
  await page.evaluate( () => document.fonts.ready );
} );

test( 'scrolling back up collapses the pinned sections without moving the view, then restores them', async ( { page } ) =>
{
  // Pinned on the way down
  expect( await height( page, carriage ) ).toBeGreaterThan( 900 * 2 );
  expect( await height( page, passport ) ).toBeGreaterThan( 900 * 2 );

  await page.locator( '#news' ).evaluate( el => window.scrollTo( { top: el.getBoundingClientRect().top + window.scrollY, behavior: 'instant' } ) );
  await page.mouse.move( 720, 450 );
  const before = await topOf( page, '#news' );
  await page.mouse.wheel( 0, -300 );
  await expect( carriage( page ) ).toHaveAttribute( 'data-collapsed', 'true' );
  await expect( passport( page ) ).toHaveAttribute( 'data-collapsed', 'true' );
  // The page moved by the wheel distance only, not by the screens that were removed above
  await expect.poll( async () => Math.abs( ( await topOf( page, '#news' ) ) - before - 300 ) ).toBeLessThan( 40 );
  expect( await height( page, carriage ) ).toBeLessThan( 900 * 1.6 );
  expect( await height( page, passport ) ).toBeLessThan( 900 * 1.6 );

  // Back at the top they are below the screen again, so they grow back for the next trip down
  await page.evaluate( () => window.scrollTo( { top: 0, behavior: 'instant' } ) );
  await expect( carriage( page ) ).not.toHaveAttribute( 'data-collapsed', 'true' );
  await expect( passport( page ) ).not.toHaveAttribute( 'data-collapsed', 'true' );
  expect( await height( page, carriage ) ).toBeGreaterThan( 900 * 2 );
} );

test( 'jumping up from below with the line rail still lands on the station', async ( { page } ) =>
{
  await page.locator( '#news' ).evaluate( el => window.scrollTo( { top: el.getBoundingClientRect().top + window.scrollY, behavior: 'instant' } ) );
  const rail = page.locator( 'nav[aria-label="页面线路"]' );
  await expect( rail ).toHaveAttribute( 'data-visible', 'true' );
  await rail.getByRole( 'link', { name: '赴英指南' } ).click();
  await expect( page.locator( '#guide' ) ).toBeInViewport( { timeout: 10_000 } );
} );
