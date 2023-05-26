import Wallet from "./wallet";
import Queue from "@lib/queue";

async function getWalletReport(data) {
  let params = {
    address: data.wallet,
    startTime: data.start_date + " 00:00:00",
    endTime: data.end_date + " 23:59:59"
  };

  const api = await Wallet.getApiByAbbr(data.currency);

  let apiMethod = "";
  let generateReportMethod = "";

  if (data.report_type == "fee") {
    apiMethod = "getWalletFeeReportData";
    generateReportMethod = "walletFeeReport";
  }
  if (data.report_type == "statement") {
    apiMethod = "getWalletStatementReportData";
    generateReportMethod = "walletStatementReport";
  }

  let res;
  try {
    res = await Wallet.sendGetRequest(api, apiMethod, params);
  } catch (e) {
    const err =
      e && e.response && e.response.data
        ? JSON.stringify(e.response.data, null, 4)
        : e;
    console.log("Catch error getWalletReport:", err);
    return { success: false, error: err };
  }

  if (res && res.data && res.data.result && res.data.result.errors) {
    const err = JSON.stringify(res.data.result.errors, null, 4);
    console.log(apiMethod, err);
    return { success: false, error: err };
  }

  if (res && res.data && res.data.data && res.data.data.length) {
    let { result } = await Queue.newJob("report-service", {
      method: "generateReport",
      data: {
        report_name: generateReportMethod,
        format: "xlsx",
        owner_id: data.job_id,
        report_params: data,
        data: res.data.data
      }
    });
    return result;
  }

  return { success: false, error: "" };
}

export default {
  getWalletReport
};
