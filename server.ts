import { bot } from "./bot.ts";
import { Application, Router } from "oak";
import { webhookCallback } from "grammy";

const router = new Router();

router.use("/", webhookCallback(bot, "oak"));

const app = new Application();

app.use(router.routes());
app.listen();
