Ext.define("Crm.modules.orders.view.CustomGridsAdvertisingFormController", {
  extend: "Core.form.FormController",

  setControls() {
    this.callParent(arguments);
    this.control({
      "[action=generate_report_pdf]": {
        click: () => {
          this.generateCustomAdvertisingReport("pdf");
        }
      },
      "[action=generate_report_docx]": {
        click: () => {
          this.generateCustomAdvertisingReport("docx");
        }
      },
      "[action=generate_report_xlsx]": {
        click: () => {
          this.generateCustomAdvertisingReport("xlsx");
        }
      },
      "[action=add_empty_transaction]": {
        click: () => {
          this.addRecord();
        }
      }
    });
    this.loadAllStoresData();
    this.view
      .down("[name=general_stats_grid]")
      .on("selectionchange", (el, record) => {
        this.sumGeneralStatsAmount();
      });
    this.view
      .down("[name=transactions_grid]")
      .on("selectionchange", (el, record) => {
        this.sumTransfersAmount();
      });
  },
  addRecord() {
    this.view.down("[name=transactions_grid]").store.add({ manual: true });
  },
  setValues(data) {
    data.date_from = Ext.Date.format(
      new Date(this.view.config.ad_data.date_from),
      "d.m.Y"
    );
    data.date_to = Ext.Date.format(
      new Date(this.view.config.ad_data.date_to),
      "d.m.Y"
    );
    this.callParent(arguments);
  },

  async generateCustomAdvertisingReport(format) {
    let me = this.view;
    let mask = new Ext.LoadMask({
      msg: D.t("Loading..."),
      target: me
    });
    mask.show();

    let general_stats_data = this.getSelectedRows("general_stats_grid");
    let transactions_data = this.getSelectedRows("transactions_grid");

    if (!!!general_stats_data.length) {
      mask.hide();
      return D.a("Error", "Select at least one record from general stats");
    }

    let res = await this.model.callApi("report-service", "generateReport", {
      order_dates: {
        from: this.view.config.ad_data.order_date_from,
        to: this.view.config.ad_data.order_date_to
      },
      general_stats_data,
      transactions_data,
      campaign_id: this.view.config.ad_data.campaignID,
      merchant_id: this.view.config.ad_data.merchant_id,
      websites: this.view.config.ad_data.websites,
      order_id: this.view.config.ad_data.order_id,
      get_file_instantly: true,
      returning: true,
      report_name: "CustomAdvertisingReport",
      format: format ? format : "pdf",
      use_custom_dates: this.view.config.ad_data.use_custom_dates,
      manual_transfers: this.getSelectedManualTransfers()
    });
    mask.hide();
    if (res.error)
      return D.a("Error", `Cannot generate ${format || "pdf"} report`);
    let a = document.createElement("a");
    a.download = `${res.data.filename}.${format || "pdf"}`;
    a.href = `data:application/octet-stream;base64,${res.file_data}`;
    return a.click();
  },
  
  getSelectedManualTransfers() {
    let selected_rows = this.getSelectedRows("transactions_grid");
    selected_rows = selected_rows.filter((el) => el.manual == true);
    return selected_rows.map((el) => ({
      amount: `${el.amount}`,
      ctime: el.ctime,
      data: { currency: el.currency }
    }));
  },

  getSelectedRows(grid_name) {
    let selected_rows = this.view
      .down(`[name=${grid_name}]`)
      .getSelectionModel()
      .getSelected();
    return selected_rows.items.map((el) => el.data);
  },

  sumTransfersAmount() {
    let selected_rows = this.view
      .down("[name=transactions_grid]")
      .getSelectionModel()
      .getSelected();
    let total = 0;
    if (selected_rows.length)
      for (let row of selected_rows.items) {
        if (row.data.result_amount)
          row.data.result_amount = `${row.data.result_amount}`;
        if (row.data.result_amount && row.data.result_amount.includes(",")) {
          total += Number(row.data.result_amount.replace(",", "."));
          continue;
        }
        if (!row.data.result_amount) row.data.result_amount = 0;
        total += Number(row.data.result_amount);
      }
    this.view
      .down("[name=transactions_selected_total]")
      .setValue(this.transformAmount(total, 2));
  },
  getFormattedNumber(splitted_amount, decim) {
    let integer_reversed = splitted_amount.length
      ? splitted_amount.split("").reverse()
      : [];
    let integer_reversed_new = [];
    let length = decim ? decim : integer_reversed.length;
    for (let i = 0; i < length; i++) {
      if (i != 0 && i % 3 == 0) integer_reversed_new.push(" ");
      if (decim) integer_reversed_new.push("#");
      else integer_reversed_new.push(integer_reversed[i]);
    }
    return integer_reversed_new.reverse().join("");
  },

  applyMask(amount_string, mask) {
    if (!amount_string)
      amount_string = mask
        .split("")
        .map((el) => "0")
        .join("");
    let splitted_amount = amount_string.split("");
    mask = mask.split("");
    let space_count = 0;
    for (let i = 0; i < mask.length; i++) {
      if (mask[i] == " ") {
        space_count++;
        continue;
      }
      mask.splice(i, 1, splitted_amount[i - space_count]);
    }
    return mask.join("");
  },
  getFormattedDecimals(amount_string, decimal) {
    let mask = this.getFormattedNumber([], decimal);
    return this.applyMask(amount_string, mask);
  },
  transformAmount(amount, decim) {
    if (amount) {
      let splitted_amount = amount.toString().split(".");
      amount = `${this.getFormattedNumber(
        splitted_amount[0]
      )}.${this.getFormattedDecimals(splitted_amount[1], decim)}`;
    } else amount = amount.toFixed(2);
    return amount;
  },
  sumGeneralStatsAmount() {
    let selected_rows = this.view
      .down("[name=general_stats_grid]")
      .getSelectionModel()
      .getSelected();
    let total = 0;
    if (selected_rows.length)
      for (let row of selected_rows.items) {
        total += row.data.usd;
      }
    this.view
      .down("[name=general_stats_selected_total]")
      .setValue(this.transformAmount(total, 2));
  },
  async loadAllStoresData() {
    await this.loadGeneralStatsGridStore();
    await this.loadTranactionsGridStore();
  },

  async loadTranactionsGridStore() {
    this.view
      .down("[name=transactions_grid]")
      .store.loadData(this.view.config.withdrawal_list);
  },

  async loadGeneralStatsGridStore() {
    for (let item of this.view.config.general_stats) {
      let splitted_date = item.date.split(".");
      item.date = new Date(
        splitted_date[2],
        splitted_date[1] - 1,
        splitted_date[0]
      );
    }
    this.view
      .down("[name=general_stats_grid]")
      .store.loadData(this.view.config.general_stats);
    return this.view
      .down("[name=general_stats_grid]")
      .store.sort("date", "DESC");
  }
});
