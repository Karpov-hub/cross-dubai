Ext.define("Crm.modules.realm.view.RealmFormController", {
  extend: "Core.form.FormController",

  setControls() {
    this.control({
      "[action=gentoken]": {
        click: () => {
          this.genToken();
        }
      },
      "[action=permissHeader]": {
        async headerclick(grid, col, e, t) {
          await this.allowAllPermis();
        }
      },
      "[name=admin_realm]": {
        change: (e, newVal, oldVal) => {
          let me = this;
          let realm = me.view.down("form").getValues();
          this.model.runOnServer(
            "checkDefaultRealm",
            { realmId: realm.id },
            function(res) {
              if (res.result === true || oldVal === true) {
                return me.view.down("[name=admin_realm]").setValue(newVal);
              } else {
                return me.view.down("[name=admin_realm]").setValue(oldVal);
              }
            }
          );
        }
      }
    });
    this.view.on("beforesave", (el, data) => {
      this.prepareDataBeforeSave(data);
    });
    this.callParent(arguments);
  },

  afterDataLoad(data, cb) {
    let out = [];
    const permisGrid = this.view.down("[name=permiss]");
    permisGrid.setLoading(true);
    this.model.getApiServices((res) => {
      if (res && res.result && res.result.data) {
        Object.keys(res.result.data).forEach((service) => {
          Object.keys(res.result.data[service]).forEach((method) => {
            if (res.result.data[service][method].realm) {
              out.push({
                service,
                method,
                description: res.result.data[service][method].description,
                access:
                  data.permissions &&
                  data.permissions[service] &&
                  data.permissions[service][method]
              });
            }
          });
        });
      }
      out.sort((a, b) => {
        return a.service + ":" + a.method > b.service + ":" + b.method ? 1 : -1;
      });
      //data.permissions = out;
      permisGrid.setValue(out);
      permisGrid.setLoading(false);
    });
    cb(data);
  },

  async allowAllPermis() {
    const permisGrid = this.view.down("[name=permiss]");
    let permisGridData = permisGrid.getValue();
    let notAllYES = false;
    for (let permis of permisGridData) {
      if (!permis.access) notAllYES = true;
    }
    for (let permis of permisGridData) {
      permis.access = notAllYES;
    }
    permisGrid.setValue(permisGridData);
  },
  prepareDataBeforeSave(data) {
    let out = {};
    data.permiss.forEach((rec) => {
      if (rec.access) {
        if (!out[rec.service]) out[rec.service] = {};
        out[rec.service][rec.method] = true;
      }
    });
    data.permissions = out;
  },

  genToken() {
    this.model.generateToken((token) => {
      if (token) {
        this.view.down("[name=token]").setValue(token);
      }
    });
  },

  setValues(data) {
    if (data && data.pid && data.pid.id) data.pid = data.pid.id;
    this.callParent(arguments);
  }
});
