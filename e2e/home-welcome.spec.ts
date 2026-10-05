import { expect, test } from '@playwright/test';

test( 'welcome departure board lists the next furcons and the contribute service', async ( { page } ) => {
  await page.clock.install( { time: new Date( '2026-10-03T09:41:00Z' ) } );
  await page.goto( '/' );
  const board = page.getByRole( 'list', { name: '近期班次' } );
  await board.scrollIntoViewIfNeeded();
  await expect( page.getByRole( 'heading', { level: 2, name: /欢迎！/ } ) ).toBeVisible();

  const services = board.getByRole( 'link' );
  await expect( services ).toHaveCount( 4 );
  // London time on the board clock (BST in October)
  await expect( page.locator( '[class*="WelcomeBoard"][class*="clock"]' ) ).toHaveText( '10:41' );
  // Next London Furs after 3 Oct 2026 is 10 Oct
  await expect( services.nth( 0 ) ).toContainText( '10/10' );
  await expect( services.nth( 0 ) ).toContainText( '7天后' );
  for ( const i of [ 0, 1, 2 ] ) await expect( services.nth( i ) ).toHaveAttribute( 'href', /\/furcon$/ );

  const contribute = services.nth( 3 );
  await expect( contribute ).toContainText( '出一份力' );
  await contribute.click();
  await expect( page ).toHaveURL( /\/contribute$/ );
} );

test( 'onboarding passport stamps every guide chapter and opens the guide', async ( { page } ) => {
  await page.goto( '/' );
  const stamps = page.getByRole( 'list', { name: '指南章节' } );
  await stamps.scrollIntoViewIfNeeded();
  await expect( stamps.getByRole( 'listitem' ) ).toHaveCount( 13 );
  await expect( page.getByRole( 'heading', { name: 'CFFA UK Onboarding' } ) ).toBeVisible();

  await page.getByRole( 'link', { name: /打开赴英指南/ } ).click();
  await expect( page ).toHaveURL( /\/guide$/ );
} );

test( 'explore carriage lists its stops, the unbuilt one, and gets off at the chosen city', async ( { page } ) => {
  await page.goto( '/' );
  const stops = page.getByRole( 'list', { name: '城市探索路线' } );
  await stops.scrollIntoViewIfNeeded();
  await expect( page.getByRole( 'heading', { level: 2, name: /Explore/ } ) ).toBeVisible();
  // Three real stops plus the unbuilt one that invites a contribution
  await expect( stops.getByRole( 'link' ) ).toHaveCount( 4 );
  const yourStop = stops.getByRole( 'link', { name: /你的站/ } );
  await expect( yourStop ).toHaveAttribute( 'href', '/contribute' );
  expect( Number( ( await yourStop.getAttribute( 'aria-label' ) )!.match( /已铺 (\d+) 站/ )![ 1 ] ) ).toBeGreaterThan( 1 );
  await stops.getByRole( 'link', { name: /Europa/ } ).click();
  await expect( page ).toHaveURL( /\/europa$/ );
} );

test( 'eats receipts open the restaurant details and link to the full list', async ( { page } ) => {
  await page.goto( '/' );
  const receipts = page.getByRole( 'list', { name: '推荐餐厅小票' } );
  await receipts.scrollIntoViewIfNeeded();
  await expect( page.getByRole( 'heading', { level: 2, name: 'London 推荐餐厅' } ) ).toBeVisible();
  await expect( receipts.getByRole( 'button' ) ).toHaveCount( 3 );
  await receipts.getByRole( 'button', { name: /查看 CERU 的详情/ } ).click();
  await expect( page.getByRole( 'heading', { name: 'CERU', exact: true } ).last() ).toBeVisible();
  await page.keyboard.press( 'Escape' );
  await expect( page.getByRole( 'link', { name: /View All/ } ) ).toHaveAttribute( 'href', '/london/restaurants' );
} );

