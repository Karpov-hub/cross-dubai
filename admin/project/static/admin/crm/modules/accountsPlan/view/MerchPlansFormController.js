Ext.define("Crm.modules.accountsPlan.view.MerchPlansFormController", {
  extend: "Core.form.FormController",

  setControls: function() {
    this.control({
      "[name=plan_id]": {
        change: (el, val) => {
          this.changePlan(val);
        }
      }
    });
    this.callParent(arguments);
  },

  setValues(data) {
    this.planItems = data.items;
    data.plan_id = data.plan_id ? data.plan_id.id : "";
    this.planName = data.name;

    if (data.plan_id) {
      setTimeout(() => {
        this.changePlan(data.plan_id);
      }, 500);
    }
    this.callParent(arguments);
  },

  changePlan(val) {
    let selectedData;
    this.view
      .down("[name=plan_id]")
      .getStore()
      .each((item) => {
        if (item.data.id == val) selectedData = item.data;
      });
    if (selectedData) {
      if (this.planName) this.planName = "";
      else this.view.down("[name=name]").setValue(selectedData.name);

      const values = this.view.down("[name=items]").getValue();
      const items = selectedData.items.concat([]);
      items.forEach((item) => {
        for (let v of values) {
          if (v.tag == item.tag && v.currency == item.currency) {
            item.acc_no = v.acc_no;
            item.extra = v.extra;
            if (v.descript) item.descript = v.descript;
            break;
          }
        }
      });
      this.view.down("[name=items]").setValue(items);
    }
  }
});
