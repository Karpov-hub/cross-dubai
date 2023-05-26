import chai from "chai";
import chaiHttp from "chai-http";
import server from "../../src/index.js";
import db from "@lib/db";
import pretest from "@lib/pretest";
import memstore from "@lib/memstore";
import doc from "@lib/chai-documentator";
import uuid from "uuid/v4";
import config from "@lib/config";

chai.use(require("chai-like"));
chai.use(require("chai-things"));

let userToken;
let file_data =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAADICAYAAACtWK6eAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAALEgAACxIB0t1+/AAAABh0RVh0U29mdHdhcmUAQWRvYmUgRmlyZXdvcmtzT7MfTgAAABZ0RVh0Q3JlYXRpb24gVGltZQAwNi8yNy8xMxoI2XgAAAKSSURBVHic7dyxjsIwFABBfOL/f9lXXIu2cC44kJk+wlisHsVTxpxzPoCXfnYfAK5MIBAEAkEgEAQCQSAQBAJBIBAEAkEgEAQCQSAQBAJBIBAEAkEgEAQCQSAQBAJBIBAEAkEgEAQCQSAQBAJBIBAEAkEgEAQC4bn7AHczxlh+1ov4388EgSAQCAKBIBAIAoEgEAgCgSAQCAKBIBAIAoEgEAgCgWCbd9GRrdx3fqYN4GNMEAgCgSAQCAKBIBAIAoEgEAgCgSAQCAKBIBAIAoEgEAgCgXDrdfcdK+ur6+erZ119zpr8HxMEgkAgCASCQCAIBIJAIAgEgkAgCASCQCAIBIJAIAgEwphfsrb57s3cT7o2d7POBIEgEAgCgSAQCAKBIBAIAoEgEAgCgSAQCAKBIBAIAoEgEAiXW3e3mn0Nn/Ri7zOZIBAEAkEgEAQCQSAQBAJBIBAEAkEgEAQCQSAQBALhtGXFb1863LHMt+IO93LmdzRBIAgEgkAgCASCQCAIBIJAIAgEgkAgCASCQCAIBIJAIDx3H+BujmyefsoG8Tc5LZDVH4IfwT1d8b28j4e/WJAEAkEgEAQCQSAQBAJBIBAEAkEgEAQCQSAQBAJBIBAEAkEgEAQCQSAQBAJBIBAEAkEgEAQCQSAQBAJBIBAEAkEgEAQCQSAQBAJBIBAEAkEgEAQCQSAQBAJBIBAEAkEgEAQC4bn7AP9ljLH7CJfkXo4xQSAIBIJAIAgEgkAgCASCQCAIBIJAIAgEgkAgCASCQCAIBMKYc87dh4CrMkEgCASCQCAIBIJAIAgEgkAgCASCQCAIBIJAIAgEgkAgCASCQCAIBIJAIAgEgkAgCASCQCAIBIJAIAgEgkAgCASCQCD8AkUtP407XiL1AAAAAElFTkSuQmCC";

let ENV;
let realmId;
let userId;
let ticketId;

chai.use(chaiHttp);

describe("Support service methods", async () => {
  before(async () => {
    ENV = await pretest.before();
    realmId = ENV.realmId;
    userId = ENV.user1.dataValues.id;
    userToken = global.userToken;
  });
  after(async () => {});

  it("Create ticket", async () => {
    let data = {
      header: {
        id: 111,
        version: config.apiVersion,
        service: "support-service",
        method: "createTicket",
        token: userToken
      },
      data: {
        title: "Ticket",
        category: "Withdrawal",
        message: "Problem with Withdrawal",
        files: [
          {
            name: "passport.png",
            data: file_data
          }
        ],
        is_user_message: true
      }
    };
    const res = await doc(
      chai
        .request(server)
        .post("/")
        .set("Origin", "http://" + realmHost)
        .set("content-type", "application/json")
        .set("authorization", "bearer" + realmToken)
        .send(data)
    );

    res.body.header.should.have.deep.property("status", "OK");
    ticketId = res.body.data.ticket.ticket_id;
  });

  it("Get tickets", async () => {
    let data = {
      header: {
        id: 111,
        version: config.apiVersion,
        service: "support-service",
        method: "getTickets",
        token: userToken
      },
      data: {}
    };
    const res = await doc(
      chai
        .request(server)
        .post("/")
        .set("Origin", "http://" + realmHost)
        .set("content-type", "application/json")
        .set("authorization", "bearer" + realmToken)
        .send(data)
    );
    res.body.header.should.have.deep.property("status", "OK");
  });

  it("Create comment", async () => {
    let data = {
      header: {
        id: 111,
        version: config.apiVersion,
        service: "support-service",
        method: "createComment",
        token: userToken
      },
      data: {
        ticket_id: ticketId,
        message: "Hi",
        files: [
          {
            name: "passport.jpg",
            data: file_data
          }
        ],
        is_user_message: true
      }
    };
    const res = await doc(
      chai
        .request(server)
        .post("/")
        .set("Origin", "http://" + realmHost)
        .set("content-type", "application/json")
        .set("authorization", "bearer" + realmToken)
        .send(data)
    );
    res.body.header.should.have.deep.property("status", "OK");
  });

  it("Get comments", async () => {
    let data = {
      header: {
        id: 111,
        version: config.apiVersion,
        service: "support-service",
        method: "getComments",
        token: userToken
      },
      data: {
        ticketId: ticketId
      }
    };
    const res = await doc(
      chai
        .request(server)
        .post("/")
        .set("Origin", "http://" + realmHost)
        .set("content-type", "application/json")
        .set("authorization", "bearer" + realmToken)
        .send(data)
    );
    res.body.header.should.have.deep.property("status", "OK");
  });

  it("Reopen ticket", async () => {
    let data = {
      header: {
        id: 111,
        version: config.apiVersion,
        service: "support-service",
        method: "reopenTicket",
        token: userToken
      },
      data: {
        ticket_id: ticketId
      }
    };
    const res = await doc(
      chai
        .request(server)
        .post("/")
        .set("Origin", "http://" + realmHost)
        .set("content-type", "application/json")
        .set("authorization", "bearer" + realmToken)
        .send(data)
    );

    res.body.header.should.have.deep.property("status", "OK");
  });

  it("Send notification", async () => {
    let data = {
      header: {
        id: 111,
        version: config.apiVersion,
        service: "support-service",
        method: "sendNotification",
        token: userToken
      },
      data: {
        message: "New notification",
        sender: "Admin",
        user_id: userId
      }
    };
    const res = await doc(
      chai
        .request(server)
        .post("/")
        .set("Origin", "http://" + realmHost)
        .set("content-type", "application/json")
        .set("authorization", "bearer" + realmToken)
        .send(data)
    );

    res.body.header.should.have.deep.property("status", "OK");
  });

  it("Get notifications", async () => {
    let data = {
      header: {
        id: 111,
        version: config.apiVersion,
        service: "support-service",
        method: "getNotifications",
        token: userToken
      },
      data: {
        start: 0,
        limit: 10,
        is_new: 1,
        mark_is_read: true
      }
    };
    const res = await doc(
      chai
        .request(server)
        .post("/")
        .set("Origin", "http://" + realmHost)
        .set("content-type", "application/json")
        .set("authorization", "bearer" + realmToken)
        .send(data)
    );

    res.body.header.should.have.deep.property("status", "OK");
  });
});
