Ext.define("Crm.modules.transfers.view.SimpleTransfersGridController", {
  extend: "Core.grid.GridController",
  setControls: function() {
    const me = this;
    this.view.on("cancel", function(record) {
      me.buildWarningMsg(
        "Warning",
        "Are you sure you want cancel payment?",
        (btn) => {
          if (btn === "ok") me.cancelTransfer(record);
        }
      );
    });
    this.view.on("resume", function(record) {
      me.buildWarningMsg(
        "Warning",
        "Are you sure you want resume payment?",
        (btn) => {
          if (btn === "ok") me.resumeTransfer(record);
        }
      );
    });
    this.view.on("showErrorLog", function(record) {
      me.showErrorLog(record);
    });

    this.callParent(arguments);
  },

  showErrorLog(record) {
    if (!record) return;
    let error_string = record.errors
      .map((el) => {
        return `- ${el.message}`;
      })
      .join("\n");
    const error_window = Ext.create("Ext.window.Window", {
      layout: "fit",
      title: "Error Log",
      width: 600,
      height: 400,
      items: [
        {
          xtype: "textarea",
          name: "error_log",
          readOnly: true,
          value: error_string
        }
      ],
      buttons: [
        {
          text: D.t("Close"),
          iconCls: "x-fa fa-ban",
          handler: () => {
            error_window.close();
          }
        }
      ]
    });
    error_window.show();
  },

  buildWarningMsg(title, message, fn) {
    return Ext.Msg.show({
      title,
      message,
      buttons: Ext.Msg.OKCANCEL,
      icon: Ext.Msg.WARNING,
      fn
    });
  },

  async cancelTransfer(data, lastTransfer) {
    if (!lastTransfer)
      lastTransfer = await this.model.getLatestTransfer({ id: data.id });
    if (!lastTransfer) return Ext.Msg.alert("Warning", "No transfer found");

    if (lastTransfer && lastTransfer.held && !lastTransfer.canceled) {
      await this.model.callApi(
        "account-service",
        "rollback",
        {
          ref_id: lastTransfer.ref_id,
          transfer_id: lastTransfer.id,
          plan_transfer_id: lastTransfer.plan_transfer_id
        },
        lastTransfer.realm_id,
        lastTransfer.user_id || lastTransfer.merchant_id
      );
    }
  },

  async resumeTransfer(data) {
    let lastTransfer = await this.model.getLatestTransfer({ id: data.id });
    if (!lastTransfer) return Ext.Msg.alert("Warning", "No transfer found");

    await this.cancelTransfer(data, lastTransfer);
    await this.model.callApi(
      "account-service",
      "resumeTransfer",
      {
        pipeline: lastTransfer.data.pipeline,
        ref_id: lastTransfer.ref_id,
        merchant_id: lastTransfer.data.merchant_id,
        amount: lastTransfer.amount,
        realm_id: lastTransfer.realm_id
      },
      lastTransfer.realm_id,
      lastTransfer.user_id || lastTransfer.merchant_id
    );
  },
  gotoRecordHash() {
    return;
  }
});
