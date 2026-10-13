import { expect, test } from '@playwright/test';

for ( const width of [ 1440, 768, 390, 320 ] )
{
  test( `London editorial guide scrolls and fits at ${width}px`, async ( { page } ) =>
  {
    await page.setViewportSize( { width, height: 900 } );
    await page.goto( '/london' );
    const street = page.getByRole( 'region', { name: 'LONDON.' } );
    await expect( street ).toHaveAttribute( 'data-scene', 'ready' );
    const food = page.locator( '#london-food' );
    const places = page.locator( '#london-places' );
    const meetup = page.getByRole( 'region', { name: 'London Furmeets', exact: true } );
    const facts = page.getByRole( 'region', { name: /伦敦使用说明/ } );
    await page.getByRole( 'navigation', { name: '伦敦指南目录' } ).getByRole( 'link', { name: /吃喝推荐/ } ).click();
    await expect( page ).toHaveURL( /#london-food$/ );
    await expect( street ).toHaveAttribute( 'data-motion', 'paused' );
    await expect( food.getByRole( 'link', { name: /找一家好吃的/ } ) ).toHaveAttribute( 'href', '/london/restaurants' );
    await expect( places.getByRole( 'link', { name: /挑一个地方逛逛/ } ) ).toHaveAttribute( 'href', '/london/attractions' );
    await expect( facts.locator( 'article' ) ).toHaveCount( 5 );
    await expect( meetup.getByRole( 'link' ) ).toHaveAttribute( 'href', '/furcon' );
    await expect( meetup ).toContainText( '每三周一次 · 周六兽聚' );
    await expect( meetup ).toContainText( '免费，但需提前订票' );
    const receipts = food.getByRole( 'list', { name: '推荐餐厅小票' } );
    await expect( receipts.getByRole( 'button' ) ).toHaveCount( 3 );
    await expect( receipts ).not.toContainText( 'CFFA EATS' );
    await expect( receipts ).not.toContainText( 'LONDON · 伦敦 · TABLE' );
    await expect( receipts ).not.toContainText( '必点 Must try' );
    await expect( receipts.getByText( /^1 × / ) ).toHaveCount( 0 );
    await expect( receipts ).not.toContainText( 'TOTAL' );
    await expect( receipts.getByText( '好吃', { exact: true } ) ).toHaveCount( 0 );
    await expect( receipts.locator( '[class*="note"], [class*="barcode"]' ) ).toHaveCount( 0 );
    await expect( receipts ).toContainText( '人均 Per person' );
    await expect( food.getByRole( 'heading', { name: 'London 推荐餐厅' } ) ).toHaveCount( 0 );
    await expect( receipts.locator( 'img' ).first() ).toHaveAttribute( 'src', '/london-editorial/med-salleh-kopitiam.webp' );
    expect( await receipts.getByRole( 'button' ).first().evaluate( el => getComputedStyle( el ).animationName ) ).toBe( 'none' );
    await page.emulateMedia( { reducedMotion: 'reduce' } );
    const foodY = await food.evaluate( el => el.getBoundingClientRect().top + scrollY );
    const placesY = await places.evaluate( el => el.getBoundingClientRect().top + scrollY );
    const factsY = await facts.evaluate( el => el.getBoundingClientRect().top + scrollY );
    const meetupY = await meetup.evaluate( el => el.getBoundingClientRect().top + scrollY );
    expect( foodY ).toBeLessThan( placesY );
    expect( placesY ).toBeLessThan( meetupY );
    expect( meetupY ).toBeLessThan( factsY );
    for ( const [ name, section ] of [ [ 'food', food ], [ 'places', places ], [ 'meetup', meetup ], [ 'facts', facts ] ] as const )
    {
      await section.scrollIntoViewIfNeeded();
      for ( const img of await section.locator( 'img' ).all() )
      {
        await img.scrollIntoViewIfNeeded();
        await expect.poll( () => img.evaluate( el => ( el as HTMLImageElement ).naturalWidth ) ).toBeGreaterThan( 0 );
        await expect( img ).toHaveAttribute( 'loading', 'lazy' );
      }
      const overflows = await section.evaluate( el => [ ...el.querySelectorAll( 'h2, h3, p, a, figure, button' ) ].some( child =>
      {
        const rect = child.getBoundingClientRect();
        return rect.left < -1 || rect.right > innerWidth + 1;
      } ) );
      expect( overflows ).toBe( false );
      await section.screenshot( { path: `/tmp/london-guide-${name}-${width}.png` } );
    }
    for ( const name of [ 'Med Salleh Kopitiam', 'CERU', 'Kiln' ] )
    {
      await receipts.getByRole( 'button', { name: `查看 ${name} 的详情`, exact: true } ).click();
      const heading = page.getByRole( 'heading', { level: 2, name, exact: true } );
      await expect( heading ).toBeVisible();
      await expect( page ).toHaveURL( /\/london#london-food$/ );
      await page.keyboard.press( 'Escape' );
      await expect( heading ).toHaveCount( 0 );
      expect( await page.locator( 'body' ).evaluate( el => el.style.overflow ) ).toBe( '' );
    }
    const invitation = meetup.getByRole( 'link' );
    await invitation.scrollIntoViewIfNeeded();
    await invitation.focus();
    await expect( invitation ).toBeFocused();
    expect( await invitation.evaluate( el => getComputedStyle( el ).outlineStyle ) ).not.toBe( 'none' );
    await page.keyboard.press( 'Enter' );
    await expect( page ).toHaveURL( /\/furcon$/ );
  } );
}
