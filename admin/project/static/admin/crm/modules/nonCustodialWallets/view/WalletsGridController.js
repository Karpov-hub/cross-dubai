Ext.define("Crm.modules.nonCustodialWallets.view.WalletsGridController", {
  extend: "Core.grid.GridController",

  setControls() {
    this.control({
      "[action=learn_more]": {
        click: () => {
          this.openLearnMoreWindow();
        }
      }
    });

    this.view.on("sharePrivateKey", (grid, indx) => {
      this.getPrivateKeyForm(grid.getStore().getAt(indx));
    });

    this.callParent(arguments);

    this.setMerchantFilterStore();
  },

  async getPrivateKeyForm(data) {
    const email = data.data.user_id.email
    Ext.create("Crm.modules.nonCustodialWallets.view.GetPrivateKeyWindow", {
      scope: this.view,
      wallet: data.data,
      email,
      callback: async (data) => {
        this.reloadData();
      }
    });
  },

  openLearnMoreWindow() {
    return Ext.create("Crm.modules.nonCustodialWallets.view.LearnMoreWindow");
  },

  async setMerchantFilterStore() {
    if (this.view.observe && this.view.observe.length) {
      const observe = this.view.observe;

      if (!observe || !observe.length) {
        return null;
      }

      const observeParam = observe[0].property;

      if (observeParam == "user_id") {
        const merchants = await this.model.getAllMerchantsByClient({
          client_id: this.view.scope.recordId
        });

        const merchantColumn = this.view.columns.find(
          (item) => item.dataIndex == "merchant_id"
        );

        merchantColumn.filter = {
          xtype: "combo",
          queryMode: "local",
          forceSelection: true,
          triggerAction: "all",
          valueField: "id",
          displayField: "name",
          store: {
            fields: ["id", "name"],
            data: merchants
          }
        };
      }
    }
  }
});
