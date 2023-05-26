import chai from "chai";
import chaiHttp from "chai-http";
import server from "../../src/index.js";
import db from "@lib/db";
import pretest from "@lib/pretest";
import Queue from "@lib/queue";

import memstore from "@lib/memstore";
import doc from "@lib/chai-documentator";
import config from "@lib/config";

chai.use(require("chai-like"));
chai.use(require("chai-things"));
chai.use(require("chai-uuid"));

let should = chai.should();
const expect = chai.expect;

chai.use(chaiHttp);
let account1, account2;
let iban = {};

let file_data =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAADICAYAAACtWK6eAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAALEgAACxIB0t1+/AAAABh0RVh0U29mdHdhcmUAQWRvYmUgRmlyZXdvcmtzT7MfTgAAABZ0RVh0Q3JlYXRpb24gVGltZQAwNi8yNy8xMxoI2XgAAAKSSURBVHic7dyxjsIwFABBfOL/f9lXXIu2cC44kJk+wlisHsVTxpxzPoCXfnYfAK5MIBAEAkEgEAQCQSAQBAJBIBAEAkEgEAQCQSAQBAJBIBAEAkEgEAQCQSAQBAJBIBAEAkEgEAQCQSAQBAJBIBAEAkEgEAQC4bn7AHczxlh+1ov4388EgSAQCAKBIBAIAoEgEAgCgSAQCAKBIBAIAoEgEAgCgWCbd9GRrdx3fqYN4GNMEAgCgSAQCAKBIBAIAoEgEAgCgSAQCAKBIBAIAoEgEAgCgXDrdfcdK+ur6+erZ119zpr8HxMEgkAgCASCQCAIBIJAIAgEgkAgCASCQCAIBIJAIAgEwphfsrb57s3cT7o2d7POBIEgEAgCgSAQCAKBIBAIAoEgEAgCgSAQCAKBIBAIAoEgEAiXW3e3mn0Nn/Ri7zOZIBAEAkEgEAQCQSAQBAJBIBAEAkEgEAQCQSAQBALhtGXFb1863LHMt+IO93LmdzRBIAgEgkAgCASCQCAIBIJAIAgEgkAgCASCQCAIBIJAIDx3H+BujmyefsoG8Tc5LZDVH4IfwT1d8b28j4e/WJAEAkEgEAQCQSAQBAJBIBAEAkEgEAQCQSAQBAJBIBAEAkEgEAQCQSAQBAJBIBAEAkEgEAQCQSAQBAJBIBAEAkEgEAQCQSAQBAJBIBAEAkEgEAQCQSAQBAJBIBAEAkEgEAQC4bn7AP9ljLH7CJfkXo4xQSAIBIJAIAgEgkAgCASCQCAIBIJAIAgEgkAgCASCQCAIBMKYc87dh4CrMkEgCASCQCAIBIJAIAgEgkAgCASCQCAIBIJAIAgEgkAgCASCQCAIBIJAIAgEgkAgCASCQCAIBIJAIAgEgkAgCASCQCD8AkUtP407XiL1AAAAAElFTkSuQmCC";

async function getLatestRates(data) {
  let currency = await db.currency_rate.findAll({
    where: {
      abbr: "EUR"
    },
    raw: true
  });

  let res_currency = await db.currency_rate.findAll({
    where: {
      abbr: "USDT"
    },
    raw: true
  });

  let exchange_rate =
    currency[currency.length - 1].value *
    (1 / res_currency[res_currency.length - 1].value);

  // if (data.amount) exchange_rate = exchange_rate * data.amount;

  return {
    exchange_rate
  };
}

async function getBalanceByAccNo(acc_no) {
  const account = await db.account.findOne({
    where: { acc_no },
    attributes: ["balance"]
  });
  if (account) return account.get("balance");
  return null;
}

function wait(secs) {
  return new Promise((res) => {
    setTimeout(() => {
      res();
    }, secs * 1000);
  });
}

async function sendRequest(data, toDoc) {
  if (toDoc !== false) toDoc = true;

  if (toDoc)
    return await doc(
      chai
        .request(server)
        .post("/")
        .set("Origin", "http://" + realmHost)
        .set("content-type", "application/json")
        .set("authorization", "bearer" + realmToken)
        .send(data)
    );

  return await chai
    .request(server)
    .post("/")
    .set("Origin", "http://" + realmHost)
    .set("content-type", "application/json")
    .set("authorization", "bearer" + realmToken)
    .send(data);
}

