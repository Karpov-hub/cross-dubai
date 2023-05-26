import db from "@lib/db";

let mPlan, plan, merchant, manual_transfer_plan, swap_plan, chain_transfer_plan;

async function init(ENV) {
  merchant = await db.merchant.create({
    name: "merchant",
    user_id: ENV.user2.id,
    variables: {
      _arr: [
        { key: "PLAN_SOURCE_EUR", value: ENV.user2.accounts[1].acc_no },
        { key: "PLAN_MONITORING_ACC", value: ENV.user2.accounts[2].acc_no },
        { key: "PLAN_MONITORING_WALLET", value: "usdt_wallet_123" },
        { key: "PLAN_EXTRA_WALLET", value: "external_wallet" },
        { key: "SKIP", value: "1" }
      ]
    }
  });
  merchant = merchant.toJSON();

  //console.log("ENV.user1:", ENV.user2);

  await db.account.update(
    { balance: 100000 },
    { where: { acc_no: ENV.user2.accounts[1].acc_no } }
  );

  await db.account_crypto.create({
    acc_no: ENV.user2.accounts[1].acc_no,
    address: "external_wallet",
    abbr: "USDT"
  });

  plan = await db.accounts_plan.create({
    name: "full workflow",
    items: {
      _arr: [
        {
          descript: "Source account",
          acc_no: "$PLAN_SOURCE_EUR",
          currency: "EUR",
          tag: "src",
          method: "account-service/testCheckBalance"
        },
        {
          descript: "Skipped",
          acc_no: ENV.USDT_ACCOUNT,
          currency: "USDT",
          condition: "$SKIP!='1'", // по условиям этот шаг не должен быть выполнен
          tag: "skipped",
          method: "ccoin-service/exchange"
        },

        {
          descript: "Exchange",
          acc_no: ENV.USDT_ACCOUNT,
          currency: "USDT",
          tag: "exchange",
          condition: "$SKIP=='1'",
          method: "ccoin-service/exchange"
        },
        {
          descript: "Nil to SK",
          acc_no: ENV.USDT_ACCOUNT,
          currency: "USDT",
          tag: "sk",
          method: "ccoin-service/nil2sk"
        },
        {
          descript: "SK to Monitoring",
          acc_no: "$PLAN_MONITORING_ACC",
          currency: "USDT",
          tag: "monitor",
          extra: "$PLAN_MONITORING_WALLET",
          method: "ccoin-service/sk2monitoring"
        },
        {
          descript: "Monitoring to external",
          acc_no: ENV.USDT_ACCOUNT,
          currency: "USDT",
          tag: "external",
          extra: "$PLAN_EXTRA_WALLET",
          method: "ccoin-service/monitoring2external"
        }
      ]
    }
  });

  manual_transfer_plan = await db.accounts_plan.create({
    name: "Manual transfer USDT",
    description: "manualtransfer",
    items: {
      _arr: [
        {
          id: "extModel10780-1",
          descript: "Src",
          acc_no: ENV.USDT_ACCOUNT,
          currency: "USDT",
          tag: "",
          extra: "",
          method: ""
        },
        {
          id: "extModel10780-2",
          descript: "Deposit",
          acc_no: "$MONITOR_ACC_USDT",
          currency: "USDT",
          tag: "",
          extra: "$FROM_USDT_ADDR",
          method: ""
        },
        {
          id: "extModel10780-3",
          descript: "Withdrawal",
          acc_no: ENV.USDT_ACCOUNT,
          currency: "USDT",
          tag: "",
          extra: "$TO_USDT_ADDR",
          method: "ccoin-service/monitoring2external"
        }
      ]
    }
  });

  swap_plan = await db.accounts_plan.create({
    name: "Swap USTR -> USDT",
    description: "swap",
    items: {
      _arr: [
        {
          id: "extModel1734-1",
          descript: "Source",
          acc_no: ENV.USDT_ACCOUNT,
          currency: "USTR",
          tag: "",
          extra: "",
          method: ""
        },
        {
          id: "extModel324-1",
          descript: "Exchange",
          acc_no: "$MONITOR_ACC_USTR",
          currency: "USTR",
          tag: "",
          extra: "$MONITOR_ADDR_USTR",
          method: ""
        },
        {
          id: "extModel324-2",
          descript: "Sending",
          acc_no: ENV.USDT_ACCOUNT,
          currency: "USDT",
          tag: "",
          extra: "$MONITOR_ADDR_USDT",
          method: "ccoin-service:swap"
        },
        {
          id: "extModel324-3",
          descript: "Deposit",
          acc_no: "$MONITOR_ACC_USDT",
          currency: "USDT",
          tag: "",
          extra: "",
          method: ""
        }
      ]
    }
  });

  chain_transfer_plan = await db.accounts_plan.create({
    name: "Transfer by chain USDT",
    description: "manualtransfer",
    items: {
      _arr: [
        {
          id: "extModel10780-1",
          descript: "Src",
          acc_no: ENV.FROM_CHAIN_USDT_ACCOUNT,
          currency: "USDT",
          tag: "",
          extra: "",
          method: ""
        },
        {
          id: "extModel10780-2",
          descript: "Deposit",
          acc_no: "$MONITOR_ACC_USDT",
          currency: "USDT",
          tag: "",
          extra: "$FROM_USDT_ADDR",
          method: ""
        },
        {
          id: "extModel10780-3",
          descript: "Withdrawal",
          acc_no: ENV.TO_CHAIN_USDT_ACCOUNT,
          currency: "USDT",
          tag: "",
          extra: "$TO_USDT_ADDR",
          method: "ccoin-service/sendViaChain"
        }
      ]
    },
    variables: {
      _arr: [
        {
          id: "extModel15443-1",
          key: "MONITOR_ACC_USDT",
          value: "",
          descript: "Мониторинговый счет USDT"
        },
        {
          id: "extModel11039-2",
          key: "FROM_USDT_ADDR",
          value: "",
          descript: "USDT адрес отправления"
        },
        {
          id: "extModel11039-1",
          key: "TO_USDT_ADDR",
          value: "",
          descript: "USDT адрес получения"
        }
      ]
    }
  });

  await db.merchant_account.create({
    id_merchant: merchant.id,
    id_account: ENV.user2.accounts[2].id
  });
  await db.merchant_account.create({
    id_merchant: merchant.id,
    id_account: ENV.user2.accounts[3].id
  });

  await db.account_crypto.create({
    acc_no: ENV.user2.accounts[2].acc_no,
    address: "test_address_chain_from",
    abbr: ENV.user2.accounts[2].currency
  });

  await db.account_crypto.create({
    acc_no: ENV.user3.accounts[2].acc_no,
    address: "test_address_chain_to",
    abbr: ENV.user3.accounts[2].currency
  });

  await db.order.create({
    merchant: ENV.user2.id,
    contract_id: "f0c750f5-8c16-40ae-aceb-b83df7cce030",
    organisation: merchant.id,
    status: 1,
    removed: 0
  });

  await db.account.create({
    acc_no: "80000000",
    currency: "ETH",
    owner: ENV.user2.id,
    balance: 0,
    status: 1,
    negative: true,
    ctime: new Date(),
    mtime: new Date(),
    removed: 0,
    maker: ENV.realmId
  });
  await db.account.create({
    acc_no: "80000001",
    currency: "USDT",
    owner: ENV.user2.id,
    balance: 0,
    status: 1,
    negative: true,
    ctime: new Date(),
    mtime: new Date(),
    removed: 0,
    maker: ENV.realmId
  });
  await db.account_crypto.create({
    acc_no: "80000000",
    address: "repeatable_address",
    abbr: "ETH"
  });
  await db.account_crypto.create({
    acc_no: "80000001",
    address: "repeatable_address",
    abbr: "USDT"
  });
  return {
    plan,
    merchant,
    manual_transfer_plan,
    swap_plan,
    chain_transfer_plan
  };
}

export default {
  init
};
