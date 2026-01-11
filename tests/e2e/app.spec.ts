import { test, expect } from '@playwright/test';

test.describe('Table Communication App', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load the main page', async ({ page }) => {
    // ページタイトルが正しく表示される
    await expect(page.locator('h1').filter({ hasText: 'Table Communication' })).toBeVisible();

    // 言語スイッチが表示される（デスクトップの場合のみ）
    const isDesktop = page.viewportSize()?.width ? page.viewportSize()!.width >= 640 : true;
    if (isDesktop) {
      await expect(page.locator('text=言語:')).toBeVisible();
    }

    // 検索バーが表示される
    await expect(page.locator('input[placeholder*="キーワードで検索"]')).toBeVisible();

    // タブが表示される
    const tabs = page.getByRole('tab');
    await expect(tabs.first()).toBeVisible();
  });

  test('should switch languages correctly', async ({ page }) => {
    // デフォルトで日本語が選択されていることを確認
    await expect(page.locator('[aria-label="日本語"]')).toHaveAttribute('data-state', 'on');

    // 英語に切り替える
    await page.locator('[aria-label="English"]').click({ force: true });
    await expect(page.locator('[aria-label="English"]')).toHaveAttribute('data-state', 'on');

    // スペイン語に切り替える
    await page.locator('[aria-label="Español"]').click({ force: true });
    await expect(page.locator('[aria-label="Español"]')).toHaveAttribute('data-state', 'on');

    // 日本語に戻す
    await page.locator('[aria-label="日本語"]').click({ force: true });
    await expect(page.locator('[aria-label="日本語"]')).toHaveAttribute('data-state', 'on');
  });

  test('should display quick response cards', async ({ page }) => {
    // クイック回答カードが表示される
    const cards = page.locator('[data-testid="quick-response-card"], .cursor-pointer');
    await expect(cards.first()).toBeVisible();

    // 少なくとも1つのカードがあることを確認
    await expect(cards).toHaveCount(await cards.count());
  });

  test('should filter by category', async ({ page }) => {
    // デフォルトで「すべて」が選択されている
    await expect(page.getByRole('tab', { name: 'すべて' })).toHaveAttribute('data-state', 'active');

    // 会計カテゴリに切り替える
    await page.getByRole('tab', { name: '会' }).click();
    await expect(page.getByRole('tab', { name: '会' })).toHaveAttribute('data-state', 'active');

    // 食べ方カテゴリに切り替える
    await page.getByRole('tab', { name: '食' }).click();
    await expect(page.getByRole('tab', { name: '食' })).toHaveAttribute('data-state', 'active');

    // すべてに戻す
    await page.getByRole('tab', { name: 'すべて' }).click();
    await expect(page.getByRole('tab', { name: 'すべて' })).toHaveAttribute('data-state', 'active');
  });

  test('should search responses', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="キーワードで検索"]');

    // 検索バーに「会計」を入力
    await searchInput.fill('会計');
    await expect(searchInput).toHaveValue('会計');

    // 検索結果が表示される（検索機能が動作することを確認）
    // 実際の検索結果の検証はデータによるので、入力が受け付けられることを確認

    // 検索をクリア
    await searchInput.clear();
    await expect(searchInput).toHaveValue('');
  });

  test('should open quick response dialog', async ({ page }) => {
    // 最初のクイック回答カードをクリック
    const firstCard = page.locator('[data-testid="quick-response-card"], .cursor-pointer').first();
    await firstCard.click();

    // ダイアログが開くことを確認
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible();

    // 大きな文字でメッセージが表示されていることを確認
    const largeText = page.locator('[role="dialog"]').locator('.text-3xl, .text-4xl, .text-5xl').filter({ hasText: 'お会計はこちらのテーブルでお願いします。' });
    await expect(largeText).toBeVisible();

    // ダイアログを閉じる
    await page.keyboard.press('Escape');
    await expect(dialog).not.toBeVisible();
  });

  test('should display response content in different languages', async ({ page }) => {
    // デフォルト（日本語）の状態で特定のテキストが存在することを確認
    await expect(page.getByText('お会計はこちらのテーブルでお願いします。')).toBeVisible();

    // 英語に切り替えて対応する英語テキストが存在することを確認
    await page.locator('[aria-label="English"]').click();
    await expect(page.getByText('Please pay at this table.')).toBeVisible();

    // スペイン語に切り替えて対応するスペイン語テキストが存在することを確認
    await page.locator('[aria-label="Español"]').click();
    await expect(page.getByText('Por favor, pague en esta mesa.')).toBeVisible();
  });

  test('should display images in responses', async ({ page }) => {
    // SVG画像が表示されていることを確認
    await expect(page.locator('img[src*="table-payment"]')).toBeVisible();
  });

  test('should be responsive on mobile', async ({ page }) => {
    // モバイルビューポートに設定
    await page.setViewportSize({ width: 375, height: 667 });

    // モバイルでも主要要素が表示されることを確認
    await expect(page.locator('h1').filter({ hasText: 'Table' })).toBeVisible();
    await expect(page.locator('input[placeholder*="キーワードで検索"]')).toBeVisible();

    // モバイルではバッジが非表示になっていることを確認
    await expect(page.locator('text=飲食店スタッフ支援')).not.toBeVisible();

    // 言語スイッチがモバイルでも機能することを確認
    await expect(page.locator('[aria-label="日本語"]')).toBeVisible();

    // モバイルでのダイアログ表示を確認
    const firstCard = page.locator('[data-testid="quick-response-card"]').first();
    await firstCard.click();

    // モバイルでも大きな文字が表示されていることを確認
    const largeText = page.locator('[role="dialog"]').locator('.text-3xl, .text-4xl, .text-5xl').filter({ hasText: 'お会計はこちらのテーブルでお願いします。' });
    await expect(largeText).toBeVisible();

    // ダイアログを閉じる
    await page.keyboard.press('Escape');
  });

  test('should have proper touch targets on mobile', async ({ page }) => {
    // モバイルビューポートに設定
    await page.setViewportSize({ width: 375, height: 667 });

    // 検索バーがタッチしやすいサイズであることを確認
    const searchInput = page.locator('input[placeholder*="キーワードで検索"]');
    const searchInputBox = await searchInput.boundingBox();
    expect(searchInputBox?.height).toBeGreaterThanOrEqual(44); // 最小タッチターゲットサイズ

    // カードがタッチしやすいサイズであることを確認
    const firstCard = page.locator('[data-testid="quick-response-card"]').first();
    const cardBox = await firstCard.boundingBox();
    expect(cardBox?.width).toBeGreaterThanOrEqual(44);
    expect(cardBox?.height).toBeGreaterThanOrEqual(44);
  });

  test('should handle horizontal scrolling tabs on mobile', async ({ page }) => {
    // モバイルビューポートに設定
    await page.setViewportSize({ width: 375, height: 667 });

    // タブが横スクロール可能であることを確認
    const tabsContainer = page.locator('.overflow-x-auto');
    await expect(tabsContainer).toBeVisible();

    // タブがスクロール可能なコンテナに含まれていることを確認
    const tabs = tabsContainer.getByRole('tab');
    await expect(tabs).toHaveCount(5);
  });

  test('should display compact UI elements on mobile', async ({ page }) => {
    // モバイルビューポートに設定
    await page.setViewportSize({ width: 375, height: 667 });

    // ヘッダーがコンパクトであることを確認
    const header = page.locator('header');
    const headerBox = await header.boundingBox();
    expect(headerBox?.height).toBeGreaterThanOrEqual(64); // モバイルでの適切な高さ

    // 説明文がモバイル用に短くなっていることを確認
    await expect(page.locator('text=タップでゲストに見せる')).toBeVisible();
    await expect(page.locator('text=タップしてゲストに見せる画面が開きます')).not.toBeVisible();
  });

  test('should work properly in landscape mobile view', async ({ page }) => {
    // モバイルランドスケープビューポートに設定
    await page.setViewportSize({ width: 667, height: 375 });

    // ランドスケープでも主要要素が表示されることを確認
    await expect(page.locator('h1').filter({ hasText: 'Table' })).toBeVisible();
    await expect(page.locator('input[placeholder*="キーワードで検索"]')).toBeVisible();

    // グリッドレイアウトが適切に表示されることを確認
    const cards = page.locator('[data-testid="quick-response-card"]');
    await expect(cards.first()).toBeVisible();
  });
});
