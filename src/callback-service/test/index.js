import chai from "chai";
let should = chai.should();

import Service from "../src/Service.js";
const service = new Service({ name: "callback-service" });

describe("Callback service", async () => {
  before(async () => {
    // this code runs before all tests
  });

  after(function() {});

  describe("Set transfer status", () => {
    it("Set transfer status to processed", async () => {
      const res = await service.runServiceMethod({
        method: "setProcessed",
        data: {
          id: "a928565d-989c-482a-a0b5-e7f2ec79a6f6"
        }
      });
      res.should.have.deep.property("success", true);
    });

    it("Set transfer status to refund", async () => {
      const res = await service.runServiceMethod({
        method: "setRefund",
        data: {
          id: "a928565d-989c-482a-a0b5-e7f2ec79a6f6"
        }
      });
      res.should.have.deep.property("success", true);
    });

    it("Set transfer status to canceled", async () => {
      const res = await service.runServiceMethod({
        method: "setCanceled",
        data: {
          id: "a928565d-989c-482a-a0b5-e7f2ec79a6f6"
        }
      });
      res.should.have.deep.property("success", true);
    });
  });
});
