import db from "@lib/db";
import pretest from "@lib/pretest";
import chai from "chai";
import memstore from "@lib/memstore";
import config from "@lib/config";
import plan from "./inc/plan";
import queue from "@lib/queue";
import Service from "../src/Service.js";

let should = chai.should();

chai.use(require("chai-uuid"));

const expect = chai.expect;

let transfer;
let txCounter = 0;

const sendChainCallback = async (callBackData) => {
  const t = await db.transfer.findOne({
    where: {
      plan_transfer_id: transfer.plan_transfer_id,
      held: true
    },
    raw: true
  });

  callBackData.txId = "" + txCounter++;
  callBackData.requestId = t.id;

  const callback = await queue.newJob("ccoin-service", {
    method: "completeTransfer", // method: "sendComplete",
    data: callBackData,
    realmId: ENV.realmId
  });

  callback.result.should.have.deep.property("info", "SendViaMixer");
};

const service = new Service({ name: "account-service" });

let ENV;
let transferId;
let planObjects;

async function getBalanceByAccNo(acc_no) {
  const account = await db.account.findOne({
    where: { acc_no },
    attributes: ["balance"]
  });
  if (account) return account.get("balance");
  return null;
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

    planObjects = await plan.init(ENV);

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
  });

  it("Download Withdrawal Statements (archived)", async () => {
    const { result: res } = await service.runServiceMethod({
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

  it("Get crypto accounts by user", async () => {
    const res = await service.runServiceMethod({
      method: "getCryptoAccounts",
      data: {
        distinct: true
      },
      realmId: ENV.realmId,
      userId: ENV.user2.id
    });
    expect(res.list.length).to.equal(3);
  });

  it("Get crypto accounts by user with repeatable addresses", async () => {
    const res = await service.runServiceMethod({
      method: "getCryptoAccounts",
      data: {},
      realmId: ENV.realmId,
      userId: ENV.user2.id
    });
    expect(res.list.length).to.equal(4);
    let repeatable_acc_1 = res.list.find((el) => {
      return el.acc_no == "80000000";
    });
    let repeatable_acc_2 = res.list.find((el) => {
      return el.acc_no == "80000001";
    });
    expect(repeatable_acc_1.address).to.be.equal(repeatable_acc_2.address);
    expect(repeatable_acc_1.currency).to.be.not.equal(
      repeatable_acc_2.currency
    );
  });

  it("Create wallet", async () => {
    const res = await service.runServiceMethod({
      method: "createWallet",
      data: {
        init_currency: "TRX",
        merchant_id: planObjects.merchant.id,
        user_memo: "test"
      },
      realmId: ENV.realmId,
      userId: ENV.user2.id
    });

    res.should.have.deep.property("success", true);
    res.should.have.deep.property("count", 2);
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
    expect(user2_balance).to.equal(100010);
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

  describe("Accounts plan pipeline", () => {
    const OrderId = "a928565d-989c-482a-a0b5-e7f2ec79a777";

    it("Start plan pipeline (insufficient balance)", async () => {
      await db.account.update(
        { balance: 1 },
        { where: { acc_no: ENV.user2.accounts[1].acc_no } }
      );

      const res = await service.runServiceMethod({
        method: "paymentByPlan",
        data: {
          ref_id: OrderId,
          amount: 100,
          merchant_id: planObjects.merchant.id,
          plan_id: planObjects.plan.id
        },
        realmId: ENV.realmId,
        userId: ENV.user2.id
      });

      res.should.have.deep.property("result", "Error");

      await pretest.wait(500);

      await db.account.update(
        { balance: 100000 },
        { where: { acc_no: ENV.user2.accounts[1].acc_no } }
      );
    });

    it("Start plan pipeline", async () => {
      const res = await service.runServiceMethod({
        method: "paymentByPlan",
        data: {
          ref_id: OrderId,
          amount: 100,
          merchant_id: planObjects.merchant.id,
          plan_id: planObjects.plan.id
        },
        realmId: ENV.realmId,
        userId: ENV.user2.id
      });
      transfer = res.transfer;
      res.should.have.deep.property("transfer");

      await pretest.wait(500);

      const res1 = await service.runServiceMethod({
        method: "paymentByPlan",
        data: {
          ref_id: OrderId,
          amount: 24990,
          merchant_id: planObjects.merchant.id,
          plan_id: planObjects.plan.id
        },
        realmId: ENV.realmId,
        userId: ENV.user2.id
      });

      res1.should.have.deep.property("transfer");

      await pretest.wait(500);
    });

    let callback1;

    it("Callback on SK", async () => {
      const callBackData = {
        txType: "RECEIVE",
        currencyId: "USDT",
        amount: 60843.25,
        txId:
          "0x1d37e2bab0b770b3d9b2dd7da5f48cd1354810097dd4d7b6c453af6adfa1d888",
        address: "111111",
        tag: null,
        confirmations: 52,
        txStatus: "COMPLETED",
        sign: "4Ghf6cHd61M8iBlIr053AjjAqPnOrBQEhoylamEj2BI=",
        networkFee: 0.00507677836,
        networkFeeCurrencyId: "ETH",
        txTime: "2021-04-06 12:41:38"
      };

      callback1 = await queue.newJob("ccoin-service", {
        method: "deposit",
        data: callBackData,
        realmId: ENV.realmId
      });

      callback1.result.should.have.deep.property("provided", 2);

      await pretest.wait(1000);
    });

    it("Callback on Monitor", async () => {
      const t = await db.transfer.findOne({
        where: { description: "SK to Monitoring" },
        attributes: ["id"],
        raw: true
      });
      const callBackData = {
        txType: "RECEIVE",
        requestId: t.id,
        currencyId: "USDT",
        amount: 200,
        txId:
          "0x50fa0fcd8502e0f6e5772b7d1acb90d8856fc4a104ae9e2d0ae2ea72b3522bbb",
        address: "usdt_wallet_123",
        tag: null,
        confirmations: 52,
        txStatus: "COMPLETED",
        sign: "4Ghf6cHd61M8iBlIr053AjjAqPnOrBQEhoylamEj2BI=",
        networkFee: 0.00507677836,
        networkFeeCurrencyId: "ETH",
        txTime: "2021-04-06 12:41:38",
        info: "send"
      };

      const callback2 = await queue.newJob("ccoin-service", {
        method: "sendComplete",
        data: callBackData,
        realmId: ENV.realmId
      });

      callback2.result.should.have.deep.property("cbData");

      await pretest.wait(1000);
    });

    it("Callback on External", async () => {
      const t = await db.transfer.findOne({
        where: { description: "Monitoring to external" },
        attributes: ["id"],
        raw: true
      });

      //console.log("t:", t);

      const callBackData = {
        txType: "RECEIVE",
        requestId: t.id,
        currencyId: "USDT",
        amount: 200,
        txId:
          "0x50fa0fcd8502e0f6e5772b7d1acb90d8856fc4a104ae9e2d0ae2ea72b3522bb1",
        address: "external_wallet",
        tag: null,
        confirmations: 52,
        txStatus: "COMPLETED",
        sign: "4Ghf6cHd61M8iBlIr053AjjAqPnOrBQEhoylamEj2BI=",
        networkFee: 0.00507677836,
        networkFeeCurrencyId: "ETH",
        txTime: "2021-04-06 12:41:38",
        info: "send"
      };

      const callback2 = await queue.newJob("ccoin-service", {
        method: "sendComplete",
        data: callBackData,
        realmId: ENV.realmId
      });

      callback2.result.should.have.deep.property("cbData");

      await pretest.wait(1000);
    });

    it("Check if plan for transfer via chain from UI exist", async () => {
      const res = await service.runServiceMethod({
        method: "checkTransferViaChainAvailable",
        data: {
          currency: "USDT"
        },
        realmId: ENV.realmId,
        userId: ENV.user2.id
      });

      expect(res.plan.length).to.equal(1);
      expect(res.plan[0].items.length).to.equal(3);
      expect(res.plan[0].items[2].method).to.equal(
        "ccoin-service/sendViaChain"
      );
      res.should.have.deep.property("success", true);
    });

    it("Manual transfer initiated by user", async () => {
      const res = await service.runServiceMethod({
        method: "initSendTransfer",
        data: {
          acc_src: ENV.user2.accounts[2].acc_no,
          address_dst: "qwerty123",
          currency: "USDT",
          amount: 1
        },
        realmId: ENV.realmId,
        userId: ENV.user2.id
      });

      const callBackData = {
        txType: "RECEIVE",
        requestId: null,
        currencyId: "USDT",
        amount: 1,
        txId:
          "0x50fa0fcd8502e0f6e5772b7d1acb90d8856fc4a104ae9e2d0ae2ea72b3522bb1",
        address: "external_wallet",
        tag: null,
        confirmations: 52,
        txStatus: "COMPLETED",
        sign: "4Ghf6cHd61M8iBlIr053AjjAqPnOrBQEhoylamEj2BI=",
        networkFee: 0.00507677836,
        networkFeeCurrencyId: "ETH",
        txTime: "2021-04-06 12:41:38",
        info: "send"
      };

      const callback2 = await queue.newJob("ccoin-service", {
        method: "deposit",
        data: callBackData,
        realmId: ENV.realmId
      });

      callback2.result.tx[0].should.have.deep.property("amount", 1);
      res.should.have.deep.property("success", true);
    });

    it("Swap transfer initiated by user", async () => {
      const res = await service.runServiceMethod({
        method: "initSwapTransfer",
        data: {
          acc_src: ENV.user2.accounts[3].acc_no,
          address_src: "qwerty123",
          currency_src: "USTR",
          acc_dst: ENV.user2.accounts[2].acc_no,
          address_dst: "qwerty123",
          currency_dst: "USDT",
          amount: 1
        },
        realmId: ENV.realmId,
        userId: ENV.user2.id
      });
      res.should.have.deep.property("success", true);
    });

    describe("Transfer by chain USDT. Chain length - 3", () => {
      const callbackData = {
        txType: "SEND",
        currencyId: "USDT",
        amount: 10.8,
        txId: null,
        address: "1",
        tag: null,
        confirmations: 51,
        txStatus: "COMPLETED",
        sign: "EvUHsawi8oO6mPE3sWVpIxRtEg/M2/sazF4XQXUUcmA=",
        fromAddress: "test_address_chain_from",
        networkFee: 3.69152,
        networkFeeCurrencyId: "ETH",
        txTime: "2023-01-12 07:10:46",
        requestId: null,
        info: "SendViaMixer",
        systemFee: 0
      };

      it("Transfer by chain USDT", async () => {
        const res = await service.runServiceMethod({
          method: "paymentByPlan",
          data: {
            ref_id: OrderId,
            amount: 10.8,
            merchant_id: planObjects.merchant.id,
            plan_id: planObjects.chain_transfer_plan.id,
            order_id: OrderId,
            variables: [
              {
                id: "extModel3096-1",
                key: "MONITOR_ACC_USDT",
                type: "merchant_account",
                value: ENV.USDT_ACCOUNT,
                values: null,
                descript: "Мониторинговый счет USDT ERC20"
              },
              {
                id: "extModel11039-2",
                key: "FROM_USDT_ADDR",
                value: "test_address_chain_from",
                descript: "USDT адрес отправления"
              },
              {
                id: "extModel11039-1",
                key: "TO_USDT_ADDR",
                value: "test_address_chain_to",
                descript: "USDT адрес получения"
              }
            ]
          },
          realmId: ENV.realmId,
          userId: ENV.user2.id
        });

        res.should.have.deep.property("transfer");
        transfer = res.transfer;

        await pretest.wait(500);
      });

      it("Callback on transfer by chain - 1", async () => {
        await sendChainCallback(callbackData);
      });

      it("Callback on transfer by chain - 2", async () => {
        callbackData.fromAddress = "1";
        callbackData.address = "2";
        await sendChainCallback(callbackData);
      });

      it("Callback on transfer by chain - 3", async () => {
        callbackData.fromAddress = "2";
        callbackData.address = "3";
        await sendChainCallback(callbackData);
      });

      it("Callback on transfer by chain - 4", async () => {
        callbackData.fromAddress = "3";
        callbackData.address = "test_address_chain_to";
        await sendChainCallback(callbackData);
      });
    });

    // describe("Transfer by chain USDT. Chain length - 4", () => {
    //   const callbackData = {
    //     txType: "SEND",
    //     currencyId: "USDT",
    //     amount: 10.8,
    //     txId: null,
    //     address: "1",
    //     tag: null,
    //     confirmations: 51,
    //     txStatus: "COMPLETED",
    //     sign: "EvUHsawi8oO6mPE3sWVpIxRtEg/M2/sazF4XQXUUcmA=",
    //     fromAddress: "test_address_chain_from_cl_4",
    //     networkFee: 3.69152,
    //     networkFeeCurrencyId: "ETH",
    //     txTime: "2023-01-12 07:10:46",
    //     requestId: null,
    //     info: "SendViaMixer",
    //     systemFee: 0
    //   };

    //   it("Transfer by chain USDT", async () => {
    //     const res = await service.runServiceMethod({
    //       method: "paymentByPlan",
    //       data: {
    //         ref_id: OrderId,
    //         amount: 10.8,
    //         merchant_id: planObjects.merchant.id,
    //         plan_id: planObjects.chain_transfer_plan.id,
    //         order_id: OrderId,
    //         variables: [
    //           {
    //             id: "extModel3096-1",
    //             key: "MONITOR_ACC_USDT",
    //             type: "merchant_account",
    //             value: ENV.USDT_ACCOUNT,
    //             values: null,
    //             descript: "Мониторинговый счет USDT ERC20"
    //           },
    //           {
    //             id: "extModel11039-2",
    //             key: "FROM_USDT_ADDR",
    //             value: "test_address_chain_from_cl_4",
    //             descript: "USDT адрес отправления"
    //           },
    //           {
    //             id: "extModel11039-1",
    //             key: "TO_USDT_ADDR",
    //             value: "test_address_chain_to_cl_4",
    //             descript: "USDT адрес получения"
    //           }
    //         ]
    //       },
    //       realmId: ENV.realmId,
    //       userId: ENV.user2.id
    //     });

    //     res.should.have.deep.property("transfer");
    //     transfer = res.transfer;

    //     await pretest.wait(500);
    //   });

    //   it("Callback on transfer by chain - 1", async () => {
    //     await sendChainCallback(callbackData);
    //   });

    //   it("Callback on transfer by chain - 2", async () => {
    //     callbackData.fromAddress = "1";
    //     callbackData.address = "2";
    //     await sendChainCallback(callbackData);
    //   });

    //   it("Callback on transfer by chain - 3", async () => {
    //     callbackData.fromAddress = "2";
    //     callbackData.address = "3";
    //     await sendChainCallback(callbackData);
    //   });

    //   it("Callback on transfer by chain - 4", async () => {
    //     callbackData.fromAddress = "3";
    //     callbackData.address = "4";
    //     await sendChainCallback(callbackData);
    //   });

    //   it("Callback on transfer by chain - 5", async () => {
    //     callbackData.fromAddress = "4";
    //     callbackData.address = "test_address_chain_to_cl_4";
    //     await sendChainCallback(callbackData);
    //   });
    // });
  });
});
