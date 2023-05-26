import chai from "chai";
import db from "@lib/db";
import pretest from "@lib/pretest";
import uuid from "uuid/v4";
import Queue from "@lib/queue";
import memstore from "@lib/memstore";
let should = chai.should();

const expect = chai.expect;

import Service from "../src/Service.js";
const service = new Service({ name: "ccoin-service" });
let ENV;
let merchant;
let plan, merchPlan;
describe("Crypto coins service", async () => {
  before(async () => {
    // this code runs before all tests
    ENV = await pretest.before();
    await db.account_crypto.destroy({ truncate: true, cascade: true });
    await service.run();
  });

  after(function() {});

  describe("Create crypto address", () => {
    let address;
    it("Create by currency api", async () => {
      const res = await service.runServiceMethod({
        method: "create",
        data: {
          currency: {
            api: {
              api: "http://localhost:8010/coin/",
              apitoken: "123"
            },
            abbr: "BTC"
          }, //"http://46.165.245.221:13000/btc/" },
          account: {
            acc_no: ENV.user1.accounts[1].acc_no
          }
        }
      });
      address = res.address;
      res.should.have.deep.property("walletId");
      res.should.have.deep.property("address");
    });

    it("Validate address by currency (ETH address| ETH currency)", async () => {
      const res = await service.runServiceMethod({
        method: "validateAddress",
        data: {
          address: "0x78B22647d0366E2a1E4f5f6F7293F00E6F20acB1",
          currency: "ETH"
        }
      });
      res.should.have.deep.property("valid", true);
    });
    it("Validate address by currency (ETH address| TRX currency)", async () => {
      const res = await service.runServiceMethod({
        method: "validateAddress",
        data: {
          address: "TB2v1aC5gyjKvQtwBWHe6Hep3tGk64Qnsh",
          currency: "ETH"
        }
      });
      res.should.have.deep.property("valid", false);
    });

    it("Get address by account", async () => {
      const res = await service.runServiceMethod({
        method: "getAddress",
        data: {
          acc_no: ENV.user1.accounts[1].acc_no
        }
      });
      res.should.have.deep.property("address", address);
    });

    let requestId = uuid();

    const swapData = {
      method: "swap",
      data: {
        payment: {
          ref_id: "af48128d-0ffc-4bc5-9c1a-d579a95799ae",
          user_id: "b55ae049-9231-4ae5-a896-1a26fbf4d3eb",
          acc_src: "2004",
          acc_dst: "30000006",
          amount: "10",
          tag: "11111",
          step: 0,
          extra: "11111",
          prevData: {},
          variables: [
            {
              id: "extModel702-2",
              key: "TO_ADDRESS",
              value: "111",
              descript: "Адрес получателя"
            },
            {
              id: "extModel702-1",
              key: "FROM_ADDRESS",
              value: "333",
              descript: "Адрес отправки"
            }
          ],
          plan: [
            {
              id: "extModel654-1",
              descript: "Source acc",
              acc_no: "2004",
              currency: "USDT",
              tag: "",
              extra: "",
              method: ""
            },
            {
              id: "extModel882-1",
              descript: "Dist acc",
              acc_no: "30000006",
              currency: "USDT",
              tag: "11111",
              extra: "11111",
              method: "swap"
            },
            {
              id: "extModel2470-1",
              descript: "",
              acc_no: "801",
              currency: "USTR",
              tag: "",
              extra: "",
              method: ""
            },
            {
              id: "extModel2470-1",
              descript: "",
              acc_no: "802",
              currency: "USTR",
              tag: "",
              extra: "",
              method: ""
            }
          ],
          output: {},
          transfer: {
            id: requestId,
            removed: 0,
            ref_id: "af48128d-0ffc-4bc5-9c1a-d579a95799ae",
            realm_id: "ef07097c-ff3c-497a-a576-5b3299beed8f",
            user_id: "b55ae049-9231-4ae5-a896-1a26fbf4d3eb",
            event_name: "doPipe",
            held: true,
            description: "Dist acc",
            data: {
              plan: {
                to: {
                  id: "extModel882-1",
                  tag: "11111",
                  extra: "11111",
                  acc_no: "30000006",
                  method: "swap",
                  currency: "USDT",
                  descript: "Dist acc"
                },
                from: {
                  id: "extModel654-1",
                  tag: "",
                  extra: "",
                  acc_no: "2004",
                  method: "",
                  currency: "USTR",
                  descript: "Source acc"
                }
              },
              amount: "10",
              ref_id: "af48128d-0ffc-4bc5-9c1a-d579a95799ae",
              merchant: "30307cd9-3f30-4743-a293-e963a1f34d59",
              pipeline: "1b873df1-b4b0-4d5f-badb-d3c10c81465d",
              merchant_id: "30307cd9-3f30-4743-a293-e963a1f34d59",
              organisation_name: "IT"
            },
            amount: 10,
            plan_transfer_id: "1b873df1-b4b0-4d5f-badb-d3c10c81465d",
            mtime: "2022-06-10T08:27:55.994Z",
            ctime: "2022-06-10T08:27:55.994Z",
            notes: null,
            maker: null,
            signobject: null,
            canceled: false,
            invoice_number: null,
            status: 1,
            order_id: null,
            deferred: false,
            show_to_client: true,
            transactions: [
              {
                parent_id: "af48128d-0ffc-4bc5-9c1a-d579a95799ae",
                txtype: "transfer",
                hold: true,
                hidden: false,
                acc_src: "2004",
                acc_dst: "30000006",
                description_src: "Transfer",
                description_dst: "Transfer",
                amount: 10,
                tariff: "Payment by plan (tech)",
                tariff_id: "4b3018fc-3e86-4190-8627-f05c7a6f1d5d",
                tariff_plan: "Default",
                tariff_plan_id: "2c112408-b407-47b5-b1c7-91dea3d109c1",
                exchange_amount: 10,
                currency: "USTR",
                exchange_currency: "USTR"
              }
            ]
          }
        },
        planStep: {
          from: {
            id: "extModel654-1",
            descript: "Source acc",
            acc_no: "2004",
            currency: "USTR",
            tag: "",
            extra: "",
            method: ""
          },
          to: {
            id: "extModel882-1",
            descript: "Dist acc",
            acc_no: "30000006",
            currency: "USTR",
            tag: "11111",
            extra: "11111",
            method: "swap"
          }
        },
        plan: [
          {
            id: "extModel654-1",
            descript: "Source acc",
            acc_no: "2004",
            currency: "USTR",
            tag: "",
            extra: "",
            method: ""
          },
          {
            id: "extModel882-1",
            descript: "Dist acc",
            acc_no: "30000006",
            currency: "USTR",
            tag: "11111",
            extra: "11111",
            method: "swap"
          },
          {
            id: "extModel2470-1",
            descript: "",
            acc_no: "801",
            currency: "USDT",
            tag: "",
            extra: "",
            method: ""
          },
          {
            id: "extModel2470-1",
            descript: "",
            acc_no: "802",
            currency: "USDT",
            tag: "",
            extra: "",
            method: ""
          }
        ],
        txAmount: 10
      }
    };

    it("Swap crypto by Krunal's service (error in exchange service)", async () => {
      await memstore.set("coinexTest", "1");

      let res;
      try {
        res = await service.runServiceMethod(swapData);
      } catch (e) {
        expect(e).to.equal("SWAPERROR");
      }

      await memstore.set("coinexTest", "0");
      res = await service.runServiceMethod(swapData);
      res.net.should.have.deep.property("address");
    });

    it("Approve exchange transfers by callback", async () => {
      await db.account.update(
        { balance: 100 },
        {
          where: { acc_no: ENV.user1.accounts[0].acc_no }
        }
      );

      let tx = await Queue.newJob("account-service", {
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

      tx = await db.transfer.findOne({
        where: { id: tx.result.id },
        raw: true,
        attributes: ["id", "held"]
      });

      tx.should.have.deep.property("held", true);

      const res = await service.runServiceMethod({
        method: "exchangecallback",
        data: {
          id: "5fdb3c03cef94d929e2ec7685f2de629",
          requestId: tx.id,
          txType: "EXCHANGE",
          fromAddress: "TC2ZwLyH97QWywt8ut9xh2prqx17NbFwfy",
          fromCurrency: "TRX_USDT",
          fromAmount: 11.0,
          toAddress: "TC2ZwLyH97QWywt8ut9xh2prqx17NbFwfy",
          toCurrency: "TRX_USDT",
          toAmount: 9.989,
          toTxId:
            "930e1266628bdbd8126ba0d8914ff23e268204b38a05efb950296584de48eeaf",
          networkFee: 1,
          tradeFee: 0.011,
          txResult: "COMPLETED",
          createdTime: "2022-05-30 13:59:53",
          finishedTime: "2022-05-30 18:05:12",
          sign: "QySmySaGqU+ZuMwtJzpqvJ+4Si8NbeP2i2e9kq3s3uc=",
          notificationType: "EXCHANGE"
        },
        realmId: ENV.realmId
      });
      res.should.have.deep.property("success");
      tx = await db.transfer.findOne({
        where: { id: tx.id },
        raw: true,
        attributes: ["id", "held"]
      });

      tx.should.have.deep.property("held", false);
    });

    it("Deposit crypto couns", async () => {
      const res = await service.runServiceMethod({
        method: "deposit",
        data: {
          currencyId: "BTC",
          amount: 0.001,
          txId:
            "d427ba4c4e205883c793c81ea5e0abf27b2c4e3e9e668106c294f61ddc1b7f11",
          address: address,
          tag: null,
          confirmations: 1,
          txStatus: "COMPLETED",
          sign: "T+WTBlZA1F1iXHdQdyobeSDNZ0lTLK22uquSiL27PJU=",
          networkFee: null,
          networkFeeCurrencyId: null,
          "crypto-bot": ""
        },
        realmId: ENV.realmId
      });

      const acc = await db.account.findOne({
        where: { acc_no: ENV.user1.accounts[1].acc_no },
        attributes: ["balance", "currency"]
      });
      const tx = await db.cryptotx.findOne({
        where: {
          id: "d427ba4c4e205883c793c81ea5e0abf27b2c4e3e9e668106c294f61ddc1b7f11"
        },
        attributes: ["provided"]
      });

      expect(acc.balance).to.equal(0.001); // 0.001 - 5% by tariff
      expect(acc.currency).to.equal("BTC");
      expect(tx.provided).to.equal(true);
    });
  });
});
