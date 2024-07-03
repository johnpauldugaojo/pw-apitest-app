import { test, expect, request } from "@playwright/test";
import tags from "../test-data/tags.json";

test.beforeEach(async ({ page }) => {
  await page.route("*/**/api/tags", async (route) => {
    await route.fulfill({
      body: JSON.stringify(tags),
    });
  });

  await page.goto("https://conduit.bondaracademy.com/");
  // // await page.waitForTimeout(5000);
  // await page.getByText("Sign in").click();
  // await page
  //   .getByRole("textbox", { name: "Email" })
  //   .fill("jpadmin@conduit.com");
  // await page.getByRole("textbox", { name: "Password" }).fill("admin");
  // await page.getByRole("button").click();
});

test("has title", async ({ page }) => {
  //to modify the response boy
  await page.route("*/**/api/articles*", async (route) => {
    const res = await route.fetch();
    const resBody = await res.json();
    resBody.articles[0].title = "This is a mock test title";
    resBody.articles[0].description = "This is a mock test description";

    await route.fulfill({
      body: JSON.stringify(resBody),
    });
  });

  await page.getByText("Global Feed").click();
  await expect(page.locator('[class="navbar-brand"]')).toHaveText("conduit");
  await expect(page.locator("app-article-list h1").first()).toContainText(
    "This is a mock test title"
  );
  await expect(page.locator("app-article-list p").first()).toContainText(
    "This is a mock test description"
  );
});

test("Delete Article", async ({ page, request }) => {
  // const resLogin = await request.post(
  //   "https://conduit-api.bondaracademy.com/api/users/login",
  //   {
  //     data: {
  //       user: { email: "jpadmin@conduit.com", password: "admin" },
  //     },
  //   }
  // );
  // const resBody = await resLogin.json();
  // const userToken = resBody.user.token; --> Removed since refactor using authentication state

  const createArticle = await request.post(
    "https://conduit-api.bondaracademy.com/api/articles/",
    {
      data: {
        article: {
          title: "jparticle",
          description: "jayps article",
          body: "Helloworld",
          tagList: [" Testing"],
        },
      },
      // headers: {
      //   Authorization: `Token ${userToken}`,
      // }, --> Delete already declare in pw config
    }
  );
  expect(createArticle.status()).toEqual(201);

  await page.getByText("Global Feed").click();
  await page.getByText("jparticle").click();
  await page.getByRole("button", { name: "Delete Article" }).first().click();
  await page.getByText("Global Feed").click();
  await expect(page.locator("app-article-list h1").first()).not.toContainText(
    "jparticle"
  );
});

test("create article", async ({ page, request }) => {
  await page.getByText("New Article").click();
  await page
    .getByRole("textbox", { name: "Article Title" })
    .fill("Hello World Article");
  await page
    .getByRole("textbox", { name: "What's this article about?" })
    .fill("Hello World Article Description");
  await page
    .getByRole("textbox", { name: "Write your article (in markdown)" })
    .fill("Hello World Write your article (in markdown)");
  await page.getByRole("textbox", { name: "Enter tags" }).fill("Automation");
  await page.getByRole("button", { name: "Publish Article" }).click();

  const articleRes = await page.waitForResponse(
    "https://conduit-api.bondaracademy.com/api/articles/"
  );

  const articleResBody = await articleRes.json();
  const slugId = articleResBody.article.slug;

  await expect(page.locator(".article-page h1")).toContainText(
    "Hello World Article"
  );
  await page.getByText("Home").click();
  await page.getByText("Global Feed").click();
  await expect(page.locator("app-article-list h1").first()).toContainText(
    "Hello World Article"
  );

  // const resLogin = await request.post(
  //   "https://conduit-api.bondaracademy.com/api/users/login",
  //   {
  //     data: {
  //       user: { email: "jpadmin@conduit.com", password: "admin" },
  //     },
  //   }
  // );
  // const resBody = await resLogin.json();
  // const userToken = resBody.user.token;

  const deleteArticleReq = await request.delete(
    `https://conduit-api.bondaracademy.com/api/articles/${slugId}`,
    {
      // headers: {
      //   Authorization: `Token ${userToken}`,
      // }, --> removed already declare in pw-config
    }
  );

  expect(deleteArticleReq.status()).toEqual(204); //verify status code
});
