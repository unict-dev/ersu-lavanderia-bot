import { bot, kv } from "./bot.ts";
import { webhookCallback } from "grammy";
import { Application, Router } from "oak";

const router = new Router();
router
  .get(`/api/${bot.token}/available`, async (ctx) => {
    const available = (await kv.get<boolean>(["key", "available"])).value;
    ctx.response.type = "application/json";
    ctx.response.body = { available };
  })
  .post(`/${bot.token}`, webhookCallback(bot, "oak"));

const app = new Application();
app.use(router.routes());
app.use(router.allowedMethods());

await app.listen({ port: 8080 });
