import { expect, test, type Page } from '@playwright/test';

function newsPanel( page: Page )
{
  return page.getByRole( 'region', { name: /Quite shite innit/ } );
}

function snapshot()
{
  return {
    fetchedAt: new Date().toISOString(),
    feedUpdatedAt: new Date().toISOString(),
    items: Array.from( { length: 12 }, ( _, index ) => ( {
      title: `Test BBC headline ${index + 1}: the latest UK travel and community news`,
      url: `https://www.bbc.co.uk/news/articles/test-${index}`,
      publishedAt: '2026-09-06T10:00:00.000Z',
      imageUrl: index < 4 ? `https://ichef.bbci.co.uk/news/test-${index}.jpg` : undefined,
      description: `BBC summary ${index + 1}: a concise account of the story, supplied by the original publisher.`,
    } ) ),
  };
}

test.beforeEach( async ( { page } ) => {
  await page.route( 'https://ichef.bbci.co.uk/**', route => route.fulfill( {
    contentType: 'image/svg+xml',
    body: '<svg xmlns="http://www.w3.org/2000/svg" width="240" height="135"><rect width="240" height="135" fill="#7396ac"/></svg>',
  } ) );
} );

for ( const width of [ 1440, 390, 320 ] )
{
  test( `reading mode unfolds in place and folds back at ${width}px`, async ( { page } ) => {
    await page.setViewportSize( { width, height: 1000 } );
    await page.route( '**/api/news', route => route.fulfill( { json: snapshot() } ) );
    await page.goto( '/' );
    // Web fonts swapping in late would shift the page and be mistaken for a reading-mode jump
    await page.evaluate( () => document.fonts.ready );
    const news = newsPanel( page );
    const toggle = news.getByRole( 'button', { name: '进入阅读模式' } );
    await toggle.scrollIntoViewIfNeeded();
    const originalWidth = ( await news.boundingBox() )!.width;
    const originalScroll = await page.evaluate( () => window.scrollY );
    const originalUrl = page.url();
    await toggle.click();
    await expect( news ).toHaveAttribute( 'data-reading', 'true' );
    await expect( news ).toHaveAttribute( 'data-animating', 'false' );
    await expect( news.getByRole( 'heading', { level: 3 } ) ).toHaveCount( 12 );
    await expect( news.getByText( /^BBC summary 1:/ ) ).toBeVisible();
    await expect( news ).toHaveCSS( 'background-color', 'rgb(255, 241, 229)' );
    await expect( news.getByRole( 'button', { name: '合上报纸', exact: true } ) ).toHaveAttribute( 'aria-expanded', 'true' );
    expect( page.url() ).toBe( originalUrl );
    const expandedWidth = ( await news.boundingBox() )!.width;
    if ( width >= 1024 ) expect( expandedWidth / originalWidth ).toBeCloseTo( 1 / .7, 1 );
    expect( await news.evaluate( el => el.scrollWidth <= el.clientWidth ) ).toBe( true );
    expect( await page.evaluate( () => document.documentElement.scrollWidth <= window.innerWidth ) ).toBe( true );
    await news.screenshot( { path: `/tmp/home-news-reading-${width}.png` } );
    await news.getByRole( 'button', { name: '合上，回到首页' } ).click();
    await expect( news ).toHaveAttribute( 'data-animating', 'false' );
    await expect( news.getByRole( 'heading', { level: 3 } ) ).toHaveCount( 8 );
    await expect( toggle ).toBeFocused();
    expect( ( await news.boundingBox() )!.width ).toBeCloseTo( originalWidth, 0 );
    expect( Math.abs( await page.evaluate( () => window.scrollY ) - originalScroll ) ).toBeLessThan( 4 );
    await expect( news.getByText( /^BBC summary 1:/ ) ).toHaveCount( 0 );
  } );
}

