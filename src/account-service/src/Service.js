import db from "@lib/db";
import Base from "@lib/base";
import Account from "./lib/account";
import Transfer from "./lib/transfer";
import Deposit from "./lib/deposit";
import Proxy from "./lib/proxy";
import Refund from "./lib/refund";
import Withdrawal from "./lib/withdrawal";
import Iban from "./lib/iban";
import Invoice from "./lib/invoice";
import Payment from "./lib/payment";
import WithdrawalStatement from "./lib/withdrawalStatement";
import Calculator from "./lib/calculator.js";
import Plan from "./lib/plan.js";
import History from "./lib/history.js";
import Exchange from "./lib/exchange.js";
import Balances from "./lib/balances.js";
import UserPayments from "./lib/userPayments.js";
import Wallet from "./lib/wallet";
import AddressBook from "./lib/addressBook";

export default class Service extends Base {
  publicMethods() {
    return {
      create: {
        realm: true,
        user: true,
        description: "Createing user's account",
        method: Account.create,
        schema: {
          type: "object",
          properties: {
            acc_name: { type: "string" },
            currency: { type: "string" }
          },
          required: ["acc_name", "currency"]
        }
      },
      getAllBalance: {
        realm: true,
        user: true,
        description: "Getting balances from all user's accounts",
        method: Account.getBalances
      },
      realmtransfer: {
        realm: true,
        user: true,
        otp: true,
        kyc: true,
        schema: {
          type: "object",
          properties: {
            ref_id: { anyOf: [{ type: "number" }, { type: "string" }] },
            acc_src: { type: "string" },
            acc_dst: { type: "string" },
            amount: { type: "number" },
            currency: { type: "string" },
            country: { type: "string" }
          },
          required: ["acc_src", "acc_dst", "amount"]
        },
        description: "Transfer between two inside accounts by realm",
        method: Transfer.realmtransfer
      },
      accept: {
        realm: true,
        user: true,
        description: "Acception of held transaction",
        schema: {
          type: "object",
          properties: {
            ref_id: { anyOf: [{ type: "number" }, { type: "string" }] },
            transfer_id: { type: "string" },
            amount: { anyOf: [{ type: "number" }, { type: "string" }] }
          },
          required: ["transfer_id"]
        },
        method: Transfer.accept
      },
      deposit: {
        realm: true,
        user: true,
        otp: true,
        kyc: true,
        schema: {
          type: "object",
          properties: {
            ref_id: { anyOf: [{ type: "number" }, { type: "string" }] },
            acc_no: { type: "string" },
            amount: { type: "number" },
            currency: { type: "string" },
            country: { type: "string" },
            description: { type: "string" },
            options: {
              type: "object",
              properties: {
                iban: { type: "string" },
                swift: { type: "string" },
                required: ["iban", "swift"]
              }
            },
            files: {
              type: "array",
              items: {
                type: "object",
                name: { type: "string" },
                data: { type: "string" }
              }
            }
          },
          required: ["acc_no", "amount", "currency", "country"]
        },
        description: "Deposit money into the system",
        method: Deposit.deposit
      },
      refund: {
        realm: true,
        user: true,
        description: "Refund money",
        schema: {
          type: "object",
          properties: {
            ref_id: { anyOf: [{ type: "number" }, { type: "string" }] },
            acc_no: { type: "string" },
            description: { type: "string" },
            amount: { type: "number" },
            currency: { type: "string" },
            country: { type: "string" }
          },
          required: ["acc_no", "amount", "currency"]
        },

        method: Refund.refund
      },
      rollback: {
        realm: true,
        user: false,
        schema: {
          type: "object",
          properties: {
            ref_id: { anyOf: [{ type: "number" }, { type: "string" }] },
            transfer_id: { type: "string" }
          },
          required: ["transfer_id"]
        },
        description: "Rollback held transaction",
        method: Transfer.rollback
      },
      withdrawal: {
        realm: true,
        user: true,
        otp: true,
        kyc: true,
        description: "Withdrawal money outside",
        schema: {
          type: "object",
          properties: {
            ref_id: { anyOf: [{ type: "number" }, { type: "string" }] },
            acc_no: { type: "string" },
            acc_tech: { type: "string" },
            description: { type: "string" },
            amount: { type: "number" },
            currency: { type: "string" },
            country: { type: "string" }
          },
          required: ["acc_no", "amount", "currency"]
        },
        method: Withdrawal.withdrawal
      },
      withdrawalCustomExchangeRate: {
        realm: true,
        user: true,
        otp: true,
        kyc: true,
        description: "Withdrawal money outside",
        schema: {
          type: "object",
          properties: {
            ref_id: { anyOf: [{ type: "number" }, { type: "string" }] },
            acc_no: { type: "string" },
            acc_tech: { type: "string" },
            description: { type: "string" },
            amount: { type: "number" },
            currency: { type: "string" },
            country: { type: "string" },
            custom_exchange_rate: { type: "number" },
            use_stock: { type: "boolean" },
            wallet: { type: "string" }
          },
          required: ["acc_no", "amount", "currency"]
        },
        method: Withdrawal.withdrawalCustomExchangeRate
      },
      doTransfer: {
        realm: true,
        user: false,
        description:
          "Do transfer for inner request (do not add permissions for it to realms)"
      },
      getUserBalance: {
        realm: true,
        user: true,
        schema: {
          type: "object",
          properties: {
            currency: { type: "string" }
          },
          required: ["currency"]
        },
        description: "User balance in a certain currency",
        method: Account.getUserBalance
      },
      getUserAccounts: {
        realm: true,
        user: true,
        description: "User accounts",
        method: Account.getUserAccounts
      },
      getUserAccount: {
        realm: true,
        user: true,
        schema: {
          type: "object",
          properties: {
            id: { type: "string" }
          },
          required: ["id"]
        },
        description: "User account",
        method: Account.getUserAccount
      },
      getAccountsByCurrency: {
        realm: true,
        user: true,
        method: Account.getAccountsByCurrency,
        description: "Get user account list by currency",
        schema: {
          type: "object",
          properties: {
            currency: { type: "string" }
          },
          required: ["currency"]
        }
      },
      getTechAccByMerchant: {
        realm: true,
        user: true,
        method: Account.getTechAccByMerchant,
        description: "Get tech account to merchant for withdrawal",
        schema: {
          type: "object",
          properties: {},
          required: []
        }
      },
      updateUserAccount: {
        realm: true,
        user: true,
        schema: {
          type: "object",
          properties: {
            id: { type: "string" },
            acc_name: { type: "string" }
          },
          required: ["id", "acc_name"]
        },
        description: "Update user account",
        method: Account.updateUserAccount
      },
      getAllWalletsAmountInSameCurrency: {
        realm: true,
        user: true,
        schema: {
          type: "object",
          properties: {
            currency: { type: "string" }
          },
          required: ["currency"]
        },
        description: "All wallets amounts in same currency",
        method: Account.getAllWalletsAmountInSameCurrency
      },
      getUserIbans: {
        realm: true,
        user: true,
        schema: {
          type: "object",
          properties: {
            start: { type: "number" },
            limit: { type: "number" }
          }
        },
        description: "User ibans",
        method: Iban.getUserIbans
      },
      getBanks: {
        realm: true,
        user: true,
        description: "Get banks",
        method: Iban.getBanks
      },
      createIban: {
        realm: true,
        user: true,

        description: "Create iban",
        method: Iban.createIban
      },
      deleteIban: {
        realm: true,
        user: true,
        description: "Delete iban",
        schema: {
          type: "object",
          properties: {
            iban_id: { type: "string" }
          },
          required: ["iban_id"]
        },
        method: Iban.deleteIban
      },
      getCurrency: {
        realm: true,
        user: false,
        description: "get currency",
        method: Account.getCurrency
      },
      proxyTransfer: {
        realm: true,
        otp: true,
        user: true,
        description: "Proxy transfer",
        method: Proxy.transfer,
        schema: {
          type: "object",
          properties: {
            ref_id: { anyOf: [{ type: "number" }, { type: "string" }] },
            amount: { type: ["number", "null"] },
            amount_result: { type: ["number", "null"] },
            description: { type: "string" },
            src_currency: { type: "string" },
            src_country: { type: "string" },
            src_person: { type: "string" },
            src_email: { type: "string" },
            src_phone: { type: "string" },
            src_bank: { type: "string" },
            src_swift: { type: "string" },
            src_bank_corr: { type: "string" },
            src_iban: { type: "string" },
            dst_currency: { type: "string" },
            dst_country: { type: "string" },
            dst_person: { type: "string" },
            dst_email: { type: "string" },
            dst_phone: { type: "string" },
            dst_bank: { type: "string" },
            dst_swift: { type: "string" },
            dst_bank_corr: { type: "string" },
            dst_iban: { type: "string" },
            files: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  data: { type: "string" }
                }
              }
            },
            kyc_applicantid: { type: "string" },
            kyc_service: { type: "string" }
          },
          required: []
        }
      },
      getTransferStatus: {
        realm: true,
        description: "Get transfer status",
        schema: {
          type: "object",
          properties: {
            ref_id: { anyOf: [{ type: "number" }, { type: "string" }] },
            transfer_id: { type: "string" }
          },
          required: ["transfer_id"]
        },
        method: Transfer.getStatusById
      },
      getTransfers: {
        realm: true,
        user: true,
        schema: {
          type: "object",
          properties: {
            filters: {
              type: "object",
              properties: {
                status: { type: "string" },
                invoice_number: { type: "string" },
                merchant_order_num: { type: "string" },
                date_from: { type: "string" },
                date_till: { type: "string" },
                date_processed_from: { type: "string" },
                date_processed_to: { type: "string" }
              }
            }
          },
          required: ["filters"]
        },
        description: "get currency",
        method: Transfer.getTransfers
      },
      getTransactions: {
        realm: true,
        user: true,
        description: "Get user transactions",
        schema: {
          type: "object",
          properties: {
            acc_src: { type: "string" },
            date_from: { type: "string" },
            date_to: { type: "string" },
            held: { type: "boolean" },
            canceled: { type: "boolean" },
            limit: { type: "integer" },
            start: { type: "integer" }
          }
        },
        method: Transfer.getTransactions
      },
      downloadWithdrawalStatements: {
        realm: true,
        user: true,
        description: "Download Withdrawal Statements",
        schema: {
          type: "object",
          properties: {
            date_from: { type: "string" },
            date_to: { type: "string" }
          }
        },
        method: WithdrawalStatement.downloadWithdrawalStatements
      },
      getXls: {
        realm: true,
        user: true,
        description: "get transactions excel",
        schema: {
          type: "object",

          properties: {
            status: { type: "string" },
            invoice_number: { type: "string" },
            merchant_order_num: { type: "string" },
            date_from: { type: "string" },
            date_till: { type: "string" },
            date_processed_from: { type: "string" },
            date_processed_to: { type: "string" }
          }
        },
        method: Transfer.getXls
      },
      getInvoiceByTransferId: {
        realm: true,
        schema: {
          type: "object",
          properties: {
            ref_id: { anyOf: [{ type: "number" }, { type: "string" }] },
            transfer_id: { type: "string" }
          },
          required: ["transfer_id"]
        },
        description: "Get invoice data by transfer ID",
        method: Invoice.getDataByTransferId
      },
      getInvoiceHtmlByTransferId: {
        realm: true,
        user: true,
        description: "Get invoice HTML by transfer ID",
        method: Invoice.getHtmlByTransferId
      },
      findAccounts: {
        realm: true,
        user: true,
        description: "Get accounts by search",
        method: Account.findAccounts
      },
      acceptTxByCode: {
        realm: true,
        user: true,
        otp: true,
        description: "Accept transfer by security code.",
        method: Transfer.acceptTxByCode
      },
      getBusinessTypes: {
        realm: true,
        description: "Get business types",
        method: Transfer.getBusinessTypes
      },
      updateCurrency: {
        private: true,
        description: "Accept transfer by security code [private]"
      },
      massPayment: {
        realm: true,
        user: true,
        description: "Mass payment",
        method: Payment.massPayment
      },
      autoPayment: {
        realm: true,
        description: "Auto payment",
        method: Payment.auto
      },
      getAccountsStatus: {
        realm: true,
        user: true,
        description: "Get balances of occounts list",
        method: Account.getStatus,
        schema: {
          type: "object",
          properties: {
            accounts: {
              type: "array",
              items: {
                type: "string"
              }
            }
          },
          required: ["accounts"]
        }
      },
      doExchange: {
        realm: true,
        user: true,
        description: "Exchange",
        method: Exchange.exchange
      },
      exchange: {
        realm: true,
        user: true,
        description: "Get currency exchange info",
        method: Account.exchangeInfo,
        schema: {
          type: "object",
          properties: {
            amount: { type: "number" },
            currency_src: { type: "string" },
            currency_dst: { type: "string" }
          },
          required: ["amount", "currency_src", "currency_dst"]
        }
      },
      removeOrder: {
        realm: true,
        user: true,
        description: "Remove order and all transfers under order",
        method: Account.removeOrder,
        schema: {
          type: "object",
          properties: {
            id: { type: "string" }
          },
          required: ["id"]
        }
      },
      removeTransfer: {
        realm: true,
        user: true,
        description: "Remove transfer with transactions",
        method: Account.removeTransfer,
        schema: {
          type: "object",
          properties: {
            id: { type: "string" }
          },
          required: ["id"]
        }
      },
      getMerchantAccBalanceByCurrency: {
        realm: true,
        user: true,
        description: "Get merchant account balance by currency",
        method: Withdrawal.getMerchantAccBalanceByCurrency,
        schema: {
          type: "object",
          properties: {
            merchant_id: { type: "string" },
            currency: { type: "string" }
          },
          required: ["merchant_id", "currency"]
        }
      },
      bankCharge: {
        realm: true,
        user: true,
        description: "Bank charges",
        method: Payment.bankCharge,
        schema: {
          type: "object",
          properties: {
            amount: { type: "number" },
            description: { type: "string" },
            merchant_id: { type: "string" }
          },
          required: ["amount", "description"]
        }
      },
      writeWithdrawalStatement: {
        realm: true,
        user: true,
        description: "write withdrawal statement report",
        method: WithdrawalStatement.writeWithdrawalStatement,
        schema: {
          type: "object",
          properties: {
            code: { type: "string" },
            transfer_id: { type: "string" }
          }
        }
      },
      removeDeposit: {
        realm: true,
        user: true,
        private: true,
        description: "Remove deposit transfer and transactions",
        method: Deposit.removeDeposit,
        schema: {
          type: "object",
          properties: {
            deposit_id: { type: "string" }
          },
          required: ["deposit_id"]
        }
      },
      precalculateAmount: {
        private: true,
        description: "Calculating amounts",
        method: Calculator.calculateAmount
      },
      paymentByPlan: {
        private: true,
        description: "Send payment by plan",
        method: Plan.startPipeline
      },
      doPipe: {
        private: true,
        description: "Does one step of a plan",
        method: Plan.doPipe
      },
      getHistory: {
        realm: true,
        user: true,
        schema: {
          type: "object",
          properties: {
            filters: {
              type: "object",
              properties: {
                type: { anyOf: [{ type: "number" }, { type: "string" }] },
                //invoice_number: { type: "string" },
                company: { type: "string" },
                date_from: { type: "string" },
                date_till: { type: "string" },
                date_processed_from: { type: "string" },
                date_processed_to: { type: "string" }
              }
            }
          },
          required: ["filters"]
        },
        description: "Get transfers history",
        method: History.list
      },
      getPlanRecords: {
        private: true,
        description: "Get records by plan",
        method: History.getPlanRecords
      },
      showDepositAndSendEmail: {
        realm: true,
        user: true,
        description: "Show deposit to client and send email",
        method: Deposit.showDepositAndSendEmail
      },
      syncBalances: {
        private: true,
        description: "Sync Balances",
        method: Balances.syncBalances
      },
      fixingBalances: {
        private: true,
        description: "Fixing Balances",
        method: Balances.fixingBalances
      },
      resumeTransfer: {
        private: true,
        description: "Resume transfer",
        method: Plan.resumeTransfer
      },
      testCheckBalance: {
        private: true,
        description: "Check Balances",
        method: Balances.testCheck
      },
      checkAccountBalance: {
        private: true,
        description: "Check Account Balance",
        method: Balances.checkAccountBalance
      },
      checkNilBalance: {
        private: true,
        description: "Check NIL Balance",
        method: Balances.checkNilBalance
      },
      checkWithdrawalToBank: {
        private: true,
        description: "Check withdrawal amount",
        method: Withdrawal.checkWithdrawalToBank
      },
      initSendTransfer: {
        user: true,
        realm: true,
        otp: true,
        description: "API for initialization of transfer by plan from UI",
        method: UserPayments.initSendTransfer,
        schema: {
          type: "object",
          properties: {
            acc_src: { type: "string" },
            address_dst: { type: "string" },
            currency: { type: "string" },
            amount: { type: "string" },
            description: { type: "string" },
            type: { type: "string" }
          },
          required: ["acc_src", "address_dst", "currency", "amount"]
        }
      },
      initSwapTransfer: {
        user: true,
        realm: true,
        otp: true,
        description: "API for initialization of swap transfer by plan from UI",
        method: UserPayments.initSwapTransfer,
        schema: {
          type: "object",
          properties: {
            acc_src: { type: "string" },
            address_src: { type: "string" },
            currency_src: { type: "string" },
            acc_dst: { type: "string" },
            address_dst: { type: "string" },
            currency_dst: { type: "string" },
            amount: { type: "string" },
            description: { type: "string" }
          },
          required: [
            "acc_src",
            "address_src",
            "currency_src",
            "acc_dst",
            "address_dst",
            "currency_dst",
            "amount"
          ]
        }
      },
      getCryptoAccounts: {
        realm: true,
        user: true,
        description: "User crypto accounts",
        method: Account.getCryptoAccounts,
        schema: {
          type: "object",
          properties: {
            distinct: { type: "boolean" }
          },
          required: []
        }
      },
      createWallet: {
        realm: true,
        user: true,
        description: "Create wallet",
        method: Wallet.createWallet,
        schema: {
          type: "object",
          properties: {
            init_currency: { type: "string" },
            merchant_id: { type: "string" },
            user_memo: { type: "string" },
            address: { type: "string" }
          },
          required: ["init_currency", "merchant_id"]
        }
      },
      editWalletMemo: {
        realm: true,
        user: true,
        description: "Edit wallet memo",
        method: Wallet.editWalletMemo,
        schema: {
          type: "object",
          properties: {
            memo: { type: "string" },
            address: { type: "string" }
          },
          required: ["memo", "address"]
        }
      },
      resumePaymentByPlan: {
        user: true,
        realm: true,
        description: "Resume transfer by plan from UI",
        method: UserPayments.resumePaymentByPlan,
        schema: {
          type: "object",
          properties: {
            plan_transfer_id: { type: "string" }
          },
          required: ["plan_transfer_id"]
        }
      },
      cancelPaymentByPlan: {
        user: true,
        realm: true,
        description: "Cancel transfer by plan from UI",
        method: UserPayments.cancelPaymentByPlan,
        schema: {
          type: "object",
          properties: {
            plan_transfer_id: { type: "string" }
          },
          required: ["plan_transfer_id"]
        }
      },
      checkTransferViaChainAvailable: {
        user: true,
        realm: true,
        description: "Check if plan for transfer via chain from UI exist",
        method: UserPayments.checkTransferViaChainAvailable,
        schema: {
          type: "object",
          properties: {
            currency: { type: "string" },
            type: { type: "string" }
          },
          required: ["currency"]
        }
      },
      getAddressBook: {
        realm: true,
        user: true,
        schema: {
          type: "object",
          properties: {
            currency: { type: "string" },
            start: { type: "number" },
            limit: { type: "number" }
          },
          required: []
        },
        description: "Get address book",
        method: AddressBook.getAddressBook
      },
      getWalletDataFromAddressBook: {
        realm: true,
        user: true,
        schema: {
          type: "object",
          properties: {
            wallet_id: { type: "string" }
          },
          required: ["wallet_id"]
        },
        description: "Get wallet data from address book",
        method: AddressBook.getWalletDataFromAddressBook
      },
      upsertWalletAddressBook: {
        realm: true,
        user: true,
        schema: {
          type: "object",
          properties: {
            wallet_id: { type: "string" },
            name: { type: "string" },
            send_via_chain_required: { type: "boolean" },
            status: { type: "integer" },
            walletAccess: { type: "array" },
            num: { type: "string" }
          },
          required: [
            "name",
            "send_via_chain_required",
            "status",
            "walletAccess",
            "num"
          ]
        },
        description: "Upsert wallet data from address book",
        method: AddressBook.upsertWalletAddressBook
      },
      deleteWalletFromAddressBook: {
        realm: true,
        user: true,
        description: "Delete wallet from address book",
        method: AddressBook.deleteWalletFromAddressBook,
        schema: {
          type: "object",
          properties: {
            wallet_id: { type: "string" }
          },
          required: ["wallet_id"]
        }
      },
      createTransferForApproval: {
        realm: true,
        description: "Get ready transfer for approval",
        method: Transfer.createTransferForApproval
      },
      rejectTransferForApproval:{
        realm: true,
        description: "Get ready transfer for approval",
        method: Transfer.rejectTransferForApproval
      },
      checkNetworkFeeLimit: {
        realm: true,
        description: "Check if gas account have enough amount for transfer",
        method: Account.checkNetworkFeeLimit,
        schems: {
          type: "object",
          properties: {
            address: { type: "string" },
            currency: { type: "string" },
            result_currency: { type: "string" }
          },
          required: ["address"]
        }
      }
    };
  }

  async monthlyCommission(data) {
    return { success: true };
  }

  async doTransfer(data, realmId, userId) {
    return await Transfer.transfer(data, realmId, userId);
  }

  async run() {
    //process.title = "account-service";
    this.pushPermissions();
    await this.getTriggersFromService();
    await this.updateCurrency();
    this.subscribe();
  }

  async updateCurrency() {
    const res = await db.vw_current_currency.findAll({
      attributes: ["k", "abbr"]
    });
    const currentCurrency = {};
    res.forEach((rec) => {
      currentCurrency[rec.abbr] = rec.k;
    });
    Account.setCurrentCurrency(currentCurrency);
    return { success: true };
  }
}
