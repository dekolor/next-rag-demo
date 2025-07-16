import test, { expect } from "@playwright/test";

test.describe("Test Chat functionality", () => {
    test("Chat returns cited answer", async ({ page }) => {
        await page.goto("/");

        await page.getByRole("textbox").fill("What is partial prerendering?");
        await page.getByRole('button', { name: "Submit" }).click();

        await expect(page.getByLabel("citation").first()).toBeVisible({ timeout: 60 * 1000 });

        const requestAnswer = await page.locator('.llm-response').first().textContent();
        expect(requestAnswer!.length).toBeGreaterThan(50);
    });
});