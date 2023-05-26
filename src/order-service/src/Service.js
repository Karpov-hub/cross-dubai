import Base from "@lib/base";
import NonAdOrder from "./lib/non_ad_order";
import TfActions from "./lib/tf_actions";

export default class Service extends Base {
  publicMethods() {
    return {
      getNonAdOrdersList: {
        realm: true,
        user: true,
        description: "Get list of non-ad orders",
        method: NonAdOrder.getNonAdOrdersList,
        schema: {
          type: "object",
          properties: {
            filters: {
              type: "object",
              properties: {
                date: {
                  type: "object",
                  properties: {
                    from: { type: "string" },
                    to: { type: "string" }
                  }
                },
                merchant_id: {
                  type: "string"
                },
                status: {
                  type: "integer"
                }
              }
            },
            order: {
              type: "object",
              properties: {
                field: { type: "string" },
                dir: { type: "string" }
              }
            },
            opts: {
              type: "object",
              properties: {
                start: { type: "integer" },
                limit: { type: "integer" }
              },
              required: ["start", "limit"]
            }
          },
          required: ["opts"]
        }
      },

      getNonAdOrder: {
        realm: true,
        user: true,
        description: "Get non-ad order",
        method: NonAdOrder.getNonAdOrder,
        schema: {
          type: "object",
          properties: {
            order_id: { type: "string" }
          },
          required: ["order_id"]
        }
      },

      approveTransfer: {
        realm: true,
        user: true,
        description: "Approve transfer from non-ad order field",
        method: TfActions.approveTransfer,
        schema: {
          type: "object",
          properties: {
            field: { type: "string" },
            transfer_id: { type: "string" }
          },
          required: ["field", "transfer_id"]
        }
      },

      rejectTransfer: {
        realm: true,
        user: true,
        description: "Reject transfer from non-ad order field",
        method: TfActions.rejectTransfer,
        schema: {
          type: "object",
          properties: {
            field: { type: "string" },
            transfer_id: { type: "string" }
          },
          required: ["field", "transfer_id"]
        }
      }
    };
  }
}
