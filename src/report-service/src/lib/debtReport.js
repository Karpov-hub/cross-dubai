import dbHelper from "./dbHelper";
import db from "@lib/db";
import moment from "moment";

async function prepareTplForDebtReport(data) {
  if (!data.client_id) throw "THEREISNTCLIENTID";

  const clientDebts = await dbHelper.getClientDebts(data.client_id);
  const heldDeposits = await dbHelper.getHeldMerchantDeposits(data.client_id);
  const merchantBalances = await dbHelper.getMerchantBalances(data.client_id);
  const stats = merchantBalances.concat(heldDeposits);
  const userData = await dbHelper.getUserById(data.client_id);

  let out = {};
  out.data = {
    report_generated: moment(new Date()).format("DD.MM.YYYY HH:mm"),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    group_name: userData.legalname,
    clientDebts,
    stats
  };

  out.report_name = "fbtb_debt_report";
  out.filename = `DEBT_REPORT-${userData.legalname}-${out.data.report_generated}`;
  out.format = "xlsx";

  return out;
}

export default {
  prepareTplForDebtReport
};
