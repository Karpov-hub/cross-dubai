import chai from "chai";
import db from "@lib/db";
import pretest from "@lib/pretest";

let expect = chai.expect;

import Service from "../src/Service.js";
import PrepareOrder from "./prep/order.js";
const service = new Service({ name: "order-service" });
let ENV = {};

describe("Order service", async () => {
  before(async () => {
    ENV = await pretest.before();
    let merchant = await db.merchant.create({
      name: "test_merch_1",
      user_id: ENV.user1.id,
      ctime: new Date(),
      mtime: new Date()
    });
    // status: * 0 - Created
    //         * 1 - In progress
    //         * 2 - Completed
    await PrepareOrder.createNonAdOrder(
      merchant.id,
      "CardsWithWithdrawalFiat",
      0
    );
    await PrepareOrder.createNonAdOrder(
      merchant.id,
      "CardsWithWithdrawalFiat",
      1
    );
    let res = await PrepareOrder.createNonAdOrder(
      merchant.id,
      "CardsWithWithdrawal",
      0
    );
    ENV.non_ad_order_id = res.get("id");
    ENV.acc_plan = await PrepareOrder.createPlanForNonAdOrder();
    await PrepareOrder.createTestTransfersOnOrder(
      ENV.non_ad_order_id,
      ENV.acc_plan,
      merchant.id,
      ENV.user1.id
    );
    await PrepareOrder.createTestTranchesOnOrder(ENV.non_ad_order_id);
    await PrepareOrder.createNonAdOrder(merchant.id, "CardsWithWithdrawal", 1);
    ENV = { ...ENV, ...PrepareOrder.ENV };
  });

  after(async () => {
    await PrepareOrder.after();
  });

  describe("Get list of all non-ad orders", () => {
    it("getNonAdOrdersList: only with pagination", async () => {
      const res = await service.runServiceMethod({
        method: "getNonAdOrdersList",
        data: {
          opts: {
            start: 0,
            limit: 3
          }
        },
        realmId: ENV.realmId,
        userId: ENV.user1.id
      });

      expect(res)
        .to.have.property("count")
        .that.is.a("number")
        .and.equal(4);
      expect(res)
        .to.have.property("list")
        .that.is.an("array")
        .and.have.lengthOf(3);
    });
    it("getNonAdOrdersList: with pagination and ordering", async () => {
      const res = await service.runServiceMethod({
        method: "getNonAdOrdersList",
        data: {
          order: {
            field: "status",
            dir: "ASC"
          },
          opts: {
            start: 0,
            limit: 2
          }
        },
        realmId: ENV.realmId,
        userId: ENV.user1.id
      });
      expect(res)
        .to.have.property("count")
        .that.is.a("number")
        .and.equal(4);
      expect(res)
        .to.have.property("list")
        .that.is.an("array")
        .and.have.lengthOf(2);
      expect(res.list[0])
        .to.have.property("status")
        .that.is.a("number")
        .and.equal(0);
    });
    it("getNonAdOrdersList: with pagination, ordering and filter by status", async () => {
      const res = await service.runServiceMethod({
        method: "getNonAdOrdersList",
        data: {
          filters: {
            status: 1
          },
          order: {
            field: "ctime",
            dir: "DESC"
          },
          opts: {
            start: 0,
            limit: 4
          }
        },
        realmId: ENV.realmId,
        userId: ENV.user1.id
      });
      expect(res)
        .to.have.property("count")
        .that.is.a("number")
        .and.equal(2);
      expect(res)
        .to.have.property("list")
        .that.is.an("array")
        .and.have.lengthOf(2);
      expect(res.list[0])
        .to.have.property("status")
        .that.is.a("number")
        .and.equal(1);
      expect(res.list[0].ctime > res.list[1].ctime).to.be.equal(true);
    });
  });

  describe("Get non-ad order data", () => {
    it("getNonAdOrder: getting data by order id", async () => {
      const res = await service.runServiceMethod({
        method: "getNonAdOrder",
        data: {
          order_id: ENV.non_ad_order_id
        },
        realmId: ENV.realmId,
        userId: ENV.user1.id
      });

      expect(res)
        .to.be.an("object")
        .that.have.property("id");
      expect(res).to.have.property("additional_data");
      expect(res.additional_data).to.have.property("provided");
      expect(res.additional_data).to.have.property("provided_transfer_id");
      expect(res.additional_data).to.have.property("not_provided");
      expect(res.additional_data).to.have.property("not_provided_transfer_id");
      expect(res.additional_data)
        .to.have.property("provided_transfer_data")
        .that.is.an("object");
      expect(res.additional_data)
        .to.have.property("not_provided_transfer_data")
        .that.is.an("object");
      expect(res.additional_data.provided_transfer_data).to.have.property("id");
      expect(res.additional_data.provided_transfer_data)
        .to.have.property("transfers")
        .that.is.an("array")
        .and.have.lengthOf(2);
      expect(res.additional_data.provided_transfer_data.transfers[1])
        .to.have.property("transactions")
        .that.is.an("array")
        .and.have.lengthOf(2);
      expect(
        res.additional_data.provided_transfer_data.transfers[1].transactions[0]
      ).to.have.property("id");
    });
  });

  describe("Approve transfer in Non Ad order", () => {
    it("approveTransfer: approve transfer successfully", async () => {
      const res = await service.runServiceMethod({
        method: "approveTransfer",
        data: {
          field: "not_provided",
          transfer_id: ENV.not_sent_transfer
        },
        realmId: ENV.realmId,
        userId: ENV.user1.id
      });

      expect(res).to.be.an("object");
      expect(res)
        .that.have.property("success")
        .that.equal(true);
      expect(res).to.have.property("transfer_id").that.is.not.empty;

      let plan_transfer = await db.transfers_plan.findOne({
        where: { id: res.transfer_id },
        attributes: ["id"],
        raw: true
      });
      expect(plan_transfer)
        .to.be.an("object")
        .and.have.property("id");
      let non_ad_order_data = await db.non_ad_order.findOne({
        where: { id: ENV.non_ad_order_id },
        attributes: ["additional_data"],
        raw: true
      });
      expect(plan_transfer.id).to.be.equal(
        non_ad_order_data.additional_data[`${res.field}_transfer_id`]
      );
    });
  });

  describe("Reject transfer in Non Ad order", () => {
    it("rejectTransfer: rejection transfer successfully", async () => {
      let transfer_before = await db.not_sent_plan_transfer.findOne({
        where: { id: ENV.transfer_for_rejection },
        attributes: ["id"],
        raw: true
      });
      expect(transfer_before).to.have.property("id");
      expect(transfer_before.id).to.be.equal(ENV.transfer_for_rejection);

      const res = await service.runServiceMethod({
        method: "rejectTransfer",
        data: {
          field: "for_reject",
          transfer_id: ENV.transfer_for_rejection
        },
        realmId: ENV.realmId,
        userId: ENV.user1.id
      });

      expect(res).to.be.an("object");
      expect(res)
        .that.have.property("success")
        .that.equal(true);

      let transfer_after = await db.not_sent_plan_transfer.findOne({
        where: { id: ENV.transfer_for_rejection },
        attributes: ["id"],
        raw: true
      });
      expect(transfer_after).to.be.null;
    });
  });
});
