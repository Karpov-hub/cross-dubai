import chai from "chai";
let should = chai.should();

import Service from "../src/Service.js.js";
const service = new Service({ name: "file-service" });

describe("File service", async () => {
  before(async () => {
    // this code runs before all tests
  });

  after(function() {});

  describe("Ping", () => {
    it("Should return test-pong", async () => {});
  });
});
