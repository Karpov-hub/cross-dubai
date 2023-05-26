Ext.define("Crm.modules.transfers.view.TransfersFormController", {
  extend: "Core.form.FormController",

  requires: ["Core.print.renderers.Base"],

  setControls() {
    let me = this;
    this.control({
      "[action=accept]": {
        click: () => {
          this.acceptTransfer();
        }
      },
      "[action=repeat]": {
        click: () => {
          this.resendPayment();
        }
      },
      "[action=reject]": {
        click: () => {
          this.buildWarning(
            D.t(
              "Are you sure you want to cancel this transfer? You could not reverse this action"
            ),
            (result) => {
              if (result === "ok") this.reject();
            }
          );
        }
      },
      "[action=refund]": {
        click: () => {
          this.refund();
        }
      },

      "[action=downloadReport]": {
        click: () => {
          this.downloadReport();
        }
      }
    });
    this.view.on("changeStatus", function() {
      me.changeStatus();
    });
    this.dataPanel = this.view.down("[action=datapanel]");
    this.callParent(arguments);
  },

  buildWarning(message, cb) {
    Ext.Msg.show({
      title: "Warning",
      message,
      buttons: Ext.Msg.OKCANCEL,
      icon: Ext.Msg.WARNING,
      fn: cb
    });
  },

  async acceptTransfer() {
    await this.model.callApi(
      "account-service",
      "accept",
      {
        ref_id: this.data.ref_id,
        transfer_id: this.data.id,
        _admin_id: localStorage.getItem("uid")
      },
      this.data.realm_id,
      this.data.user_id
    );
    this.setAcceptResectDisabled();
  },

  async refund() {
    const data = {
      ref_id: this.data.ref_id,
      transfer_type: "refund",
      acc_no: this.data.data.acc_no,
      amount: this.data.amount,
      currency: this.data.data.currency,
      description: "Refound money",
      options: this.data.data.options || {}
    };

    const res = await this.model.callApi(
      "account-service",
      "refund",
      data,
      this.data.realm_id,
      this.data.user_id
    );

    this.setAcceptResectDisabled();
  },

  async reject() {
    await this.model.callApi(
      "account-service",
      "rollback",
      {
        ref_id: this.data.ref_id,
        transfer_id: this.data.id
      },
      this.data.realm_id,
      this.data.user_id
    );
    this.setAcceptResectDisabled();
  },

  setAcceptResectDisabled() {
    this.view.down("[action=accept]").setDisabled(true);
    this.view.down("[action=reject]").setDisabled(true);
    //this.view.down("[name=status]").setReadOnly(true);
  },

  async setValues(data) {
    this.view.currentData = data;
    this.data = data;
    if (!data.held || data.canceled) {
      this.setAcceptResectDisabled();
    }

    let statuses = [1, 2, 3, 4, 5, 6, 7];
    for (const status of statuses) {
      //if (this.data.status == status)
      //  this.view.down("[name=status]").setValue(status);
    }
    this.view
      .down("[action=downloadReport]")
      .setHidden(
        !(
          data.event_name.includes("withdrawalCustomExchangeRate") &&
          !data.held &&
          data.status == 4
        )
      );
    if (data.event_name != "account-service:deposit" && !data.held) {
      //this.view.down("[action=refund]").setDisabled(true);
    }
    this.view.down("[name=id]").setValue(data.id);
    this.view.applyEventTpl(data.event_name);

    this.view.down("[action=datapanel]").setData(data);
    if (data && data.data && data.data.files && data.data.files.length) {
      const files = await this.getFilesContents(data.data.files, data);
      if (files.length) this.view.down("[action=documents]").setData({ files });
    }
  },

  async getFilesContents(files, data) {
    let out = [],
      f;
    for (let file of files) {
      f = await this.getFileContent(file, data);
      if (f) out.push(f);
    }
    return out;
  },

  async getFileContent(file, data) {
    const res = await this.model.callApi(
      "kyc-service",
      "pullFile",
      {
        code: file.code
      },
      data.realm_id,
      data.user_id
    );
    return res;
  },

  async changeStatus() {
    return;
    let status = this.view.down("[name=status]").getValue();
    if (status == 3) {
      this.acceptTransfer();
      return;
    }
    if (status == 4) {
      this.reject();
      return;
    }
    if (status == 5) {
      this.refund();
      return;
    }
    this.model.runOnServer(
      "changeStatus",
      {
        id: this.data.id,
        status
      },
      function(res) {
        if (res) {
          return true;
        }
      }
    );
  },

  async downloadReport() {
    const metaData = {
      report_name: "it_technologie_withdrawal_statement",
      format: "pdf",
      transfer_id: this.data.id
    };
    const res = await this.model.callApi(
      "report-service",
      "generateReport",
      metaData,
      this.data.realm_id,
      this.data.user_id
    );
    if (res.success) {
      if (!res.exist) {
        this.model.callApi(
          "account-service",
          "writeWithdrawalStatement",
          { transfer_id: this.data.id, code: res.code },
          this.data.realm_id,
          this.data.user_id
        );
      }
      let link = document.createElement("a");

      link.setAttribute("href", `${__CONFIG__.downloadFileLink}/${res.code}`);
      link.click();
    } else D.a("Error", res.error);
  },

  refresh() {
    this.loadData((data) => {
      this.setTitle(data);
      this.setFieldsDisable(() => {});
    });
  },

  resendPayment() {
    this.loadData((data) => {
      let w;
      if (data.event_name == "account-service:withdrawalCustomExchangeRate") {
        w = Ext.create("Crm.modules.transfers.view.WithdrawalForm");
      } else if (data.event_name == "account-service:deposit") {
        w = Ext.create("Crm.modules.transfers.view.DepositForm");
      } else return;

      w.controller.setValues(data.data);
      this.view.close();
    });
  }
});
