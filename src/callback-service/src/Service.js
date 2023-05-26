import Base from "@lib/base";
import Callback from "./lib/callback_methods";

export default class Service extends Base {
  publicMethods() {
    return {
      setProcessed: {
        method: Callback.setProcessed,
        description: "Set transfer status to processed",
        schema: {
          type: "object",
          properties: {
            id: { type: "string" }
          },
          required: ["id"]
        }
      },
      setRefund: {
        method: Callback.setRefund,
        description: "Set transfer status to refund",
        schema: {
          type: "object",
          properties: {
            id: { type: "string" }
          },
          required: ["id"]
        }
      },
      setCanceled: {
        method: Callback.setCanceled,
        description: "Set transfer status to canceled",
        schema: {
          type: "object",
          properties: {
            id: { type: "string" }
          },
          required: ["id"]
        }
      }
    };
  }
}
