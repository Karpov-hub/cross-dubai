Ext.define("Crm.modules.orders.view.orderTypes.BaseTypesController", {
  extend: "Core.form.FormController",

  setControls() {
    this.view.on(
      "paymentChanged",
      (amount_field_name, transfer_id, hash_id) => {
        this.view.scope.fireEvent("checkIfOrderHaveTransfers");
        this.setFieldsValue(
          this.view,
          transfer_id,
          `${amount_field_name}_transfer_id`
        );
        if (hash_id) {
          this.setFieldsValue(
            this.view,
            hash_id,
            `${amount_field_name}_hash_id`
          );
          this.view.scope.fireEvent("hashSet");
        }
        this.updateOrderStatus();
        this.view.scope.controller.save(false);
        this.view.scope.fireEvent("statusChanged");
      }
    );
    this.callParent(arguments);
  },

  updateOrderStatus() {
    let hashes_fields_arr = this.getHashesFields();
    let hashes = this.getFieldsValues(this.view, hashes_fields_arr);
    if (
      Object.values(hashes).every((el) => {
        return !!el;
      })
    )
      return this.setFieldsValue(this.view.scope, "Completed", "status");
    let transfers_ids = this.getTransfersFields();
    let transfers = this.getFieldsValues(this.view, transfers_ids);
    if (
      Object.values(transfers).some((el) => {
        return !!el;
      })
    )
      return this.setFieldsValue(this.view.scope, "In progress", "status");

    return this.setFieldsValue(this.view.scope, "Created", "status");
  },
  async closeTranche(scope) {
    await this.updateOrderData();
    scope.down("[name=tranche_details_panel]").setVisible(false);
    scope.down("[name=order_totals_panel]").setVisible(true);
  },
  calculateTrancheData() {
    return {};
  },
  async updateOrderData() {
    return {};
  },
  async updateTranche() {
    await this.calculateTrancheData();
    await this.saveTrancheRow();
    return await this.disableOrderTypeSelectionIfTranchesExists(
      this.view.scope
    );
  },

  async updateOrderDataQuietly() {
    let main_order_data = this.view
      .down("[name=order_totals_panel]")
      .getForm()
      .getValues();
    let tranches = await this.view.model.getOrderTranchesData(
      this.view.scope.currentData.id
    );
    if (!tranches || !tranches.length) return;
    for (let tranche of tranches) {
      let tranche_data = await this.calculateTrancheData(
        Object.assign(main_order_data, tranche)
      );
      await this.saveTrancheRow(Object.assign(tranche, tranche_data));
    }
    await this.updateGeneralOrderData();
  },

  disableAdditionalOrderFields(fields) {
    for (let field of fields) {
      this.view.down(`[name=${field}]`).setReadOnly(true);
    }
    return;
  },
  getEmptyTrancheData() {
    let output = {};
    let tranche_details_panel = this.view.down("[name=tranche_details_panel]");
    if (tranche_details_panel.items.items.length)
      for (let item of tranche_details_panel.items.items) {
        if (item.xtype == "fieldcontainer") {
          this.setFieldsEmptyFromInnerContainer(output, item.items.items);
          continue;
        }
        output[item.name] = item.xtype == "numberfield" ? null : "";
      }
    return output;
  },
  setFieldsEmptyFromInnerContainer(output, items) {
    for (let item of items) {
      output[item.name] = item.xtype == "numberfield" ? null : "";
    }
    return output;
  },
  async fillFieldsWithSystemData(order_data, fields_array) {
    let empty_fields_array = [];
    let tariff_variables_array = [];
    for (let field of fields_array) {
      if (order_data[field[0]]) continue;
      empty_fields_array.push(field);
      tariff_variables_array.push(field[1]);
    }
    let data = await this.getOrderFieldsData([], tariff_variables_array);
    let tariff_variables = data.tariff_variables;
    let fields_values = {};
    for (let field of empty_fields_array)
      fields_values[field[0]] = tariff_variables[field[1]];
    this.saveOrderData(fields_values);
  },
  async updateGeneralOrderData() {
    return {};
  },

  async sortCurrenciesByCommonUsed(field_name, filter) {
    if (!field_name) return;
    let store = this.view.down(`[name=${field_name}]`).getStore();
    if (!store) return;

    store.clearFilter(true);
    if (filter) {
      store.filter("crypto", filter == "crypto" ? true : false);
      store.reload()
    }
    store.on("load", async () => {
      let currencies = await this.view.model.calculateCurrenciesRating({
        volume: field_name
      });
      let store_data = store.getData().items.map((el) => el.data);

      store_data.sort((a, b) => {
        if ((currencies[a.abbr] || 0) > (currencies[b.abbr] || 0)) return -1;
        if ((currencies[a.abbr] || 0) < (currencies[b.abbr] || 0)) return 1;
        return 0;
      });
      this.view
        .down(`[name=${field_name}]`)
        .getStore()
        .setData(store_data);
    });
  }
});
