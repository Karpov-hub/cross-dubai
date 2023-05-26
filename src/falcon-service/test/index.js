import chai from "chai";
let should = chai.should();

import Service from "../src/Service.js";
const service = new Service({ name: "falcon-service" });

if (process.env.NODE_ENV == "localtest")
  describe("Falcon service", async () => {
    before(async () => {
      // this code runs before all tests
    });

    after(function() {});
    /*
    describe("NIL", () => {
      it("Get transaction history", async () => {
        const res = await service.runServiceMethod({
          method: "getTxHistory",
          data: {}
        });
        chai.expect(res).to.be.an("array");
      });

      it("Withdrawal fiat", async () => {
        const res = await service.runServiceMethod({
          method: "withdrawal",
          data: {
            amount: "100",
            currency: "EUR",
            destination_bank_account: "USD Bank Account"
          }
        });
        chai.expect(res).to.be.an("object");
      });

      it("Withdrawal crypto", async () => {
        const res = await service.runServiceMethod({
          method: "withdrawal",
          data: {
            amount: "100",
            currency: "XRP",
            destination_address: {
              address_value: "rUQngTebGgF1tCexhuPaQBr5MufweybMom",
              address_suffix: "tag0",
              address_protocol: null
            }
          }
        });
        chai.expect(res).to.be.an("object");
      });

      it("Get Balance", async () => {
        const res = await service.runServiceMethod({
          method: "getBalance",
          data: {}
        });
        chai.expect(res).to.be.an("object");
      });

      it("Exchange", async () => {
        const res = await service.runServiceMethod({
          method: "exchange",
          data: {
            amount: "1",
            currency: "UST",
            to_currency: "EUR"
          }
        });
        chai.expect(res).to.be.an("object");
      });
    });
    */
  });
