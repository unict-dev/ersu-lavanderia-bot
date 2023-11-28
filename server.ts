import { bot } from "./bot.ts";
import { webhookCallback } from "grammy";
import { Application, Router } from "oak";

const router = new Router();
router.post(`/${bot.token}`, webhookCallback(bot, "oak"));

const app = new Application();
app.use(router.routes());
app.use(router.allowedMethods());

app.use(webhookCallback(bot, "oak"));
