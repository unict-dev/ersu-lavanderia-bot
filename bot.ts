/// <reference lib="deno.unstable" />

import { Bot } from "grammy";

/*
There is no way to run the programm without this enviroment variables so we just exit.
This might seem bad but it's actually fine since this is meant to be deployed serverless,
meaning the envs will be set a secrets.
*/
const bot_token = Deno.env.get("BOT_TOKEN");
if (!bot_token) throw new Error("BOT_TOKEN is unset");

const channel_id = Deno.env.get("CHANNEL_ID");
if (!channel_id) throw new Error("CHANNEL_ID is unset");

const admins_env = Deno.env.get("ADMINS");
if (!admins_env) throw new Error("ADMINS is unset");
const admins = admins_env.split(",");

// This opens a redis like database we use to store the key status.
const kv = await Deno.openKv();

// Export the bot so we can easily use bot webhook and polling mode.
export const bot = new Bot(bot_token);

/*
This command is automatically run when a user interacts with the bot for the first time,
meaning it should contain all the information to get started with the bot
*/
bot.command(
  "start",
  (ctx) => {
    // FIXME: null check
    if (admins.includes(ctx.from!.id.toString())) {
      ctx.reply("Benvenuto admin");
    } else {
      ctx.reply("Benvenuto user");
    }
  },
);

bot.command("disponibile", async (ctx) => {
  // FIXME: null check
  if (!admins.includes(ctx.from!.id.toString())) {
    return await ctx.reply(
      "Questo commando è riservato agli amministratori.\nSe credi si tratti di un errore contatta il responsabile del bot.",
    );
  }

  const available = (await kv.get<boolean>(["key", "available"])).value;

  if (available === null || !available) {
    await ctx.reply(
      "La chiave della lavanderia è stata segnata come disponibile.",
    );
    await bot.api.sendMessage(
      channel_id,
      "La chiave della lavanderia è disponibile.",
    );
    await kv.set(["key", "available"], true);
  } else {
    await ctx.reply(
      "La chiave della lavanderia è gia disponibile.\nPuoi usare il commando /occupata per segnalare che la chiave è in uso.",
    );
  }
});

bot.command("occupata", async (ctx) => {
  // FIXME: null check
  if (!admins.includes(ctx.from!.id.toString())) {
    return await ctx.reply(
      "Questo commando è riservato agli amministratori.\nSe credi si tratti di un errore contatta il responsabile del bot.",
    );
  }

  const available = (await kv.get<boolean>(["key", "available"])).value;

  if (available === null || available) {
    await ctx.reply(
      "La chiave della lavanderia è stata segnata come occupata.",
    );
    await bot.api.sendMessage(
      channel_id,
      "La chiave della lavanderia è occupata.",
    );
    await kv.set(["key", "available"], false);
  } else {
    await ctx.reply(
      "La chiave della lavanderia è gia occupata.\nPuoi usare il commando /disponibile per segnalare che la chiave è disponibile.",
    );
  }
});

// Checks the status of the key
bot.command("stato", async (ctx) => {
  const available = (await kv.get<boolean>(["key", "available"])).value;

  if (available === null) {
    await ctx.reply(
      "La stato della chiave è sconosciuto",
    );
  } else if (available) {
    await ctx.reply(
      "La chiave della lavanderia è disponibile.",
    );
  } else {
    await ctx.reply(
      "La chiave della lavanderia è occupata.",
    );
  }
});

// Simple helper to get the chat id, usefull to get the chat id of the channel
bot.command("chat_id", (ctx) => {
  ctx.reply(ctx.chat.id.toString());
});

bot.command("user_id", (ctx) => {
  // FIXME: null check
  ctx.reply(ctx.from!.id.toString());
});
