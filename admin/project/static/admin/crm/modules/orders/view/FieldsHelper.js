Ext.define("Crm.modules.orders.view.FieldsHelper", {
  saveOrderData(fields_values) {
    if (!fields_values || !Object.keys(fields_values).length)
      return { success: false };
    let fields_array = [];
    if (Object.keys(fields_values).length)
      for (let name of Object.keys(fields_values)) {
        fields_array.push({ name, value: fields_values[name] });
        if (this.view && this.view.order_data)
          this.view.order_data[name] = fields_values[name];
      }
    this.setFieldsValues(this.view, fields_array);
    return { success: true };
  },
  async disableOrderTypeSelectionIfTranchesExists(view) {
    if (!view) view = this.view;
    let id = view.recordId;
    if (id) {
      let tranches_exists = await this.model.checkExistedTranches({
        order_id: id
      });
      return view.down("[name=order_type]").setReadOnly(tranches_exists);
    }
  },
  async getOrderFieldsData(fields_array, variables_array) {
    if (!fields_array) fields_array = [];
    if (!variables_array) variables_array = [];
    let fields_data = {},
      tariff_variables = {};
    if (fields_array.length)
      fields_data = this.getFieldsValues(this.view, fields_array);
    if (
      variables_array.length &&
      this.view.scope.down("[name=organisation]").getValue()
    )
      tariff_variables = await this.model.getMerchantTariffVariables(
        this.view.scope.down("[name=organisation]").getValue(),
        variables_array
      );
    return { fields_data, tariff_variables };
  },
  async saveTrancheRow(data) {
    if (!data)
      data = this.view
        .down("[name=tranche_details_panel]")
        .getForm()
        .getValues();
    let ref_id = this.view.scope.down("[name=id]").getValue();
    await this.model.upsertTranche({
      ref_id,
      data
    });
    return { success: true };
  },

  transformFieldsNumbers(fields_data, fields_names_array = []) {
    if (!fields_names_array.length) return fields_data;
    for (let field_name of fields_names_array)
      if (typeof fields_data[field_name] == "string")
        fields_data[field_name] = Number(
          fields_data[field_name].replace(",", ".")
        );
    return fields_data;
  },
  /**
   * displayNecessaryPanel
   * @param {Object} [view] ExtJs view instance where need to manipulate with fields
   * @param {string} visible_field
   * @param {string or array[string]} hidden_fields
   * @returns
   */
  displayNecessaryPanel(view, panel_to_show, panels_to_hide) {
    if (typeof panels_to_hide == "string") panels_to_hide = [panels_to_hide];
    for (let field of panels_to_hide) {
      view.down(`[pname=${field}]`).setVisible(false);
      view.down(`[pname=${field}]`).setDisabled(true);
    }
    view.down(`[pname=${panel_to_show}]`).setVisible(true);
    view.down(`[pname=${panel_to_show}]`).setDisabled(false);
    return { success: true };
  },

  /**
   * getFieldsValues
   * @param {Object} [view] ExtJs view instance where need to manipulate with fields
   * @param {string or array[string]} fields
   * @returns
   */
  getFieldsValues(view, fields) {
    if (typeof fields == "string") fields = [fields];
    let fields_data = {};
    for (let field of fields) {
      fields_data[field] = view.down(`[name=${field}]`).getValue();
      if (this.view && this.view.order_data)
        this.view.order_data[field] = fields_data[field];
    }
    return fields_data;
  },

  /**
   * setFieldsValue
   * @param {Object} [view] ExtJs view instance where need to manipulate with fields
   * @param {any} [value]
   * @param {string or array[string]} [fields]
   * @returns
   */
  setFieldsValue(view, value, fields) {
    if (typeof fields == "string") fields = [fields];
    for (let field_name of fields)
      view.down(`[name=${field_name}]`).setValue(value);
    return { success: true };
  },

  /**
   * setFieldsValues
   * @param {Object} [view] ExtJs view instance where need to manipulate with fields
   * @param {object or array[object] } field_values
   * @returns
   */
  setFieldsValues(view, field_values) {
    if (!field_values || !field_values.length) return;
    if (!Array.isArray(field_values)) field_values = [field_values];
    for (let field of field_values) {
      view.down(`[name=${field.name}]`).setValue(field.value);
    }
    return { success: true };
  },

  /**
   * disableFields
   * @param {Object} [view]
   * @param {any} [fields]
   * @param {Boolean} [disable]
   * @returns
   */
  disableFields(view, fields) {
    if (!fields || !fields.length) return;
    if (!Array.isArray(fields)) fields = [fields];
    for (let field of fields) {
      view.down(`[name=${field}]`).setReadOnly(true);
    }
    return { success: true };
  },

  /**
   * displayFields
   * @param {Object} [view]
   * @param {any} [fields]
   * @param {Boolean} [disable]
   * @returns
   */
  displayFields(view, fields, display) {
    if (!fields || !fields.length) return;
    if (!Array.isArray(fields)) fields = [fields];
    for (let field of fields) {
      view.down(`[name=${field}]`).setVisible(!!display);
    }
    return { success: true };
  },

  /**
   *
   * @param {Object} [view]
   * @param {String} [currency]
   * @param {any} [fields]
   * @returns boolean
   */
  async setDecimalPrecisionByCurrency(view, currency, fields) {
    if (!fields || !fields.length) return;
    if (!Array.isArray(fields)) fields = [fields];
    let decimals_list = await this.getCurrencyDecimalList(view);
    for (let field of fields)
      view
        .down(`[name=${field}]`)
        .setConfig("decimalPrecision", decimals_list[currency] || 2);
    return true;
  },
  async getCurrencyDecimalList(view) {
    return await view.model.callApi(
      "merchant-service",
      "getListCurrencyDecimal",
      {}
    );
  },

  /**
   * checkIfObjectValid
   * @param {Object} obj
   * @returns boolean
   */
  checkIfObjectValid(obj) {
    if (!obj) return false;
    for (val in obj) if (!obj[val] && obj[val] !== 0) return false;
    return true;
  },

  async setDefaultCurrencies() {
    let currencies = await this.model.getCommonOrdeCurrencies();
    if (!this.view.order_data.from_currency)
      this.view.down("[name=from_currency]").setValue(currencies.from_currency);
    if (!this.view.order_data.to_currency)
      this.view.down("[name=to_currency]").setValue(currencies.to_currency);
  },
  /**
   * getDecimalLength
   * @param {integer} value
   * @returns integer
   */
  getDecimalLength(value) {
    if (!value) return 0;
    value = value.toString().split(".");
    if (value[1]) return value[1].length;
    return 0;
  }
});
