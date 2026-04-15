import { expect, test } from "@playwright/test";

test.describe("CUPRA Raval landing page", () => {
  test("renders hero content and supports primary navigation", async ({ page }) => {
    await page.goto("/");

    await expect(
      page.getByRole("heading", {
        level: 1,
        name: /cupra raval is built for a city that wants more than quiet efficiency/i
      })
    ).toBeVisible();

    await expect(page.locator(".brand-mark")).toBeVisible();
    await expect(page.locator('link[rel="icon"]').first()).toHaveAttribute("href", /favicon/i);

    await page.getByRole("link", { name: /explore the vision/i }).click();

    await expect(page.locator("#overview")).toBeInViewport();
    await expect(page.locator('.site-nav a[href="#overview"]')).toHaveClass(/is-active/);
  });

  test("publishes crawl metadata, analytics hooks, and indexable assets", async ({
    page,
    request,
    baseURL
  }) => {
    const siteUrl = baseURL?.replace(/\/$/, "") || "http://127.0.0.1:4317";

    await page.goto("/");

    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `${siteUrl}/`);
    await expect(page.locator('meta[property="og:url"]')).toHaveAttribute("content", `${siteUrl}/`);
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
      "content",
      `${siteUrl}/assets/brand/cupra-raval-mark-512.png`
    );
    await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute(
      "content",
      "summary_large_image"
    );
    await expect(page.locator('meta[name="clarity-project-id"]')).toHaveAttribute(
      "content",
      "wbzs0weet7"
    );
    await expect(page.locator("#clarity-script")).toHaveAttribute(
      "src",
      /clarity\.ms\/tag\/wbzs0weet7/
    );
    await expect(page.locator('meta[name="ga4-measurement-id"]')).toHaveAttribute("content", "");

    const structuredData = page.locator('script[type="application/ld+json"]').first();
    const schema = JSON.parse((await structuredData.textContent()) || "{}");
    expect(schema["@graph"][0].url).toBe(`${siteUrl}/`);
    expect(schema["@graph"][1]["@type"]).toBe("FAQPage");

    const robotsResponse = await request.get(`${siteUrl}/robots.txt`);
    expect(robotsResponse.ok()).toBeTruthy();
    expect(await robotsResponse.text()).toContain("Sitemap: https://cupraraval.lol/sitemap.xml");

    const sitemapResponse = await request.get(`${siteUrl}/sitemap.xml`);
    expect(sitemapResponse.ok()).toBeTruthy();
    expect(await sitemapResponse.text()).toContain("<loc>https://cupraraval.lol/</loc>");
  });

  test("stays within the viewport on mobile and keeps faq accessible", async ({ page }) => {
    await page.goto("/");

    const overflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth - window.innerWidth;
    });

    expect(overflow).toBeLessThanOrEqual(1);

    await page.getByRole("link", { name: /^FAQ$/ }).click();
    await expect(page.locator("#faq")).toBeInViewport();
    await expect(page.getByText(/fast answers for the most common cupra raval questions/i)).toBeVisible();
  });
});
