const { Telegraf } = require("telegraf");
const { Markup } = require("telegraf");
const calculate = require("./calculate");
const sceneCalculates = require("./scenes/calculates");
const Scenes = require("telegraf").Scenes;
const session = require("telegraf").session;
import config from "@lib/config";

if (process.env.NO_TELEGRAM) {
  process.exit(0);
}

const bot = new Telegraf(config.telegram_bot_token);

bot.command("start", (ctx) => {
  ctx.reply(
    `Click Start to calculate the exchange order`,
    Markup.inlineKeyboard([Markup.button.callback("Start", "first_step_calc")])
  );
});

const stage = new Scenes.Stage();

stage.register(sceneCalculates.calculatesFirstStep);
stage.register(sceneCalculates.calculatesSecondStep);
stage.register(sceneCalculates.calculatesThirdStep);
stage.register(sceneCalculates.reportStep);

bot.use(session());
bot.use(stage.middleware());

bot.action("first_step_calc", (ctx) => {
  ctx.scene.enter("firstStepCalculates");
});

bot.action("second_step_calc", (ctx) => {
  ctx.scene.enter("secondStepCalculates");
});

bot.action("third_step_calc", (ctx) => {
  ctx.scene.enter("thirdStepCalculates");
});

bot.action("report", (ctx) => {
  ctx.scene.enter("reportCalculates");
});

bot.launch();

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));

console.log("Telegram bot is runing...");
