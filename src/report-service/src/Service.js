import Base from "@lib/base";
import Report from "./lib/index";
import Archiver from "./lib/archiver";
import ReportQueue from "./lib/reportsQueue";
import Advertising from "./lib/Advertising";
import dbHelper from "./lib/dbHelper";

export default class Service extends Base {
  publicMethods() {
    return {
      getTransfers: {
        private: true,
        description: "Get withdrawal transfers",
        method:dbHelper.getTransfers
      },
      getAdvertisingData: {
        private: true,
        description: "Get advertising report data",
        method: Advertising.getAdvertisingData,
        schema: {
          type: "object",
          properties: {
            campaignID: { type: "string" },
            fromDate: { type: "string" },
            toDate: { type: "string" },
            groupBy: { type: "string" }
          },
          required: ["campaignID", "fromDate", "toDate", "groupBy"]
        }
      },
      generateReport: {
        realm: true,
        user: true,
        description: "get jasper report",
        method: Report.generateReport,
        schema: {
          type: "object",
          properties: {
            report_name: { type: "string" },
            format: { type: "string" }
          },
          required: ["report_name"]
        }
      },
      downloadArchive: {
        realm: true,
        user: true,
        description: "Download Archive files",
        method: Archiver.downloadArchive,
        schema: {
          type: "object",
          properties: {
            meta_files: { type: "array" },
            filename: { type: "string" }
          }
        }
      },
      requestReport: {
        realm: true,
        description: "Request report",
        method: ReportQueue.requestReport,
        schema: {
          type: "object",
          properties: {
            service: { type: "string" },
            method: { type: "string" }
          },
          required: ["service", "method"]
        }
      },
      reportChecker: {
        private: true,
        description: "Check reports",
        method: ReportQueue.reportChecker
      }
    };
  }
}

async function processReports() {
  const log = await ReportQueue.reportChecker();
  if (log) processReports();
  else {
    setTimeout(() => {
      processReports();
    }, 15000);
  }
}

processReports();
