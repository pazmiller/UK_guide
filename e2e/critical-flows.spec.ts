import { expect, test, type Page } from '@playwright/test';

async function gotoReady(page: Page, path: string) {
  await page.goto(path);
  await page.waitForLoadState('networkidle');
}

test('desktop navigation opens the London attractions page', async ({ page }) => {
  await gotoReady(page, '/');

  const navigation = page.locator('nav');
  await navigation.getByRole('link', { name: 'London', exact: true }).hover();
  await navigation.getByRole('link', { name: 'Attractions', exact: true }).click();

  await expect(page).toHaveURL(/\/london\/attractions$/);
  await expect(page.getByRole('heading', { name: 'London Attractions' })).toBeVisible();
});

test('mobile navigation opens and closes after a route change', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await gotoReady(page, '/');

  const navigation = page.locator('nav');
  await navigation.getByRole('button', { name: 'Toggle menu' }).click();
  await navigation.getByRole('link', { name: 'Restaurants', exact: true }).click();

  await expect(page).toHaveURL(/\/london\/restaurants$/);
  await expect(page.getByRole('heading', { name: 'London Restaurants' })).toBeVisible();
  await expect(navigation.getByRole('link', { name: 'Home', exact: true })).toBeHidden();
});

test('restaurant details open and close with Escape', async ({ page }) => {
  await gotoReady(page, '/london/restaurants');

  await page.getByRole('heading', { name: 'Med Salleh Kopitiam', level: 3 }).click();

  const modalHeading = page.getByRole('heading', {
    name: 'Med Salleh Kopitiam',
    level: 2,
  });
  await expect(modalHeading).toBeVisible();
  await expect(page.getByRole('link', { name: 'Take me there~' })).toHaveAttribute(
    'href',
    /google\.com\/maps\/search/,
  );
  await expect.poll(
    () => page.locator('body').evaluate(element => element.style.overflow),
  ).toBe('hidden');

  await page.keyboard.press('Escape');

  await expect(modalHeading).toBeHidden();
  await expect.poll(
    () => page.locator('body').evaluate(element => element.style.overflow),
  ).toBe('');
});

test('chatbot renders a mocked answer and source', async ({ page }) => {
  await page.route('**/api/chat', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        answer: '推荐你去 Borough Market。',
        mode: 'test',
        sources: [
          {
            id: 'borough-market',
            title: 'Borough Market',
            city: 'London',
            category: 'attraction',
            source: 'DATA.md',
            score: 0.95,
          },
        ],
      }),
    });
  });
  await gotoReady(page, '/london/restaurants');

  await page.getByRole('button', { name: 'Open chatbot' }).click();
  await page.getByPlaceholder('问伦敦、约克有什么好吃好玩...').fill('伦敦去哪里？');
  await page.getByRole('button', { name: 'Send message' }).click();

  await expect(page.getByText('伦敦去哪里？', { exact: true })).toBeVisible();
  await expect(page.getByText('推荐你去 Borough Market。', { exact: true })).toBeVisible();
  await expect(page.getByText('London · Borough Market', { exact: true })).toBeVisible();
});

test('university dossier waits for reviewed student submissions', async ({ page }) => {
  await gotoReady(page, '/universities/ucl');

  await expect(page.getByRole('heading', { name: 'University College London', level: 1 })).toBeVisible();
  await expect(page.getByRole('button', { name: /AVERAGE SCORE/ })).toBeDisabled();
  await expect(page.getByRole('heading', { name: '这所学校还没有已审核评价。' })).toBeVisible();
  await expect(page.getByText('已确认的校园结构')).toHaveCount(0);
  await expect(page.getByText('真正需要问的问题')).toHaveCount(0);
});

test('contribution form sends the expected restaurant submission', async ({ page }) => {
  let submission: unknown;
  await page.route('**/api/contributions', async route => {
    submission = route.request().postDataJSON();
    await route.fulfill({
      status: 201,
      contentType: 'application/json',
      body: JSON.stringify({
        message: '已进入待审核队列，谢谢你出的一份力！',
      }),
    });
  });
  await gotoReady(page, '/contribute');

  await page.getByLabel(/地点 \/ 主题名称/).fill('测试餐厅');
  await page.getByLabel(/城市（街区请写在补充里）/).fill('London / Soho');
  await page.getByLabel(/菜系 \/ Cuisine/).selectOption('Chinese');
  await page.getByLabel(/推荐理由 \/ Why recommend it/).fill('适合 Playwright 自动化测试。');
  await page.getByLabel(/餐厅简介与其他补充/).fill('这是一条不会进入真实审核队列的测试投稿。');
  await page.getByRole('button', { name: '提交审核' }).click();

  await expect(page.locator('p[role="status"]')).toHaveText('已进入待审核队列，谢谢你出的一份力！');
  expect(submission).toMatchObject({
    version: 1,
    type: 'restaurant',
    intent: 'add',
    name: '测试餐厅',
    city: 'London / Soho',
    cuisine: 'Chinese',
    imageKeys: [],
  });
});

