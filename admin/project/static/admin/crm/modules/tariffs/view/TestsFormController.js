Ext.define("Crm.modules.tariffs.view.TestsFormController", {
  extend: "Core.form.FormController",

  setControls() {
    this.control({
      "[action=run_test]": {
        click: async () => {
          await this.runTest();
        }
      },
      "[action=set_data]": {
        click: async () => {
          this.getExampleData();
        }
      }
    });
    this.view.on("beforesave", (el, data) => {
      this.prepareDataBeforeSave(data);
    });

    this.view.on("insert_checks", (parameter, value, test_id) => {
      let param = parameter.split(".");
      if (param[1] != "header")
        this.insertChecks({ parameter, value, test_id });
    });

    this.onConsoleLogSubscribe();

    this.logsField = this.view.down("[name=consolelog]");

    this.callParent(arguments);
  },

  onConsoleLogSubscribe() {
    Glob.ws.subscribe(
      "Crm.modules.tariffs.model.TestsModel",
      "Crm.modules.tariffs.model.TestsModel",
      (action, data) => {
        if (action == "log" && data.log) {
          this.logsField.setValue(data.log.join("\n"));
        }
      }
    );
  },

  async insertChecks(data) {
    await this.model.insertChecks(data);
  },

  async getExampleData() {
    let trigger_id = this.view.down("[name=trigger]").getValue();
    let res = await this.model.getExampleData(trigger_id);

    if (res && res.data && res.data.data) {
      this.view
        .down("[name=data]")
        .setValue(JSON.stringify(res.data.data, null, 2));
    }
  },

  async runTest() {
    let data = this.view.down("form").getValues();
    const res = await this.model.runTest(data.id);
    this.view.down("[name=result]").setValue(res);
  },

  prepareDataBeforeSave(data) {
    if (!data.plan_id) data.plan_id = this.view.scope.scope.currentData.id;
    if (this.input_data) data.data = this.input_data.getValue();
  },

  setValues(data) {
    this.callParent(arguments);
    if (data.data) data.data = JSON.stringify(JSON.parse(data.data), null, 2);
  }
});
