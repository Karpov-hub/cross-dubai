Ext.define("Crm.modules.transfers.view.PlanTransfersWinController", {
  extend: "Core.form.FormController",

  setControls() {
    this.control({
      "[name=transfers_grid]": {
        dataready: (data) => {
          this.parseTransfersData(data);
        }
      },
      "[name=to_currency]": {
        click: (el, v) => {}
      },
      "[action=downloadReport]": {
        click: (el, v) => {
          this.getReport();
        }
      }
    });

    this.callParent(arguments);
  },

  async getReport() {
    let report_data = this.view.down("[name=transfer_info]").getData();

    report_data.report_name = "it_technologie_transfer";
    report_data.format = "pdf";
    report_data.plan_transfer_id = this.view
      .down("[name=plan_transfer_id]")
      .getValue();

    const res = await this.model.callApi(
      "report-service",
      "generateReport",
      report_data
    );
    if (res && res.code) {
      let link_url = `${__CONFIG__.downloadFileLink}/${res.code}`;
      let link = document.createElement("a");
      link.setAttribute("href", link_url);
      link.click();
    }
  },
  async setValues(data) {
    this.view.currentData = data;
    this.data = data;

    this.view.down("[name=plan_transfer_id]").setValue(data.plan_transfer_id);

    this.view.applyEventTpl();
  },

  async parseTransfersData(data) {
    const transfers = data.map((item) => item.data);
    const out = await this.view.model.prepareTransfersData({
      transfersData: transfers
    });

    this.view.down("[action=datapanel]").setData(out);
  }
});
