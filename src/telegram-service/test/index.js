import chai from "chai";
let should = chai.should();
import pretest from "@lib/pretest";
import db from "@lib/db";

import Service from "../src/Service.js";
const service = new Service({
  name: "telegram-service"
});

let ENV;

describe("Mail service", async () => {
  before(async () => {});

  after(async () => {});

  describe("Telegram service", () => {});
});
