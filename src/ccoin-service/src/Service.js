import Base from "@lib/base";
import Wallet from "./lib/wallet.js";
import Callbacks from "./lib/callbacks.js";
import Withdrawal from "./lib/withdrawal.js";
import Nil from "./lib/nil.js";
import CallbackNew from "./lib/callbacks_new.js";
import Reports from "./lib/reports.js";
import Exchange from "./lib/exchange.js";
import Validator from "./lib/validator.js";
import Transfer from "./lib/transfer";

export default class Service extends Base {
  publicMethods() {
    return {
      create: {
        private: true,
        description: "Create crypto address",
        method: Wallet.create,
        schema: {
          type: "object",
          properties: {
            currency: {
              type: "object",
              properties: {
                api: { type: "string" },
                abbr: { type: "string" }
              }
            },
            account: {
              type: "object",
              properties: {
                acc_no: { type: "string" },
                address: { type: "string" }
              }
            }
          },
          required: ["currency", "account"]
        }
      },

      getAddress: {
        realm: true,
        //user: true,
        description: "Getting crypto address by account",
        method: Wallet.getAddress,
        schema: {
          type: "object",
          properties: {
            acc_no: { type: "string" }
          },
          required: ["acc_no"]
        }
      },

      completeTransfer: {
        realm: true,
        description: "Callback function for complete payments",
        method: Callbacks.complete
      },

      masterWalletBalance: {
        realm: true,
        description: "Callback function for showing master balance",
        method: Callbacks.masterWalletBalance
      },

      deposit: {
        realm: true,
        description: "Callback function for deposit payments",
        method: Callbacks.provide,
        schema: {
          type: "object",
          properties: {
            currencyId: { type: "string" },
            amount: { type: "float" },
            txId: { type: "string" },
            address: { type: "string" },
            confirmations: { type: "integer" },
            txStatus: { type: "string" },
            sign: { type: "string" },
            networkFee: { anyOf: [{ type: "float" }, { type: "null" }] },
            networkFeeCurrencyId: {
              anyOf: [{ type: "string" }, { type: "null" }]
            },
            "crypto-bot": { type: "string" }
          },
          required: ["address", "currencyId", "amount", "txStatus"]
        }
      },

      send: {
        realm: true,
        user: true,
        otp: true,
        description: "Sending crypto payment via stock",
        method: Withdrawal.send
      },

      sendFromSk: {
        realm: true,
        user: true,
        otp: true,
        description: "Sending crypto payment from Sk",
        method: Withdrawal.sendFromSk
      },

      getExchangeRate: {
        realm: true,
        user: true,
        description: "Get exchange rate",
        method: Wallet.getExchangeRate,
        schema: {
          type: "object",
          properties: {
            currency_from: { type: "string" },
            currency_to: { type: "string" },
            amount: { anyOf: [{ type: "float" }, { type: "string" }] }
          },
          required: ["currency_from", "currency_to", "amount"]
        }
      },
      calculateAmount: {
        private: true,
        description: "Calculate amount by transactions",
        method: Withdrawal.calculateAmount
      },
      getLatestFees: {
        realm: true,
        user: true,
        description: "Get latest blockchain fees",
        method: Wallet.getLatestFees
      },
      sendCryptoPaymentChecker: {
        private: true,
        description: "Check crypto",
        method: Wallet.sendCryptoPaymentChecker
      },
      getSKBalance: {
        private: true,
        description: "Get master balances",
        method: Wallet.getSKBalance
      },
      sendFromMonitoringToNilViaSk: {
        private: true,
        description: "Send crypto from customer's monitoring to NIL",
        method: Withdrawal.sendFromMonitoringToNilViaSk
      },
      provideDeferred: {
        realm: true,
        description: "Provide deferred transfers",
        method: Withdrawal.provideDeferred,
        schema: {
          type: "object",
          properties: {
            txIds: {
              type: "array",
              items: {
                type: "string"
              }
            }
          },
          required: ["txIds"]
        }
      },
      getMonitoringAddressByMerchant: {
        private: true,
        description: "Returns monitoring address by merchant ID"
      },
      sendCustom: {
        private: true,
        description: "Custom sending from merchant's address to external",
        method: Wallet.sendCustom
      },
      //----------

      exchange: {
        private: true,
        description: "Exchange on nil",
        method: Nil.order
      },
      nil2sk: {
        private: true,
        description: "Withdrawal from NIL",
        method: Nil.nil2sk
      },
      sk2monitoring: {
        private: true,
        description: "Send from NIL to Monitor",
        method: Nil.sk2monitoring
      },
      monitoring2external: {
        private: true,
        description: "Send from NIL to Monitor",
        method: Nil.monitoring2external
      },
      sendComplete: {
        realm: true,
        description: "Callback from crypto server",
        method: CallbackNew.onComplete
      },
      getTxsByWallet: {
        private: true,
        description: "Get txs by wallet",
        method: Wallet.getTxsByWallet
      },
      resendCallback: {
        realm: true,
        description: "Resend callback",
        method: Callbacks.resendCallback,
        schema: {
          type: "object",
          properties: {
            hash_id: { type: "string" },
            currency: { type: "string" }
          },
          required: ["hash_id", "currency"]
        }
      },
      getWalletReport: {
        private: true,
        description: "Wallet report",
        method: Reports.getWalletReport
      },
      swap: {
        private: true,
        description: "Swap crypto currency",
        method: Exchange.swap
      },
      exchangecallback: {
        realm: true,
        description: "Exchange callback",
        method: Exchange.callback
      },
      getExchangeRates: {
        realm: true,
        user: true,
        description: "Get exchange rate for multiple instruments",
        method: Wallet.getExchangeRates,
        schema: {
          type: "object",
          properties: {
            instruments: {
              type: "array"
            }
          },
          required: ["instruments"]
        }
      },
      nil2bank: {
        private: true,
        description: "Withdrawal from NIL to bank account",
        method: Nil.nil2bank
      },
      calculateAverageDailyRate: {
        private: true,
        description: "Calculate average daily NIL rates",
        method: Wallet.calculateAverageDailyRate
      },
      calculateTodaysNilRates: {
        private: true,
        description: "Get today's NIL rates",
        method: Wallet.calculateTodaysNilRates
      },
      getWalletsBalances: {
        realm: true,
        user: true,
        description:
          "Get wallets balances by array of accounts with addresses and currencies",
        method: Wallet.getWalletsBalances,
        schema: {
          type: "object",
          properties: {
            accounts: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  address: { type: "string" },
                  currency: { type: "string" }
                },
                required: ["address", "currency"]
              }
            }
          },
          required: ["accounts"]
        }
      },
      validateAddress: {
        realm: true,
        user: false,
        description: "Check if address is valid by it's currency",
        method: Validator.validateAddress,
        schema: {
          type: "object",
          properties: {
            address: { type: "string" },
            currency: { type: "string" }
          },
          required: ["address", "currency"]
        }
      },
      validateAddresses: {
        realm: true,
        user: false,
        description: "Check multiple addresses are valid by it's currency",
        method: Validator.validateAddresses,
        schema: {
          type: "object",
          properties: {
            addresses: {
              type: "array",
              items: {
                type: "string"
              }
            },
            currency: { type: "string" }
          },
          required: ["addresses", "currency"]
        }
      },
      createUpdateNonCustodialWallet: {
        realm: true,
        user: true,
        description: "Create/Update non-custodial address",
        method: Wallet.createUpdateNonCustodialWallet,
        schema: {
          type: "object",
          properties: {
            id: { type: "string" },
            address: { type: "string" },
            currency: { type: "string" },
            memo: { type: "string" }
          },
          required: ["currency"]
        }
      },
      getWalletPrivateKey: {
        realm: true,
        user: true,
        description: "Get wallet private key",
        method: Wallet.getWalletPrivateKey,
        schema: {
          type: "object",
          properties: {
            wallet_id: { type: "string" },
            email: { type: "string" }
          },
          required: ["wallet_id", "email"]
        }
      },
      getChainOfWallets: {
        private: true,
        description: "Get a chain of wallets",
        method: Wallet.getChainOfWallets,
        schema: {
          type: "object",
          properties: {
            wallet_src: { type: "string" },
            wallet_dst: { type: "string" },
            user_id: { type: "string" },
            currency: { type: "string" }
          },
          required: ["wallet_src", "wallet_dst", "user_id", "currency"]
        }
      },
      sendViaChain: {
        private: true,
        description: "Send transfer by chain of addresses",
        method: Transfer.sendViaChain
      },
      cancelChain: {
        private: true,
        description: "Cancel transfer by chain of addresses",
        method: Transfer.cancelChain
      },
      getNonCustodialWallets: {
        realm: true,
        user: true,
        description: "Get non-custodial addresses",
        method: Wallet.getNonCustodialWallets,
        schema: {
          type: "object",
          properties: {
            start: { type: "number" },
            limit: { type: "number" }
          },
          required: []
        }
      },
      generateAddress: {
        private: true,
        description: "Get crypto wallet address",
        method: Wallet.generateAddress,
        schema: {
          type: "object",
          properties: {
            currency: { type: "string" }
          },
          required: ["currency"]
        }
      },
      getAndSumWalletBalances: {
        private: true,
        description: "Get and sum wallet balances",
        method: Wallet.getAndSumWalletBalances
      },
      checkAddressExist: {
        private: true,
        description: "Check if address exist",
        method: Wallet.checkAddressExist
      },
      getCoinexExchangeRate: {
        realm: true,
        user: true,
        description: "Get exchange rate",
        method: Exchange.getExchangeRate,
        schema: {
          type: "object",
          properties: {
            fromCurrency: { type: "string" },
            toCurrency: { type: "string" },
            amount: { type: "number" }
          },
          required: ["fromCurrency", "toCurrency", "amount"]
        }
      },
      getValidCurrenciesForAddress: {
        realm: true,
        user: true,
        description: "Get valid currencies for address",
        method: Validator.getValidCurrenciesForAddress,
        schema: {
          type: "object",
          properties: {
            address: { type: "string" }
          },
          required: ["address"]
        }
      },
      getLatestFeesByCurrency: {
        realm: true,
        user: true,
        description: "Get latest blockchain fees by currency",
        method: Wallet.getLatestFeesByCurrency,
        schema: {
          type: "object",
          properties: {
            currency: { type: "string" }
          },
          required: ["currency"]
        }
      },
      getAndSaveLatestFees: {
        private: true,
        description: "Get latest blockchain fees and save",
        method: Wallet.getAndSaveLatestFees
      },
      getValidAddressesForCurrency: {
        private: true,
        description: "Get valid addresses for currency",
        method: Validator.getValidAddressesForCurrency,
        schema: {
          type: "object",
          properties: {
            addresses: { type: "string" },
            currency: { type: "string" }
          },
          required: ["address", "currency"]
        }
      },
      getSwapLimits: {
        realm: true,
        description: "Get swap limits",
        method: Exchange.getSwapLimits,
        schema: {
          type: "object",
          properties: {}
        }
      }
    };
  }

  async getMonitoringAddressByMerchant(data) {
    const address = await Wallet.getMonitoringAddressByMerchant(
      data.merchant,
      data.currency
    );
    return { address };
  }
}
