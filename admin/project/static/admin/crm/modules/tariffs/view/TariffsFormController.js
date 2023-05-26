Ext.define("Crm.modules.tariffs.view.TariffsFormController", {
  extend: "Core.form.FormController",

  setControls() {
    this.control({
      "[name=trigger]": {
        change: (el, v) => {
          this.onTriggerChange(v);
        }
      },
      "[action=addobject]": {
        click: () => {
          this.addObject();
        }
      },
      "[action=datafromtrigger]": {
        click: () => {
          this.dataFromTrigger();
        }
      }
    });
    this.triggerModel = Ext.create("Crm.modules.tariffs.model.TriggersModel", {
      scope: this
    });
    this.dataField = this.view.down("[name=data]");
    this.callParent(arguments);
  },

  onTriggerChange(id) {
    let currentData = this.dataField.getValue();
    if (!currentData) this.readDataFromTrigger(id);
  },
  readDataFromTrigger(id) {
    this.triggerModel.readRecord(id, data => {
      if (data && data.data) {
        this.dataField.setValue(data.data);
      }
    });
  },
  dataFromTrigger() {
    const trigger = this.view.down("[name=trigger]").getValue();
    if (trigger) this.readDataFromTrigger(trigger);
  },
  addObject() {
    const data = this.view.down("[name=data]").getValue();
    if (data) {
      Ext.create("Crm.modules.tariffs.view.AddObjectWindow", {
        scope: this.view.down("[name=data]"),
        callback(data) {
          this.view.down("[name=data]").setValue(data);
        }
      });
    }
  }
});
