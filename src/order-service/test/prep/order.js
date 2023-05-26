import db from "@lib/db";

let ENV = {};
const createNonAdOrder = async (organisation, order_type, status) => {
  return await db.non_ad_order.create({
    organisation,
    order_type,
    ctime: new Date(),
    mtime: new Date(),
    status
  });
};

const createTestTransfersOnOrder = async (
  non_ad_order_id,
  acc_plan,
  merch,
  user
) => {
  let plan_transfer = await db.transfers_plan.create({
    ctime: new Date(),
    mtime: new Date(),
    plan_id: acc_plan
  });
  let transfer = await db.transfer.bulkCreate([
    {
      plan_transfer_id: plan_transfer.get("id")
    },
    {
      plan_transfer_id: plan_transfer.get("id")
    }
  ]);
  await db.transaction.bulkCreate([
    {
      transfer_id: transfer[0].get("id"),
      ref_id: non_ad_order_id
    },
    {
      transfer_id: transfer[1].get("id"),
      ref_id: non_ad_order_id
    },
    {
      transfer_id: transfer[1].get("id"),
      ref_id: non_ad_order_id
    }
  ]);
  let not_sent_transfer = await db.not_sent_plan_transfer.create({
    ref_id: non_ad_order_id,
    amount: 1,
    currency: "ETH",
    result_currency: "ETH",
    plan_id: acc_plan,
    merchant_id: merch,
    variables: [
      {
        id: "extModel6106-4",
        key: "MONITOR_ACC_USDT",
        type: "merchant_account",
        value: "61010107325101072842655",
        values: null,
        descript: "Мониторинговый счет USDT ERC20"
      },
      {
        id: "extModel11039-2",
        key: "FROM_USDT_ADDR",
        value: "0x8ad51560e3ca9da594aa51cbdc7134f7955a90d3",
        descript: "USDT адрес отправления"
      },
      {
        id: "extModel11039-1",
        key: "TO_USDT_ADDR",
        value: "0x8ad51560e3ca9da594aa51cbdc7134f7955a90d3",
        descript: "USDT адрес получения"
      }
    ]
  });
  let acc = await db.account.create({
    balance: 10000,
    acc_no: "61010107325101072842655",
    currency: "USDT",
    owner: user
  });
  await db.merchant_account.create({ id_merchant: merch, id_account: acc.id });

  let transfer_for_rejection = await db.not_sent_plan_transfer.create({
    ref_id: non_ad_order_id,
    amount: 1,
    currency: "ETH",
    result_currency: "ETH",
    plan_id: acc_plan,
    merchant_id: merch,
    variables: [
      {
        id: "extModel6106-4",
        key: "MONITOR_ACC_USDT",
        type: "merchant_account",
        value: "61010107325101072842655",
        values: null,
        descript: "Мониторинговый счет USDT ERC20"
      },
      {
        id: "extModel11039-2",
        key: "FROM_USDT_ADDR",
        value: "0x8ad51560e3ca9da594aa51cbdc7134f7955a90d3",
        descript: "USDT адрес отправления"
      },
      {
        id: "extModel11039-1",
        key: "TO_USDT_ADDR",
        value: "0x8ad51560e3ca9da594aa51cbdc7134f7955a90d3",
        descript: "USDT адрес получения"
      }
    ]
  });

  ENV.plan_transfer = plan_transfer.get("id");
  ENV.not_sent_transfer = not_sent_transfer.get("id");
  ENV.transfer_for_rejection = transfer_for_rejection.get("id");
  await await db.non_ad_order.update(
    {
      additional_data: {
        provided: 123,
        provided_transfer_id: plan_transfer.get("id"),
        not_provided: 321,
        not_provided_transfer_id: not_sent_transfer.get("id"),
        for_reject: 333,
        for_reject_transfer_id: transfer_for_rejection.get("id")
      }
    },
    { where: { id: non_ad_order_id } }
  );
  return true;
};

const createTestTranchesOnOrder = async (non_ad_order_id) => {
  let tranches_arr = [];
  for (let i = 1; i < 5; i++) {
    tranches_arr.push({
      ref_id: non_ad_order_id,
      no: i,
      ctime: new Date(),
      mtime: new Date(),
      removed: 0
    });
  }
  await db.tranche.bulkCreate(tranches_arr);
  return true;
};

const createPlanForNonAdOrder = async () => {
  let plan = await db.accounts_plan.create({
    name: "test plan for orders",
    items: {
      _arr: [
        {
          descript: "Source account",
          acc_no: "$MONITOR_ACC_USDT",
          currency: "USDT",
          tag: "src",
          method: "account-service/testCheckBalance"
        },
        {
          descript: "Fin",
          acc_no: "$MONITOR_ACC_USDT",
          currency: "USDT",
          tag: "monitor",
          extra: "$FROM_USDT_ADDR",
          method: "ccoin-service/sk2monitoring"
        }
      ]
    }
  });
  return plan.id;
};

const after = async () => {
  await db.non_ad_order.destroy({ truncate: true, cascade: true });
  await db.not_sent_plan_transfer.destroy({ truncate: true, cascade: true });
};

export default {
  ENV,
  createNonAdOrder,
  createTestTransfersOnOrder,
  createTestTranchesOnOrder,
  createPlanForNonAdOrder,
  after
};
