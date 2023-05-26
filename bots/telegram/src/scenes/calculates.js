const { Markup } = require("telegraf");
const { WizardScene } = require("telegraf").Scenes;

let data = {};

function checkIntegerInput(ctx) {
  if (!isNaN(parseFloat(ctx.message.text)) && isFinite(ctx.message.text)) {
    return true;
  }
  ctx.reply("Ввод не является числом");

  ctx.wizard.back();
  return ctx.wizard.steps[ctx.wizard.cursor](ctx);
}

exports.calculatesFirstStep = new WizardScene(
  "firstStepCalculates",
  (ctx) => {
    ctx.reply("Сумма к обмену:");
    return ctx.wizard.next();
  },
  (ctx) => {
    if (checkIntegerInput(ctx) !== true) return;

    data.amount_src = ctx.message.text;
    ctx.reply("Курс клиенту:");
    return ctx.wizard.next();
  },
  async (ctx) => {
    if (checkIntegerInput(ctx) !== true) return;

    data.usdt_exchange_rate = ctx.message.text;
    data.inter_usdt_exchange =
      parseFloat(data.amount_src) / parseFloat(data.usdt_exchange_rate);

    await ctx.reply("Курс наш:");
    return ctx.wizard.next();
  },
  (ctx) => {
    if (checkIntegerInput(ctx) !== true) return;

    data.usdt_cost_exchange_rate = ctx.message.text;
    ctx.reply("Расходы:");
    return ctx.wizard.next();
  },
  async (ctx) => {
    if (checkIntegerInput(ctx) !== true) return;

    data.transporter_fees = ctx.message.text;

    data.inter_usdt_cost_exchange =
      parseFloat(data.amount_src) / parseFloat(data.usdt_cost_exchange_rate);

    // data.delta_r = data.inter_usdt_cost_exchange - data.inter_usdt_exchange;

    data.usdt_profit =
      data.inter_usdt_cost_exchange -
      data.inter_usdt_exchange -
      data.transporter_fees;

    // await ctx.reply(`Дельта Р: ${data.delta_r.toFixed(2)}`);
    await ctx.reply(`Наша прибыль: ${data.usdt_profit.toFixed(2)}`);

    ctx.reply(
      "Select option:",
      Markup.inlineKeyboard([
        Markup.button.callback("Recalculate", "first_step_calc"),
        Markup.button.callback("Continue", "second_step_calc")
      ])
    );
    return ctx.scene.leave();
  }
);

exports.calculatesSecondStep = new WizardScene(
  "secondStepCalculates",
  (ctx) => {
    ctx.reply("Курс клиенту:");
    return ctx.wizard.next();
  },
  (ctx) => {
    if (checkIntegerInput(ctx) !== true) return;

    data.sell_usdt_exch_rate = ctx.message.text;
    ctx.reply("Курс наш:");
    return ctx.wizard.next();
  },
  (ctx) => {
    if (checkIntegerInput(ctx) !== true) return;

    data.cost_usdt_exch_rate = ctx.message.text;
    ctx.reply("Процент со сделки, %:");
    return ctx.wizard.next();
  },
  async (ctx) => {
    if (checkIntegerInput(ctx) !== true) return;

    data.profit_usdt_interest = ctx.message.text;

    data.inter_profit_usdt_interest =
      parseFloat(data.inter_usdt_exchange) *
      (parseFloat(data.profit_usdt_interest) / 100);

    data.usdt_for_exchange =
      data.inter_usdt_exchange - data.inter_profit_usdt_interest;

    data.dest_currency_after_exchange =
      data.usdt_for_exchange * parseFloat(data.sell_usdt_exch_rate);

    data.dest_currency_by_our_rates =
      data.usdt_for_exchange * parseFloat(data.cost_usdt_exch_rate);

    data.percentage_difference_usdt =
      (data.dest_currency_by_our_rates - data.dest_currency_after_exchange) /
      parseFloat(data.sell_usdt_exch_rate);

    data.total_revenue =
      parseFloat(data.usdt_profit) + data.inter_profit_usdt_interest;

    await ctx.reply(
      `Наши ${
        data.profit_usdt_interest
      }%: ${data.inter_profit_usdt_interest.toFixed(2)}`
    );
    await ctx.reply(
      `Сумма клиента в USDT: ${data.usdt_for_exchange.toFixed(2)}`
    );
    await ctx.reply(
      `Сумма клиента в фиате: *${data.dest_currency_after_exchange.toFixed(
        2
      )}*`,
      {
        parse_mode: "Markdown"
      }
    );
    await ctx.reply(
      `Наша разница на проценте: ${data.percentage_difference_usdt.toFixed(2)}`
    );
    await ctx.reply(`Наша прибыль до обмена: ${data.total_revenue.toFixed(2)}`);

    await ctx.reply(
      "Select option:",
      Markup.inlineKeyboard([
        Markup.button.callback("Recalculate this step", "second_step_calc"),
        Markup.button.callback("Recalculate from beginnig", "first_step_calc"),
        Markup.button.callback("Continue", "third_step_calc")
      ])
    );

    return ctx.scene.leave();
  }
);

