import Base from "@lib/base";
import Account from "./lib/account.js";
import Nil from "./lib/nil.js";
import txHistory from "./lib/history";

export default class Service extends Base {
  publicMethods() {
    return {
      depositSysUsdt: {
        description: "depositSysUsdt",
        method: Account.depositSysUsdt,
        schema: {
          type: "object",
          properties: {
            amount: { type: "number" }
          },
          required: ["amount"]
        }
      },
      requestForQuote: {
        description: "requestForQuote",
        method: Nil.requestForQuote,
        schema: {
          type: "object",
          properties: {
            client_rfq_id: { type: "string" },
            quantity: { type: "string" },
            side: { type: "string" },
            instrument: { type: "number" }
          },
          required: []
        }
      },
      getTxHistory: {
        description: "Get transaction history",
        method: txHistory.getTxHistory,
        schema: {
          type: "object",
          properties: {
            currency: { type: "string" },
            type: { type: "string" },
            group: { type: "string" },
            from_date: { type: "string" },
            to_date: { type: "string" }
          }
        }
      },
      withdrawal: {
        description: "Withdrawal money",
        method: Nil.withdrawal,
        schema: {
          type: "object",
          properties: {
            currency: { type: "string" },
            amount: { type: "string" },
            destination_address: { type: "object" },
            destination_bank_account: { type: "string" }
          }
        }
      },
      getBalance: {
        description: "getBalance",
        method: Nil.getBalance,
        schema: {
          type: "object",
          properties: {}
        }
      },
      exchange: {
        description: "exchange",
        method: Nil.exchange,
        schema: {
          type: "object",
          properties: {
            amount: { type: "string" },
            currency: { type: "string" },
            to_currency: { type: "string" }
          }
        }
      }
    };
  }
}
