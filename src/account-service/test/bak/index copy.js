import db from "@lib/db";
import pretest from "@lib/pretest";
import chai from "chai";
import memstore from "@lib/memstore";
import config from "@lib/config";
import plan from "../inc/plan";

let should = chai.should();

chai.use(require("chai-uuid"));

const expect = chai.expect;

import Service from "../../src/Service.js";

const service = new Service({ name: "account-service" });

let ENV;
let transferId;
let iban = {};
let depositTransferId;
async function fillBalance(acc_no, userId, amount) {
  await service.runServiceMethod({
    method: "deposit",
    data: {
      ref_id: "a928565d-989c-482a-a0b5-e7f2ec79a6f9",
      acc_no,
      amount,
      currency: "USD",
      country: "UK",
      description: "DEPOSIT DETAILS"
    },
    realmId: ENV.realmId,
    userId
  });
}
async function createOrder(data, realmId, userId) {
  let order = {
    id: data.id || uuid(),
    merchant: data.merchant ? data.merchant : userId,
    organisation: data.organisation,
    amount: data.amount,
    currency: data.currency,
    res_currency: data.res_currency,
    realm_department: data.realm_department,
    status: data.status,
    details: data.details,
    contract_id: data.contract_id,
    bank_details: data.bank_details,
    removed: 0
  };

  const res = await db.order.upsert(order);
  return { success: true };
}

async function getBalanceByAccNo(acc_no) {
  const account = await db.account.findOne({
    where: { acc_no },
    attributes: ["balance"]
  });
  if (account) return account.get("balance");
  return null;
}
async function changeTXHold(hold) {
  let r = await db.tariff.findOne({ where: { id: ENV.tariff1 } });
  let tariff = r.toJSON();
  tariff.actions._arr[1].options.currency = null;
  tariff.actions._arr[1].options.acc_src = "root:result:acc_src";
  tariff.actions._arr[1].options.fee = null;

  tariff.actions._arr[0].options.hold = hold;
  tariff.actions._arr[1].options.hold = hold;
  tariff.actions._arr[2].options.hold = hold;
  delete tariff.id;
  return await db.tariff.update(tariff, { where: { id: ENV.tariff1 } });
}
async function getTransactions(transfer_id) {
  const res = await db.transaction.findAll({ where: { transfer_id } });

  return res.map((tx) => {
    return {
      txtype: tx.txtype,
      held: tx.held,
      hidden: tx.hidden,
      canceled: tx.canceled,
      amount: tx.amount,
      exchange_amount: tx.exchange_amount,
      acc_src: tx.acc_src,
      acc_dst: tx.acc_dst,
      tariff: tx.tariff,
      plan: tx.plan,
      ref_id: tx.ref_id,
      description_src: tx.description_src,
      description_dst: tx.description_dst,
      currency_src: tx.currency_src,
      currency_dst: tx.currency_dst
    };
  });
}