test('contribution form sends a half-star university review', async ({ page }) => {
  let submission: Record<string, unknown> | undefined;
  await page.route('**/api/contributions/uploads', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        key: 'incoming/e2e/university-library.jpg',
        uploadUrl: 'https://upload.test/university-library.jpg',
      }),
    });
  });
  await page.route('https://upload.test/**', async route => {
    await route.fulfill({ status: 200, body: '' });
  });
  await page.route('**/api/contributions', async route => {
    submission = route.request().postDataJSON() as Record<string, unknown>;
    await route.fulfill({
      status: 201,
      contentType: 'application/json',
      body: JSON.stringify({ message: '已进入待审核队列，谢谢你出的一份力！' }),
    });
  });
  await gotoReady(page, '/contribute');

  await page.getByRole('button', { name: '大学评价' }).click();
  const universitySelect = page.getByRole('combobox', { name: /学校全名/ });
  await universitySelect.selectOption({ label: 'University of Oxford' });
  await expect(universitySelect).toHaveValue('oxford');
  await expect(page.getByLabel('学校全名（其他）')).toHaveCount(0);
  await universitySelect.selectOption('Others...');
  await page.getByLabel('学校全名（其他）').fill('University of Test');
  await universitySelect.selectOption({ label: 'University of Oxford' });
  await expect(page.getByLabel('学校全名（其他）')).toHaveCount(0);
  const studyYearGroup = page.getByRole('group', { name: /就读年份/ });
  const yearRangeButton = studyYearGroup.getByRole('button').first();
  await yearRangeButton.click();
  const yearRangePicker = page.getByRole('dialog', { name: '选择就读年份范围' });
  await yearRangePicker.getByRole('button', { name: '2022 年', exact: true }).click();
  await expect(yearRangePicker.getByText('已选 2022 年，现在选择结束年份')).toBeVisible();
  await yearRangePicker.getByRole('button', { name: '2025 年', exact: true }).click();
  await expect(yearRangePicker.getByRole('button', { name: '2023 年，所选范围内' })).toBeVisible();
  await yearRangePicker.getByRole('button', { name: '完成' }).click();
  await expect(yearRangeButton).toContainText('2022 年');
  await expect(yearRangeButton).toContainText('2025 年');
  await page.getByRole('button', { name: '硕士' }).click();
  await page.getByLabel(/专业/).fill('MSc Testing');
  await page.getByLabel('4.5 星').check({ force: true });
  await expect(page.getByRole('button', { name: '匿名投稿' })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByPlaceholder('我对这所带学，设施和师资的锐评是……')).toBeVisible();
  await page.getByRole('button', { name: '署名投稿' }).click();
  await page.getByLabel(/希望公开显示的名字/).fill('Discarded Name');
  await page.getByRole('button', { name: '匿名投稿' }).click();
  await expect(page.getByLabel(/希望公开显示的名字/)).toHaveCount(0);
  await page.getByRole('button', { name: '署名投稿' }).click();
  await expect(page.getByLabel(/希望公开显示的名字/)).toHaveValue('');
  await page.getByLabel(/希望公开显示的名字/).fill('Test Student');
  await page.getByLabel(/特别好之处/).fill('图书馆资源充足。');
  await page.getByLabel(/特别坏之处/).fill('行政回复偏慢。');
  await page.getByLabel(/整体评价/).fill('设施和师资都经过了自动化测试。');
  await page.locator('input[type="file"]').setInputFiles({
    name: 'university-library.jpg',
    mimeType: 'image/jpeg',
    buffer: Buffer.from('playwright image fixture'),
  });
  await expect(page.locator('img[src^="blob:"]')).toBeVisible();
  await page.getByPlaceholder('例如：图书馆二楼自习区、宿舍公共厨房').fill('图书馆二楼自习区');
  await page.getByRole('checkbox').check();
  await page.getByRole('button', { name: '提交审核' }).click();

  await expect(page.locator('p[role="status"]')).toHaveText('已进入待审核队列，谢谢你出的一份力！');
  expect(submission).toMatchObject({
    version: 1,
    type: 'university',
    intent: 'add',
    region: 'uk',
    name: 'University of Oxford',
    universitySlug: 'oxford',
    city: '',
    studyYear: '2022–2025',
    studyStartYear: '2022',
    studyEndYear: '2025',
    studyStage: '硕士',
    studyProgram: 'MSc Testing',
    rating: 4.5,
    discloseSubmitterName: true,
    submitterName: 'Test Student',
    universityPros: '图书馆资源充足。',
    universityCons: '行政回复偏慢。',
    details: '设施和师资都经过了自动化测试。',
    imageKeys: [ 'incoming/e2e/university-library.jpg' ],
    imageCaptions: [ '图书馆二楼自习区' ],
    imageRightsConfirmed: true,
  });
});
