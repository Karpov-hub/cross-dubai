import FileProvider from "@lib/fileprovider";
import config from "@lib/config";
import { ERROR_MESSAGES } from "./errors";
import ReconciliationAct from "./reconciliationAct";
import Transfer from "./transfer";
import Invoice from "./invoice";
import TradeHistory from "./tradeHistory";
import Advertising from "./Advertising";
import dataRecord from "./dataRecord";
import cancInvoice from "./cancellationInvoice";
import Wallet from "./wallet";
import DebtReport from "./debtReport";
import FalconBalancesReport from "./falconBalancesReport";
import AccountTransactionsReport from "./accountTransactionsReport";
import TransfersByPlan from "./transfersByPlan";
import NilTransactionsReport from "./nilTransactionsReport";
import NonAdOrderReport from "./NonAdOrderReport";

const request = require("request"); // scope:server

const REPORT_TEMPLATES = {
  it_technologie_transfer: Transfer.prepareTplForTransferByPlan,
  it_technologie_withdrawal_statement: Transfer.prepareTplForWithdrawalTransfer,
  reconciliation_act_invoice: ReconciliationAct.prepareTplForReconciliationAct,
  reconciliation_act: ReconciliationAct.prepareTplForReconciliationAct,
  ittechnologieInvoice: Invoice.prepareTplForInvoice,
  ittechnologie: Invoice.prepareTplForInvoice,
  depositImportsReport: Transfer.prepareTplForDepositImports,
  tradeHistoryCsv: TradeHistory.prepareTplForTradeHistory,
  AdvertisingReport: Advertising.prepareTplData,
  invoiceAdmin: Invoice.prepareTplForOrderInvoice,
  DataRecordReport: dataRecord.prepareTplForDataRecord,
  cancellationInvoice: cancInvoice.prepareTplForCancelInvoice,
  walletStatementReport: Wallet.prepareTplForWalletStatementReport,
  walletFeeReport: Wallet.prepareTplForWalletFeeReport,
  debt_report: DebtReport.prepareTplForDebtReport,
  falconBalancesReport: FalconBalancesReport.prepareTplForFalconBalancesReport,
  accountTransactionsReport:
    AccountTransactionsReport.prepareTplForAccountTransactionsReport,
  allAccountsTransactionsReport:
    AccountTransactionsReport.prepareTplForAllAccountTransactionsReport,
  transfersByPlanReport: TransfersByPlan.prepareTplForTransfersByPlanReport,
  CustomAdvertisingReport: Advertising.prepareTplForCustomAdvertisingReport,
  nilTransactionsHistory:
    NilTransactionsReport.prepareTplForNilTransactionsReport,
  CardsWithWithdrawalFiat:
    NonAdOrderReport.prepareCardsWithWithdrawalFiatReport,
  CardsWithWithdrawal: NonAdOrderReport.prepareCardsWithWithdrawalReport,
  CryptoFiatWithRate: NonAdOrderReport.prepareCryptoFiatWithRateReport,
  CryptoFiatWithExchangeRateDelta:
    NonAdOrderReport.prepareCryptoFiatWithExchangeRateDeltaReport,
  FiatCryptoWithExchangeRateDelta:
    NonAdOrderReport.prepareFiatCryptoWithExchangeRateDeltaReport,
  FiatCryptoWithTariffDelta:
    NonAdOrderReport.prepareFiatCryptoWithTariffDeltaReport,
  StartFinal_admin: NonAdOrderReport.prepareStartFinalAdminReport,
  StartFinal_client: NonAdOrderReport.prepareStartFinalClientReport
};

async function _getJasperReport(data, realmId, userId) {
  let opts = {
    uri: `${config.jasperURL}/jasperService/getReportInBase64`,
    method: "POST",
    json: data.requestParams,
    rejectUnauthorized: false,
    requestCert: true,
    agent: false
    // headers: { "Content-Type": "application/json;charset=utf-8" }
  };
  return new Promise(async (resolve, reject) => {
    request(opts, async (err, res) => {
      if (err) {
        console.log(err);
        return resolve({
          success: false,
          error: err.code
        });
      }

      let fileProvider = null;
      if (res && res.body && !res.body.file && res.body.code) {
        resolve({ error: res.body.code });
      }
      let file = {};
      if (res && res.body && res.body.file_extension) {
        data.filename += `.${res.body.file_extension}`;
        file.data = `data:application/${res.body.file_extension};base64,${res.body.file}`;
        file.name = data.filename || "File.pdf";
        fileProvider = await FileProvider.push(file, 300);
      }
      fileProvider
        ? resolve({ provider: fileProvider, file_data: res.body.file })
        : resolve(null);
    });
  });
}

async function _getReport(report, realmId, userId) {
  let filename = report.filename;
  let requestParams = {
    report_name: report.report_name,
    report_data: report.data,
    report_format: report.format
  };
  const res = await _getJasperReport(
    { filename: filename, requestParams: requestParams },
    realmId,
    userId
  );
  return res ? res : null;
}

async function generateReport(data, realmId, userId) {
  if (!data || !Object.keys(data).length)
    return { success: false, error: "No data for generate report" };
  const report = {};
  try {
    report.data = await REPORT_TEMPLATES[data.report_name](data);
  } catch (e) {
    console.error(e);
    report.error = e;
  }
  if (report.error || report.data.error) {
    const error = report.error || report.data.error;
    console.log("Report index.js catch the error: ", error);
    return {
      success: false,
      error: ERROR_MESSAGES[error] || error
    };
  }
  if (report.data.code) {
    return { success: true, code: report.data.code, exist: true };
  }
  const { provider: resReport, file_data } = await _getReport(report.data);
  if (!resReport) return { success: false };
  if (resReport.error || !resReport.success) {
    return {
      success: false,
      error: ERROR_MESSAGES[resReport.error] || ""
    };
  }
  if (report.data.attachFileToOrder) {
    await report.data.attachFileToOrder({
      code: resReport.code,
      name: report.data.filename,
      owner_id: report.data.order_id,
      type: report.data.type,
      invoice_id: report.data.invoice_id
    });
  }

  let result = {
    success: true,
    code: resReport.code,
    data: data.returning ? report.data : null
  };
  if (data.get_file_instantly) result.file_data = file_data;
  return result;
}

export default {
  generateReport
};
