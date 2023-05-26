import chai from "chai";
let should = chai.should();
const expect = chai.expect;

import Service from "../src/Service.js";
const service = new Service({ name: "currency-service" });

describe("Currency service", async () => {
  before(async () => {
    // this code runs before all tests
  });

  after(function() {});

  it("Get available services", async () => {
    const res = await service.runServiceMethod({
      method: "getServices",
      data: {}
    });
    expect(res).to.include.members(["fiat_crypto"]);
  });

  // it("Get exchange rates ECB", async () => {
  //   const res = await service.runServiceMethod({
  //     method: "getRates",
  //     data: { service: "ecb" }
  //   });
  //   expect(res.currency).to.include.deep.members([{ abbr: "EUR", value: 1 }]);
  // });

  // it("Get exchange rates NIL", async () => {
  //   const res = await service.runServiceMethod({
  //     method: "getRates",
  //     data: { service: "nil" }
  //   });

  //   expect(res.currency).to.include.deep.members([{ abbr: "EUR", value: 1 }]);
  // });

  // it("Get exchange rates from CBR", async () => {
  //   const res = await service.runServiceMethod({
  //     method: "getRates",
  //     data: { service: "fiat_crypto" }
  //   });
  //   expect(res.currency).to.include.deep.members([{ abbr: "USD", value: 1 }]);
  // });
});
