import { test as setup } from "@playwright/test";
import user from "../.auth/user.json";
import fs from "fs";
const authFile = ".auth/user.json";

setup("authentication", async ({ page, request }) => {
  // await page.goto("https://conduit.bondaracademy.com/");
  // await page.getByText("Sign in").click();
  // await page
  //   .getByRole("textbox", { name: "Email" })
  //   .fill("jpadmin@conduit.com");
  // await page.getByRole("textbox", { name: "Password" }).fill("admin");
  // await page.getByRole("button").click();
  // await page.waitForResponse("https://conduit-api.bondaracademy.com/api/tags");
  // await page.context().storageState({ path: authFile });

  const resLogin = await request.post(
    "https://conduit-api.bondaracademy.com/api/users/login",
    {
      data: {
        user: { email: "jpadmin@conduit.com", password: "admin" },
      },
    }
  );
  const resBody = await resLogin.json();
  const userToken = resBody.user.token;

  // update user for new user value
  user.origins[0].localStorage[0].value = userToken;
  fs.writeFileSync(authFile, JSON.stringify(user));

  process.env["ACCESS_TOKEN"] = userToken;
});
