Ext.define("Crm.modules.orders.view.PaymentButtons", {
  extend: "Ext.form.FieldContainer",

  xtype: "wcn_payment_panel",
  mixins: ["Crm.modules.orders.view.FieldsHelper"],

  requires: ["Ext.window.Toast"],

  config: {
    transfer_id: null,
    amount: null,
    merchant_id: null,
    user_id: null,
    order_id: null,
    transfer_data: null,
    hash_id: null,
    last_transfer: null,
    tag: null
  },

  initComponent() {
    this.model = Ext.create("Crm.modules.orders.model.PaymentButtonFunctions");
    this.items = this.buildItems();
    this.callParent(arguments);
    this.displayElement();
  },

  layout: "anchor",
  defaults: {
    anchor: "100%",
    hidden: true
  },
  buildItems() {
    return [
      {
        xtype: "button",
        tooltip: D.t("Pay"),
        iconCls: "x-fa fa-money-bill-alt",
        handler: () => {
          this.showPaymentWin();
        },
        action: "show_payment_win"
      },
      {
        xtype: "button",
        tooltip: D.t("Approve payment"),
        iconCls: "x-fa fa-check",
        action: "show_check_payment_win",
        handler: () => {
          this.showApprovingWin();
        }
      },
      {
        xtype: "button",
        tooltip: D.t("Copy to clipboard"),
        iconCls: "x-fa fa-copy",
        action: "copy_to_clipboard",
        handler: () => {
          this.copyToClipboard();
        }
      },
      {
        xtype: "button",
        tooltip: D.t("Details"),
        iconCls: "x-fa fa-info-circle",
        action: "show_details",
        handler: () => {
          this.showDetailsPanel();
        }
      }
    ];
  },
  async displayElement() {
    if (!this.scope.scope.currentData[`${this.amount_field}_transfer_id`])
      return this.showSpecificElement("show_payment_win");
    await this.setElementData(
      this.scope.scope.currentData[`${this.amount_field}_transfer_id`]
    );
    return this.scope.fireEvent(
      "paymentChanged",
      this.amount_field,
      this.getTransfer_id(),
      this.getHash_id()
    );
  },

  async setElementData(transfer_id) {
    let transfer_status = await this.model.getTransferByPlanStatus({
      transfer_id
    });
    if (transfer_status.data) {
      this.setTransfer_data(transfer_status.data);
      if (transfer_status.data.hash_id)
        this.setHash_id(transfer_status.data.hash_id);
    }
    this.setTransfer_id(transfer_id);
    switch (transfer_status.status) {
      case "sent": {
        return this.showSpecificElement("copy_to_clipboard");
      }
      case "not_sent": {
        return this.showSpecificElement("show_check_payment_win");
      }
      case "stuck": {
        return this.showSpecificElement("show_details");
      }
      default: {
        return this.showSpecificElement("show_payment_win");
      }
    }
  },

  getValue() {
    const hash_field = this.down(`[name=hash_id]`);
    if (hash_field.getValue()) return hash_field.getValue();
    return this.getTransfer_id();
  },

  setTransfer(scope, value) {
    if (!value) return false; //проверка, что колбэк отработал правильно
    if (value == "deleted") value = null; // для Reject на Approve transfer
    scope.setElementData(value);
    scope.scope.fireEvent(
      "paymentChanged",
      this.amount_field,
      value,
      this.getHash_id()
    );
    return true;
  },

  prepareData() {
    let order_data = this.getFieldsValues(this.scope.scope, [
      "id",
      "merchant",
      "organisation",
      this.amount_field
    ]);
    this.setUser_id(order_data.merchant);
    this.setOrder_id(order_data.id);
    this.setMerchant_id(order_data.organisation);
    this.setAmount(order_data[this.amount_field]);
    return {
      user_id: this.getUser_id(),
      merchant: this.getMerchant_id(),
      merchant_id: this.getMerchant_id(),
      ref_id: this.getOrder_id(),
      amount: this.getAmount()
    };
  },
  showPaymentWin() {
    let me = this;
    let payment_data = this.prepareData();
    if (!this.checkIfObjectValid(payment_data))
      return D.a("Error", "Not all data was set");
    let payment_win = Ext.create("Crm.modules.accountsPlan.view.PaymentWin", {
      merchant_id: payment_data.merchant_id,
      client_id: payment_data.user_id,
      tag: this.getTag(),
      scope: this,
      field_name: this.amount_field,
      cb: (val) => {
        this.setTransfer(me, val);
      }
    });
    payment_win.show();
    payment_win.controller.setValues(payment_data);
  },

  async showApprovingWin() {
    let me = this;
    let transfer_data = await this.prepareApproveTransferData(
      me.getTransfer_data()
    );

    const class_name = transfer_data.is_draft
      ? "Crm.modules.accountsPlan.view.PaymentWin"
      : "Crm.modules.transfers.view.NotApprovedTransfersForm";

    let form_metadata = {
      recordId: me.getTransfer_id(),
      cb: (val) => {
        this.setTransfer(me, val);
      }
    };

    if (transfer_data.is_draft) form_metadata.data = transfer_data;

    let payment_window = Ext.create(class_name, form_metadata);

    payment_window.show();

    if (!transfer_data.is_draft)
      payment_window.controller.setValues(transfer_data);
  },

  async prepareApproveTransferData(data) {
    let additional_data = await this.model.getAdditionalDataForApproveWin({
      plan_id: data.plan_id,
      merchant_id: data.merchant_id,
      tariff_id: data.tariff
    });
    data = Object.assign(data, additional_data);

    return data;
  },
  showSpecificElement(el_name) {
    let elements_arr = [
      "show_payment_win",
      "show_check_payment_win",
      "copy_to_clipboard",
      "show_details"
    ];
    elements_arr = elements_arr.filter((el) => el != el_name);
    for (let element of elements_arr)
      this.down(`[action=${element}]`).setVisible(false);
    this.down(`[action=${el_name}]`).setVisible(true);
  },
  async showDetailsPanel() {
    let me = this;
    let latest_transfer_data = await this.getLatestTransfer();
    this.details_form = Ext.create("Ext.window.Window", {
      layout: "fit",
      modal: true,
      title: D.t("Details"),
      width: 800,
      height: 600,
      items: [
        {
          xtype: "textarea",
          name: "transfer_details",
          readOnly: true,
          value: JSON.stringify(latest_transfer_data.data, null, 4)
        }
      ],
      buttons: [
        {
          text: D.t("Cancel"),
          iconCls: "x-fa fa-ban",
          action: "cancel",
          handler: () => {
            me.buildWarning(
              D.t(
                "Are you sure you want to cancel this payment? You could not reverse this action"
              ),
              (result) => {
                if (result === "ok") me.cancelTransfer();
              }
            );
          }
        },
        {
          text: D.t("Resume"),
          iconCls: "x-fa fa-sync",
          action: "resume",
          handler: () => {
            me.buildWarning(
              D.t("Are you sure you want to resume this payment"),
              (result) => {
                if (result === "ok") me.resumeTransfer();
              }
            );
          }
        },
        "->",
        {
          text: D.t("Close"),
          iconCls: "x-fa fa-ban",
          action: "close_details",
          handler: () => {
            me.closeDetails();
          }
        }
      ]
    });
    this.details_form.show();

    if (latest_transfer_data.status == "empty") {
      Ext.toast(D.t("No held transfers are found"));
      this.changeDetailsButtonsStatusDisabled(true);
      return true;
    }
    return true;
  },

  async getLatestTransfer() {
    let latest_transfer_data = await this.model.getLatestTransfer(
      this.getTransfer_data()
    );
    if (latest_transfer_data.status != "empty")
      this.setLast_transfer(latest_transfer_data);
    return latest_transfer_data;
  },

  changeDetailsButtonsStatusDisabled(disable) {
    this.details_form.down("[action=cancel]").setDisabled(disable);
    this.details_form.down("[action=resume]").setDisabled(disable);
    return true;
  },
  closeDetails() {
    this.details_form.close();
  },
  async cancelTransfer(lastTransfer = null) {
    let me = this;
    this.changeDetailsButtonsStatusDisabled(true);
    let resume = true;
    if (!lastTransfer) {
      resume = false;
      lastTransfer = await this.getLatestTransfer();
    }
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
      this.changeDetailsButtonsStatusDisabled(false);
    }
    if (!resume) {
      me.setElementData(null);
      me.scope.fireEvent("paymentChanged", this.amount_field, null);
      this.closeDetails();
    }
    return true;
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
  async resumeTransfer() {
    let me = this;
    this.changeDetailsButtonsStatusDisabled(true);
    let lastTransfer = await this.getLatestTransfer();
    await this.cancelTransfer(lastTransfer);
    let res = await this.model
      .callApi(
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
      )
      .catch(async (e) => {
        console.log(e);
        D.a("Resume transfer error", this.ERROR_CODES[e] || "");
        me.changeDetailsButtonsStatusDisabled(false);
      });
    if (res.error) {
      me.setElementData(null);
      me.scope.fireEvent("paymentChanged", this.amount_field, null);
    }
    return this.closeDetails();
  },

  copyToClipboard() {
    if (!this.getHash_id()) return Ext.toast(D.t("Nothing to copy"));
    navigator.clipboard.writeText(this.getHash_id());
    return Ext.toast(D.t("Hash copied to clipboard"));
  }
});
