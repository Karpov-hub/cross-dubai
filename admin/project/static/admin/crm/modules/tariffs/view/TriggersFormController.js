Ext.define("Crm.modules.tariffs.view.TriggersFormController", {
  extend: "Core.form.FormController",

  setControls() {
    this.control({
      "[action=testcron]": {
        click: el => {
          this.testCron();
        }
      },
      "[name=tablename]": {
        change: (el, v) => {
          this.tableChange(v);
        }
      },
      "[name=ttype]": {
        change: (el, v, pv) => {
          this.typeChange(v, pv);
        }
      }
    });
    this.view.on("beforesave", (el, data) => {
      this.prepareDataBeforeSave(data);
    });
    this.view.EventCombo.on("change", (el, v) => {
      // this.changeMethod(v);
    });
    this.getApiServices();
    //
    this.fieldModel = Ext.create(
      "Crm.modules.tariffs.model.DbTablesFieldsModel"
    );

    this.callParent(arguments);
  },

  typeChange(value, perviouse) {
    this.view.EventCombo.setDisabled(value !== 1);
    this.view.down("[action=cron]").setDisabled(value !== 2);
    if (perviouse && value) {
      this.view.down("[name=cron]").setValue("");
    }
  },

  tableChange(table) {
    this.fieldModel.runOnServer("getExampleRecord", { table }, fields => {
      this.view.down("[name=data]").setValue(JSON.stringify(fields, null, 2));
    });
  },

  getApiServices() {
    const realmModel = Ext.create("Crm.modules.realm.model.RealmModel");
    let out = [];
    //this.view..setLoading(true);
    realmModel.getApiServices(res => {
      if (res && res.result && res.result.data) {
        Object.keys(res.result.data).forEach(service => {
          Object.keys(res.result.data[service]).forEach(method => {
            out.push({
              service,
              method,
              service_method: `${service}:${method}`,
              description: res.result.data[service][method].description
            });
          });
        });
      }
      this.view.EventCombo.store.loadData(out);
    });
  },

  changeMethod(v) {
    this.view.down("[name=cron]").setDisabled(!!v);
    this.view.down("[action=testcron]").setDisabled(!!v);
    this.view.down("[name=data]").setDisabled(!v);
  },

  testCron() {
    let result = [];
    this.model.testCronString(this.view.down("[name=cron]").getValue(), res => {
      result.push("Test cron string: " + (res.valid ? "OK" : "Wrong!"));
      this.model.testQuery(
        {
          table: this.view.down("[name=tablename]").getValue(),
          conditions: this.view.down("[name=conditions]").getValue()
        },
        res => {
          result.push("Test query: " + (res.valid ? "OK" : "Wrong!"));
          D.a("Test cron", result.join("<br>"), []);
        }
      );
    });
  },

  prepareDataBeforeSave(data) {
    let event = this.view.EventCombo.getValue();
    if (event) {
      event = event.split(":");
      data.service = event[0];
      data.method = event[1];
    }
  },

  afterDataLoad(data, cb) {
    if (data.service && data.method) {
      this.view.EventCombo.setValue(data.service + ":" + data.method);
    }
    if (data.data) {
      data.data = JSON.stringify(data.data, null, 4);
    }
    cb(data);
  }
});
