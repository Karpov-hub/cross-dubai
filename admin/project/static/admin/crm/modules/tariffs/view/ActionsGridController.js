Ext.define("Crm.modules.tariffs.view.ActionsGridController", {
  extend: "Ext.app.ViewController",

  init(view) {
    this.view = view;
    this.control({
      "[name=list]": {
        celldblclick: (th, td, cellIndex, record, tr, rowIndex, e, eOpts) => {
          this.startEdit(record);
        }
      },
      "[aname=type]": {
        change: (el, v) => {
          this.changeType(v);
        }
      },
      "[action=accept]": {
        click: () => {
          this.accept(false);
        }
      },
      "[action=acceptnew]": {
        click: () => {
          this.accept(true);
        }
      },
      "[action=clean]": {
        click: () => {
          this.clean();
        }
      }
    });
    this.panel_transfer = this.view.down("[action=transferpanel]");
    this.panel_message = this.view.down("[action=messagepanel]");
    this.panel_error = this.view.down("[action=errorpanel]");
    this.panel_tag = this.view.down("[action=tagpanel]");
    this.panel_settings = this.view.down("[action=settingspanel]");
    this.panel_internal_message = this.view.down(
      "[action=internalmessagepanel]"
    );
    this.gridfield = this.view.down("[name=list]");
  },

  changeType(type) {
    this.panel_transfer.hide();
    this.panel_message.hide();
    this.panel_error.hide();
    this.panel_tag.hide();
    this.panel_internal_message.hide();
    this[`panel_${type}`].show();
  },

  clean() {
    this.panel_settings.query("[aname]").forEach((el) => {
      if (el.aname != "type" && !!el.setValue) {
        el.setValue("");
      }
    });
    this.currentRecord = null;
  },

  getPanelValues(type) {
    const out = {};
    this[`panel_${type}`].query("[aname]").forEach((el) => {
      if (!!el.setValue) {
        out[el.aname] = el.getValue();
      }
    });
    return out;
  },

  setPanelValues(type, data) {
    Object.keys(data).forEach((key) => {
      const el = this[`panel_${type}`].down(`[aname=${key}]`);
      if (el && !!el.setValue) el.setValue(data[key]);
    });
  },

  accept(asnew) {
    const data = {
      type: this.view.down("[aname=type]").getValue(),
      name: this.view.down("[aname=name]").getValue()
    };
    data.options = this.getPanelValues(data.type);

    if (!!this.currentRecord && !asnew) {
      this.currentRecord.data = data;
      this.currentRecord.commit();
    } else {
      this.value = this.gridfield.getValue();
      if (!this.value) this.value = [];
      this.value.push(data);
      this.gridfield.setValue(this.value);
    }

    this.clean();
  },

  startEdit(record) {
    this.clean();
    this.view.down("[aname=type]").setValue(record.data.type);
    this.view.down("[aname=name]").setValue(record.data.name);
    this.setPanelValues(record.data.type, record.data.options);
    this.currentRecord = record;
  }
});
