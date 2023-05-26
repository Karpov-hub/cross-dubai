import Queue from "@lib/queue";
import db from "@lib/db";
import account from "./account";
import shortHash from "short-hash";
import sha1 from "sha1";
import generatePassword from "password-generator";

async function getUserByEmail(email, realmId) {
  if (!email) return null;
  const { result } = await Queue.newJob("auth-service", {
    method: "getUserByEmail",
    data: {
      email
    },
    realmId
  });
  return result;
}

function getPrefixedData(data, prefix) {
  let profile = {};
  for (let key in data) {
    if (key.substr(0, prefix.length + 1) == prefix + "_") {
      profile[key.substr(prefix.length + 1)] = data[key];
    }
  }
  return profile;
}

async function createUser(profile, realm) {
  const pass = generatePassword();
  profile.realm = realm;
  profile.pass = sha1(pass);
  profile.login = profile.email;
  const result = await db.user.create(profile);
  const out = result.toJSON();
  out.pass = pass;
  return out;
}

async function getUserAccount(user, currency, realmId) {
  const acc = await db.account.findOne({
    where: {
      currency,
      owner: user.id
    },
    attributes: ["acc_no"]
  });
  if (acc) return acc.acc_no;

  const result = await account.create(
    {
      currency,
      name: "test",
      negative: true,
      status: 1
    },
    realmId,
    user.id
  );
  return result.acc_no;
}

async function transfer(data, realm_id, userId, transactions, hooks) {
  if (!data.src_email) throw "THEREISNTEMAIL";

  data.no = shortHash(userId + Date.now());

  let user = await getUserByEmail(data.src_email, realm_id);

  let profile;
  if (!user) {
    profile = getPrefixedData(data, "src");
    user = await createUser(profile, realm_id);
    // message about creating a new profile
    Queue.newJob("mail-service", {
      method: "send",
      data: {
        lang: arguments[7].lang,
        code: "proxy-newuser",
        to: user.email,
        body: user
      },
      realmId: realm_id
    });
  }
  const acc_no = await getUserAccount(user, data.src_currency, realm_id);
  const tech_acc_deposit = await account.getTechAccountByRealmId(
    realm_id,
    data.src_currency,
    1
  );

  if (!tech_acc_deposit) throw "THEREISNTTECHACCOUNT";

  const tech_acc_withdrawal = await account.getTechAccountByRealmId(
    realm_id,
    data.dst_currency,
    2
  );

  if (!tech_acc_withdrawal) throw "THEREISNTTECHACCOUNT";

  let bank;

  if (tech_acc_deposit.iban && tech_acc_deposit.iban.bank_id)
    bank = await db.bank.findOne({
      where: { id: tech_acc_deposit.iban.bank_id }
    });

  hooks.beforeSendResult = async (result, transfer, transactions) => {
    let out;
    if (transfer) {
      await db.transfer.update(
        { user_id: user.id },
        { where: { id: transfer.id } }
      );

      out = {
        id: transfer.id,
        ref_id: transfer.ref_id,
        user_id: user.id,
        held: transfer.held,
        description: transfer.description,
        amount: transfer.amount,
        sourceData: transfer.data,
        transactions,
        invoice: {
          iban: tech_acc_deposit.iban ? tech_acc_deposit.iban.iban : null,
          amount: transfer.amount,
          currency: data.src_currency,
          details: tech_acc_deposit.details,
          bank: bank ? bank.toJSON() : null
        }
      };
      if (data.src_email && !data.test) {
        Queue.newJob("mail-service", {
          method: "send",
          data: {
            lang: arguments[7].lang,
            code: "proxy-payment",
            to: data.src_email,
            body: out
          },
          realmId: realm_id
        });
      }
    } else {
      out = {
        transactions
      };
    }
    return out;
  };

  return {
    realm: realm_id,
    acc_no,
    tech_acc_deposit,
    tech_acc_withdrawal,
    user
  };
}

export default {
  transfer
};
