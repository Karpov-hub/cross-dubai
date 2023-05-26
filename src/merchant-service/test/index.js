import chai from "chai";
let should = chai.should();
let expect = chai.expect;
import pretest from "@lib/pretest";
import db from "@lib/db";

import Service from "../src/Service.js";
const service = new Service({ name: "merchant-service" });
let realmId;
let ENV;
const MERCH_FEE_ACCOUNT = "33000001";

describe("Merchant service", async () => {
  before(async () => {
    ENV = await pretest.before();
    realmId = ENV.realmId;

    await db.merchant.destroy({
      truncate: {
        cascade: false
      }
    });
    await db.order.destroy({
      truncate: {
        cascade: false
      }
    });

    await db.account.create({
      acc_no: MERCH_FEE_ACCOUNT,
      currency: "USD",
      owner: realmId,
      balance: 0,
      status: 1,
      negative: false,
      ctime: new Date(),
      mtime: new Date(),
      removed: 0,
      maker: realmId
    });
  });

  after(async () => {});

  let merchantId;
  describe("Merchant service methods", () => {
    it("Create merchant", async () => {
      const res = await service.runServiceMethod({
        method: "createMerchant",
        data: {
          name: "merchant1",
          website: "www.website.com",
          description: "some text",
          categories: "1 category",
          account_fiat: "1000002",
          account_crypto: "20000000001"
        },
        realmId,
        userId: ENV.user2.id
      });

      res.should.have.deep.property("token");
    });

    it("Get merchants", async () => {
      const res = await service.runServiceMethod({
        method: "getMerchants",
        data: {
          start: 0,
          limit: 1
        },
        realmId,
        userId: ENV.user2.id
      });

      merchantId = res.merchants[0].id;
      res.should.have.deep.property("count");
      res.should.have.deep.property("merchants");
    });
    it("Get merchant", async () => {
      const res = await service.runServiceMethod({
        method: "getMerchant",
        data: {
          merchant_id: merchantId
        },
        realmId,
        userId: ENV.user2.id
      });
      res.should.have.deep.property("id");
      res.should.have.deep.property("accounts");
    });

    if (
      ("Add IBAN",
      async () => {
        const res = await service.runServiceMethod({
          method: "addIBAN",
          data: {
            org_id: merchantId,
            name: "test",
            bank_details: "test"
          },
          realmId,
          userId: ENV.user2.id
        });
        res.should.have.deep.property("success", true);
      })
    )
      it("Update merchant", async () => {
        const res = await service.runServiceMethod({
          method: "updateMerchant",
          data: {
            merchant_id: merchantId,
            acc1: ENV.user2.accounts[0].id,
            acc2: ENV.user2.accounts[1].id,
            name: "merchant_new",
            website: "www.website-new.com",
            description: "another text",
            callback: "callback",
            callback_error: "callback error"
          },
          realmId,
          userId: ENV.user1.id
        });

        res.should.have.deep.property("success", true);
      });

    it("Deposit", async () => {
      await db.merchant.update(
        {
          variables: {
            _arr: [
              {
                key: "FEE_ACCOUNT",
                descript: "",
                value: MERCH_FEE_ACCOUNT
              }
            ]
          }
        },
        {
          where: { id: merchantId }
        }
      );

      const res = await service.runServiceMethod({
        method: "deposit",
        data: {
          merchant_id: merchantId,
          amount: 100,
          currency: "USD",
          ref_id: "a928565d-989c-482a-a0b5-e7f2ec79a6f6"
        },
        realmId
      });

      res.should.have.deep.property("owner");
      res.should.have.deep.property(
        "ref_id",
        "a928565d-989c-482a-a0b5-e7f2ec79a6f6"
      );
      res.should.have.deep.property("transfer_type", "deposit");
      res.should.have.deep.property("amount", 100);
      res.should.have.deep.property("acc_src");
      res.should.have.deep.property("acc_dst");
    });

    it("Create contract", async () => {
      const res = await service.runServiceMethod({
        method: "addContract",
        data: {
          id: "223f33c1-3416-4dcb-8ef4-0916d4d9e72d",
          director_name: "Name of director",
          contract_subject: "Subject of Contract",
          files: [
            {
              code: "c53d053c-78b8-4af7-b8c8-0e99c56334c5",
              name: "Name of file"
            }
          ],
          description: "Description of Contract",
          contract_date: new Date(),
          expiration_date: new Date(),
          merchant: "3f4d56c7-f25e-4103-b71f-4617cdc2050c",
          realm: "7457349e-c49f-437e-a689-198dca2889aa"
        }
      });
      res.should.have.deep.property("success", true);
    });

    it("Upload file to the contract", async () => {
      const res = await service.runServiceMethod({
        method: "uploadFile",
        data: {
          id: "7457349e-c49f-437e-a689-198dca2889aa",
          files: [
            {
              code: "c53d053c-78b8-4af7-b8c8-0e99c56334c5",
              name: "Name of file"
            }
          ],
          owner_id: "612663c5-8dd8-4343-9175-673fcd5d61d3"
        }
      });
    });

    let org, order;

    it("Create order", async () => {
      org = await db.merchant.create({
        name: "Org",
        website: "website",
        user_id: ENV.user2.id
      });

      const res = await service.runServiceMethod({
        method: "createOrder",
        data: {
          id: "8375a68f-c6d6-47e8-b710-0c6a958ac554",
          merchant: ENV.user2.id,
          organisation: org.dataValues.id,
          amount: "123",
          currency: "EUR",
          res_currency: "USD",
          status: 0,
          details: "qweqweqwe",
          bank_details: "testestestestesresf",
          realm_department: ENV.realmDepartment.dataValues.id,
          d: "223f33c1-3416-4dcb-8ef4-0916d4d9e72d",
          contract_id: "223f33c1-3416-4dcb-8ef4-0916d4d9e72d",
          order_date: "2021-08-20"
        },
        realmId,
        userId: ENV.user2.id
      });

      res.should.have.deep.property("success", true);
    });

    it("Change order status", async () => {
      const res = await service.runServiceMethod({
        method: "changeOrderStatus",
        data: {
          id: "8375a68f-c6d6-47e8-b710-0c6a958ac554",
          status: 1
        },
        realmId,
        userId: ENV.user2.id
      });

      res.should.have.deep.property("success", true);
    });

    it("Create another order with statues 'ongoing' (previous should be switched to status 'completed')", async () => {
      const res = await service.runServiceMethod({
        method: "createOrder",
        data: {
          id: "8375a68f-c6d6-47e8-b710-0c6a958ac577",
          merchant: ENV.user2.id,
          organisation: org.dataValues.id,
          amount: "123",
          currency: "EUR",
          res_currency: "USD",
          status: 1,
          details: "qweqweqwe",
          bank_details: "testestestestesresf",
          d: "223f33c1-3416-4dcb-8ef4-0916d4d9e72d",
          contract_id: "223f33c1-3416-4dcb-8ef4-0916d4d9e72d",
          order_date: "2021-08-20",
          realm_department: ENV.realmDepartment.dataValues.id
        },
        realmId,
        userId: ENV.user2.id
      });

      const prevOrder = await db.order.findOne({
        where: { id: "8375a68f-c6d6-47e8-b710-0c6a958ac554" },
        attributes: ["status"]
      });

      prevOrder.should.have.deep.property("status", 2);
    });

    it("Change order status. Should be just one order with status 'ongoing' per merchant", async () => {
      const res = await service.runServiceMethod({
        method: "changeOrderStatus",
        data: {
          id: "8375a68f-c6d6-47e8-b710-0c6a958ac554",
          status: 1
        },
        realmId,
        userId: ENV.user2.id
      });

      const prevOrder = await db.order.findOne({
        where: { id: "8375a68f-c6d6-47e8-b710-0c6a958ac577" },
        attributes: ["status"]
      });

      prevOrder.should.have.deep.property("status", 2);
    });
  });
});