test( 'reading mode handles rapid reversals, keyboard and reduced motion', async ( { page } ) => {
  await page.route( '**/api/news', route => route.fulfill( { json: snapshot() } ) );
  await page.goto( '/' );
  const news = newsPanel( page );
  const toggle = news.locator( 'button[aria-controls="home-news-stories"]' );
  await toggle.scrollIntoViewIfNeeded();
  // Dispatch pointer-style clicks while the layout is moving, without locator stability waits.
  await toggle.evaluate( el => el.dispatchEvent( new MouseEvent( 'click', { bubbles: true, detail: 1 } ) ) );
  await page.waitForTimeout( 160 );
  // Measure within one browser task so test-runner latency is not mistaken for a jump.
  const widthJump = await toggle.evaluate( el => {
    const panel = el.closest( 'section' )!;
    const before = panel.getBoundingClientRect().width;
    el.dispatchEvent( new MouseEvent( 'click', { bubbles: true, detail: 1 } ) );
    return Math.abs( panel.getBoundingClientRect().width - before );
  } );
  expect( widthJump ).toBeLessThan( 1 );
  await page.waitForTimeout( 100 );
  await toggle.evaluate( el => el.dispatchEvent( new MouseEvent( 'click', { bubbles: true, detail: 1 } ) ) );
  await expect( news ).toHaveAttribute( 'data-animating', 'false' );
  await expect( news ).toHaveAttribute( 'data-reading', 'true' );
  await toggle.focus();
  await page.keyboard.press( 'Escape' );
  await expect( toggle ).toBeFocused();
  await expect( toggle ).toHaveAttribute( 'aria-expanded', 'false' );
  await page.keyboard.press( 'Enter' );
  await expect( toggle ).toHaveAttribute( 'aria-expanded', 'true' );
  await expect( news ).toHaveAttribute( 'data-animating', 'false' );
  await page.emulateMedia( { reducedMotion: 'reduce' } );
  await toggle.click();
  await toggle.click();
  await expect( toggle ).toHaveAttribute( 'aria-expanded', 'true' );
  await expect( news ).toHaveAttribute( 'data-animating', 'false' );
  expect( await news.evaluate( el => el.getAnimations().length ) ).toBe( 0 );
  await page.setViewportSize( { width: 390, height: 900 } );
  expect( await news.evaluate( el => el.scrollWidth <= el.clientWidth ) ).toBe( true );
} );

for ( const width of [ 1440, 1024, 390, 320 ] )
{
  test( `news links and layout at ${width}px`, async ( { page } ) => {
    await page.setViewportSize( { width, height: 1000 } );
    await page.route( '**/api/news', route => route.fulfill( { json: snapshot() } ) );
    await page.goto( '/' );
    const news = newsPanel( page );
    await expect( news.getByRole( 'heading', { level: 3 } ) ).toHaveCount( 8 );
    await expect( news.locator( 'img' ) ).toHaveCount( 4 );
    await news.scrollIntoViewIfNeeded();
    await expect( news.getByText( '每日新闻', { exact: true } ) ).toBeVisible();
    await expect( news.locator( 'header a' ) ).toHaveCount( 0 );
    const firstStory = news.locator( 'li' ).first();
    const photoBounds = await firstStory.locator( 'img' ).boundingBox();
    const headlineBounds = await firstStory.locator( 'h3' ).boundingBox();
    expect( photoBounds!.x + photoBounds!.width ).toBeLessThan( headlineBounds!.x );
    await expect( news.getByRole( 'link', { name: 'BBC News', exact: true } ) ).toHaveAttribute( 'href', 'https://www.bbc.co.uk/news' );
    await expect( news.getByRole( 'link', { name: /Test BBC headline 1/ } ) ).toHaveAttribute( 'href', 'https://www.bbc.co.uk/news/articles/test-0' );
    await expect( news.getByRole( 'link', { name: /Test BBC headline 1/ } ) ).toHaveAttribute( 'target', '_blank' );
    // September uses British Summer Time: 10:00 UTC becomes 11:00 in London.
    await expect( news.locator( 'li time' ).first() ).toHaveText( /11:00/ );
    expect( await news.evaluate( el => el.scrollWidth <= el.clientWidth ) ).toBe( true );
    await page.screenshot( { path: `/tmp/home-news-${width}.png` } );
  } );
}

