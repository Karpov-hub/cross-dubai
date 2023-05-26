Ext.define("Crm.modules.merchants.model.DepartmentsFunctionsModel", {
  /* scope:server */
  async saveComboData(data, collection, comboVals, removeObj, insertObj) {
    await this.src.db.collection(collection).remove(removeObj);

    if (!comboVals) return data;
    if (!Ext.isArray(comboVals)) comboVals = [comboVals];
    for (let val of comboVals) {
      if (collection == "org_cryptowallets") insertObj.wallet_id = val;
      if (collection == "merchant_accounts") {
        insertObj.id_account = val;
        await this.src.db.collection("accounts").update(
          {
            id: insertObj.id_account
          },
          {
            $set: {
              acc_name: data.name
            }
          }
        );
      }
      if (collection == "org_ibans") insertObj.iban_id = val;
      if (collection == "realm_department_accounts") insertObj.account_id = val;
      await this.src.db.collection(collection).insert(insertObj);
    }
  },

  /* scope:server */
  async saveComboDataWallet(data, collection, comboVals, removeObj, insertObj) {
    await this.src.db.collection(collection).remove(removeObj);

    if (!comboVals) return data;

    if (!Ext.isArray(comboVals)) comboVals = [comboVals];
    for (let val of comboVals) {
      if (collection == "org_cryptowallets") insertObj.org_id = val;
      await this.src.db.collection(collection).insert(insertObj);
    }
  }
});
