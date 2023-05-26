import config from "@lib/config";
import excel from "exceljs";
import FileProvider from "@lib/fileprovider";

async function generate(data) {
  return new Promise(async (resolve, reject) => {
    let workbook = new excel.Workbook();
    workbook.creator = "Santrapay";
    workbook.lastModifiedBy = "System";
    workbook.created = new Date();
    workbook.modified = new Date();
    workbook.views = [
      {
        x: 0,
        y: 0,
        width: 10000,
        height: 20000,
        firstSheet: 0,
        activeTab: 0,
        visibility: "visible"
      }
    ];

    for (const list of data.lists) {
      let sheet = workbook.addWorksheet(list.title);
      sheet.properties.defaultRowHeight = 15;
      sheet.views = [
        { state: "frozen", ySplit: 1, topLeftCell: "A6", activeCell: "A6" }
      ];
      sheet.columns = list.columns;
      sheet.addRows(list.data);
    }

    workbook.xlsx.writeBuffer().then(async buffer => {
      let file = {};
      file.name = data.name;
      file.data = buffer;
      let res = await FileProvider.push(file, 300);
      resolve(res);
    });
  });
}

export default {
  generate
};
