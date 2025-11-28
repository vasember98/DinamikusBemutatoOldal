import { expect, test } from '@playwright/test';

test.describe('Quiz Flow', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/kviz');
	});

	test('should display quiz page with quiz elements', async ({ page }) => {
		await expect(page.locator('h1')).toContainText('Kvíz');
		await expect(page.locator('.quiz-layout')).toBeVisible();
		await expect(page.locator('.question-wrapper')).toBeVisible();
		await expect(page.locator('.quiz-sidebar')).toBeVisible();
	});

	test('should navigate to next question', async ({ page }) => {
		const firstQuestion = await page.locator('.prompt h3').textContent();
		
		await page.locator('button', { hasText: 'Következő' }).click();
		await page.waitForTimeout(300);

		const secondQuestion = await page.locator('.prompt h3').textContent();
		expect(secondQuestion).not.toBe(firstQuestion);

		const questionCard = page.locator('.sidebar-card').filter({ hasText: 'Kérdés' });
		await expect(questionCard.locator('.value')).toContainText('2 /');
	});

	test('should toggle exam mode', async ({ page }) => {
		const examModeCard = page.locator('.sidebar-card').filter({ hasText: 'Vizsga mód' });
		const toggle = examModeCard.locator('input[type="checkbox"]');
		
		await expect(toggle).not.toBeChecked();
		
		await toggle.click();
		await page.waitForTimeout(300);
		
		await expect(toggle).toBeChecked();
	});

	test('should complete quiz and show results', async ({ page }) => {
		let questionsCount = 0;
		const maxQuestions = 50;

		while (questionsCount < maxQuestions) {
			const trueButton = page.locator('button', { hasText: 'Igaz' }).first();
			if ((await trueButton.count()) > 0) {
				await trueButton.click();
				await page.waitForTimeout(100);
			}

			const nextButton = page.locator('button').filter({ hasText: /Következő|Befejezés/ });
			const buttonText = await nextButton.textContent();

			if (buttonText?.includes('Befejezés')) {
				await nextButton.click();
				await page.waitForTimeout(500);
				break;
			}

			await nextButton.click();
			await page.waitForTimeout(200);
			questionsCount++;
		}

		await expect(page.locator('.results-card')).toBeVisible();
		await expect(page.locator('.results-card h2')).toContainText('Eredmény');
		await expect(page.locator('.results-card p').first()).toContainText('helyes válasz');
	});

	test('should handle single choice questions', async ({ page }) => {
		let found = false;
		const maxAttempts = 10;

		for (let i = 0; i < maxAttempts; i++) {
			const radioButton = page.locator('input[type="radio"]').first();
			if ((await radioButton.count()) > 0) {
				found = true;
				await radioButton.click();
				await page.waitForTimeout(300);

				const answeredCard = page.locator('.sidebar-card').filter({ hasText: 'Megválaszolt' });
				const answeredText = await answeredCard.locator('.value').textContent();
				expect(parseInt(answeredText || '0')).toBeGreaterThan(0);
				break;
			}

			const nextButton = page.locator('button', { hasText: 'Következő' });
			if ((await nextButton.count()) > 0) {
				await nextButton.click();
				await page.waitForTimeout(300);
			} else {
				break;
			}
		}

		expect(found).toBe(true);
	});
});
