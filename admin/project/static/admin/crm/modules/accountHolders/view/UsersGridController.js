Ext.define("Crm.modules.accountHolders.view.UsersGridController", {
  extend: "Core.grid.GridController",
  setControls() {
    this.control({
      "[action=merchantsExportTransfers]": {
        click: () => {
          this.exportTx({ report_name: "tradeHistoryCsv" });
        }
      },
      "[action=exportPlanTransfers]": {
        click: () => {
          this.exportTx({ report_name: "transfersByPlanReport" });
        }
      },
      "[action=add_client]": {
        click: () => {
          this.askForClientType();
        }
      }
    });
    this.callParent();
  },
  askForClientType: function() {
    let me = this;
    let messageBox = Ext.create("Ext.window.Window", {
      title: D.t("Message"),
      layout: "fit",
      modal: true,
      draggable: !Ext.platformTags.phone,
      height: 150,
      width: Ext.platformTags.phone ? Ext.Element.getViewportWidth() : 300,
      padding: 10,
      items: [{ xtype: "label", text: D.t("Choose type of client, please") }],
      dockedItems: [
        {
          xtype: "toolbar",
          dock: "bottom",
          ui: "footer",
          defaults: {
            xtype: "button"
          },
          items: [
            {
              text: D.t("Project"),
              value: "project",
              handler: () => {
                me.addRecord({ type: 0 });
                messageBox.close();
              }
            },
            {
              text: D.t("Company"),
              value: "company",
              handler: () => {
                me.addRecord({ type: 1 });
                messageBox.close();
              }
            },
            "->",
            {
              text: D.t("Cancel"),
              value: "cancel",
              handler: () => {
                messageBox.close();
              }
            }
          ]
        }
      ]
    }).show();
  },
  addRecord: function(data) {
    this.view.model.getNewObjectId((id) => {
      if (!!this.view.observeObject) window.__CB_REC__ = this.view.observeObject;
      let oo = { type: data.type };
      oo[this.view.model.idField] = id;
      this.gotoRecordHash(oo);
    });
  },

  gotoRecordHash: function(data) {
    this.detailClass = null;
    if (data.hasOwnProperty("type") && data.type === 0)
      this.detailClass = "Crm.modules.accountHolders.view.ProjectsForm";
    this.callParent(arguments);
  },

  exportTx(data = {}) {
    let user_id;
    if (
      this.view &&
      this.view.store &&
      this.view.store.data &&
      this.view.store.data.items.length
    ) {
      user_id = this.view.store.data.items[0].data.id;
    }

    Ext.create("Crm.modules.transfers.view.ExportTransfersForm", {
      scope: this.view,
      merchant_id: null,
      user_id: user_id || null,
      report_name: data.report_name
    });
  },

  deleteRecord_do(store, rec) {
    D.c("Removing", "Delete the record?", [], async () => {
      await this.model.removeClient({ data: rec.data });
      store.remove(rec);
    });
  },

  initButtonsByPermissions: function() {
    var me = this;
    this.view.model.getPermissions(async (permis) => {
      me.model.callServerMethod("getAdminProfile").then((current_user) => {
        me.view.permis = permis;
        me.view.current_user = current_user;
        if (!permis.add) {
          var addBtn = me.view.down("[action=add]");
          if (addBtn) addBtn.setDisabled(true);
        }
      });
    });
  }
});