exports.calculatesThirdStep = new WizardScene(
  "thirdStepCalculates",
  (ctx) => {
    ctx.reply("% Агенту:");
    return ctx.wizard.next();
  },
  async (ctx) => {
    if (checkIntegerInput(ctx) !== true) return;

    data.src_agent_share = ctx.message.text;

    data.total_sk =
      data.usdt_profit +
      data.inter_profit_usdt_interest +
      data.percentage_difference_usdt;

    data.agent_share = data.total_sk * (data.src_agent_share / 100);
    data.our_share = data.total_sk * (data.src_agent_share / 100) * 2;

    await ctx.reply(
      `Общая прибыль (Дельта Р + ${
        data.profit_usdt_interest
      }% + Дельта AED): ${data.total_sk.toFixed(2)}`
    );
    await ctx.reply(
      `Часть агента (${data.src_agent_share}%): ${data.agent_share.toFixed(2)}`
    );
    await ctx.reply(
      `Наша часть (${100 - data.src_agent_share}%): ${data.our_share.toFixed(
        2
      )}`
    );
    await ctx.reply(
      "Select option:",
      Markup.inlineKeyboard([
        Markup.button.callback("Recalculate this step", "third_step_calc"),
        Markup.button.callback("Report", "report")
      ])
    );

    return ctx.scene.leave();
  }
);

exports.reportStep = new WizardScene("reportCalculates", async (ctx) => {
  await ctx.reply(
    `Наша прибыль: ${data.usdt_profit.toFixed(2)}
  \nНаши ${
    data.profit_usdt_interest
  }%: ${data.inter_profit_usdt_interest.toFixed(2)}
  \nСумма клиента в USDT: ${data.usdt_for_exchange.toFixed(2)}
  \nСумма клиента в фиате: *${data.dest_currency_after_exchange.toFixed(2)}*
  \nНаша разница на проценте: ${data.percentage_difference_usdt.toFixed(2)}
  \nНаша прибыль до обмена: ${data.total_revenue.toFixed(2)}
  \nОбщая прибыль (Дельта Р + ${
    data.profit_usdt_interest
  }% + Дельта AED): ${data.total_sk.toFixed(2)}
  \nЧасть агента (${data.src_agent_share}%): ${data.agent_share.toFixed(2)}
  \nНаша часть (${100 - data.src_agent_share}%): ${data.our_share.toFixed(2)}`,
    {
      parse_mode: "Markdown"
    }
  );

  await ctx.reply(
    "Select option:",
    Markup.inlineKeyboard([
      Markup.button.callback("New calculation", "first_step_calc")
    ])
  );

  return ctx.scene.leave();
});
