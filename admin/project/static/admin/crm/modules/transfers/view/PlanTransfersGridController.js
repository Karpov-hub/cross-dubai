Ext.define("Crm.modules.transfers.view.PlanTransfersGridController", {
  extend: "Core.grid.GridController",

  setControls() {
    this.control({
      "[action=cancel_payment]": {
        click: () => {
          this.buildWarning(
            D.t(
              "Are you sure you want to cancel this payment? You could not reverse this action"
            ),
            (result) => {
              if (result === "ok") this.cancelPayment();
            }
          );
        }
      },
      "[action=resume_payment]": {
        click: () => {
          this.buildWarning(
            D.t("Are you sure you want to resume this payment?"),
            (result) => {
              if (result === "ok") this.resumePayment();
            }
          );
        }
      }
    });
    this.view.on({
      deletePermanent: (grid, data) => {
        this.deletePermanent(data);
      }
    });

    this.showResumeButton();

    this.callParent();
  },

  gotoRecordHash() {},

  buildWarning(message, cb) {
    Ext.Msg.show({
      title: "Warning",
      message,
      buttons: Ext.Msg.OKCANCEL,
      icon: Ext.Msg.WARNING,
      fn: cb
    });
  },

  showResumeButton() {
    this.view.store.on("load", async () => {
      await this.showResumeButtonIfLatestTransferIsPending();
    });
  },

  async showResumeButtonIfLatestTransferIsPending() {
    let lastTransfer = await this.getLatestPlanTransferFromGrid();

    if (lastTransfer && lastTransfer.held && !lastTransfer.canceled) {
      this.view.down("[action=resume_payment]").setVisible(true);
      this.view.down("[action=cancel_payment]").setVisible(true);
    } else {
      this.view.down("[action=resume_payment]").setVisible(false);
      this.view.down("[action=cancel_payment]").setVisible(false);
    }
  },

  async getLatestPlanTransferFromGrid() {
    let planTransfers = [];
    this.view
      .down("grid")
      .getStore()
      .each((item) => {
        planTransfers.push(item.data);
      });
    return planTransfers[0];
  },

  async getLatestPlanTransfer() {
    const latestGridTransfer = await this.getLatestPlanTransferFromGrid();
    const transferId = latestGridTransfer.id;

    const lastTransfer = await this.model.getLatestPlanTransfer({
      transfer_id: transferId
    });

    return lastTransfer;
  },

  ERROR_CODES: {
    INSUFFICIENTBALANCE: "Insufficient balance"
  },

  async resumePayment() {
    let lastTransfer = await this.getLatestPlanTransfer();
    const merchant_id =
      lastTransfer.data.merchant_id || lastTransfer.data.merchant;
    await this.cancelPayment(lastTransfer);
    await this.model
      .callApi(
        "account-service",
        "resumeTransfer",
        {
          pipeline: lastTransfer.data.pipeline,
          ref_id: lastTransfer.ref_id,
          merchant_id: merchant_id,
          amount: lastTransfer.amount,
          realm_id: lastTransfer.realm_id
        },
        lastTransfer.realm_id,
        lastTransfer.user_id || merchant_id
      )
      .catch(async (e) => {
        D.a("Resume transfer error", this.ERROR_CODES[e] || "");
        await this.showResumeButtonIfLatestTransferIsPending();
      });
    await this.showResumeButtonIfLatestTransferIsPending();
  },

  async cancelPayment(lastTransfer) {
    if (!lastTransfer) lastTransfer = await this.getLatestPlanTransfer();
    const merchant_id =
      lastTransfer.data.merchant_id || lastTransfer.data.merchant;
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
        lastTransfer.user_id || merchant_id
      );
    }
    return;
  }
});