test( 'shows an error fallback and retries successfully', async ( { page } ) => {
  let fail = true;
  await page.route( '**/api/news', route => fail
    ? route.fulfill( { status: 503, json: { error: 'Unavailable' } } )
    : route.fulfill( { json: snapshot() } ) );
  await page.goto( '/' );
  const news = newsPanel( page );
  await expect( news.getByRole( 'status' ) ).toContainText( '新闻暂时无法加载' );
  await expect( news.getByRole( 'link', { name: 'BBC News', exact: true } ) ).toBeVisible();
  fail = false;
  await news.getByRole( 'button', { name: '重试' } ).click();
  await expect( news.getByRole( 'heading', { level: 3 } ) ).toHaveCount( 8 );
  await expect( news.getByRole( 'status' ) ).toHaveCount( 0 );
} );

test( 'a broken image falls back to a working text-only story', async ( { page } ) => {
  await page.route( 'https://ichef.bbci.co.uk/**', route => route.abort() );
  const data = snapshot();
  data.items = [ data.items[ 0 ] ];
  await page.route( '**/api/news', route => route.fulfill( { json: data } ) );
  await page.goto( '/' );
  const news = newsPanel( page );
  const story = news.getByRole( 'link', { name: /Test BBC headline 1/ } );
  await story.scrollIntoViewIfNeeded();
  await expect( news.locator( 'img' ) ).toHaveCount( 0 );
  await expect( story ).toBeVisible();
  await expect( story ).toHaveAttribute( 'href', 'https://www.bbc.co.uk/news/articles/test-0' );
} );

test( 'warns when the cached feed is old', async ( { page } ) => {
  await page.route( '**/api/news', route => route.fulfill( { json: { ...snapshot(), fetchedAt: '2020-01-01T00:00:00Z' } } ) );
  await page.goto( '/' );
  await expect( page.getByRole( 'status' ).filter( { hasText: '较早的订阅数据' } ) ).toBeVisible();
} );

test( 'reading images fall back to the original thumbnail and missing summaries remain readable', async ( { page } ) => {
  const data = snapshot();
  data.items = [ { ...data.items[ 0 ], imageUrl: 'https://ichef.bbci.co.uk/ace/standard/240/cpsprodpb/test.jpg', description: '' } ];
  await page.route( '**/api/news', route => route.fulfill( { json: data } ) );
  await page.route( 'https://ichef.bbci.co.uk/ace/standard/800/**', route => route.abort() );
  await page.goto( '/' );
  const news = newsPanel( page );
  await news.getByRole( 'button', { name: '进入阅读模式' } ).click();
  await expect( news ).toHaveAttribute( 'data-animating', 'false' );
  await expect( news.locator( 'img' ) ).toHaveAttribute( 'src', data.items[ 0 ].imageUrl! );
  await expect( news.getByRole( 'heading', { level: 3 } ) ).toHaveCount( 1 );
  await expect( news.getByRole( 'link', { name: /Test BBC headline 1/ } ) ).toBeVisible();
  expect( await news.evaluate( el => el.scrollWidth <= el.clientWidth ) ).toBe( true );
} );

test( 'reading mode remains closable on feed failure and during a viewport resize', async ( { page } ) => {
  await page.route( '**/api/news', route => route.fulfill( { status: 503, json: { error: 'Unavailable' } } ) );
  await page.goto( '/' );
  const news = newsPanel( page );
  const toggle = news.locator( 'button[aria-controls="home-news-stories"]' );
  await toggle.scrollIntoViewIfNeeded();
  await toggle.evaluate( el => el.dispatchEvent( new MouseEvent( 'click', { bubbles: true, detail: 1 } ) ) );
  await page.setViewportSize( { width: 320, height: 900 } );
  await expect( news ).toHaveAttribute( 'data-animating', 'false' );
  await expect( news.getByRole( 'status' ) ).toContainText( '新闻暂时无法加载' );
  expect( await news.evaluate( el => el.scrollWidth <= el.clientWidth ) ).toBe( true );
  await news.getByRole( 'button', { name: '合上报纸', exact: true } ).click();
  await expect( toggle ).toHaveAttribute( 'aria-expanded', 'false' );
} );