describe("Account service", async () => {
  before(async () => {
    ENV = await pretest.before();

    await db.business_type.truncate({});

    await db.account.create({
      balance: 0,
      currency: "EUR",
      owner: ENV.user1.id,
      removed: 0
    });

    await db.business_type.create({
      id: "779c6e06-27a0-11ea-978f-2e728ce88125",
      type: "Type 1",
      realm: ENV.realmId
    });

    await plan.init(ENV);

    try {
      await service.run();
    } catch (e) {
      console.log("e:", e);
    }
  });

  after(async () => {
    await db.account.destroy({
      where: {
        balance: 0,
        currency: "EUR",
        owner: ENV.user1.id,
        removed: 0
      }
    });
    //await db.bank.truncate({});
    //await db.iban.truncate({});
  });

  /*it("Generate Reconciliation Jasper Report", async () => {
    let merchant_id = "8375a68f-c6d6-47e8-b710-0c6a958ac556";
    let contract_id = "8375a68f-c6d6-47e8-b710-0c6a958ac555";
    const res = await service.runServiceMethod({
      realmId: ENV.realmId,
      userId: ENV.user1.id,
      method: "generateReport",
      data: {
        report_name: "reconciliation_act",
        format: "docx",
        date_from: "01/08/2021",
        date_to: "30/08/2021",
        merchant_id: merchant_id,
        contract_id: contract_id
      }
    });
    res.should.have.deep.property("success", true);
    res.should.have.deep.property("code");
  });

  it("Generate Reconciliation Jasper Report (Invoice)", async () => {
    let merchant_id = "8375a68f-c6d6-47e8-b710-0c6a958ac556";
    // let orderId = "8375a68f-c6d6-47e8-b710-0c6a958ac556";
    let contract_id = "8375a68f-c6d6-47e8-b710-0c6a958ac555";
    const res = await service.runServiceMethod({
      realmId: ENV.realmId,
      userId: ENV.user1.id,
      method: "generateReport",
      data: {
        report_name: "reconciliation_act_invoice",
        format: "docx",
        date_from: "01/08/2021",
        date_to: "30/08/2021",
        merchant_id: merchant_id,
        contract_id: contract_id
      }
    });
    res.should.have.deep.property("success", true);
    res.should.have.deep.property("code");
  });
  */

 
  it("Download Withdrawal Statements (archived)", async () => {
    const res = await service.runServiceMethod({
      realmId: ENV.realmId,
      userId: ENV.user1.id,
      method: "downloadWithdrawalStatements",
      data: {
        date_from: "2021-07-07",
        date_to: "2021-07-09"
      }
    });
    res.should.have.deep.property("success", true);
  });
  it("Write Withdrawal Statement", async () => {
    const res = await service.runServiceMethod({
      realmId: ENV.realmId,
      userId: ENV.user1.id,
      method: "writeWithdrawalStatement",
      data: {
        transfer_id: "8375a68f-c6d6-47e8-b710-0c6a958ac555",
        code: "8375a68f-c6d6-47e8-b710-0c6a958ac553"
      }
    });
    expect(res).to.be.equal(true);
  });
  it("Create accounts", async () => {
    ENV.user1.accounts[0].should.have.deep.property("acc_no");
    ENV.user1.accounts[0].should.have.deep.property("currency", "USD");
  });

  it("All wallets amounts in same currency", async () => {
    const res = await service.runServiceMethod({
      method: "getAllWalletsAmountInSameCurrency",
      data: {
        currency: "EUR"
      },
      realmId: ENV.realmId,
      userId: ENV.user1.id
    });
    res.should.have.deep.property("currency");
    res.should.have.deep.property("accounts");
  });

  it("Deposit user's money", async () => {
    const res = await service.runServiceMethod({
      method: "deposit",
      data: {
        ref_id: "a928565d-989c-482a-a0b5-e7f2ec79a6f6",
        acc_no: ENV.user1.accounts[0].acc_no,
        amount: 100,
        currency: "USD",
        country: "UK",
        description: "DEPOSIT DETAILS"
      },
      realmId: ENV.realmId,
      userId: ENV.user1.id
    });

    res.should.have.deep.property(
      "ref_id",
      "a928565d-989c-482a-a0b5-e7f2ec79a6f6"
    );

    res.should.have.deep.property("description", "DEPOSIT DETAILS");
    res.should.have.deep.property("id");
    depositTransferId = res.id;
    /*res.invoice.should.have.deep.property("iban");
    res.invoice.should.have.deep.property("currency");
    res.invoice.should.have.deep.property("amount");
    res.invoice.should.have.deep.property("details");
    res.invoice.bank.should.have.deep.property("name");
    res.invoice.bank.should.have.deep.property("swift");
    res.invoice.bank.should.have.deep.property("corr_bank");
    res.invoice.bank.should.have.deep.property("corr_swift");
    res.invoice.bank.should.have.deep.property("corr_acc");
    res.invoice.bank.should.have.deep.property("country");
    */

    expect(res.transactions).to.have.deep.members([
      {
        parent_id: res.transactions[0].parent_id,
        txtype: "transfer",
        hold: false,
        hidden: false,
        acc_src: "30000001",
        acc_dst: "1000001",
        description_src: "deposit client's money",
        description_dst: "deposit self money",
        amount: 100,
        tariff: "deposit",
        tariff_id: res.transactions[0].tariff_id,
        tariff_plan: "testplan",
        tariff_plan_id: res.transactions[0].tariff_plan_id,
        exchange_amount: 100,
        currency: "USD",
        exchange_currency: "USD"
      },
      {
        parent_id: res.transactions[0].parent_id,
        txtype: "fee",
        hold: false,
        hidden: false,
        acc_src: "1000001",
        acc_dst: "20000000001",
        description_src: "fix fee for deposit",
        description_dst: "fix fee from user for deposit",
        amount: 5,
        tariff: "deposit",
        tariff_id: res.transactions[0].tariff_id,
        tariff_plan: "testplan",
        tariff_plan_id: res.transactions[0].tariff_plan_id,
        exchange_amount: 5,
        currency: "USD",
        exchange_currency: "USD"
      }
    ]);

    let user_balance = await getBalanceByAccNo(ENV.user1.accounts[0].acc_no);
    let deposit_balance = await getBalanceByAccNo(ENV.ACC_DEPOSIT_USD);
    let fee_balance = await getBalanceByAccNo(ENV.FEE_ACCOUNT);

    let transactions = await getTransactions(res.id);

    expect(transactions).to.have.deep.members([
      {
        held: false,
        hidden: false,
        canceled: false,
        amount: 100,
        exchange_amount: 100,
        acc_src: "30000001",
        acc_dst: ENV.user1.accounts[0].acc_no,
        tariff: "deposit",
        plan: "testplan",
        currency_src: "USD",
        currency_dst: "USD",
        ref_id: "a928565d-989c-482a-a0b5-e7f2ec79a6f6",
        description_src: "deposit client's money",
        description_dst: "deposit self money",
        txtype: "transfer"
      },
      {
        held: false,
        hidden: false,
        canceled: false,
        amount: 5,
        exchange_amount: 5,
        acc_src: ENV.user1.accounts[0].acc_no,
        acc_dst: "20000000001",
        tariff: "deposit",
        plan: "testplan",
        ref_id: "a928565d-989c-482a-a0b5-e7f2ec79a6f6",
        description_src: "fix fee for deposit",
        description_dst: "fix fee from user for deposit",
        currency_src: "USD",
        currency_dst: "USD",
        txtype: "fee"
      },
      {
        acc_src: ENV.user1.accounts[0].acc_no,
        acc_dst: "20000000001",
        amount: 1,
        canceled: false,
        currency_dst: "USD",
        currency_src: "USD",
        description_dst: "percents fee from user for deposit",
        description_src: "percents fee for deposit",
        exchange_amount: 1,
        held: false,
        hidden: true,
        plan: "testplan",
        ref_id: "a928565d-989c-482a-a0b5-e7f2ec79a6f6",
        tariff: "deposit",
        txtype: "fee"
      }
    ]);

    expect(user_balance).to.equal(94);
    //expect(deposit_balance).to.equal(-100);
    expect(fee_balance).to.equal(6);
  });

  it("Transfer to another inside account in same currency with hold", async () => {
    const res = await service.runServiceMethod({
      method: "realmtransfer",
      data: {
        ref_id: "a928565d-989c-482a-a0b5-e7f2ec79a6f6",
        acc_src: ENV.user1.accounts[0].acc_no,
        acc_dst: ENV.user2.accounts[0].acc_no,
        amount: 50,
        currency: "USD",
        country: "UK"
      },
      realmId: ENV.realmId,
      userId: ENV.user1.id
    });

    transferId = res.id;

    res.should.have.deep.property(
      "ref_id",
      "a928565d-989c-482a-a0b5-e7f2ec79a6f6"
    );

    let user1_balance = await getBalanceByAccNo(ENV.user1.accounts[0].acc_no);
    let user2_balance = await getBalanceByAccNo(ENV.user2.accounts[0].acc_no);
    let fee_balance = await getBalanceByAccNo(ENV.FEE_ACCOUNT);

    expect(user1_balance).to.equal(40);
    expect(user2_balance).to.equal(0);
    expect(fee_balance).to.equal(6);
  });

  it("Accept held transaction", async () => {
    const res = await service.runServiceMethod({
      method: "accept",
      data: {
        ref_id: "a928565d-989c-482a-a0b5-e7f2ec79a6f6",
        transfer_id: transferId
      },
      realmId: ENV.realmId
    });

    res.should.have.deep.property(
      "ref_id",
      "a928565d-989c-482a-a0b5-e7f2ec79a6f6"
    );
    let user2_balance = await getBalanceByAccNo(ENV.user2.accounts[0].acc_no);
    let fee_balance = await getBalanceByAccNo(ENV.FEE_ACCOUNT);
    expect(user2_balance).to.equal(50);
    expect(fee_balance).to.equal(10);
  });

  it("Transfer to another inside account in different currency", async () => {
    const res = await service.runServiceMethod({
      method: "realmtransfer",
      data: {
        ref_id: "a928565d-989c-482a-a0b5-e7f2ec79a6f6",
        acc_src: ENV.user1.accounts[0].acc_no,
        acc_dst: ENV.user2.accounts[1].acc_no,
        amount: 20,
        currency: "USD",
        country: "UK"
      },
      realmId: ENV.realmId,
      userId: ENV.user1.id
    });

    await service.runServiceMethod({
      method: "accept",
      data: {
        ref_id: "a928565d-989c-482a-a0b5-e7f2ec79a6f6",
        transfer_id: res.id
      },
      realmId: ENV.realmId
    });

    res.should.have.deep.property(
      "ref_id",
      "a928565d-989c-482a-a0b5-e7f2ec79a6f6"
    );

    let user1_balance = await getBalanceByAccNo(ENV.user1.accounts[0].acc_no);
    let user2_balance = await getBalanceByAccNo(ENV.user2.accounts[1].acc_no);
    let fee_balance = await getBalanceByAccNo(ENV.FEE_ACCOUNT);

    expect(user1_balance).to.equal(16);
    expect(user2_balance).to.equal(10);
    expect(fee_balance).to.equal(14);
  });

  it("Rollback of held transactions", async () => {
    const transfer = await service.runServiceMethod({
      method: "realmtransfer",
      data: {
        ref_id: "a928565d-989c-482a-a0b5-e7f2ec79a6f6",
        acc_src: ENV.user1.accounts[0].acc_no,
        acc_dst: ENV.user2.accounts[0].acc_no,
        amount: 10,
        currency: "USD",
        country: "UK"
      },
      realmId: ENV.realmId,
      userId: ENV.user1.id
    });
    let user1_balance = await getBalanceByAccNo(ENV.user1.accounts[0].acc_no);
    let user2_balance = await getBalanceByAccNo(ENV.user2.accounts[0].acc_no);
    let fee_balance = await getBalanceByAccNo(ENV.FEE_ACCOUNT);

    await service.runServiceMethod({
      method: "rollback",
      data: {
        ref_id: "a928565d-989c-482a-a0b5-e7f2ec79a6f6",
        transfer_id: transfer.id
      },
      realmId: ENV.realmId
    });

    let user1_balance1 = await getBalanceByAccNo(ENV.user1.accounts[0].acc_no);
    let user2_balance1 = await getBalanceByAccNo(ENV.user2.accounts[0].acc_no);
    let fee_balance1 = await getBalanceByAccNo(ENV.FEE_ACCOUNT);
    expect(user1_balance).to.equal(2);
    expect(user1_balance1).to.equal(16);
    expect(user2_balance).to.equal(user2_balance1);
    expect(fee_balance).to.equal(fee_balance1);
  });

  it("Withdrawal money outside", async () => {
    let fee_balance_prev = await getBalanceByAccNo(ENV.FEE_ACCOUNT);
    const transfer = await service.runServiceMethod({
      method: "withdrawal",
      data: {
        ref_id: "a928565d-989c-482a-a0b5-e7f2ec79a6f6",
        acc_no: ENV.user1.accounts[0].acc_no,
        acc_tech: ENV.ACC_WITHDRAWAL_USD,
        amount: 5,
        currency: "USD",
        country: "UK"
      },
      realmId: ENV.realmId,
      userId: ENV.user1.id
    });
    let user1_balance = await getBalanceByAccNo(ENV.user1.accounts[0].acc_no);
    let withdrawal_balance = await getBalanceByAccNo(ENV.ACC_WITHDRAWAL_USD);
    let fee_balance = await getBalanceByAccNo(ENV.FEE_ACCOUNT);

    expect(user1_balance).to.equal(10);
    expect(withdrawal_balance).to.equal(5);
    expect(fee_balance).to.equal(fee_balance_prev + 1);
  });

  it("Getting total user's balances", async () => {
    const res = await service.runServiceMethod({
      method: "getUserBalance",
      data: {
        currency: "USD"
      },
      realmId: ENV.realmId,
      userId: ENV.user2.id
    });
    res.should.have.deep.property("balance", 70);
    res.should.have.deep.property("currency", "USD");
  });

  it("Getting user's accounts", async () => {
    const res = await service.runServiceMethod({
      method: "getUserAccounts",
      data: {},
      realmId: ENV.realmId,
      userId: ENV.user2.id
    });
    res[0].should.have.deep.property("acc_no");
    res[0].should.have.deep.property("balance");
    res[0].should.have.deep.property("currency");
  });

  it("Getting one user account", async () => {
    const res = await service.runServiceMethod({
      method: "getUserAccount",
      data: {
        id: ENV.user1.accounts[0].id
      },
      realmId: ENV.realmId,
      userId: ENV.user1.id
    });
    res.should.have.deep.property("acc_name");
    res.should.have.deep.property("currency");
    res.should.have.deep.property("balance");
    res.should.have.deep.property("acc_no");
  });

  it("Update user account", async () => {
    const res = await service.runServiceMethod({
      method: "updateUserAccount",
      data: {
        id: ENV.user1.accounts[0].id,
        acc_name: "new_name"
      },
      realmId: ENV.realmId,
      userId: ENV.user1.id
    });
    res.should.have.deep.property("success", true);
  });

  it("Create iban with an existing bank", async () => {
    const res = await service.runServiceMethod({
      method: "createIban",
      data: {
        iban: "iban1",
        swift: "qwe",
        currency: "USD"
      },
      realmId: ENV.realmId,
      userId: ENV.user2.id
    });
    res.should.have.deep.property("success", true);
  });

  it("Create iban with a nonexistent bank", async () => {
    const res = await service.runServiceMethod({
      method: "createIban",
      data: {
        iban: "iban2",
        swift: "zxc",
        currency: "USD",
        name: "bank3",
        corr_bank: "ert",
        corr_swift: "ert",
        corr_acc: "ert"
      },
      realmId: ENV.realmId,
      userId: ENV.user2.id
    });
    res.should.have.deep.property("success", true);
  });

  it("Getting user's ibans", async () => {
    const res = await service.runServiceMethod({
      method: "getUserIbans",
      data: {
        start: 0,
        limit: 15
      },
      realmId: ENV.realmId,
      userId: ENV.user2.id
    });

    res.ibans[0].should.have.deep.property("id_iban");
    res.ibans[0].should.have.deep.property("iban");
    res.ibans[0].should.have.deep.property("bank_name");
    res.ibans[0].should.have.deep.property("bank_swift");
    iban.id = res.ibans[0].id_iban;
  });

  it("Delete user iban", async () => {
    const res = await service.runServiceMethod({
      method: "deleteIban",
      data: {
        iban_id: iban.id
      },
      realmId: ENV.realmId,
      userId: ENV.user2.id
    });
    res.should.have.deep.property("success", true);
  });

  it("Getting banks", async () => {
    const res = await service.runServiceMethod({
      method: "getBanks",
      data: {},
      realmId: ENV.realmId,
      userId: ENV.user2.id
    });
    res[0].should.have.deep.property("name");
    res[0].should.have.deep.property("shortname");
    res[0].should.have.deep.property("country");
    res[0].should.have.deep.property("swift");
    res[0].should.have.deep.property("notes");
    res[0].should.have.deep.property("active");
    res[0].should.have.deep.property("corr_bank");
    res[0].should.have.deep.property("corr_swift");
    res[0].should.have.deep.property("corr_acc");
  });

  let proxyTransferId;

  it("Proxy transfer", async () => {
    let data = {
      ref_id: 123,
      amount: 10,
      description: "proxy 10",
      src_currency: "USD",
      src_country: "UK",
      src_person: "Tester X",
      src_email: "testX@test.test",
      src_phone: "99999999999",
      src_bank: "Bank 1",
      src_swift: "AAA",
      src_bank_corr: "Bank corr",
      src_iban: "1111",
      dst_currency: "USD",
      dst_country: "UK",
      dst_person: "Tester Y",
      dst_email: "testY@test.test",
      dst_phone: "77777777777",
      dst_bank: "Bank 2",
      dst_swift: "BBB",
      dst_bank_corr: "Bank corr Y",
      dst_iban: "2222",
      files: [
        {
          name: "passport",
          code: 123
        }
      ]
    };

    const res = await service.runServiceMethod({
      method: "proxyTransfer",
      data,
      realmId: ENV.realmId,
      userId: ENV.user2.id
    });

    proxyTransferId = res.id;

    res.should.have.deep.property("ref_id", "123");
    expect(res.id).to.be.a.uuid();
    expect(res.user_id).to.be.a.uuid();
    res.should.have.deep.property("held", true);
    res.should.have.deep.property("amount", 10);
    res.should.have.deep.property("sourceData");
    res.should.have.deep.property("transactions");
    expect(res.transactions).to.have.lengthOf(3);

    res.invoice.should.have.deep.property("iban");
    res.invoice.should.have.deep.property("currency");
    res.invoice.should.have.deep.property("amount");
    res.invoice.should.have.deep.property("details");
    res.invoice.bank.should.have.deep.property("name");
    res.invoice.bank.should.have.deep.property("swift");
    res.invoice.bank.should.have.deep.property("corr_bank");
    res.invoice.bank.should.have.deep.property("corr_swift");
    res.invoice.bank.should.have.deep.property("corr_acc");
    res.invoice.bank.should.have.deep.property("country");
  });

  it("Accept proxy transfer", async () => {
    let data = {
      ref_id: "a928565d-989c-482a-a0b5-e7f2ec79a6f6",
      transfer_id: proxyTransferId
    };

    const res = await service.runServiceMethod({
      method: "accept",
      data,
      realmId: ENV.realmId,
      userId: ENV.user2.id
    });
    let test = await memstore.get("test");
    test = JSON.parse(test);
    res.should.have.deep.property("provided", 3); // provided 3 transactions of the transfer
    test.should.have.deep.property("ref_id");
    test.should.have.deep.property("transfer_id");
    test.should.have.deep.property("amount", 9.9);
  });

  it("Get invoice by transfer id", async () => {
    let data = {
      ref_id: "a928565d-989c-482a-a0b5-e7f2ec79a6f6",
      transfer_id: proxyTransferId
    };

    const res = await service.runServiceMethod({
      method: "getInvoiceByTransferId",
      data,
      realmId: ENV.realmId
    });

    //console.log("res:", res);

    //res.should.have.deep.property("provided", 3); // provided 3 transactions of the transfer
    res.should.have.deep.property("ref_id");
    res.should.have.deep.property("invoices");
    res.invoices[0].should.have.deep.property("amount", 10);
  });

  it("Transfer to another inside account in different currency, recalc fee to fee account currency", async () => {
    let r = await db.tariff.findOne({ where: { id: ENV.tariff1 } });
    let tariff = r.toJSON();
    tariff.actions._arr[1].options.currency = "dst";
    tariff.actions._arr[1].options.acc_src = "root:result:acc_dst";
    tariff.actions._arr[1].options.fee = 5;
    tariff.actions._arr[0].options.hold = false;
    tariff.actions._arr[1].options.hold = false;
    tariff.actions._arr[2].options.hold = false;
    delete tariff.id;
    await db.tariff.update(tariff, { where: { id: ENV.tariff1 } });

    const res = await service.runServiceMethod({
      method: "realmtransfer",
      data: {
        ref_id: "a928565d-989c-482a-a0b5-e7f2ec79a6f6",
        acc_src: ENV.user1.accounts[0].acc_no,
        acc_dst: ENV.user2.accounts[1].acc_no,
        amount: 10,
        currency: "USD",
        country: "UK"
      },
      realmId: ENV.realmId,
      userId: ENV.user1.id
    });

    //console.log("res:", res);

    res.should.have.deep.property(
      "ref_id",
      "a928565d-989c-482a-a0b5-e7f2ec79a6f6"
    );

    let user1_balance = await getBalanceByAccNo(ENV.user1.accounts[0].acc_no);
    let user2_balance = await getBalanceByAccNo(ENV.user2.accounts[1].acc_no);
    let fee_balance = await getBalanceByAccNo(ENV.FEE_ACCOUNT);

    expect(user1_balance).to.equal(0);
    expect(user2_balance).to.equal(12.5);
    expect(fee_balance).to.equal(20.1);
  });

  it("Getting business types", async () => {
    const res = await service.runServiceMethod({
      method: "getBusinessTypes",
      data: {},
      realmId: ENV.realmId
    });
    res[0].should.have.deep.property("type");
    res[0].should.have.deep.property("id");
  });

  it("Deposit user's money with referal payment", async () => {
    await db.user.update(
      {
        ref_user: ENV.user2.get("id")
      },
      {
        where: {
          id: ENV.user1.get("id")
        }
      }
    );
    const res = await service.runServiceMethod({
      method: "deposit",
      data: {
        ref_id: "a928565d-989c-482a-a0b5-e7f2ec79a6f6",
        acc_no: ENV.user1.accounts[0].acc_no,
        amount: 100,
        currency: "USD",
        country: "UK",
        description: "DEPOSIT DETAILS"
      },
      realmId: ENV.realmId,
      userId: ENV.user1.id
    });

    res.should.have.deep.property(
      "ref_id",
      "a928565d-989c-482a-a0b5-e7f2ec79a6f6"
    );

    let transactions = await getTransactions(res.id);

    expect(transactions).to.have.deep.members([
      {
        txtype: "referal",
        held: false,
        hidden: false,
        canceled: false,
        amount: 1,
        exchange_amount: 1,
        acc_src: "20000000001",
        acc_dst: ENV.user2.accounts[0].acc_no,
        tariff: "deposit",
        plan: "testplan",
        ref_id: "a928565d-989c-482a-a0b5-e7f2ec79a6f6",
        description_src: "fix fee for referal",
        description_dst: "fix fee from user for referal",
        currency_src: "USD",
        currency_dst: "USD"
      },
      {
        txtype: "transfer",
        held: false,
        hidden: false,
        canceled: false,
        amount: 100,
        exchange_amount: 100,
        acc_src: "30000001",
        acc_dst: ENV.user1.accounts[0].acc_no,
        tariff: "deposit",
        plan: "testplan",
        ref_id: "a928565d-989c-482a-a0b5-e7f2ec79a6f6",
        description_src: "deposit client's money",
        description_dst: "deposit self money",
        currency_src: "USD",
        currency_dst: "USD"
      },
      {
        txtype: "fee",
        held: false,
        hidden: false,
        canceled: false,
        amount: 5,
        exchange_amount: 5,
        acc_src: ENV.user1.accounts[0].acc_no,
        acc_dst: "20000000001",
        tariff: "deposit",
        plan: "testplan",
        ref_id: "a928565d-989c-482a-a0b5-e7f2ec79a6f6",
        description_src: "fix fee for deposit",
        description_dst: "fix fee from user for deposit",
        currency_src: "USD",
        currency_dst: "USD"
      },
      {
        acc_dst: "20000000001",
        acc_src: ENV.user1.accounts[0].acc_no,
        amount: 1,
        canceled: false,
        currency_dst: "USD",
        currency_src: "USD",
        description_dst: "percents fee from user for deposit",
        description_src: "percents fee for deposit",
        exchange_amount: 1,
        held: false,
        hidden: true,
        plan: "testplan",
        ref_id: "a928565d-989c-482a-a0b5-e7f2ec79a6f6",
        tariff: "deposit",
        txtype: "fee"
      }
    ]);
  });

  it("Exchange info", async () => {
    const res = await service.runServiceMethod({
      method: "exchange",
      data: {
        amount: 204,
        currency_src: "USD",
        currency_dst: "EUR"
      },
      realmId: ENV.realmId,
      userId: ENV.user1.id
    });
    res.should.have.deep.property("amount", 100);
    res.should.have.deep.property("currency", "EUR");
  });

  it("Get all transactions", async () => {
    const res = await service.runServiceMethod({
      method: "getTransactions",
      data: {},
      realmId: ENV.realmId,
      userId: ENV.user1.id
    });
    expect(res.list).to.be.an("array");
    expect(res.list.length).to.be.equal(res.count);
  });

  it("Get all transactions for specific source account (with filters)", async () => {
    const res = await service.runServiceMethod({
      method: "getTransactions",
      data: {
        acc_src: "7316378131088931226",
        date_from: "01.01.2020",
        date_to: "01.01.2021",
        held: false,
        canceled: false,
        limit: 10,
        start: 0
      },
      realmId: ENV.realmId,
      userId: ENV.user1.id
    });
    expect(res.list).to.be.an("array");
    expect(res.list.length).to.be.equal(10);
  });

  it("Get merchant accounts by currency", async () => {
    const res = await service.runServiceMethod({
      method: "getAccountsByCurrency",
      data: { currency: "EUR" },
      realmId: ENV.realmId,
      userId: ENV.user1.id
    });
    expect(res).to.be.an("array");
    expect(res).to.have.lengthOf(1);
  });

  it("Get merchant accounts by currency (no accounts with currency PLN (PoLish New zloty))", async () => {
    const res = await service.runServiceMethod({
      method: "getAccountsByCurrency",
      data: { currency: "PLN" },
      realmId: ENV.realmId,
      userId: ENV.user1.id
    });
    expect(res).to.be.an("array");
    expect(res).to.have.lengthOf(0);
  });

  it("Get technical accounts by merchant", async () => {
    const res = await service.runServiceMethod({
      method: "getTechAccByMerchant",
      data: {},
      realmId: ENV.realmId,
      userId: ENV.user1.id
    });
    expect(res).to.be.an("array");
    expect(res).to.have.lengthOf(3);
  });

  it("Delete order from system", async () => {
    let org = await db.merchant.create({
      name: "Org",
      website: "website",
      user_id: ENV.user3.id
    });
    let orderId = "8375a68f-c6d6-47e8-b710-0c6a958ac555";
    let contract_id = "8375a68f-c6d6-47e8-b710-0c6a958ac555";

    let user3BalanceBeforeRemoving = await getBalanceByAccNo(
      ENV.user3.accounts[0].acc_no
    );

    await createOrder(
      {
        id: orderId,
        merchant: ENV.user3.id,
        organisation: org.dataValues.id,
        contract_id: org.dataValues.id,
        amount: "123",
        currency: "EUR",
        res_currency: "USD",
        status: 0,
        details: "qweqweqwe",
        bank_details: "testestestestesresf",
        contract_id: contract_id
      },
      ENV.realmId,
      ENV.user3.id
    );
    await service.runServiceMethod({
      method: "deposit",
      data: {
        ref_id: orderId,
        acc_no: ENV.user3.accounts[0].acc_no,
        amount: 123,
        currency: "USD",
        country: "UK",
        description: "DEPOSIT DETAILS"
      },
      realmId: ENV.realmId,
      userId: ENV.user3.id
    });

    let res = await service.runServiceMethod({
      method: "removeOrder",
      data: {
        id: orderId
      },
      realmId: ENV.realmId,
      userId: ENV.user3.id
    });
    let user3BalanceAfterRemovind = await getBalanceByAccNo(
      ENV.user3.accounts[0].acc_no
    );

    if (config.allowDeleteOrdersAndTransfers) {
      expect(res).to.have.deep.property("success", true);
      expect(user3BalanceBeforeRemoving).to.be.equal(user3BalanceAfterRemovind);
    } else {
      expect(res).to.have.deep.property("code", "REMOVINGNOTALLOWED");
    }
  });

  it("Delete transfer from system", async () => {
    let orderId = "8375a68f-c6d6-47e8-b710-0c6a958ac555";
    let user3BalanceBeforeRemoving = await getBalanceByAccNo(
      ENV.user3.accounts[0].acc_no
    );

    let transfer = await service.runServiceMethod({
      method: "deposit",
      data: {
        ref_id: orderId,
        acc_no: ENV.user3.accounts[0].acc_no,
        amount: 123,
        currency: "USD",
        country: "UK",
        description: "DEPOSIT DETAILS"
      },
      realmId: ENV.realmId,
      userId: ENV.user3.id
    });

    let res = await service.runServiceMethod({
      method: "removeTransfer",
      data: {
        id: transfer.id
      },
      realmId: ENV.realmId,
      userId: ENV.user3.id
    });
    let user3BalanceAfterRemovind = await getBalanceByAccNo(
      ENV.user3.accounts[0].acc_no
    );
    if (config.allowDeleteOrdersAndTransfers) {
      expect(res).to.have.deep.property("success", true);
      expect(user3BalanceBeforeRemoving).to.be.equal(user3BalanceAfterRemovind);
    } else {
      expect(res).to.have.deep.property("code", "REMOVINGNOTALLOWED");
    }
  });

  it("Delete held transfer from system", async () => {
    await changeTXHold(true);
    await fillBalance(ENV.user3.accounts[0].acc_no, ENV.user3.id, 50);
    await fillBalance(ENV.user4.accounts[0].acc_no, ENV.user4.id, 22);

    let user3BalanceBeforeRemoving = await getBalanceByAccNo(
      ENV.user3.accounts[0].acc_no
    );
    let user4BalanceBeforeRemoving = await getBalanceByAccNo(
      ENV.user4.accounts[0].acc_no
    );

    const transfer = await service.runServiceMethod({
      method: "realmtransfer",
      data: {
        ref_id: "a928565d-989c-482a-a0b5-e7f2ec79a6f6",
        acc_src: ENV.user3.accounts[0].acc_no,
        acc_dst: ENV.user4.accounts[0].acc_no,
        amount: 10,
        currency: "USD",
        country: "UK"
      },
      realmId: ENV.realmId,
      userId: ENV.user3.id
    });
    let user3BalanceAfterTransfer = await getBalanceByAccNo(
      ENV.user4.accounts[0].acc_no
    );
    let user4BalanceAfterTransfer = await getBalanceByAccNo(
      ENV.user4.accounts[0].acc_no
    );

    expect(user3BalanceBeforeRemoving).to.not.equal(user3BalanceAfterTransfer);
    expect(user4BalanceBeforeRemoving).to.be.equal(user4BalanceAfterTransfer);
    let res = await service.runServiceMethod({
      method: "removeTransfer",
      data: {
        id: transfer.id
      },
      realmId: ENV.realmId,
      userId: ENV.user3.id
    });
    let user3BalanceAfterRemovind = await getBalanceByAccNo(
      ENV.user3.accounts[0].acc_no
    );
    let user4BalanceAfterRemovind = await getBalanceByAccNo(
      ENV.user4.accounts[0].acc_no
    );
    await changeTXHold(false);
    if (config.allowDeleteOrdersAndTransfers) {
      expect(res).to.have.deep.property("success", true);
      expect(user3BalanceBeforeRemoving).to.be.equal(user3BalanceAfterRemovind);
      expect(user4BalanceBeforeRemoving).to.be.equal(user4BalanceAfterRemovind);
    } else {
      expect(res).to.have.deep.property("code", "REMOVINGNOTALLOWED");
    }
  });

  describe("Accounts plan pipeline", () => {});

  // it("Remove deposit", async () => {
  //   const transfer = await db.transfer.findOne({
  //     where: { id: depositTransferId },
  //     raw: true
  //   });

  //   const res = await service.runServiceMethod({
  //     method: "removeDeposit",
  //     data: {
  //       deposit_id: depositTransferId,
  //       currency: "USD",
  //       user_id: transfer.user_id
  //     },
  //     realmId: ENV.realmId,
  //     userId: ENV.user1.id
  //   });

  //   res.should.have.deep.property("success", true);

  //   const check_transfer = await db.transfer.findOne({
  //     where: { id: depositTransferId },
  //     raw: true
  //   });
  //   const check_trxs = await db.transaction.findAll({
  //     where: { transfer_id: depositTransferId },
  //     raw: true
  //   });

  //   expect(check_transfer).to.equal(null);
  //   expect(check_trxs).to.be.empty;
  // });
});
