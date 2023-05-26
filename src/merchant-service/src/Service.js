import Base from "@lib/base";
import Deposit from "./lib/deposit";
import Crypto from "./lib/crypto";
import Order from "./lib/order";
import Merchant from "./lib/merchant";
import Contracts from "./lib/contracts";

export default class Service extends Base {
  publicMethods() {
    return {
      deposit: {
        realm: true,
        user: false,
        method: Deposit.deposit,
        description: "Purchase through merchant",
        schema: {
          type: "object",
          properties: {
            id: { type: "string" },
            owner_id: { type: "string" },
            files: {
              type: "array",
              items: { type: "object" }
            }
          },
          required: ["id", "owner_id", "files"]
        }
      },
      createMerchant: {
        realm: true,
        user: true,
        method: Merchant.createMerchant,
        description: "create merchant",
        schema: {
          type: "object",
          properties: {
            name: { type: "string" },
            website: { type: "string" },
            description: { type: "string" },
            categories: { type: "string" },
            account_fiat: { type: "string" },
            account_crypto: { type: "string" }
          },
          required: [
            "name",
            "website",
            "description",
            "categories",
            "account_fiat",
            "account_crypto"
          ]
        }
      },
      getMerchants: {
        realm: true,
        user: true,
        method: Merchant.getMerchants,
        description: "get merchants",
        schema: {
          type: "object",
          properties: {
            start: { type: "integer" },
            limit: { type: "integer" }
          }
        }
      },
      updateMerchant: {
        realm: true,
        user: true,
        method: Merchant.updateMerchant,
        description: "update merchant",
        schema: {
          type: "object",
          properties: {
            merchant_id: { type: "string" },
            name: { type: "string" },
            website: { type: "string" },
            description: { type: "string" },
            callback: { type: "string" },
            callback_error: { type: "string" }
          },
          required: [
            "merchant_id",
            "name",
            "website",
            "description",
            "callback",
            "callback_error"
          ]
        }
      },
      getMerchant: {
        realm: true,
        user: true,
        method: Merchant.getMerchant,
        description: "get merchant",
        schema: {
          type: "object",
          properties: {
            merchant_id: { type: "string" }
          },
          required: ["merchant_id"]
        }
      },
      getMerchantSecret: {
        realm: true,
        method: Merchant.getMerchantSecret,
        schema: {
          type: "object",
          properties: {
            id: { type: "string" }
          },
          required: ["id"]
        }
      },
      cryptoDeposit: {
        realm: true,
        method: Crypto.deposit,
        description: "Deposit in crypto coins"
      },
      createOrder: {
        realm: true,
        user: true,
        method: Order.createOrder,
        schema: {
          type: "object",
          properties: {
            amount: { type: "float" },
            currency: { type: "string", minLength: 3, maxLength: 4 },
            realm_department: { type: "string", format: "uuid" },
            res_currency: { type: "string", minLength: 3, maxLength: 4 },
            organisation: { type: "string", format: "uuid" },
            contract_id: { type: "string", format: "uuid" },
            status: { type: "integer" },
            date_from: { type: "string", format: "date-time" },
            date_to: { type: "string", format: "date-time" }
          },
          required: [
            // "merchant",
            "amount",
            "currency",
            // "res_currency",
            "organisation",
            "contract_id",
            "realm_department",
            "date_from",
            "date_to"
            // "bank_details"
          ]
        }
      },
      changeOrderStatus: {
        method: Order.changeOrderStatus,
        schema: {
          type: "object",
          properties: {
            id: { type: "string" },
            status: { type: "integer" }
          },
          required: ["id", "status"]
        }
      },
      getCompanies: {
        realm: true,
        user: true,
        description: "Get user companies",
        method: Merchant.getCompanies,
        schema: {
          type: "object",
          properties: {
            start: { type: "number" },
            limit: { type: "number" },
            monitoringWallets: { type: "boolean" }
          },
          required: []
        }
      },
      addIBAN: {
        realm: true,
        user: true,
        description: "Add new IBAN",
        method: Merchant.addIBAN,
        schema: {
          type: "object",
          properties: {
            org_id: { type: "string" },
            name: { type: "string" },
            bank_details: { type: "string" }
          },
          required: ["name", "bank_details"]
        }
      },
      addContract: {
        realm: true,
        user: true,
        description: "Add contract",
        method: Merchant.addContract,
        schema: {
          type: "object",
          properties: {
            id: { type: "string" },
            merchant: { type: "string" },
            realm: { type: "string" },
            description: { type: "string" },
            contract_date: { type: "string" },
            expiration_date: { type: "string" },
            director_name: { type: "string" },
            memo: { type: "string" },
            files: {
              type: "array",
              items: {
                type: "object",
                name: { type: "string" },
                data: { type: "string" }
              }
            },
            other_signatories: { type: "object" }
          },
          required: ["merchant", "realm"]
        }
      },
      uploadFile: {
        realm: true,
        user: true,
        description: "Upload file from Admin",
        method: Merchant.uploadFile,
        schema: {
          type: "object",
          properties: {
            owner_id: { type: "string" },
            id: { type: "string" },
            files: {
              type: "array",
              items: {
                type: "object",
                name: { type: "string" },
                code: { type: "string" }
              }
            }
          },
          required: ["owner_id", "id", "files"]
        }
      },
      getContracts: {
        realm: true,
        user: true,
        description: "Get all contracts by organization",
        method: Merchant.getContracts,
        schema: {
          type: "object",
          properties: {
            org_id: { type: "string" }
          },
          required: ["org_id"]
        }
      },
      changeStatusIban: {
        realm: true,
        user: true,
        description: "Changes Iban status  by ID",
        method: Merchant.changeStatusIban,
        schema: {
          type: "object",
          properties: {
            iban_id: { type: "string" },
            org_id: { type: "string" },
            status: { type: "number" }
          }
        }
      },
      getIBANList: {
        realm: true,
        user: true,
        description: "Get IBAN by organization ID",
        method: Merchant.getIBANList,
        schema: {
          type: "object",
          properties: {
            org_id: { type: "string" }
          }
        }
      },
      delIBAN: {
        realm: true,
        user: true,
        description: "Delete IBAN by ID",
        method: Merchant.delIBAN,
        schema: {
          type: "object",
          properties: {
            id: { type: "string" }
          },
          required: ["id"]
        }
      },
      getOrders: {
        realm: true,
        user: true,
        description: "Get orders",
        method: Order.getOrders,
        schema: {
          type: "object",
          properties: {
            org_id: { type: "string" },
            page: { type: "integer" },
            limit: { type: "integer" },
            order: { type: "string" },
            dir: { type: "string" }
          }
        }
      },
      getOrderTransactions: {
        realm: true,
        user: true,
        description: "Get transactions of order",
        method: Order.getOrderTransactions,
        schema: {
          type: "object",
          properties: {
            order_id: { type: "string" },
            page: { type: "integer" },
            limit: { type: "integer" },
            order: { type: "string" },
            dir: { type: "string" },
            required: ["filter"]
          }
        }
      },
      getRealmDepartments: {
        realm: true,
        user: true,
        description: "Get realm organizations",
        method: Order.getRealmDepartments,
        schema: {}
      },
      getContractsByOrgId: {
        realm: true,
        user: true,
        description: "Get contract by merchant and realm organization ids",
        method: Order.getContractsByOrgId,
        schema: {
          type: "object",
          properties: {
            org_id: { type: "string" },
            realm_org_id: { type: "string" }
          },
          required: ["org_id", "realm_org_id"]
        }
      },
      generateInvoice: {
        realm: true,
        user: true,
        description: "Generate invoice",
        method: Order.generateInvoice,
        schema: {
          type: "object",
          properties: {
            order_id: { type: "string" }
          },
          required: ["order_id"]
        }
      },
      getListCurrencyDecimal: {
        realm: false,
        user: false,
        description: "Get list decimal of curriences",
        method: Order.getListCurrencyDecimal
      },
      computeDepositAndBalanceByOrder: {
        realm: true,
        user: true,
        description: "Compute deposit and balance by order",
        method: Order.computeDepositAndBalanceByOrder,
        schema: {
          type: "object",
          properties: {
            order_id: { type: "string" }
          },
          required: ["order_id"]
        }
      },
      getWithdrawalDecimalsOfCurrencies: {
        realm: false,
        user: false,
        description: "Get list withdrawal decimals of curriences",
        method: Order.getWithdrawalDecimalsOfCurrencies
      },
      generateProformaInvoice: {
        realm: true,
        user: true,
        description: "Generate proforma invoice",
        method: Order.generateProformaInvoice,
        schema: {
          type: "object"
        }
      },
      renewalContracts: {
        private: true,
        description: "Renewal contracts",
        method: Contracts.renewalContracts
      }
    };
  }
}
