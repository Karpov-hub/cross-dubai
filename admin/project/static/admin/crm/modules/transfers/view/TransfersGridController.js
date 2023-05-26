Ext.define("Crm.modules.transfers.view.TransfersGridController", {
  extend: "Core.grid.GridController",

  setControls() {
    this.control({
      "[action=provide_deferred]": {
        click: () => {
          this.provideDeferred();
        }
      },
      "[action=exportTransfers]": {
        click: () => {
          this.exportTx({
            report_name: "tradeHistoryCsv"
          });
        }
      },
      "[action=exportPlanTransfers]": {
        click: () => {
          this.exportTx({
            report_name: "transfersByPlanReport"
          });
        }
      }
    });
    this.view.on({
      accept: (grid, data) => {
        this.accept(data);
      }
    });

    this.view.on({
      cancel: (grid, data) => {
        this.buildWarning(
          D.t(
            "Are you sure you want to cancel this transfer? You could not reverse this action"
          ),
          (result) => {
            if (result === "ok") this.reject(data);
          }
        );
      }
    });

    this.view.on({
      adjust_deposit_form: (grid, data) => {
        this.createAdjustDepositForm(data);
      }
    });

    this.view.on({
      show_deposit: (grid, data) => {
        this.showDepositToClient(data);
      }
    });

    this.view.store.on("load", () => {
      if (!this.groupingFeature && this.view.down("grid"))
        this.groupingFeature = this.view
          .down("grid")
          .view.findFeature("grouping");
      if (this.groupingFeature) this.groupingFeature.expandAll();
    });

    // this.getEvents();
    this.callParent();
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

  createAdjustDepositForm(data) {
    const form = Ext.create("Crm.modules.transfers.view.DepositForm");
    const formData = {
      user_id: data.user_id,
      merchant: data.merchant_id,
      ref_id: data.ref_id,
      amount: data.amount,
      currency: data.currency,
      description: "",
      is_adjust: true,
      deposit_id: data.id,
      acc_no: data.data.acc_no,
      transfer_data: data.data
    };
    form.controller.setValues(formData);
  },

  async showDepositToClient(data) {
    await this.model.callApi(
      "account-service",
      "showDepositAndSendEmail",
      data,
      data.realm_id,
      data.user_id
    );
    this.reloadData();
  },

  exportTx(data = {}) {
    let user_id, ref_id;
    if (this.view && this.view.observeObject) {
      user_id = this.view.observeObject.user_id;
      ref_id = this.view.observeObject.ref_id;
    }

    Ext.create("Crm.modules.transfers.view.ExportTransfersForm", {
      scope: this.view,
      merchant_id: data.merchant_id || null,
      user_id: user_id || null,
      ref_id: ref_id || null,
      report_name: data.report_name
    });
  },

  showDepositWindow() {
    Ext.create("Crm.modules.transfers.view.DepositForm", {
      scope: this.view
    });
  },

  gotoRecordHash(data) {
    if (data.plan_transfer_id && data.plan_transfer_id != "1")
      this.openPlanTransfers(data);
    else this.callParent(arguments);
  },

  openPlanTransfers(data) {
    if (this.view.config && this.view.config.from_calc)
      return Ext.create("Crm.modules.transfers.view.PlanTransfersWin", {
        from_calc: this.view.config.from_calc
      }).setValues(data);
    return Ext.create("Crm.modules.transfers.view.PlanTransfersWin").setValues(
      data
    );
  },

  getEvents() {
    const realmModel = Ext.create("Crm.modules.realm.model.RealmModel");
    const events = {};
    realmModel.getApiServices((res) => {
      if (res && res.result && res.result.data) {
        Object.keys(res.result.data).forEach((service) => {
          Object.keys(res.result.data[service]).forEach((method) => {
            events[`${service}:${method}`] =
              res.result.data[service][method].description;
          });
        });
      }
      this.setEventsStore(events);
    });
  },

  setEventsStore(events) {
    this.view.eventsNames = events;

    this.view.eventStore.loadData(
      Object.keys(events).map((key) => {
        return { key, name: events[key] };
      })
    );
    this.reloadData();
  },

  async accept(data) {
    await this.model.callApi(
      "account-service",
      "accept",
      {
        ref_id: data.ref_id,
        transfer_id: data.id,
        _admin_id: localStorage.getItem("uid")
      },
      data.realm_id,
      data.user_id
    );
    this.reloadData();
  },

  async reject(data) {
    await this.model.callApi(
      "account-service",
      "rollback",
      {
        ref_id: data.ref_id,
        transfer_id: data.id,
        plan_transfer_id: data.plan_transfer_id
      },
      data.realm_id,
      data.user_id || data.merchant_id
    );
    this.reloadData();
  },

  generateDetailsCls() {
    return "Crm.modules.transfers.view.TransfersForm";
  },

  provideDeferred() {
    Ext.create("Crm.modules.orders.view.DeferredWindow");
  }
});