test( 'polls after 15 minutes and retains articles if the update fails', async ( { page } ) => {
  await page.clock.install();
  let requests = 0;
  await page.route( '**/api/news', route => {
    requests += 1;
    return requests === 1 ? route.fulfill( { json: snapshot() } ) : route.fulfill( { status: 503, json: { error: 'Unavailable' } } );
  } );
  await page.goto( '/' );
  const news = newsPanel( page );
  await expect( news.getByRole( 'heading', { level: 3 } ) ).toHaveCount( 8 );
  await page.clock.fastForward( 15 * 60 * 1000 );
  await expect( news.getByRole( 'status' ) ).toContainText( '保留上次获取的新闻' );
  await expect( news.getByRole( 'heading', { level: 3 } ) ).toHaveCount( 8 );
  expect( requests ).toBe( 2 );
} );

test( 'hovering anywhere inside news lights the panel until the pointer leaves', async ( { page } ) => {
  await page.route( '**/api/news', route => route.fulfill( { json: snapshot() } ) );
  await page.goto( '/' );
  const toggle = page.getByRole( 'button', { name: '进入阅读模式', exact: true } );
  const news = newsPanel( page );
  const glow = news.locator( ':scope > span[aria-hidden="true"]' );
  const panelBounds = await news.boundingBox();
  const glowBounds = await glow.boundingBox();
  expect( Math.abs( glowBounds!.width - panelBounds!.width ) ).toBeLessThanOrEqual( 2 );
  expect( Math.abs( glowBounds!.height - panelBounds!.height ) ).toBeLessThanOrEqual( 2 );
  await expect( glow ).toHaveCSS( 'opacity', '0' );
  await news.getByRole( 'heading', { level: 2 } ).hover();
  await expect( glow ).toHaveCSS( 'opacity', '1' );
  expect( await glow.evaluate( el => getComputedStyle( el, '::before' ).animationPlayState ) ).toBe( 'running' );
  expect( await glow.evaluate( el => getComputedStyle( el, '::before' ).animationDuration ) ).toBe( '2.8s' );
  const initialTransform = await glow.evaluate( el => getComputedStyle( el, '::before' ).transform );
  await expect.poll( () => glow.evaluate( el => getComputedStyle( el, '::before' ).transform ) ).not.toBe( initialTransform );
  await news.hover( { position: { x: 12, y: 100 } } );
  await expect( glow ).toHaveCSS( 'opacity', '1' );
  await news.getByRole( 'heading', { level: 3 } ).first().hover();
  await expect( glow ).toHaveCSS( 'opacity', '1' );
  await news.locator( 'img' ).first().hover();
  await expect( glow ).toHaveCSS( 'opacity', '1' );
  expect( await glow.evaluate( el => getComputedStyle( el, '::before' ).animationPlayState ) ).toBe( 'running' );
  await page.screenshot( { path: '/tmp/bbc-hover-light.png' } );
  await page.mouse.move( 0, 0 );
  await expect( glow ).toHaveCSS( 'opacity', '0' );
  expect( await glow.evaluate( el => getComputedStyle( el, '::before' ).animationPlayState ) ).toBe( 'paused' );
  await toggle.focus();
  expect( await glow.evaluate( el => getComputedStyle( el, '::before' ).animationPlayState ) ).toBe( 'paused' );
  expect( await news.evaluate( el => getComputedStyle( el, '::after' ).opacity ) ).toBe( '1' );
  await page.emulateMedia( { reducedMotion: 'reduce' } );
  await toggle.hover();
  expect( await glow.evaluate( el => getComputedStyle( el, '::before' ).animationName ) ).toBe( 'none' );
} );