test( 'dispatch stand shouts the live top headline without fetching the feed twice', async ( { page } ) => {
  let requests = 0;
  await page.route( '**/api/news', route =>
  {
    requests++;
    const now = new Date().toISOString();
    return route.fulfill( { json: { fetchedAt: now, feedUpdatedAt: now, items: [
      { title: 'Pigeons take over Trafalgar Square', url: 'https://www.bbc.co.uk/news/1', publishedAt: now },
    ] } } );
  } );
  await page.goto( '/' );
  const shout = page.getByText( /^今日头条：/ );
  await shout.scrollIntoViewIfNeeded();
  await expect( shout ).toHaveText( '今日头条：Pigeons take over Trafalgar Square' );
  const paper = page.getByRole( 'region', { name: /Quite shite innit/ } );
  await expect( paper ).toContainText( 'Pigeons take over Trafalgar Square' );
  // The news board is the Dispatch itself, with today's fortune in its ear
  await expect( paper ).toContainText( 'The UKCFFA Dispatch' );
  await expect( paper.getByRole( 'group', { name: '每日运势' } ) ).toBeVisible();
  expect( requests ).toBe( 1 );
} );

test( 'campus letterbox delivers a different university on every tap', async ( { page } ) => {
  await page.goto( '/' );
  const letterbox = page.getByRole( 'button', { name: '从投信口收一封新的大学来信' } );
  await letterbox.scrollIntoViewIfNeeded();
  await expect( page.getByRole( 'heading', { level: 2, name: /评测榜/ } ) ).toBeVisible();
  await expect( page.getByRole( 'link', { name: /更多学校/ } ) ).toHaveAttribute( 'href', '/universities' );
  await expect( page.getByRole( 'link', { name: /探索大学/ } ) ).toHaveCount( 0 );

  // The first letter arrives on its own; each tap after that brings a new school
  const tally = page.getByText( /^第 \d+ 封/ );
  await expect( tally ).toContainText( '第 1 封' );
  const current = page.locator( '[data-current="true"] a' );
  const seen = new Set<string>();
  for ( let i = 2; i <= 6; i++ )
  {
    seen.add( ( await current.getAttribute( 'href' ) )! );
    await letterbox.click();
    await expect( tally ).toContainText( `第 ${i} 封` );
  }
  seen.add( ( await current.getAttribute( 'href' ) )! );
  expect( seen.size ).toBe( 6 );

  const href = ( await current.getAttribute( 'href' ) )!;
  await page.getByRole( 'button', { name: '再来一封' } ).click();
  await expect( tally ).toContainText( '第 7 封' );
  await expect( current ).not.toHaveAttribute( 'href', href );
  await current.click();
  await expect( page ).toHaveURL( /\/universities\/[a-z0-9-]+$/ );
} );

test( 'eats header shows restaurant totals for London, all of the UK and Europa', async ( { page } ) => {
  await page.goto( '/' );
  const tally = page.getByRole( 'list', { name: '餐厅总数' } );
  await tally.scrollIntoViewIfNeeded();
  const stubs = tally.getByRole( 'link' );
  await expect( stubs ).toHaveCount( 3 );
  const value = async ( name: RegExp ) => Number( ( await tally.getByRole( 'link', { name } ).getAttribute( 'aria-label' ) )!.match( /\d+/ )![ 0 ] );
  const london = await value( /伦敦/ );
  const uk = await value( /全英/ );
  expect( london ).toBeGreaterThan( 0 );
  expect( uk ).toBeGreaterThan( london );
  expect( await value( /欧陆/ ) ).toBeGreaterThan( 0 );
  await expect( tally.getByRole( 'link', { name: /全英/ } ) ).toHaveAttribute( 'href', '/othercities' );
  await expect( tally.getByRole( 'link', { name: /欧陆/ } ) ).toHaveAttribute( 'href', '/europa' );
} );

test( 'the Elizabeth line ride ends on a big contribute button once the doors open', async ( { page } ) => {
  await page.setViewportSize( { width: 1440, height: 900 } );
  await page.goto( '/' );
  const cta = page.getByRole( 'link', { name: /Your stop · 你的站\s*出一份力/ } );
  const scrollTo = ( fraction: number ) => page.evaluate( f =>
  {
    const scroller = document.querySelector<HTMLElement>( '[class*="ExploreCarriage"][class*="scroller"]' )!;
    const top = scroller.getBoundingClientRect().top + window.scrollY;
    window.scrollTo( { top: top + ( scroller.offsetHeight - window.innerHeight ) * f, behavior: 'instant' } );
  }, fraction );

  // Hidden during the ride, shown at the very end
  await scrollTo( 0.8 );
  await expect( cta ).toBeHidden();
  await scrollTo( 1 );
  await expect( cta ).toBeVisible();
  await expect( cta ).toHaveAttribute( 'href', '/contribute' );
} );
