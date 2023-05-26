import account from "./account";
import db from "@lib/db";
import Queue from "@lib/queue";

async function deposit(
  data,
  realm_id,
  userId,
  transactions,
  hooks,
  scope,
  operation,
  dataHeaders,
  variables
) {
  const techAccount = await account.getTechAccountByRealmId(
    realm_id,
    data.currency,
    1
  );

  if (!techAccount) {
    throw "THEREISNTTECHACCOUNT";
  }

  if (data.variables) {
    data.variables.forEach((v) => variables.push(v));
  }

  const user_id = await account.checkAccountNoForRealm(data.acc_no, realm_id);
  if (!user_id) throw "THEREISNTUSERACCOUNT";

  const amount = parseFloat(data.amount);
  if (isNaN(amount)) throw "AMOUNTISNAN";

  let bank;
  let iban;
  if (techAccount.iban && techAccount.iban.bank_id)
    bank = await db.bank.findOne({
      where: { id: techAccount.iban.bank_id }
    });

  if (data.options && data.options.bank)
    bank = await db.bank.findOne({
      where: { id: data.options.bank }
    });
  if (bank)
    iban = await db.iban.findOne({
      where: { bank_id: bank.id }
    });

  if (data.bank) {
    bank = null;
    bank = await db.bank.findOne({
      where: { shortname: data.bank }
    });
  }
  if (bank)
    iban = await db.iban.findOne({
      where: { bank_id: bank.id }
    });

  if (!data.options) data.options = {};

  data.bank = bank;
  data.iban = iban;
  data.returning = true;
  data.userId = userId;

  if (!data.deposit_date) data.deposit_date = new Date();
  const transferData = {
    owner: user_id,
    ref_id: data.ref_id,
    deposit_date: data.deposit_date,
    transfer_type: "deposit",
    acc_src: techAccount.account.acc_no,
    acc_dst: data.acc_no,
    amount,
    description: data.description,
    //options: data.options || {},
    invoice: data.invoice,
    show_to_client: data.show_to_client == "on" ? true : false,
    invisibility_exp_date: data.invisibility_exp_date || new Date()
  };
  hooks.beforeSendResult = async (result, transfer, transactions) => {
    if (transfer) {
      result.id = transfer.get("id");
    }
    if (transactions) {
      result.transactions = account.removeHiddenTransactions(transactions);
    }
    if (transfer && !transferData.show_to_client) {
      await markAsInvisible(
        transfer.get("id"),
        transferData.invisibility_exp_date
      );
    }
  };

  if (transferData.show_to_client) await sendDepositEmail(data, realm_id);

  return transferData;
}

async function markAsInvisible(transfer_id, date) {
  try {
    await db.sequelize.query(
      "UPDATE transfers SET show_to_client=false, invisibility_exp_date=:date WHERE id=:transfer_id",
      {
        replacements: { transfer_id, date },
        type: db.sequelize.QueryTypes.UPDATE
      }
    );
  } catch (error) {
    console.log("deposit.js markAsInvisible e:", error);
  }
}

async function removeDeposit(data, realm_id, user_id) {
  let orgData = {};

  await account.removeTransfer({ id: data.deposit_id });

  const userData = await db.user.findOne({
    where: {
      id: data.user_id
    },
    attributes: ["email"],
    raw: true
  });

  if (data.merchant)
    orgData = await db.merchant.findOne({
      where: {
        id: data.merchant
      },
      attributes: ["name"],
      raw: true
    });

  Queue.newJob("mail-service", {
    method: "send",
    data: {
      code: "adjusted-deposit",
      to: userData.email,
      body: {
        merchant_name: orgData.name,
        amount: data.amount,
        currency: data.currency
      }
    },
    realmId: realm_id
  });

  await sendDepositEmail(data, realm_id);

  return { success: true };
}

async function showDepositAndSendEmail(data, realm_id, user_id) {
  try {
    await db.sequelize.query(
      "UPDATE transfers SET show_to_client=true, invisibility_exp_date=:date WHERE id=:transfer_id",
      {
        replacements: { transfer_id: data.id, date: new Date() },
        type: db.sequelize.QueryTypes.UPDATE
      }
    );
  } catch (error) {
    console.log("deposit.js showDepositAndSendEmail e:", error);
  }

  return { success: true };
}

async function sendDepositEmail(data, realm_id) {
  const userData = await db.user.findOne({
    where: {
      id: data.user_id
    },
    attributes: ["email"],
    raw: true
  });

  Queue.newJob("mail-service", {
    method: "send",
    data: {
      code: "deposit-transfer",
      to: userData.email,
      body: {
        merchant_name: data.organisation_name,
        amount: parseFloat(data.amount),
        currency: data.currency
      }
    },
    realmId: realm_id
  });
  return;
}

export default {
  deposit,
  removeDeposit,
  showDepositAndSendEmail
};