describe("Account services", async () => {
  before(async () => {
    await pretest.wait(500);

    const realm = await db.realm.findOne({
      where: { token: realmToken },
      attributes: ["id"]
    });

    await db.business_type.truncate({});
    await db.merchant_account.truncate({});
    await db.account_crypto.truncate({});
    await db.cryptotx.truncate({});
    await db.payments_queue.truncate({});

    await db.business_type.create({
      id: "779c7126-27a0-11ea-978f-2e728ce88125",
      type: "Type",
      realm: realm.id
    });

    await db.merchant.create({
      name: "Org",
      website: "website",
      user_id: ENV.user2.id
    });
  });

  after(async () => {});

  describe("Account operations", async () => {
    // Create user's account. Send currency abbreviation.
    it("Create new account", async () => {
      let data = {
        header: {
          id: 111,
          version: config.apiVersion,
          service: "account-service",
          method: "create",
          token: userToken
        },
        data: {
          acc_name: "account1",
          currency: "USD"
        }
      };

      account1 = await sendRequest(data);
      account2 = await sendRequest(data, false);
      global.account1 = account1.body.data.id;
      global.account2 = account2.body.data.id;

      await db.account.update(
        {
          status: 1
        },
        {
          where: {
            id: account1.body.data.id
          }
        }
      );

      await db.account.update(
        {
          status: 1
        },
        {
          where: {
            id: account2.body.data.id
          }
        }
      );

      account1.body.header.should.have.deep.property("status", "OK");
      account1.body.data.should.have.deep.property("acc_no");
      account1.body.data.should.have.deep.property("currency", "USD");
      account1.body.data.should.have.deep.property("status", 1);
    });

    it("All wallets amounts in same currency", async () => {
      let data = {
        header: {
          id: 111,
          version: config.apiVersion,
          service: "account-service",
          method: "getAllWalletsAmountInSameCurrency",
          token: userToken
        },
        data: {
          currency: "EUR"
        }
      };

      const res = await sendRequest(data);
      res.body.header.should.have.deep.property("status", "OK");
      res.body.data.should.have.deep.property("accounts");
      res.body.data.should.have.deep.property("currency");
    });

    it("Create wallet", async () => {
      const merchant = await db.merchant.findOne({
        where: {
          user_id: ENV.user2.id
        },
        raw: true
      });

      let data = {
        header: {
          id: 111,
          version: config.apiVersion,
          service: "account-service",
          method: "createWallet",
          token: userToken
        },
        data: {
          init_currency: "TRX",
          merchant_id: merchant.id,
          user_memo: "test"
        }
      };

      const res = await sendRequest(data);
      res.body.header.should.have.deep.property("status", "OK");
      res.body.data.should.have.deep.property("success", true);
      res.body.data.should.have.deep.property("count", 2);
    });

    it("Get business type", async () => {
      let data = {
        header: {
          id: 111,
          version: config.apiVersion,
          service: "account-service",
          method: "getBusinessTypes",
          token: userToken
        },
        data: {}
      };

      const res = await sendRequest(data);
      res.body.header.should.have.deep.property("status", "OK");
    });

    // Getting user's balance from all accounts
    /*it("Get user's balance", async () => {
      let data = {
        header: {
          id: 111,
          version: config.apiVersion,
          service: "account-service",
          method: "getAllBalance",
          token: userToken
        },
        data: {}
      };

      const res = await sendRequest(data);
      res.body.header.should.have.deep.property("status", "OK");
    });
    */

    // Getting user's accounts
    it("Get user's accounts", async () => {
      let data = {
        header: {
          id: 111,
          version: config.apiVersion,
          service: "account-service",
          method: "getUserAccounts",
          token: userToken
        },
        data: {}
      };

      const res = await sendRequest(data);
      res.body.header.should.have.deep.property("status", "OK");
    });

    // Getting one user account
    it("Get user account", async () => {
      let data = {
        header: {
          id: 111,
          version: config.apiVersion,
          service: "account-service",
          method: "getUserAccount",
          token: userToken
        },
        data: {
          id: global.account1
        }
      };

      const res = await sendRequest(data);
      res.body.header.should.have.deep.property("status", "OK");
      res.body.data.should.have.deep.property("acc_name");
      res.body.data.should.have.deep.property("currency");
      res.body.data.should.have.deep.property("balance");
      res.body.data.should.have.deep.property("acc_no");
    });

    // Update user account
    it("Update user account", async () => {
      let data = {
        header: {
          id: 111,
          version: config.apiVersion,
          service: "account-service",
          method: "updateUserAccount",
          token: userToken
        },
        data: {
          id: global.account1,
          acc_name: "new_name"
        }
      };

      const res = await sendRequest(data);
      res.body.header.should.have.deep.property("status", "OK");
    });

    it("Create iban with an existing bank", async () => {
      let data = {
        header: {
          id: 111,
          version: config.apiVersion,
          service: "account-service",
          method: "createIban",
          token: userToken
        },
        data: {
          iban: "iban1",
          swift: "qwe",
          currency: "USD",
          files: [
            {
              name: "invoice.png",
              data: file_data
            }
          ]
        }
      };

      const res = await sendRequest(data);
      res.body.header.should.have.deep.property("status", "OK");
    });

    it("Create iban with a nonexistent bank", async () => {
      let data = {
        header: {
          id: 111,
          version: config.apiVersion,
          service: "account-service",
          method: "createIban",
          token: userToken
        },
        data: {
          iban: "iban2",
          swift: "zxc",
          currency: "USD",
          name: "bank3",
          corr_bank: "ert",
          corr_swift: "ert",
          corr_acc: "ert",
          files: [
            {
              name: "invoice.png",
              data: file_data
            }
          ]
        }
      };

      const res = await sendRequest(data);
      res.body.header.should.have.deep.property("status", "OK");
    });

    // Getting user's ibans
    it("Get user's ibans", async () => {
      let data = {
        header: {
          id: 111,
          version: config.apiVersion,
          service: "account-service",
          method: "getUserIbans",
          token: userToken
        },
        data: {
          start: 0,
          limit: 15
        }
      };

      const res = await sendRequest(data);
      res.body.header.should.have.deep.property("status", "OK");
      res.body.data.ibans[0].should.have.deep.property("id_iban");
      res.body.data.ibans[0].should.have.deep.property("iban");
      res.body.data.ibans[0].should.have.deep.property("bank_name");
      res.body.data.ibans[0].should.have.deep.property("bank_swift");
      iban.id = res.body.data.ibans[0].id_iban;
    });

    it("Delete user iban", async () => {
      let data = {
        header: {
          id: 111,
          version: config.apiVersion,
          service: "account-service",
          method: "deleteIban",
          token: userToken
        },
        data: {
          iban_id: iban.id
        }
      };

      const res = await sendRequest(data);
      res.body.header.should.have.deep.property("status", "OK");
    });

    it("Getting banks", async () => {
      let data = {
        header: {
          id: 111,
          version: config.apiVersion,
          service: "account-service",
          method: "getBanks",
          token: userToken
        },
        data: {}
      };

      const res = await sendRequest(data);

      res.body.header.should.have.deep.property("status", "OK");
      res.body.data[0].should.have.deep.property("name");
      res.body.data[0].should.have.deep.property("shortname");
      res.body.data[0].should.have.deep.property("country");
      res.body.data[0].should.have.deep.property("swift");
      res.body.data[0].should.have.deep.property("notes");
      res.body.data[0].should.have.deep.property("active");
      res.body.data[0].should.have.deep.property("corr_bank");
      res.body.data[0].should.have.deep.property("corr_swift");
      res.body.data[0].should.have.deep.property("corr_acc");
    });
  });

  describe("Transfer services", async () => {
    // Deposit money into the system
    // ref_id is optional, service returns generated ref_id if you didn't send it.
    // acc_no -- number of user's account in the system (optional)
    // if there isn't acc_no in a request, money will deposit on first activated account
    it("Deposit money", async () => {
      let data = {
        header: {
          id: 111,
          version: config.apiVersion,
          service: "account-service",
          method: "deposit",
          token: userToken
        },
        data: {
          ref_id: "a928565d-989c-482a-a0b5-e7f2ec79a6f6",
          acc_no: account1.body.data.acc_no,
          amount: 100,
          currency: "USD",
          country: "UK",
          description: "DEPOSIT DETAILS",
          options: {
            iban: "123",
            swift: "AAA"
          },
          files: [
            {
              name: "invoice.png",
              data: file_data
            }
          ]
        }
      };

      const res = await sendRequest(data);
      res.body.header.should.have.deep.property("status", "OK");
      res.body.data.should.have.deep.property("otpRequred", true);
      res.body.data.should.have.deep.property("transport", "test");
      res.body.data.should.have.deep.property("operation");
      res.body.data.operation.should.have.deep.property(
        "ref_id",
        "a928565d-989c-482a-a0b5-e7f2ec79a6f6"
      );
      res.body.data.operation.should.have.deep.property(
        "acc_no",
        account1.body.data.acc_no
      );
      res.body.data.operation.should.have.deep.property("amount", 100);
      res.body.data.operation.should.have.deep.property(
        "description",
        "DEPOSIT DETAILS"
      );
      expect(res.body.data.operation.files[0].code).to.be.a.uuid();
    });

    it("Resend OTP", async () => {
      await memstore.del("testotp");

      let data = {
        header: {
          id: 111,
          version: config.apiVersion,
          service: "auth-service",
          method: "resendOtp",
          token: userToken
        },
        data: {}
      };

      const res = await sendRequest(data);
      res.body.header.should.have.deep.property("status", "OK");
      const otp = await memstore.get("testotp");
      expect(otp).to.be.equal("111111");
    });

    it("Otp on deposit money", async () => {
      const otp = await memstore.get("testotp");

      let data = {
        header: {
          id: 111,
          version: config.apiVersion,
          service: "auth-service",
          method: "checkOtp",
          token: userToken
        },
        data: {
          otp
        }
      };

      const res = await sendRequest(data);
      res.body.header.should.have.deep.property("status", "OK");
      res.body.data.should.have.deep.property(
        "ref_id",
        "a928565d-989c-482a-a0b5-e7f2ec79a6f6"
      );

      const transfer = await db.transfer.findOne({
        where: { id: res.body.data.id }
      });

      const d = transfer.get("data");

      expect(d.files[0].code).to.be.a.uuid();

      d.should.have.deep.property("amount", 100);
      d.should.have.deep.property("acc_no", account1.body.data.acc_no);
      d.options.should.have.deep.property("iban", "123");
      d.options.should.have.deep.property("swift", "AAA");

      transfer.should.have.deep.property(
        "event_name",
        "account-service:deposit"
      );

      transfer.should.have.deep.property("description", "DEPOSIT DETAILS");
    });

    // Transfer between two accounts
    // ref_id is optional, service returns generated ref_id if you didn't send it.
    it("Transfer", async () => {
      let data = {
        header: {
          id: 111,
          version: config.apiVersion,
          service: "account-service",
          method: "realmtransfer",
          token: userToken
        },
        data: {
          ref_id: "a928565d-989c-482a-a0b5-e7f2ec79a6f6",
          acc_src: account1.body.data.acc_no,
          acc_dst: account2.body.data.acc_no,
          amount: 50,
          currency: "USD",
          country: "UK"
        }
      };

      const res = await sendRequest(data);

      res.body.header.should.have.deep.property("status", "OK");
      res.body.data.should.have.deep.property("otpRequred", true);
      res.body.data.should.have.deep.property("transport", "test");
    });

    it("OTP on transfer", async () => {
      const otp = await memstore.get("testotp");
      let data = {
        header: {
          id: 111,
          version: config.apiVersion,
          service: "auth-service",
          method: "checkOtp",
          token: userToken
        },
        data: {
          otp
        }
      };

      const res = await sendRequest(data);

      res.body.header.should.have.deep.property("status", "OK");
      res.body.data.should.have.deep.property(
        "ref_id",
        "a928565d-989c-482a-a0b5-e7f2ec79a6f6"
      );
    });

    // Withdrawal money outside
    // ref_id is optional, service returns generated ref_id if you didn't send it.
    // acc_no -- number of user's account in the system
    // acc_no -- number of user's account in the system

    // it("Withdrawal not allowed money", async () => {
    //   let data = {
    //     header: {
    //       id: 111,
    //       version: config.apiVersion,
    //       service: "account-service",
    //       method: "withdrawal",
    //       token: userToken
    //     },
    //     data: {
    //       ref_id: "a928565d-989c-482a-a0b5-e7f2ec79a6f22",
    //       acc_no: account1.body.data.acc_no,
    //       description: "IBAN: GB29 NWBK 6016 1331 9268 19",
    //       amount: 10000,
    //       currency: "USD",
    //       country: "UK"
    //     }
    //   };

    //   const res = await sendRequest(data, false);

    //   res.body.header.should.have.deep.property("status", "OK");
    //   res.body.data.should.have.deep.property("otpRequred", true);
    //   res.body.data.should.have.deep.property("transport", "test");
    // });

    // it("Otp on withdrawal not allowed money", async () => {
    //   const otp = await memstore.get("testotp");

    //   let data = {
    //     header: {
    //       id: 111,
    //       version: config.apiVersion,
    //       service: "auth-service",
    //       method: "checkOtp",
    //       token: userToken
    //     },
    //     data: {
    //       otp
    //     }
    //   };
    //   const res = await sendRequest(data, false);
    //   res.body.header.should.have.deep.property("status", "ERROR");
    // });

    // it("Withdrawal USDT", async () => {
    //   let data = {
    //     header: {
    //       id: 111,
    //       version: config.apiVersion,
    //       service: "account-service",
    //       method: "withdrawal",
    //       token: userToken
    //     },
    //     data: {
    //       ref_id: "a928565d-989c-482a-a0b5-e7f2ec79a6f23",
    //       acc_no: account1.body.data.acc_no,
    //       description: "withdrawal 10USDT",
    //       amount: 10,
    //       currency: "USDT",
    //       country: "UK"
    //     }
    //   };

    //   const res = await sendRequest(data, false);

    //   res.body.header.should.have.deep.property("status", "OK");
    //   res.body.data.should.have.deep.property("otpRequred", true);
    //   res.body.data.should.have.deep.property("transport", "test");
    // });

    // it("Otp on withdrawal of USDT", async () => {
    //   const otp = await memstore.get("testotp");

    //   let data = {
    //     header: {
    //       id: 111,
    //       version: config.apiVersion,
    //       service: "auth-service",
    //       method: "checkOtp",
    //       token: userToken
    //     },
    //     data: {
    //       otp
    //     }
    //   };
    //   const res = await sendRequest(data, false);
    //   res.body.header.should.have.deep.property("status", "ERROR");
    // });

    it("Refund money", async () => {
      let data = {
        header: {
          id: 111,
          version: config.apiVersion,
          service: "account-service",
          method: "refund",
          token: userToken
        },
        data: {
          ref_id: "a928565d-989c-482a-a0b5-e7f2ec79a6f7",
          acc_no: account1.body.data.acc_no,
          description: "REFUND 10",
          amount: 10,
          currency: "USD",
          country: "UK"
        }
      };

      const res = await sendRequest(data);
      res.body.header.should.have.deep.property("status", "OK");
      res.body.data.should.have.deep.property("id");
      expect(res.body.data.id).to.be.a.uuid();
    });

    it("Get currency", async () => {
      let data = {
        header: {
          id: 111,
          version: config.apiVersion,
          service: "account-service",
          method: "getCurrency",
          token: userToken
        },
        data: {}
      };

      const res = await sendRequest(data);
      res.body.header.should.have.deep.property("status", "OK");
      res.body.data[0].should.have.deep.property("abbr");
      res.body.data[0].should.have.deep.property("decimal");
      res.body.data[0].should.have.deep.property("crypto");
    });

    // it("Get accounts status", async () => {
    //   let data = {
    //     header: {
    //       id: 111,
    //       version: config.apiVersion,
    //       service: "account-service",
    //       method: "getAccountsStatus",
    //       token: userToken
    //     },
    //     data: {
    //       accounts: [account1.body.data.acc_no, account2.body.data.acc_no]
    //     }
    //   };

    //   const res = await sendRequest(data);

    //   res.body.header.should.have.deep.property("status", "OK");
    //   console.log(res.body);
    //   res.body.data.should.have.deep.property("heldIn");
    //   res.body.data.should.have.deep.property("heldOut");
    //   res.body.data.should.have.deep.property("balance");
    //   res.body.data.should.have.deep.property("currency", "USD");
    // });

    it("Get transfers (Status: Pending)", async () => {
      let date_from = new Date();
      let date_processed_from = new Date();
      let date_till = new Date();
      let date_processed_to = new Date();

      date_from.setSeconds(date_from.getSeconds() - 60);
      date_processed_from.setSeconds(date_processed_from.getSeconds() - 60);

      let data = {
        header: {
          id: 111,
          version: config.apiVersion,
          service: "account-service",
          method: "getTransfers",
          token: userToken
        },
        data: {
          filters: {
            status: "Pending",
            invoice_number: "",
            merchant_order_num: "",
            date_from: date_from,
            date_till: date_till,
            date_processed_from: date_processed_from,
            date_processed_to: date_processed_to
          }
        }
      };

      const res = await sendRequest(data);
      res.body.header.should.have.deep.property("status", "OK");
    });

    it("Get transfers (Status: Completed) and pagination", async () => {
      let date_from = new Date();
      let date_processed_from = new Date();
      let date_till = new Date();
      let date_processed_to = new Date();

      date_from.setSeconds(date_from.getSeconds() - 60);
      date_processed_from.setSeconds(date_processed_from.getSeconds() - 60);

      let data = {
        header: {
          id: 111,
          version: config.apiVersion,
          service: "account-service",
          method: "getTransfers",
          token: userToken
        },
        data: {
          filters: {
            status: "Completed",
            invoice_number: "",
            merchant_order_num: "",
            date_from: date_from,
            date_till: date_till,
            date_processed_from: date_processed_from,
            date_processed_to: date_processed_to,
            start: 0,
            limit: 2
          }
        }
      };

      const res = await sendRequest(data);
      res.body.header.should.have.deep.property("status", "OK");
    });

    it("Get transfers excel", async () => {
      let date_from = new Date();
      let date_processed_from = new Date();
      let date_till = new Date();
      let date_processed_to = new Date();

      date_from.setSeconds(date_from.getSeconds() - 60);
      date_processed_from.setSeconds(date_processed_from.getSeconds() - 60);

      let data = {
        header: {
          id: 111,
          version: config.apiVersion,
          service: "account-service",
          method: "getXls",
          token: userToken
        },
        data: {
          status: "",
          invoice_number: "",
          merchant_order_num: "",
          date_from: date_from,
          date_till: date_till,
          date_processed_from: date_processed_from,
          date_processed_to: date_processed_to
        }
      };

      const res = await sendRequest(data);
      res.body.header.should.have.deep.property("status", "OK");
    });

    let proxyTransferId;
    it("Proxy transfer without KYC", async () => {
      let data = {
        header: {
          id: 111,
          version: config.apiVersion,
          service: "account-service",
          method: "proxyTransfer",
          token: userToken
        },
        data: {
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
              data: file_data
            },
            {
              name: "invoice",
              data: file_data
            }
          ]
        }
      };

      await sendRequest(data);

      const res = await sendRequest(
        {
          header: {
            id: 111,
            version: config.apiVersion,
            service: "auth-service",
            method: "checkOtp",
            token: userToken
          },
          data: {
            otp: "111111"
          }
        },
        false
      );

      proxyTransferId = res.body.data.id;

      res.body.header.should.have.deep.property("status", "OK");
      res.body.data.should.have.deep.property("ref_id", "123");
      expect(res.body.data.id).to.be.a.uuid();
      expect(res.body.data.user_id).to.be.a.uuid();
      res.body.data.should.have.deep.property("held", true);
      res.body.data.should.have.deep.property("amount", 10);
      res.body.data.should.have.deep.property("sourceData");
      res.body.data.should.have.deep.property("transactions");
      expect(res.body.data.transactions).to.have.lengthOf(3);
    });

    it("Get transfer status", async () => {
      let data = {
        header: {
          id: 111,
          version: config.apiVersion,
          service: "account-service",
          method: "getTransferStatus",
          token: userToken
        },
        data: {
          ref_id: 123,
          transfer_id: proxyTransferId
        }
      };

      const res = await sendRequest(data);

      res.body.header.should.have.deep.property("status", "OK");
      res.body.data.should.have.deep.property("ref_id", 123);
      expect(res.body.data.id).to.be.a.uuid();
      res.body.data.should.have.deep.property("held", true);
      res.body.data.should.have.deep.property("canceled", false);
    });

    it("Get all transactions", async () => {
      const res = await sendRequest({
        header: {
          id: 111,
          version: config.apiVersion,
          service: "account-service",
          method: "getTransactions",
          realmId: ENV.realmId,

          token: userToken
        },
        data: {}
      });
      res.body.header.should.have.deep.property("status", "OK");
      expect(res.body.data.list).to.be.an("array");
    });
    it("Get all transactions for specific source account (with filters)", async () => {
      const res = await sendRequest({
        header: {
          id: 111,
          version: config.apiVersion,
          service: "account-service",
          method: "getTransactions",
          realmId: ENV.realmId,

          token: userToken
        },
        data: {
          acc_src: "7316378131088931226",
          date_from: "01.01.2020",
          date_to: "01.01.2021",
          held: false,
          canceled: false,
          limit: 10,
          start: 0
        }
      });
      res.body.header.should.have.deep.property("status", "OK");
      expect(res.body.data.list).to.be.an("array");
    });

    it("Get merchant accounts by currency", async () => {
      const res = await sendRequest({
        header: {
          id: 111,
          version: config.apiVersion,
          service: "account-service",
          method: "getAccountsByCurrency",
          realmId: ENV.realmId,

          token: userToken
        },
        data: { currency: "EUR" }
      });
      res.body.header.should.have.deep.property("status", "OK");
      expect(res.body.data).to.be.an("array");
    });
    it("Get technical accounts by merchant", async () => {
      const res = await sendRequest({
        header: {
          id: 111,
          version: config.apiVersion,
          service: "account-service",
          method: "getTechAccByMerchant",
          realmId: ENV.realmId,

          token: userToken
        },
        data: {}
      });
      res.body.header.should.have.deep.property("status", "OK");
      expect(res.body.data).to.be.an("array");
    });

    it("Create and delete order from system", async () => {
      let org = await db.merchant.findOne({
        where: {
          user_id: ENV.user2.id
        }
      });
      let orderId = "8375a68f-c6d6-47e8-b710-0c6a958ac555";
      let contract_id = "8375a68f-c6d6-47e8-b710-0c6a958ac555";

      let user2BalanceBeforeRemoving = await getBalanceByAccNo(
        ENV.user2.accounts[0].acc_no
      );

      const racc = await db.realmaccount.findOne({ raw: true });

      await db.realmdepartment.create({
        id: orderId,
        realm: ENV.realmId,
        realm_acc: racc.id
      });

      const res_order = await sendRequest({
        header: {
          id: 111,
          version: config.apiVersion,
          service: "merchant-service",
          method: "createOrder",
          realmId: ENV.realmId,

          token: userToken
        },
        data: {
          id: orderId,
          merchant: ENV.user2.id,
          organisation: org.dataValues.id,
          realm_department: orderId,
          amount: "123",
          currency: "USD",
          res_currency: "USD",
          status: 0,
          details: "qweqweqwe",
          date_from: new Date(),
          date_to: new Date(Date.now() + 86400000),
          contract_id: contract_id,
          order_date: "2021-08-20"
        }
      });

      res_order.body.header.should.have.deep.property("status", "OK");

      await sendRequest({
        header: {
          id: 111,
          version: config.apiVersion,
          service: "account-service",
          method: "deposit",
          realmId: ENV.realmId,

          token: userToken
        },
        data: {
          ref_id: orderId,
          acc_no: ENV.user2.accounts[0].acc_no,
          amount: 123,
          currency: "USD",
          country: "UK",
          description: "DEPOSIT DETAILS"
        }
      });
      await sendRequest(
        {
          header: {
            id: 111,
            version: config.apiVersion,
            service: "auth-service",
            method: "checkOtp",
            token: userToken
          },
          data: {
            otp: "111111"
          }
        },
        false
      );

      let res = await sendRequest({
        header: {
          id: 111,
          version: config.apiVersion,
          service: "account-service",
          method: "removeOrder",
          realmId: ENV.realmId,

          token: userToken
        },
        data: {
          id: orderId
        }
      });
      let user2BalanceAfterRemovind = await getBalanceByAccNo(
        ENV.user2.accounts[0].acc_no
      );

      if (config.allowDeleteOrdersAndTransfers) {
        expect(res.body.data).to.have.deep.property("success", true);
        expect(user2BalanceBeforeRemoving).to.be.equal(
          user2BalanceAfterRemovind
        );
      } else {
        expect(res.body.data).to.have.deep.property(
          "code",
          "REMOVINGNOTALLOWED"
        );
      }
    });

    it("Delete transfer from system", async () => {
      let orderId = "8375a68f-c6d6-47e8-b710-0c6a958ac555";
      let user2BalanceBeforeRemoving = await getBalanceByAccNo(
        ENV.user2.accounts[0].acc_no
      );

      await sendRequest({
        header: {
          id: 111,
          version: config.apiVersion,
          service: "account-service",
          method: "deposit",
          realmId: ENV.realmId,

          token: userToken
        },
        data: {
          ref_id: orderId,
          acc_no: ENV.user2.accounts[0].acc_no,
          amount: 123,
          currency: "USD",
          country: "UK",
          description: "DEPOSIT DETAILS"
        }
      });
      let transfer = await sendRequest(
        {
          header: {
            id: 111,
            version: config.apiVersion,
            service: "auth-service",
            method: "checkOtp",
            token: userToken
          },
          data: {
            otp: "111111"
          }
        },
        false
      );

      let res = await sendRequest({
        header: {
          id: 111,
          version: config.apiVersion,
          service: "account-service",
          method: "removeTransfer",
          realmId: ENV.realmId,

          token: userToken
        },
        data: {
          id: transfer.body.data.id
        }
      });

      let user2BalanceAfterRemovind = await getBalanceByAccNo(
        ENV.user2.accounts[0].acc_no
      );
      if (config.allowDeleteOrdersAndTransfers) {
        expect(res.body.data).to.have.deep.property("success", true);
        expect(user2BalanceBeforeRemoving).to.be.equal(
          user2BalanceAfterRemovind
        );
      } else {
        expect(res.body.data).to.have.deep.property(
          "code",
          "REMOVINGNOTALLOWED"
        );
      }
    });
  });

  describe("Full workflow with Custom Exchange Rate (EUR=>USDT)", async () => {
    let orderId = "8375a68f-c6d6-47e8-b710-0c6a958ac555";
    let transfer;
    let user2BalanceBefore;
    let usdtAccBefore;
    let merchant;
    let transferRecord;

    it("Step 1. Deposit EUR", async () => {
      await sendRequest(
        {
          header: {
            id: 111,
            version: config.apiVersion,
            service: "account-service",
            method: "deposit",
            realmId: ENV.realmId,

            token: userToken
          },
          data: {
            ref_id: orderId,
            acc_no: ENV.user2.accounts[1].acc_no,
            amount: 1000000,
            currency: "USD",
            country: "UK",
            description: "DEPOSIT DETAILS"
          }
        },
        false
      );

      transfer = await sendRequest(
        {
          header: {
            id: 111,
            version: config.apiVersion,
            service: "auth-service",
            method: "checkOtp",
            token: userToken
          },
          data: {
            otp: "111111"
          }
        },
        false
      );

      user2BalanceBefore = await getBalanceByAccNo(
        ENV.user2.accounts[1].acc_no
      );

      usdtAccBefore = await getBalanceByAccNo(ENV.USDT_ACCOUNT);

      merchant = await db.merchant.findOne({
        where: { user_id: ENV.user2.id },
        raw: true
      });
      await db.merchant.update(
        {
          variables: {
            _arr: [{ key: "FEE_ABS_WD", value: 4 }]
          }
        },
        {
          where: { id: merchant.id }
        }
      );

      merchant = await db.merchant.findOne({
        where: { id: merchant.id },
        raw: true
      });
    });

    it("Step 2. Exchange and withdrawal on NIL (amount < 25k)", async () => {
      let res = await sendRequest({
        header: {
          id: 111,
          version: config.apiVersion,
          service: "account-service",
          method: "withdrawalCustomExchangeRate",
          realmId: ENV.realmId,
          token: userToken
        },
        data: {
          ref_id: orderId,
          merchant: merchant.id,
          acc_no: ENV.user2.accounts[1].acc_no,
          acc_tech: ENV.USDT_ACCOUNT,
          wallet: ENV.user2.wallet[0].num,
          description: "",
          amount: 10000,
          currency: "EUR",
          to_currency: "USDT",
          country: "RUS",
          use_stock: true
        }
      });

      transfer = await sendRequest(
        {
          header: {
            id: 111,
            version: config.apiVersion,
            service: "auth-service",
            method: "checkOtp",
            token: userToken
          },
          data: {
            otp: "111111"
          }
        },
        false
      );
      transfer.body.data.cryproTx.transfer.should.have.deep.property(
        "deferred",
        true
      );

      let user2BalanceAfter = await getBalanceByAccNo(
        ENV.user2.accounts[1].acc_no
      );

      let usdtAccAfter = await getBalanceByAccNo(ENV.USDT_ACCOUNT);

      const calculatedFin =
        transfer.body.data.amount *
          0.99 *
          transfer.body.data.cryproTx.custom_exchange_rate -
        5 -
        transfer.body.data.amount * 0.04;

      expect(transfer.body.data.cryproTx.finAmount).to.be.equal(calculatedFin);

      expect(usdtAccBefore).to.be.equal(usdtAccAfter + 405);

      expect(user2BalanceBefore).to.be.equal(user2BalanceAfter + 10000 * 0.99);
      //expect(res.body.data).to.have.deep.property("success", true);

      await db.merchant_account.create({
        id_merchant: merchant.id,
        id_account: ENV.user2.accounts[1].id
      });
      await db.merchant_account.create({
        id_merchant: merchant.id,
        id_account: ENV.user2.accounts[2].id
      });
      await db.account_crypto.create({
        address: "555",
        acc_no: ENV.user2.accounts[2].acc_no
      });
      const wlt = await db.crypto_wallet.create({
        name: "Test",
        num: "777",
        curr_name: "USDT",
        user_id: ENV.user2.id
      });
      await db.org_cryptowallet.create({
        org_id: merchant.id,
        wallet_id: wlt.id
      });
    });

    it("Step 2.1. Exchange and withdrawal on NIL (amount+deferred > 25k)", async () => {
      let res = await sendRequest({
        header: {
          id: 111,
          version: config.apiVersion,
          service: "account-service",
          method: "withdrawalCustomExchangeRate",
          realmId: ENV.realmId,
          token: userToken
        },
        data: {
          ref_id: orderId,
          merchant: merchant.id,
          acc_no: ENV.user2.accounts[1].acc_no,
          acc_tech: ENV.USDT_ACCOUNT,
          wallet: ENV.user2.wallet[0].num,
          description: "",
          amount: 16000,
          currency: "EUR",
          to_currency: "USDT",
          country: "RUS",
          use_stock: true
        }
      });

      transfer = await sendRequest(
        {
          header: {
            id: 111,
            version: config.apiVersion,
            service: "auth-service",
            method: "checkOtp",
            token: userToken
          },
          data: {
            otp: "111111"
          }
        },
        false
      );

      transfer.body.data.cryproTx.nil.should.have.deep.property(
        "amount",
        "29212.4153"
      );
    });

    it("Step 3. First callback on receive usdt on SK wallet", async () => {
      const callBackData = {
        txType: "RECEIVE",
        currencyId: "USDT",
        amount: transfer.body.data.cryproTx.nil.amount,
        txId:
          "0x1d37e2bab0b770b3d9b2dd7da5f48cd1354810097dd4d7b6c453af6adfa1d874",
        address:
          transfer.body.data.cryproTx.nil.destination_address.address_value,
        tag: null,
        confirmations: 52,
        txStatus: "COMPLETED",
        sign: "4Ghf6cHd61M8iBlIr053AjjAqPnOrBQEhoylamEj2BI=",
        networkFee: 0.00507677836,
        networkFeeCurrencyId: "ETH",
        txTime: "2021-04-06 12:41:38"
      };

      transferRecord = await db.transfer.findOne({
        where: { id: transfer.body.data.id },
        raw: true
      });

      const cllback1 = await sendRequest(
        {
          header: {
            id: 111,
            version: config.apiVersion,
            service: "ccoin-service",
            method: "deposit",
            token: userToken
          },
          data: callBackData
        },
        false
      );

      transferRecord = await db.transfer.findOne({
        where: { id: transfer.body.data.id },
        raw: true
      });

      cllback1.body.header.should.have.deep.property("status", "OK");
      transferRecord.should.have.deep.property("status", 1); // 5sec pause
      transferRecord.should.have.deep.property("held", true);
      transferRecord.should.have.deep.property("canceled", false);

      await Queue.newJob("ccoin-service", {
        method: "sendCryptoPaymentChecker",
        data: {}
      });

      await Queue.newJob("ccoin-service", {
        method: "sendCryptoPaymentChecker",
        data: {}
      });

      transferRecord = await db.transfer.findOne({
        where: { id: transfer.body.data.id },
        raw: true
      });

      transferRecord.should.have.deep.property("status", 2);

      //res.body.data.cryproTx.should.have.deep.property("amount", "111.3939");
    });
    it("Step 4. Callback on finishing first output crypto transaction (SK=>Monitoring)", async () => {
      let callBack2Data = {
        txType: "RECEIVE",
        requestId: transferRecord.id,
        currencyId: "USDT",
        amount: transfer.body.data.cryproTx.nil.amount,
        txId:
          "0x50fa0fcd8502e0f6e5772b7d1acb90d8856fc4a104ae9e2d0ae2ea72b35223aa",
        address:
          transfer.body.data.cryproTx.nil.destination_address.address_value,
        tag: null,
        confirmations: 52,
        txStatus: "COMPLETED",
        sign: "4Ghf6cHd61M8iBlIr053AjjAqPnOrBQEhoylamEj2BI=",
        networkFee: 0.00507677836,
        networkFeeCurrencyId: "ETH",
        txTime: "2021-04-06 12:41:38",
        info: "MasterToMonitor"
      };
      let cllback2 = await sendRequest(
        {
          header: {
            id: 111,
            version: config.apiVersion,
            service: "ccoin-service",
            method: "completeTransfer",
            token: userToken
          },
          data: callBack2Data
        },
        false
      );

      transferRecord = await db.transfer.findOne({
        where: { id: transfer.body.data.id },
        raw: true
      });

      // console.log("callBack2Data:", callBack2Data);
      // console.log("cllback2:", cllback2.body.data);
      // console.log("transferRecord:", transferRecord);

      transferRecord.should.have.deep.property("status", 3);
      transferRecord.should.have.deep.property("held", true);
      transferRecord.should.have.deep.property("canceled", false);
      cllback2.body.header.should.have.deep.property("status", "OK");
      cllback2.body.data.should.have.deep.property("info", "MasterToMonitor");
    });

    it("Step 4 (check repeate same transaction)", async () => {
      let callBack2Data = {
        txType: "RECEIVE",
        requestId: transferRecord.id,
        currencyId: "USDT",
        amount: transfer.body.data.cryproTx.nil.amount,
        txId:
          "0x50fa0fcd8502e0f6e5772b7d1acb90d8856fc4a104ae9e2d0ae2ea72b35223aa",
        address:
          transfer.body.data.cryproTx.nil.destination_address.address_value,
        tag: null,
        confirmations: 52,
        txStatus: "COMPLETED",
        sign: "4Ghf6cHd61M8iBlIr053AjjAqPnOrBQEhoylamEj2BI=",
        networkFee: 0.00507677836,
        networkFeeCurrencyId: "ETH",
        txTime: "2021-04-06 12:41:38"
      };
      let cllback2 = await sendRequest(
        {
          header: {
            id: 111,
            version: config.apiVersion,
            service: "ccoin-service",
            method: "completeTransfer",
            token: userToken
          },
          data: callBack2Data
        },
        false
      );

      transferRecord = await db.transfer.findOne({
        where: { id: transfer.body.data.id },
        raw: true
      });

      transferRecord.should.have.deep.property("status", 3);
      cllback2.body.header.should.have.deep.property("status", "ERROR");
    });

    it("Step 5. Callback on finishing second output crypto transaction (Monitoring=>Output)", async () => {
      let callBack2Data = {
        txType: "RECEIVE",
        currencyId: "USDT",
        requestId: transferRecord.id,
        amount: transfer.body.data.cryproTx.nil.amount,
        txId:
          "0xd5fb341c5d8c4e600ecbd725bab4050aedf76b19b223c50c6ac78e8705508f8c",
        address:
          transfer.body.data.cryproTx.nil.destination_address.address_value,
        tag: null,
        confirmations: 52,
        txStatus: "COMPLETED",
        sign: "4Ghf6cHd61M8iBlIr053AjjAqPnOrBQEhoylamEj2BI=",
        networkFee: 0.00507677836,
        networkFeeCurrencyId: "ETH",
        txTime: "2021-04-06 12:41:38"
      };
      let cllback2 = await sendRequest(
        {
          header: {
            id: 111,
            version: config.apiVersion,
            service: "ccoin-service",
            method: "completeTransfer",
            token: userToken
          },
          data: callBack2Data
        },
        false
      );

      const cryptoTx = await db.cryptotx.findAll({
        where: { transfer_id: transfer.body.data.id },
        order: [["ctime", "desc"]],
        limit: 1,
        raw: true
      });

      cryptoTx[0].should.have.deep.property(
        "id",
        "0xd5fb341c5d8c4e600ecbd725bab4050aedf76b19b223c50c6ac78e8705508f8c"
      );

      cllback2.body.header.should.have.deep.property("status", "OK");

      transferRecord = await db.transfer.findOne({
        where: { id: transfer.body.data.id },
        raw: true
      });

      const trx = await db.transfer.findOne({
        where: {
          ref_id: transferRecord.ref_id,
          event_name: "ccoin-service:completeTransfer"
        },
        raw: true
      });

      const trxx = await db.transaction.findAll({
        where: {
          transfer_id: trx.id
        },
        raw: true
      });

      expect(trxx[0].amount.toFixed(11)).to.be.equal("0.00507677836");

      transferRecord.should.have.deep.property("status", 4);
      transferRecord.should.have.deep.property("held", false);
      transferRecord.should.have.deep.property("canceled", false);
      transferRecord.should.have.deep.property("held", false);
    });

    it("Step 2(2). Exchange and withdrawal without NIL", async () => {
      let user2BalanceBefore = await getBalanceByAccNo(
        ENV.user2.accounts[1].acc_no
      );

      let usdtAccBefore = await getBalanceByAccNo(ENV.USDT_ACCOUNT);

      let res = await sendRequest({
        header: {
          id: 111,
          version: config.apiVersion,
          service: "account-service",
          method: "withdrawalCustomExchangeRate",
          realmId: ENV.realmId,
          token: userToken
        },
        data: {
          ref_id: orderId,
          merchant: merchant.id,
          acc_no: ENV.user2.accounts[1].acc_no,
          acc_tech: ENV.USDT_ACCOUNT,
          wallet: ENV.user2.wallet[0].num,
          description: "",
          amount: 10,
          currency: "EUR",
          to_currency: "USDT",
          country: "RUS",
          use_stock: false
        }
      });

      transfer = await sendRequest(
        {
          header: {
            id: 111,
            version: config.apiVersion,
            service: "auth-service",
            method: "checkOtp",
            token: userToken
          },
          data: {
            otp: "111111"
          }
        },
        false
      );

      let user2BalanceAfter = await getBalanceByAccNo(
        ENV.user2.accounts[1].acc_no
      );

      let usdtAccAfter = await getBalanceByAccNo(ENV.USDT_ACCOUNT);

      expect(usdtAccBefore.toFixed(8)).to.be.equal(
        (usdtAccAfter + 5 + 10 * 0.04).toFixed(8)
      );

      expect(user2BalanceBefore).to.be.equal(user2BalanceAfter + 10 * 0.99);
    });

    it("Withdrawal money", async () => {
      let exchange_rate = await getLatestRates({ amount: 10 });

      let data = {
        header: {
          id: 111,
          version: config.apiVersion,
          service: "account-service",
          method: "withdrawal",
          token: userToken
        },
        data: {
          ref_id: "a928565d-989c-482a-a0b5-e7f2ec79a6f6",
          acc_no: ENV.user2.accounts[1].acc_no,
          acc_tech: ENV.USDT_ACCOUNT,
          wallet: ENV.user2.wallet[0].num,
          merchant_id: merchant.id,
          description: "IBAN: GB29 NWBK 6016 1331 9268 19",
          amount: 30000,
          result_amount: 30000,
          currency: "EUR",
          res_currency: "USDT",
          country: "RUS",
          exchange_rate: exchange_rate,
          manualProcessing: true,
          exact_amount: true
        }
      };

      const res = await sendRequest(data);

      res.body.header.should.have.deep.property("status", "OK");
      res.body.data.should.have.deep.property("otpRequred", true);
      res.body.data.should.have.deep.property("transport", "test");
    });

    it("Otp on withdrawal money", async () => {
      const otp = await memstore.get("testotp");

      const usdtAccBefore = await getBalanceByAccNo(
        ENV.user2.accounts[1].acc_no
      );

      let data = {
        header: {
          id: 111,
          version: config.apiVersion,
          service: "auth-service",
          method: "checkOtp",
          token: userToken
        },
        data: {
          otp
        }
      };

      const res = await sendRequest(data);

      const usdtAccAfter = await getBalanceByAccNo(
        ENV.user2.accounts[1].acc_no
      );

      expect(usdtAccBefore).to.be.equal(usdtAccAfter + 30000 * 0.99); // check account balance
      res.body.header.should.have.deep.property("status", "OK");
      res.body.data.should.have.deep.property("transfer_type", "withdrawal");
      res.body.data.should.have.deep.property(
        "description",
        "IBAN: GB29 NWBK 6016 1331 9268 19"
      );
      res.body.data.should.have.deep.property(
        "ref_id",
        "a928565d-989c-482a-a0b5-e7f2ec79a6f6"
      );
    });

    const countDefTx = async () => {
      const res = await db.sequelize.query(
        "select * from transfers where deferred=true and id not in (SELECT transfer_id FROM withdrawal_transfers)",
        {
          type: db.sequelize.QueryTypes.SELECT
        }
      );
      return res;
    };

    it("Deferred transfers providing. Step 1 (creating 2 deferred transfers)", async () => {
      let user2BalanceBefore = await getBalanceByAccNo(
        ENV.user2.accounts[1].acc_no
      );

      let usdtAccBefore = await getBalanceByAccNo(ENV.USDT_ACCOUNT);

      const defWithdrawalDo = async (amount) => {
        await sendRequest({
          header: {
            id: 111,
            version: config.apiVersion,
            service: "account-service",
            method: "withdrawalCustomExchangeRate",
            realmId: ENV.realmId,
            token: userToken
          },
          data: {
            ref_id: orderId,
            merchant: merchant.id,
            acc_no: ENV.user2.accounts[1].acc_no,
            acc_tech: ENV.USDT_ACCOUNT,
            wallet: ENV.user2.wallet[0].num,
            description: "",
            amount: amount,
            currency: "EUR",
            to_currency: "USDT",
            country: "RUS",
            use_stock: true,
            deferred_transfer: true
          }
        });

        const transfer = await sendRequest(
          {
            header: {
              id: 111,
              version: config.apiVersion,
              service: "auth-service",
              method: "checkOtp",
              token: userToken
            },
            data: {
              otp: "111111"
            }
          },
          false
        );
        expect(transfer.body.data.cryproTx.nil).to.be.empty;
      };

      let deferredTransfers = await countDefTx();

      expect(deferredTransfers.length).to.be.equal(0);

      await defWithdrawalDo(12000);
      await defWithdrawalDo(14000);

      let user2BalanceAfter = await getBalanceByAccNo(
        ENV.user2.accounts[1].acc_no
      );
    });

    it("Deferred transfers providing. Step 2 (calling ccoin-service:provideDeferred)", async () => {
      let deferredTransfers = await countDefTx();

      expect(deferredTransfers.length).to.be.equal(2);

      const provideDeferred = await sendRequest({
        header: {
          id: 111,
          version: config.apiVersion,
          service: "ccoin-service",
          method: "provideDeferred",
          realmId: ENV.realmId,
          token: userToken
        },
        data: {
          txIds: deferredTransfers.map((i) => i.id)
        }
      });

      expect(provideDeferred.body.data.provided).to.be.equal(2);

      let nilAmount = await memstore.get("nilWithdrawal");
      nilAmount = parseFloat(nilAmount);
      let defAmount =
        Math.round(
          10000 *
            (deferredTransfers[0].data.finAmount +
              deferredTransfers[1].data.finAmount)
        ) / 10000;

      expect(nilAmount).to.be.equal(defAmount);

      deferredTransfers = await countDefTx();

      expect(deferredTransfers.length).to.be.equal(0);
    });

    it("Deferred transfers providing. Step 3. (First callback on receive usdt on SK wallet)", async () => {
      let nilAmount = await memstore.get("nilWithdrawal");
      nilAmount = parseFloat(nilAmount);

      const callBackData = {
        txType: "RECEIVE",
        currencyId: "USDT",
        amount: nilAmount,
        txId:
          "0x1d37e2bab0b770b3d9b2dd7da5f48cd1354810097dd4d7b6c453af6adfa1d875",
        address: "111111",
        tag: null,
        confirmations: 52,
        txStatus: "COMPLETED",
        sign: "4Ghf6cHd61M8iBlIr053AjjAqPnOrBQEhoylamEj2BI=",
        networkFee: 0.00507677836,
        networkFeeCurrencyId: "ETH",
        txTime: "2021-04-06 12:41:38"
      };

      const cllback1 = await sendRequest(
        {
          header: {
            id: 111,
            version: config.apiVersion,
            service: "ccoin-service",
            method: "deposit",
            token: userToken
          },
          data: callBackData
        },
        false
      );

      let txAfter = await db.withdrawal.findAll({
        raw: true
      });
      txAfter = txAfter[txAfter.length - 1];
      expect(txAfter.status).to.be.equal(2);
      expect(Math.round(txAfter.amount * 10000) / 10000).to.be.equal(nilAmount);

      cllback1.body.header.should.have.deep.property("status", "OK");
    });
  });

  describe("Deposit crypo coins and withdrawal it through NIL", async () => {
    let account_crypto;
    let orderId = "8375a68f-c6d6-47e8-b710-0c6a958ac556";
    let contract_id = "8375a68f-c6d6-47e8-b710-0c6a958ac555";
    let merchant;
    let transfer;

    it("Step 1. Deposit to monitoring", async () => {
      merchant = await db.merchant.findOne({
        where: {
          name: "Org",
          website: "website",
          user_id: ENV.user2.id
        },
        raw: true
      });

      const order = await sendRequest({
        header: {
          id: 111,
          version: config.apiVersion,
          service: "merchant-service",
          method: "createOrder",
          realmId: ENV.realmId,

          token: userToken
        },
        data: {
          id: orderId,
          merchant: ENV.user2.id,
          organisation: merchant.id,
          realm_department: "8375a68f-c6d6-47e8-b710-0c6a958ac555",
          amount: "123",
          currency: "USD",
          res_currency: "USD",
          status: 1,
          details: "qweqweqwe",
          date_from: new Date(),
          date_to: new Date(Date.now() + 86400000),
          contract_id: contract_id,
          order_date: "2021-08-20"
        }
      });

      let Data = {
        txType: "RECEIVE",
        currencyId: "USDT",
        amount: 123,
        txId:
          "0x8e4b256cef85001f1e4dab7618e6ea9d14c1d3a32904076b2d883b92cd828bf1",
        address: "555",
        tag: null,
        confirmations: 22,
        txStatus: "COMPLETED",
        sign: "i6T62HbYSkHg3Ew8AJ5z6sYEfXnkMfbuXTN2g6h9Ym4=",
        fromAddress: "0x78b22647d0366e2a1e4f5f6f7293f00e6f20a111",
        networkFee: 0.001783780515,
        networkFeeCurrencyId: "ETH",
        txTime: "2021-07-09 17:25:01",
        requestId: "526d6fd0-c543-4943-8211-8d42671bb968",
        info: null,
        systemFee: 0
      };

      await db.account_crypto.update(
        { abbr: "USDT" },
        { where: { address: "555" } }
      );

      let res = await sendRequest(
        {
          header: {
            id: 111,
            version: config.apiVersion,
            service: "ccoin-service",
            method: "deposit",
            token: userToken
          },
          data: Data
        },
        false
      );

      account_crypto = res.body.data.acc_monitor;

      res.body.data.should.have.deep.property("action", "deposit");
      res.body.data.should.have.deep.property("ref_id", orderId);
      res.body.data.tx[0].should.have.deep.property("amount", 123);
      res.body.data.tx[0].should.have.deep.property(
        "acc_dst",
        ENV.user2.accounts[2].acc_no
      );
    });

    it("Step 2. Withdrawal of crypto coins", async () => {
      await sendRequest({
        header: {
          id: 111,
          version: config.apiVersion,
          service: "account-service",
          method: "withdrawalCustomExchangeRate",
          realmId: ENV.realmId,
          token: userToken
        },
        data: {
          ref_id: orderId,
          merchant: merchant.id,
          acc_no: account_crypto,
          acc_tech: ENV.EUR_ACCOUNT,
          iban: "123",
          description: "",
          amount: 123,
          currency: "USDT",
          to_currency: "BTC",
          country: "RUS",
          use_stock: true
        }
      });

      let res = await sendRequest(
        {
          header: {
            id: 111,
            version: config.apiVersion,
            service: "auth-service",
            method: "checkOtp",
            token: userToken
          },
          data: {
            otp: "111111"
          }
        },
        false
      );

      transfer = res.body.data;
      // console.log(res.body);
      res.body.data.cryproTx.should.have.deep.property("amount", 123);
      res.body.data.cryproTx.should.have.deep.property(
        "systemFee",
        90.00847872
      );
    });

    it("Step 3. Callback on complete MonitorToMaster", async () => {
      const transferDataBefore = await db.transfer.findOne({
        where: { id: transfer.id },
        attributes: ["id", "status"],
        raw: true
      });

      let res = await sendRequest({
        header: {
          id: 111,
          version: config.apiVersion,
          service: "ccoin-service",
          method: "completeTransfer",
          realmId: ENV.realmId,
          token: userToken
        },
        data: {
          txType: "SEND",
          currencyId: "USDT",
          amount: transfer.amount,
          txId:
            "0x0af9d531f4d0825d092e1e16a9242a032507030b3bfaddc948790dd059a91224",
          address: transfer.cryproTx.toAddress,
          tag: null,
          confirmations: 33,
          txStatus: "COMPLETED",
          sign: "16pQqyDuuk+bjrj6u9/VtqtKyHD3u79oqj69D4SIIII=",
          fromAddress: transfer.cryproTx.fromAddress,
          networkFee: 0.00018678,
          networkFeeCurrencyId: "ETH",
          txTime: "2021-06-21 14:13:52",
          requestId: transfer.id,
          info: "MonitorToMaster"
        }
      });

      const transferData = await db.transfer.findOne({
        where: { id: res.body.data.requestId },
        attributes: ["id", "status"],
        raw: true
      });
      transferDataBefore.should.have.deep.property("status", 1);
      transferData.should.have.deep.property("status", 2);
    });

    it("Step 4. Callback on complete MasterToExternal", async () => {
      let res = await sendRequest({
        header: {
          id: 111,
          version: config.apiVersion,
          service: "ccoin-service",
          method: "completeTransfer",
          realmId: ENV.realmId,
          token: userToken
        },
        data: {
          txType: "SEND",
          currencyId: "USDT",
          amount: transfer.amount,
          txId:
            "0x0af9d531f4d0825d092e1e16a9242a032507030b3bfaddc948790dd059a91225",
          address: transfer.cryproTx.toAddress,
          tag: null,
          confirmations: 33,
          txStatus: "COMPLETED",
          sign: "16pQqyDuuk+bjrj6u9/VtqtKyHD3u79oqj69D4SIIII=",
          fromAddress: transfer.cryproTx.fromAddress,
          networkFee: 0.00018678,
          networkFeeCurrencyId: "ETH",
          txTime: "2021-06-21 14:13:52",
          requestId: transfer.id,
          info: "MasterToExternal"
        }
      });

      const transferData = await db.transfer.findOne({
        where: { id: transfer.id },
        attributes: ["id", "status", "deferred"],
        raw: true
      });

      res.body.data.should.have.deep.property("nil");
      transferData.should.have.deep.property("deferred", true);
    });

    it("Validate crypto wallet address", async () => {
      let data = {
        header: {
          id: 111,
          version: config.apiVersion,
          service: "ccoin-service",
          method: "validateAddress"
        },
        data: {
          address: "0x78B22647d0366E2a1E4f5f6F7293F00E6F20acB1",
          currency: "ETH"
        }
      };

      const res = await sendRequest(data);

      res.body.header.should.have.deep.property("status", "OK");
      res.body.data.should.have.deep.property("valid", true);
    });
    it("Validate crypto wallets addresses", async () => {
      let data = {
        header: {
          id: 111,
          version: config.apiVersion,
          service: "ccoin-service",
          method: "validateAddresses"
        },
        data: {
          addresses: ["0x78B22647d0366E2a1E4f5f6F7293F00E6F20acB1"],
          currency: "ETH"
        }
      };

      const res = await sendRequest(data);
      res.body.header.should.have.deep.property("status", "OK");
      res.body.data.should.have.deep.property("valid", true);
    });
  });
});
