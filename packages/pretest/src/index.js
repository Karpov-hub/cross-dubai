import db from "@lib/db";
import Queue from "@lib/queue";
import memstore from "@lib/memstore";

let result = {};

function wait(tm) {
  return new Promise((res, rej) => {
    setTimeout(() => {
      res();
    }, tm);
  });
}

async function before() {
  await db.cryptotx.destroy({ truncate: true, cascade: true });
  await db.account_crypto.destroy({ truncate: true, cascade: true });
  await db.realmaccount.destroy({ truncate: true, cascade: true });
  await db.realm.destroy({ truncate: true, cascade: true });
  await db.user.destroy({ truncate: true, cascade: true });
  await db.currency.destroy({ truncate: true, cascade: true });
  await db.currency_history.destroy({ truncate: true, cascade: true });
  await db.currency_values.destroy({ truncate: true, cascade: true });
  await db.account.destroy({ truncate: true, cascade: true });
  await db.trigger.destroy({ truncate: true, cascade: true });
  await db.tariff.destroy({ truncate: true, cascade: true });
  await db.tariffplan.destroy({ truncate: true, cascade: true });
  await db.transfer.destroy({ truncate: true, cascade: true });
  await db.transaction.destroy({ truncate: true, cascade: true });
  await db.signset.destroy({ truncate: true, cascade: true });
  await db.viewset.destroy({ truncate: true, cascade: true });
  await db.file.destroy({ truncate: true, cascade: true });
  await db.contract.destroy({ truncate: true, cascade: true });
  await db.account_contract.destroy({ truncate: true, cascade: true });
  await db.log.destroy({ truncate: true, cascade: true });
  await db.invoice_template.destroy({ truncate: true, cascade: true });
  await db.withdrawal.destroy({ truncate: true, cascade: true });
  await db.withdrawal_transfer.destroy({ truncate: true, cascade: true });
  await db.currency_rate.destroy({ truncate: true, cascade: true });

  await db.transfers_plan.destroy({ truncate: true, cascade: true });
  await db.accounts_plans_merchant.destroy({ truncate: true, cascade: true });
  await db.accounts_plan.destroy({ truncate: true, cascade: true });

  await db.crypto_wallet.destroy({ truncate: true, cascade: true });
  await db.order.destroy({ truncate: true, cascade: true });
  await db.client_role.destroy({ truncate: true, cascade: true });
  await db.wallet_chain.destroy({ truncate: true, cascade: true });
  await db.merchant.destroy({ truncate: true, cascade: true });
  await db.org_cryptowallet.destroy({ truncate: true, cascade: true });

  await db.settings.bulkCreate([
    { key: "wallet_chain_lifespan_days", value: 21 },
    { key: "wallet_chain_length", value: 2 }
  ]);

  await db.wallet_chain.create({
    wallet_sender: "test_address_chain_from",
    wallet_receiver: "test_address_chain_to",
    lifespan: 1,
    status: db.wallet_chain.STATUSES.ACTIVE,
    wallets: { _arr: ["1", "2", "3"] }
  });

  await db.wallet_chain.create({
    wallet_sender: "test_address_chain_from_cl_4",
    wallet_receiver: "test_address_chain_to_cl_4",
    lifespan: 1,
    status: db.wallet_chain.STATUSES.ACTIVE,
    wallets: { _arr: ["1", "2", "3", "4"] }
  });

  let tp = await db.tariffplan.findOne({});

  let res;
  result.FEE_ACCOUNT = "20000000001";
  result.USDT_ACCOUNT = "101";
  result.EUR_ACCOUNT = "102";
  result.FROM_CHAIN_USDT_ACCOUNT = "103";
  result.TO_CHAIN_USDT_ACCOUNT = "104";

  await db.invoice_template.create({
    name: "New Invoice Template",
    html: `
table(style="width:750px; margin: 0 auto")
    thead
        tr(style="text-align:center")
            td
                h3 INVOICE BE
    tbody
        tr
            td(style="text-align:right")
        tr
            td
                strong BUYER:`,
    ctime: new Date(),
    mtime: new Date(),
    maker: "8ea6ef78-c4a3-11e9-aa8c-2a2ae2dbcce4",
    removed: 0,
    def: true
  });

  const role = await db.client_role.create({
    name: "Non-ad (like Nastya)",
    permissions: {
      _arr: ["Transactions", "Accounts", "All tickets", "User information"]
    },
    other_permissions: {
      _arr: ["allow_transfers", "show_crypto_accounts", "crypto_notifications"]
    },
    is_default: true,
    ctime: new Date(),
    mtime: new Date(),
    maker: "8ea6ef78-c4a3-11e9-aa8c-2a2ae2dbcce4",
    removed: 0
  });

  const bank = await db.bank.create({
    name: "bank",
    shortname: "bnk",
    country: "RU",
    swift: "SWIFT",
    address1: "address1",
    address2: "address2",
    notes: "note",
    corr_bank: "Corr Bank",
    corr_swift: "CORSWIFT",
    corr_acc: "10001"
  });

  let curr_rates = [
    {
      id: "6a1a7c4e-c3b1-463b-9629-4c183ca1fb1b",
      stime: "2021-05-31 11:00:05",
      abbr: "EUR",
      value: 1
    },
    {
      id: "e906bdeb-401e-4193-ba0f-df1902c797d0",
      stime: "2021-05-31 11:00:05",
      abbr: "USDT",
      value: 0.82105
    },
    {
      id: "cdc27cd3-0ca5-422c-a3e6-51c1357995ee",
      stime: "2021-05-31 11:00:05",
      abbr: "ETH",
      value: 2012.1472349999997
    },
    {
      id: "d3667dc0-b3ba-4b89-aea0-b2d2241857fe",
      stime: "2021-05-31 11:00:05",
      abbr: "USD",
      value: 0.8208037588723383
    },
    {
      id: "733b8f74-0833-4ce8-ab7b-93088be54e60",
      stime: "2021-05-31 11:00:05",
      abbr: "BTC",
      value: 29345.9691
    }
  ];

  for (const curr_rate of curr_rates) {
    await db.currency_rate.create(curr_rate);
  }

  // Tariff for inside transferts --------------------
  let triggetId, tariff1, tariff2;
  res = await db.trigger.create({
    service: "account-service",
    method: "realmtransfer",
    name: "On transfer",
    ttype: 1,
    removed: 0,
    ctime: new Date(),
    mtime: new Date()
  });

  await db.viewset.create({
    name: "realms",
    sql: "SELECT * FROM realms"
  });
  await db.viewset.create({
    name: "accounts",
    sql: "SELECT * FROM accounts"
  });

  res = await db.tariff.create({
    trigger: res.get("id"),
    name: "tariff 1",
    description: "test",
    removed: 0,
    data: {
      __conf: {
        Realm: {
          keyfield: "root:realmId",
          collection: "realms",
          field: "id",
          conditions: null
        }
      }
    },
    variables: {
      _arr: [{ key: "FEE_PERCENTS", value: 1 }]
    },
    actions: {
      _arr: [
        {
          type: "transfer",
          name: "Перечислить",
          options: {
            txtype: "transfer",
            parent_id: "root:realmId",
            acc_src: "root:result:acc_src",
            acc_dst: "root:result:acc_dst",
            fee: "100",
            feetype: "PERCENTS",
            hold: true,
            amount_field: "root:result:amount",
            description_src: "transfer to another account",
            description_dst: "incoming transfer from another account"
          }
        },
        {
          type: "transfer",
          name: "Списать фикс",
          options: {
            txtype: "fee",
            parent_id: "root:realmId",
            acc_src: "root:result:acc_src",
            acc_dst: "$FEE_ACCOUNT",
            fee: "$FEE_ABS",
            feetype: "ABS",
            hold: true,
            amount_field: "",
            description_src: "fix fee for inner transfer",
            description_dst: "fix fee"
          }
        },
        {
          type: "transfer",
          name: "Списать проценты",
          options: {
            txtype: "fee",
            parent_id: "root:realmId",
            acc_src: "root:result:acc_src",
            acc_dst: "$FEE_ACCOUNT",
            fee: "$FEE_PERCENTS",
            feetype: "PERCENTS",
            hold: true,
            amount_field: "root:result:amount",
            description_src: "percents fee for inner transfer",
            description_dst: "percents fee"
          }
        },
        {
          type: "error",
          name: "Ошибка: Превышен лимит",
          options: {
            code: "AMOUNTLIMIT"
          }
        },
        {
          type: "message",
          name: "Сообщение: Крупный перевод",
          options: {
            to: "root:Realm:email",
            subject: "Клиент пытается провести крупный перевод",
            text: ""
          }
        }
      ]
    },
    rules: {
      _arr: [
        {
          render_function: null,
          value_field: "root:data:amount",
          ne: false,
          operator: "<=",
          value: "50",
          action: ["Перечислить", "Списать фикс"],
          result: true,
          stop: true
        },
        {
          render_function: null,
          value_field: "",
          ne: false,
          operator: "",
          value: "",
          action: ["Перечислить", "Списать проценты"],
          result: true,
          stop: true
        }
      ]
    }
  });
  result.tariff1 = res.get("id");

  res = await db.trigger.create({
    service: "account-service",
    method: "deposit",
    name: "On deposit",
    ttype: 1,
    removed: 0,
    ctime: new Date(),
    mtime: new Date()
  });
  res = await db.tariff.create({
    trigger: res.get("id"),
    name: "deposit",
    removed: 0,
    description: "on deposit transfer",
    stop_on_rules: true,
    data: {
      __conf: {
        Realm: {
          keyfield: "root:result:owner",
          collection: "realms",
          field: "id",
          conditions: null
        },
        Accounts: {
          keyfield: "root:ref_user",
          collection: "accounts",
          field: "owner",
          conditions: null
        }
      }
    },

    variables: {
      _arr: []
    },
    actions: {
      _arr: [
        {
          type: "transfer",
          name: "Referal payment",
          options: {
            txtype: "referal",
            parent_id: "root:result:owner",
            acc_src: "$FEE_ACCOUNT",
            acc_dst: "root:Accounts:acc_no:0",
            fee: "1",
            feetype: "ABS",
            hold: false,
            amount_field: "",
            description_src: "fix fee for referal",
            description_dst: "fix fee from user for referal"
          }
        },
        {
          type: "transfer",
          name: "Списать 5",
          options: {
            txtype: "fee",
            parent_id: "root:result:owner",
            acc_src: "root:data:acc_no",
            acc_dst: "$FEE_ACCOUNT",
            fee: "5",
            feetype: "ABS",
            hold: false,
            amount_field: "",
            description_src: "fix fee for deposit",
            description_dst: "fix fee from user for deposit"
          }
        },
        {
          type: "transfer",
          name: "Списать 5%",
          options: {
            txtype: "fee",
            parent_id: "root:result:owner",
            acc_src: "root:data:acc_no",
            acc_dst: "$FEE_ACCOUNT",
            fee: "5",
            feetype: "PERCENTS",
            hold: false,
            amount_field: "root:result:amount",
            description_src: "percents fee for deposit",
            description_dst: "percents fee from user for deposit"
          }
        },
        {
          type: "transfer",
          name: "Списать тихо 1%",
          options: {
            txtype: "fee",
            parent_id: "root:result:owner",
            acc_src: "root:data:acc_no",
            acc_dst: "$FEE_ACCOUNT",
            fee: "1",
            feetype: "ABS",
            hold: false,
            hidden: true,
            amount_field: "root:result:amount",
            description_src: "percents fee for deposit",
            description_dst: "percents fee from user for deposit"
          }
        },
        {
          type: "transfer",
          name: "Перечислить",
          options: {
            txtype: "transfer",
            parent_id: "root:result:owner",
            acc_src: "root:result:acc_src",
            acc_dst: "root:result:acc_dst",
            fee: "100",
            feetype: "PERCENTS",
            hold: false,
            amount_field: "root:result:amount",
            description_src: "deposit client's money",
            description_dst: "deposit self money"
          }
        }
      ]
    },
    rules: {
      _arr: [
        {
          render_function: null,
          value_field: "root:result:transfer_type",
          ne: true,
          operator: "=",
          value: "'deposit'",
          action: [],
          result: false,
          stop: true
        },
        {
          render_function: null,
          value_field: "root:ref_user",
          ne: true,
          operator: "empty",
          value: "null",
          action: ["Referal payment"],
          result: true,
          stop: false
        },
        {
          render_function: null,
          value_field: "root:result:amount",
          ne: false,
          operator: "<=",
          value: "100",
          action: ["Перечислить", "Списать 5", "Списать тихо 1%"],
          result: true,
          stop: true
        },
        {
          render_function: null,
          value_field: "",
          ne: false,
          operator: "",
          value: "",
          action: ["Перечислить", "Списать 5%"],
          result: true,
          stop: true
        }
      ]
    }
  });
  result.tariff2 = res.dataValues.id;

  // res = await db.trigger.create({
  //   service: "account-service",
  //   method: "withdrawal",
  //   name: "On withdrawal",
  //   ttype: 1,
  //   ctime: new Date(),
  //   mtime: new Date(),
  //   removed: 0
  // });
  // res = await db.tariff.create({
  //   trigger: res.get("id"),
  //   name: "withdrawal",
  //   description: "on withdrawal transfer",
  //   stop_on_rules: true,
  //   removed: 0,
  //   data: {
  //     __conf: {
  //       Realm: {
  //         keyfield: "root:data:owner",
  //         collection: "realms",
  //         field: "id",
  //         conditions: null
  //       }
  //     }
  //   },
  //   variables: {
  //     _arr: [{ key: "FEE_ACCOUNT", value: result.FEE_ACCOUNT }]
  //   },
  //   actions: {
  //     _arr: [
  //       {
  //         type: "transfer",
  //         name: "Списать 1",
  //         options: {
  //           txtype: "fee",
  //           parent_id: "root:result:owner",
  //           acc_src: "root:data:acc_no",
  //           acc_dst: "$FEE_ACCOUNT",
  //           fee: "1",
  //           feetype: "ABS",
  //           hold: false,
  //           amount_field: "",
  //           description_src: "withdrawal money",
  //           description_dst: "withdrawal client's money"
  //         }
  //       },
  //       {
  //         type: "transfer",
  //         name: "Перечислить",
  //         options: {
  //           txtype: "transfer",
  //           parent_id: "root:result:owner",
  //           acc_src: "root:result:acc_src",
  //           acc_dst: "root:result:acc_dst",
  //           fee: "100",
  //           feetype: "PERCENTS",
  //           hold: false,
  //           amount_field: "root:result:amount",
  //           description_src: "fix fee for  money",
  //           description_dst: "deposit client's money"
  //         }
  //       }
  //     ]
  //   },
  //   rules: {
  //     _arr: [
  //       {
  //         render_function: null,
  //         value_field: "",
  //         ne: false,
  //         operator: "",
  //         value: "",
  //         action: ["Перечислить", "Списать 1"],
  //         result: true,
  //         stop: true
  //       }
  //     ]
  //   }
  // });
  // result.tariff3 = res.dataValues.id;

  res = await db.trigger.create({
    service: "account-service",
    method: "refund",
    name: "On refund",
    ttype: 1,
    removed: 0,
    ctime: new Date(),
    mtime: new Date()
  });
  res = await db.tariff.create({
    trigger: res.get("id"),
    name: "refund",
    removed: 0,
    description: "on deposit refund",
    stop_on_rules: true,
    data: {
      __conf: {
        Realm: {
          keyfield: "root:data:owner",
          collection: "realms",
          field: "id",
          conditions: null
        }
      }
    },
    variables: {
      _arr: []
    },
    actions: {
      _arr: [
        {
          type: "transfer",
          name: "Штраф",
          options: {
            txtype: "fine",
            parent_id: "root:result:owner",
            acc_src: "root:result:acc_dst",
            acc_dst: "$FEE_ACCOUNT",
            fee: "20",
            feetype: "PERCENTS",
            hold: false,
            amount_field: "root:result:amount",
            description_src: "штраф",
            description_dst: "штраф"
          }
        },
        {
          type: "transfer",
          name: "Вернуть",
          options: {
            txtype: "refund",
            parent_id: "root:result:owner",
            acc_src: "root:result:acc_src",
            acc_dst: "root:result:acc_dst",
            fee: "100",
            feetype: "PERCENTS",
            hold: false,
            amount_field: "root:result:amount",
            description_src: "refund money",
            description_dst: "refund money"
          }
        }
      ]
    },
    rules: {
      _arr: [
        {
          render_function: null,
          value_field: "",
          ne: false,
          operator: "=",
          value: "",
          action: ["Вернуть", "Штраф"],
          result: true,
          stop: true
        }
      ]
    }
  });
  result.tariff4 = res.dataValues.id;

  res = await db.trigger.create({
    service: "account-service",
    method: "proxyTransfer",
    name: "On proxy transfer",
    ttype: 1,
    ctime: new Date(),
    mtime: new Date(),
    removed: 0
  });
  res = await db.tariff.create({
    trigger: res.get("id"),
    name: "proxy transfer",
    description: "on proxy transfer",
    stop_on_rules: true,
    removed: 0,
    data: {
      __conf: {
        Realm: {
          keyfield: "root:result:owner",
          collection: "realms",
          field: "id",
          conditions: null
        }
      }
    },
    variables: {
      _arr: []
    },
    actions: {
      _arr: [
        {
          type: "transfer",
          name: "deposit",
          options: {
            txtype: "transfer",
            parent_id: "root:result:user:id",
            acc_src: "root:result:tech_acc_deposit:account:acc_no",
            acc_dst: "root:result:acc_no",
            fee: "100",
            feetype: "PERCENTS",
            hold: true,
            amount_field: "root:data:amount",
            description_src: "deposit money",
            description_dst: "deposit money"
          }
        },
        {
          type: "transfer",
          name: "fee",
          options: {
            txtype: "fee",
            parent_id: "root:result:user:id",
            acc_src: "root:result:acc_no",
            acc_dst: "$FEE_ACCOUNT",
            fee: "1",
            feetype: "PERCENTS",
            hold: true,
            amount_field: "root:data:amount",
            description_src: "1% fee",
            description_dst: "1% fee"
          }
        },
        {
          type: "transfer",
          name: "withdrawal",
          options: {
            txtype: "transfer",
            parent_id: "root:result:user:id",
            acc_src: "root:result:acc_no",
            acc_dst: "root:result:tech_acc_withdrawal:account:acc_no",
            fee: "99",
            feetype: "PERCENTS",
            hold: true,
            amount_field: "root:data:amount",
            description_src: "withdrawal",
            description_dst: "withdrawal"
          }
        }
      ]
    },
    rules: {
      _arr: [
        {
          render_function: null,
          value_field: "",
          ne: false,
          operator: "",
          value: "",
          action: ["deposit", "fee", "withdrawal"],
          result: true,
          stop: true
        }
      ]
    }
  });

  result.tariff5 = res.id;

  // deposit for crypto
  res = await db.trigger.create({
    service: "ccoin-service",
    method: "deposit",
    name: "On deposit",
    ttype: 1,
    removed: 0,
    ctime: new Date(),
    mtime: new Date()
  });

  let depositTrigger = res.get("id");

  res = await db.tariff.create({
    trigger: depositTrigger,
    name: "crypto deposit",
    removed: 0,
    description: "on deposit confirmation",
    stop_on_rules: true,
    data: {
      __conf: {
        Realm: {
          keyfield: "root:result:owner",
          collection: "realms",
          field: "id",
          conditions: null
        },
        Accounts: {
          keyfield: "root:ref_user",
          collection: "accounts",
          field: "owner",
          conditions: null
        }
      }
    },

    variables: {
      _arr: []
    },
    actions: {
      _arr: [
        {
          type: "transfer",
          name: "Списать 5",
          options: {
            txtype: "fee",
            parent_id: "root:result:owner",
            acc_src: "root:result:acc_dst",
            acc_dst: "$FEE_ACCOUNT",
            fee: "5",
            feetype: "PERCENTS",
            hold: false,
            amount_field: "root:result:amount",
            description_src: "fix fee for deposit",
            description_dst: "fix fee from user for deposit"
          }
        },
        {
          type: "transfer",
          name: "Перечислить",
          options: {
            txtype: "transfer",
            parent_id: "root:result:owner",
            acc_src: "root:result:acc_src",
            acc_dst: "root:result:acc_dst",
            fee: "100",
            feetype: "PERCENTS",
            hold: false,
            amount_field: "root:result:amount",
            description_src: "deposit client's money",
            description_dst: "deposit self money"
          }
        }
      ]
    },
    rules: {
      _arr: [
        {
          render_function: null,
          value_field: "root:result:action",
          ne: true,
          operator: "=",
          value: "'deposit'",
          action: ["Перечислить", "Списать 5"],
          result: true,
          stop: true
        }
      ]
    }
  });
  result.tariff6 = res.dataValues.id;

  // withdrawal for crypto
  res = await db.trigger.create({
    service: "account-service",
    method: "withdrawalCustomExchangeRate",
    name: "On withdrawal",
    ttype: 1,
    removed: 0,
    ctime: new Date(),
    mtime: new Date()
  });

  res = await db.tariff.create({
    trigger: res.get("id"),
    name: "crypto withdrawal",
    removed: 0,
    description: "on withdrawal",
    stop_on_rules: true,
    data: {
      __conf: {
        Realm: {
          keyfield: "root:result:owner",
          collection: "realms",
          field: "id",
          conditions: null
        },
        Accounts: {
          keyfield: "root:ref_user",
          collection: "accounts",
          field: "owner",
          conditions: null
        }
      }
    },

    variables: {
      _arr: []
    },
    actions: {
      _arr: [
        {
          type: "transfer",
          name: "Перечислить",
          options: {
            txtype: "transfer",
            parent_id: "root:result:owner",
            acc_src: "root:result:acc_src",
            acc_dst: "root:result:acc_dst",
            fee: "99",
            feetype: "PERCENTS",
            hold: true,
            amount_field: "root:result:amount",
            description_src: "deposit client's money",
            description_dst: "deposit self money"
          }
        },
        {
          type: "transfer",
          name: "Комиссия",
          options: {
            txtype: "fee",
            parent_id: "root:result:owner",
            acc_src: "root:result:acc_dst",
            acc_dst: "$FEE_ACCOUNT",
            fee: "$FEE_ABS_WD",
            feetype: "PERCENTS",
            hold: true,
            amount_field: "root:result:amount",
            description_src: "fee",
            description_dst: "fee"
          }
        },
        {
          type: "transfer",
          name: "Tax",
          options: {
            txtype: "tax",
            parent_id: "root:result:owner",
            acc_src: "root:result:acc_dst",
            acc_dst: "$FEE_ACCOUNT",
            fee: "5",
            feetype: "ABS",
            currency: "src",
            hold: true,
            amount_field: "",
            description_src: "tax",
            description_dst: "tax"
          }
        }
      ]
    },
    rules: {
      _arr: [
        {
          render_function: null,
          value_field: "",
          ne: false,
          operator: "",
          value: "",
          action: ["Перечислить", "Комиссия", "Tax"],
          result: true,
          stop: true
        }
      ]
    }
  });
  result.tariff7 = res.dataValues.id;

  // Complete for crypto
  res = await db.trigger.create({
    service: "ccoin-service",
    method: "completeTransfer",
    name: "On crypto complete",
    ttype: 1,
    removed: 0,
    ctime: new Date(),
    mtime: new Date()
  });

  let triggerId = res.get("id");

  res = await db.tariff.create({
    trigger: triggerId,
    name: "crypto complete",
    removed: 0,
    description: "on complete",
    stop_on_rules: true,
    data: {
      __conf: {
        Realm: {
          keyfield: "root:result:owner",
          collection: "realms",
          field: "id",
          conditions: null
        },
        Accounts: {
          keyfield: "root:ref_user",
          collection: "accounts",
          field: "owner",
          conditions: null
        }
      }
    },

    variables: {
      _arr: []
    },
    actions: {
      _arr: [
        {
          type: "transfer",
          name: "Сохранить комиссию",
          options: {
            txtype: "fee",
            parent_id: "root:result:transfer_id",
            acc_src: "20000000001",
            acc_dst: "20000000001",
            fee: "root:result:amount_fee",
            feetype: "ABS",
            currency: "src",
            hold: true,
            amount_field: "",
            description_src: "",
            description_dst: ""
          }
        }
      ]
    },
    rules: {
      _arr: [
        {
          render_function: null,
          value_field: "root:result:action",
          ne: true,
          operator: "=",
          value: "'deposit'",
          action: ["Сохранить комиссию"],
          result: true,
          stop: true
        }
      ]
    }
  });
  result.tariff8 = res.dataValues.id;

  res = await db.tariff.create({
    trigger: depositTrigger,
    name: "crypto deposit",
    removed: 0,
    description: "on complete",
    stop_on_rules: true,
    data: {
      __conf: {
        Realm: {
          keyfield: "root:result:owner",
          collection: "realms",
          field: "id",
          conditions: null
        },
        Accounts: {
          keyfield: "root:ref_user",
          collection: "accounts",
          field: "owner",
          conditions: null
        }
      }
    },

    variables: {
      _arr: []
    },
    actions: {
      _arr: [
        {
          type: "transfer",
          name: "Зачисление крипты",
          options: {
            txtype: "transfer",
            parent_id: "root:result:ref_id",
            acc_src: "20000000001",
            acc_dst: "root:result:acc_monitor",
            fee: "100",
            feetype: "PERCENTS",
            hold: false,
            amount_field: "root:result:amount",
            description_src: "",
            description_dst: ""
          }
        }
      ]
    },
    rules: {
      _arr: [
        {
          render_function: null,
          value_field: "root:result:action",
          ne: false,
          operator: "=",
          value: "'deposit'",
          action: ["Зачисление крипты"],
          result: true,
          stop: true
        }
      ]
    }
  });
  result.tariff9 = res.dataValues.id;

  // Complete for crypto
  res = await db.trigger.create({
    service: "account-service",
    method: "doPipe",
    name: "accounts plan pipeline",
    ttype: 1,
    removed: 0,
    ctime: new Date(),
    mtime: new Date()
  });

  triggerId = res.get("id");

  res = await db.tariff.create({
    trigger: triggerId,
    name: "crypto deposit",
    removed: 0,
    description: "on complete",
    stop_on_rules: true,
    data: {
      __conf: {
        Realm: {
          keyfield: "root:result:owner",
          collection: "realms",
          field: "id",
          conditions: null
        },
        Accounts: {
          keyfield: "root:ref_user",
          collection: "accounts",
          field: "owner",
          conditions: null
        }
      }
    },

    variables: {
      _arr: []
    },
    actions: {
      _arr: [
        {
          type: "transfer",
          name: "97%",
          options: {
            txtype: "transfer",
            parent_id: "root:result:ref_id",
            acc_src: "root:result:acc_src",
            acc_dst: "root:result:acc_dst",
            fee: "97",
            feetype: "PERCENTS",
            hold: true,
            amount_field: "root:result:amount",
            description_src: "",
            description_dst: ""
          }
        },
        {
          type: "fee",
          name: "3%",
          options: {
            txtype: "fee",
            parent_id: "root:result:ref_id",
            acc_src: "root:result:acc_src",
            acc_dst: "$FEE_ACCOUNT",
            fee: "3",
            feetype: "PERCENTS",
            hold: true,
            amount_field: "root:result:amount",
            description_src: "",
            description_dst: ""
          }
        },
        {
          type: "transfer",
          name: "100%",
          options: {
            txtype: "transfer",
            parent_id: "root:result:ref_id",
            acc_src: "root:result:acc_src",
            acc_dst: "root:result:acc_dst",
            fee: "100",
            feetype: "PERCENTS",
            hold: true,
            amount_field: "root:result:amount",
            description_src: "",
            description_dst: ""
          }
        },
        {
          type: "message",
          name: "Notify via email",
          options: {
            to: "'ae110@tadbox.com'",
            subject: "123",
            channel: "email",
            tpl: "test-notify"
          }
        },
        {
          type: "message",
          name: "Notify via sms",
          options: {
            to: "'89023871487'",
            subject: "123",
            channel: "sms",
            tpl: "test-notify"
          }
        },
        {
          type: "message",
          name: "Notify via telegram",
          options: {
            to: "root:result:ref_id",
            subject: "123",
            channel: "telegram",
            tpl: "test-notify"
          }
        }
      ]
    },
    rules: {
      _arr: [
        {
          id: "extModel11958-1",
          render_function: null,
          value_field: "root:data:plan:description",
          ne: false,
          operator: "=",
          value: "'manualtransfer'",
          action: [],
          result: false,
          stop: true
        },
        {
          render_function: null,
          value_field: "root:result:tag",
          ne: false,
          operator: "=",
          value: "'exchange'",
          action: [
            "97%",
            "3%",
            "Notify via email",
            "Notify via sms",
            "Notify via telegram"
          ],
          result: true,
          stop: true
        },
        {
          render_function: null,
          value_field: "root:result:tag",
          ne: true,
          operator: "=",
          value: "'exchange'",
          action: ["100%"],
          result: true,
          stop: true
        }
      ]
    }
  });
  result.tariff10 = res.dataValues.id;

  res = await db.tariff.create({
    trigger: triggerId,
    name: "Direct payment",
    removed: 0,
    stop_on_rules: false,
    data: {
      trigger: "account-service:doPipe",
      variables: {},
      data: {
        ref_id: "7ad0330b-c3d4-42f2-89b0-a0e4bf511139",
        merchant_id: "5ce0b6ea-47be-4780-bff5-0a99461daae1",
        merchant: "5ce0b6ea-47be-4780-bff5-0a99461daae1",
        organisation_name: "WCN",
        pipeline: "6a09cb34-d90d-43b0-bafd-ac5dad4d90cf",
        plan: {
          name: "Withdrawal EUR->USDT (direct without NIL)",
          description: "withoutnil"
        },
        amount: "5"
      },
      ref_user: null,
      transfers: {
        service: "account-service",
        method: "doPipe",
        data: {
          ref_id: "7ad0330b-c3d4-42f2-89b0-a0e4bf511139",
          merchant_id: "5ce0b6ea-47be-4780-bff5-0a99461daae1",
          merchant: "5ce0b6ea-47be-4780-bff5-0a99461daae1",
          organisation_name: "WCN",
          pipeline: "6a09cb34-d90d-43b0-bafd-ac5dad4d90cf",
          plan: {
            name: "Withdrawal EUR->USDT (direct without NIL)",
            description: "withoutnil"
          },
          amount: "5"
        },
        list: {},
        tags: {},
        output: {}
      },
      result: {
        ref_id: "7ad0330b-c3d4-42f2-89b0-a0e4bf511139",
        user_id: "d67e7af0-726b-4764-a88f-a205478870f0",
        acc_src: "9154146387387103157",
        acc_dst: "902",
        amount: "5",
        tag: "exchange",
        step: 0,
        extra: "0.91752",
        prevData: {},
        variables: {
          id: "extModel6106-7",
          key: "SRC_ACC_EUR",
          value: "9154146387387103157",
          descript: "Счет EUR"
        },
        plan: {
          id: "extModel1648-1",
          descript: "Source account",
          acc_no: "9154146387387103157",
          currency: "EUR",
          tag: "src",
          extra: "",
          method: ""
        }
      }
    },
    variables: {
      _arr: [
        {
          id: "extModel4385-3",
          key: "TO_USDC_ADDR",
          value: "",
          descript: "Воллет-получатель USDC"
        },
        {
          id: "extModel4385-2",
          key: "FROM_USDC_ADDR",
          value: "",
          descript: "Воллет-отправитель USDC"
        },
        {
          id: "extModel4385-1",
          key: "MONITOR_ACC_USDC",
          value: "",
          descript: "Счет USDC"
        },
        {
          id: "extModel3743-3",
          key: "TO_ETH_ADDR",
          value: "",
          descript: "Воллет-получатель ETH"
        },
        {
          id: "extModel3743-2",
          key: "FROM_ETH_ADDR",
          value: "",
          descript: "Воллет-отправитель ETH"
        },
        {
          id: "extModel3743-1",
          key: "MONITOR_ACC_ETH",
          value: "",
          descript: "Счет ETH"
        },
        {
          id: "extModel2926-1",
          key: "FROM_BTC_ADDR",
          value: "",
          descript: "BTC адрес отправления"
        }
      ]
    },
    actions: {
      _arr: [
        {
          type: "transfer",
          name: "100%",
          options: {
            txtype: "transfer",
            parent_id: "root:data:ref_id",
            acc_src: "root:result:acc_src",
            acc_dst: "root:result:acc_dst",
            fee: "100",
            currency: null,
            feetype: "PERCENTS",
            amount_field: "root:data:amount",
            hold: false,
            hidden: false,
            description_src: "Transfer",
            description_dst: "Transfer"
          },
          id: "extModel12335-1"
        },
        {
          type: "transfer",
          name: "100%h",
          options: {
            txtype: "transfer",
            parent_id: "root:data:ref_id",
            acc_src: "root:result:acc_src",
            acc_dst: "root:result:acc_dst",
            fee: "100",
            currency: null,
            feetype: "PERCENTS",
            amount_field: "root:data:amount",
            hold: true,
            hidden: false,
            description_src: "transfer",
            description_dst: "transfer"
          },
          id: "extModel12649-1"
        }
      ]
    },
    rules: {
      _arr: [
        {
          id: "extModel11958-1",
          render_function: null,
          value_field: "root:data:plan:description",
          ne: true,
          operator: "=",
          value: "'manualtransfer'",
          action: [],
          result: false,
          stop: true
        },
        {
          id: "extModel12682-1",
          render_function: null,
          value_field: "root:result:step",
          ne: false,
          operator: "=",
          value: "0",
          action: ["100%"],
          result: true,
          stop: true
        },
        {
          id: "extModel12682-2",
          render_function: null,
          value_field: "",
          ne: false,
          operator: "=",
          value: "",
          action: ["100%h"],
          result: true,
          stop: true
        }
      ]
    }
  });
  result.tariff11 = res.dataValues.id;

  res = await db.tariffplan.create({
    name: "testplan",
    removed: 0,
    tariffs: {
      _arr: [
        result.tariff1,
        result.tariff2,
        result.tariff3,
        result.tariff4,
        result.tariff5,
        result.tariff6,
        result.tariff7,
        result.tariff8,
        result.tariff9,
        result.tariff10,
        result.tariff11
      ]
    },
    variables: {
      _arr: [
        { key: "FEE_PERCENTS", value: 15 },
        { key: "FEE_ACCOUNT", value: result.FEE_ACCOUNT },
        { key: "FEE_ABS_WD", value: 1 },
        { key: "FEE_ABS", value: 2 },
        {
          id: "extModel551-1",
          key: "MAIL_VERIFY_LINK",
          value: "verify-link",
          descript: "Подтверждение почты",
          type: "select",
          values: ["email", "sms", "telegram"]
        }
      ]
    }
  });

  result.planId = res.dataValues.id;

  res = await db.realm.create({
    tariff: result.planId,
    removed: 0,
    name: "Test realm",
    host: "test.host",
    cors: { _arr: [{ option: "origin", value: "*" }] },
    variables: { _arr: [{ key: "FEE_ABS", value: 4 }] },
    permissions: {
      "auth-service": {
        signup: true,
        signin: true,
        getCaptcha: true,
        checkOtp: true
      },
      "account-service": {
        getAllBalance: true,
        create: true,
        remove: true,
        block: true,
        withdrawal: true,
        deposit: true,
        realmtransfer: true
      }
    }
  });

  result.realmId = res.get("id");

  res = await db.realm.create({
    tariff: result.planId,
    removed: 0,
    name: "Test realm",
    host: "test.host",
    cors: { _arr: [{ option: "origin", value: "*" }] },
    variables: { _arr: [{ key: "FEE_ABS", value: 4 }] },
    permissions: {
      "auth-service": {
        signup: true,
        signin: true,
        getCaptcha: true,
        checkOtp: true
      }
    }
  });

  result.childRealmId = res.get("id");

  const iban = await db.iban.create({
    bank_id: bank.id,
    iban: "20002",
    currency: "USD",
    owner: result.realmId,
    notes: "iban note"
  });

  // INIT fee account

  res = await db.account.create({
    acc_no: result.FEE_ACCOUNT,
    currency: "USD",
    owner: result.realmId,
    balance: 0,
    status: 1,
    negative: true,
    ctime: new Date(),
    mtime: new Date(),
    removed: 0,
    maker: result.realmId
  });

  res = await db.account.create({
    acc_no: result.USDT_ACCOUNT,
    currency: "USDT",
    owner: result.realmId,
    balance: 0,
    status: 1,
    negative: true,
    ctime: new Date(),
    mtime: new Date(),
    removed: 0,
    maker: result.realmId
  });

  res = await db.account.create({
    acc_no: result.FROM_CHAIN_USDT_ACCOUNT,
    currency: "USDT",
    owner: result.realmId,
    balance: 0,
    status: 1,
    negative: true,
    ctime: new Date(),
    mtime: new Date(),
    removed: 0,
    maker: result.realmId
  });
  res = await db.account.create({
    acc_no: result.TO_CHAIN_USDT_ACCOUNT,
    currency: "USDT",
    owner: result.realmId,
    balance: 0,
    status: 1,
    negative: true,
    ctime: new Date(),
    mtime: new Date(),
    removed: 0,
    maker: result.realmId
  });

  res = await db.account.create({
    acc_no: result.EUR_ACCOUNT,
    currency: "EUR",
    owner: result.realmId,
    balance: 0,
    status: 1,
    negative: true,
    ctime: new Date(),
    mtime: new Date(),
    removed: 0,
    maker: result.realmId
  });

  // INIT currency
  await db.currency.create({
    abbr: "USD",
    code: 840,
    name: "USDollar"
  });

  await db.currency.create({
    abbr: "EUR",
    code: 978,
    name: "Euro"
  });

  await db.currency.create({
    abbr: "BTC",
    code: 0,
    name: "Bitcoin",
    crypto: true,
    api: "http://localhost:8010/coin/",
    provider_address: "btc111"
  });

  await db.currency.create({
    abbr: "USDT",
    code: 0,
    name: "USDT",
    crypto: true,
    api: "http://localhost:8010/coin/",
    provider_address: "usdt111"
  });

  await db.currency.create({
    abbr: "TRX",
    code: 0,
    name: "TRX",
    crypto: true,
    api: "http://localhost:8010/coin/",
    provider_address: "trxs111"
  });

  await db.currency.create({
    abbr: "USTR",
    code: 0,
    name: "USTR",
    crypto: true,
    api: "http://localhost:8010/coin/",
    provider_address: "ustr111"
  });

  await db.account.create({
    acc_no: "8186108362",
    currency: "BTC",
    owner: result.realmId,
    balance: 0.0003,
    status: 1,
    negative: false,
    ctime: new Date(),
    mtime: new Date(),
    removed: 0,
    maker: result.realmId
  });

  res = await db.currency_history.create({
    realms: { _arr: [result.realmId] },
    name: "test",
    ctime: new Date(),
    mtime: new Date(),
    removed: 0,
    active: true
  });

  await db.currency_values.create({
    pid: res.dataValues.id,
    amount: 0,
    value: 1,
    abbr: "USD"
  });
  await db.currency_values.create({
    pid: res.dataValues.id,
    amount: 0,
    value: 2,
    abbr: "EUR"
  });
  await db.currency_values.create({
    pid: res.dataValues.id,
    amount: 0,
    value: 1,
    abbr: "BTC",
    crypto: true
  });
  await db.currency_values.create({
    pid: res.dataValues.id,
    amount: 0,
    value: 0.8,
    abbr: "USDT",
    crypto: true
  });

  let acc_no = 1000001;
  let wallet_num = 10000;
  // INIT users
  const initUser = async (
    tariff,
    variables,
    currencies,
    last_name,
    first_name,
    login
  ) => {
    let user = await db.user.create({
      login,
      email: login,
      pass: "50c3523e8730624aa305cd937bfae919ba5aa08b",
      tariff,
      first_name,
      last_name,
      removed: 0,
      otp_transport: "test",
      realm: result.realmId,
      variables: { _arr: variables },
      kyc: true,
      phone: "89659697965",
      role: role.get("id")
    });
    user.accounts = [];
    for (let currency of currencies) {
      let account = await db.account.create({
        acc_no: "" + acc_no++,
        currency,
        owner: user.id,
        balance: 0,
        status: 1,
        active: "1",
        ctime: new Date(),
        mtime: new Date(),
        removed: 0,
        negative: false,
        maker: result.realmId
      });
      user.accounts.push(account.toJSON());
    }
    let wallet = await db.crypto_wallet.create({
      num: wallet_num++,
      user_id: user.id,
      curr_name: "USDT"
    });
    user.wallet = [wallet.toJSON()];

    return user;
  };

  result.user1 = await initUser(
    result.planId,
    [{ key: "EXCHANGE_FEE", value: 2 }],
    ["USD", "BTC", "USDT"],
    "Ivanov",
    "Ivan",
    "testuser@user.com"
  );
  result.user2 = await initUser(
    result.planId,
    [],
    ["USD", "EUR", "USDT", "USTR"],
    "Petrov",
    "Petr",
    "testuser2@user.com"
  );
  result.user3 = await initUser(
    result.planId,
    [
      {
        id: "extModel559-1",
        key: "MAIL_VERIFY_LINK",
        value: "email",
        type: "select",
        values: ["email", "sms", "telegram"],
        descript: "Подтверждение почты"
      }
    ],
    ["USD", "EUR", "USDT"],
    "Yalex",
    "Yalex",
    "testuser3@user.com"
  );
  result.user4 = await initUser(
    result.planId,
    [],
    ["USD", "EUR", "USDT"],
    "Peter",
    "Grifin",
    "testuser4@user.com"
  );

  let acc_no_r = 30000001;

  // INIT realm tech accounts
  const realmAccInit = async (
    type,
    currency,
    country,
    details,
    callbackUrl
  ) => {
    const acc_no = "" + acc_no_r++;
    const account = await db.account.create({
      acc_no,
      currency,
      owner: result.realmId,
      balance: 0,
      status: 1,
      negative: true,
      ctime: new Date(),
      mtime: new Date(),
      removed: 0,
      maker: result.realmId
    });

    let dd = {
      realm_id: result.realmId,
      account_id: account.id,
      iban_id: iban.id,
      type,
      details,
      country,
      callback: callbackUrl,
      removed: 0
    };

    let realmAcc = await db.realmaccount.create(dd);

    result.realmDepartment = await db.realmdepartment.create({
      realm: result.realmId,
      name: "Cooperman Invest",
      status: "Active",
      removed: 0,
      realm_acc: realmAcc.id
    });

    return acc_no;
  };

  result.ACC_DEPOSIT_USD = await realmAccInit(
    1,
    "USD",
    "UK",
    "DEPOSIT OPERATION BANK DETAILS in USD"
  );
  result.ACC_WITHDRAWAL_USD = await realmAccInit(
    2,
    "USD",
    "UK",
    "Withdrawal OPERATION BANK DETAILS in USD",
    "http://localhost:8010"
  );

  result.ACC_DEPOSIT_USD = await realmAccInit(
    1,
    "USDT",
    "UK",
    "DEPOSIT OPERATION BANK DETAILS in USDT"
  );
  result.ACC_WITHDRAWAL_USD = await realmAccInit(
    2,
    "USDT",
    "UK",
    "Withdrawal OPERATION BANK DETAILS in USDT",
    "http://localhost:8010"
  );

  result.ACC_DEPOSIT_EUR = await realmAccInit(
    1,
    "EUD",
    "UK",
    "DEPOSIT OPERATION BANK DETAILS in EUD"
  );
  result.ACC_WITHDRAWAL_EUR = await realmAccInit(
    2,
    "EUR",
    "UK",
    "Withdrawal OPERATION BANK DETAILS in EUR",
    "http://localhost:8010"
  );
  result.ACC_DEPOSIT_BTC = await realmAccInit(
    1,
    "BTC",
    "UK",
    "DEPOSIT OPERATION BANK DETAILS in BTC"
  );
  result.ACC_WITHDRAWAL_BTC = await realmAccInit(
    2,
    "BTC",
    "UK",
    "Withdrawal OPERATION BANK DETAILS in BTC",
    "http://localhost:8010"
  );
  result.ACC_DEPOSIT_BTC = await realmAccInit(
    1,
    "BTC",
    "UK",
    "DEPOSIT OPERATION IN BTC"
  );

  await db.bank.create({
    name: "bank1",
    country: "AF",
    swift: "qwe",
    active: false,
    maker: result.realmId
  });

  let admin = await db.admin_user.findOne({ where: { login: "yeti" } });

  // console.log("admin:", admin);

  await db.signset.create({
    realm: result.realmId,
    module: "Crm-modules-accountHolders-model-UsersModel",
    priority: { _arr: [{ group: null, user: admin._id, flow: "AMG" }] }
  });
  await Queue.broadcastJob("updateViews", {}, 1000);
  //await wait(500);

  return result;
}

async function after() {}

export default {
  before,
  after,
  wait
};
