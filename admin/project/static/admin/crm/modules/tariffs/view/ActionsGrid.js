Ext.define("Crm.modules.tariffs.view.ActionsGrid", {
  extend: "Ext.panel.Panel",
  layout: "border",

  mixins: {
    field: "Ext.form.field.Field"
  },

  requires: [
    "Core.form.TreePicker",
    "Ext.ux.TreePicker",
    "Desktop.core.widgets.GridField"
  ],

  initComponent() {
    this.controller = Ext.create(
      "Crm.modules.tariffs.view.ActionsGridController"
    );
    this.buildStores();
    this.items = [this.buildGrid(), this.buildForm()];
    //this.tbar = this.buildTbar();
    this.callParent(arguments);
  },

  setValue: function(value) {
    if (!value) value = [];
    this.value = value;
    this.down("[name=list]").store.loadData(value);
    this.fireEvent("change", this, value);
  },

  getValue: function() {
    var out = [];
    this.down("[name=list]").store.each(function(r) {
      var log = false;
      for (var i in r.data)
        if (r.data[i]) {
          log = true;
          break;
        }
      if (log) out.push(r.data);
    });
    this.value = out;
    return out;
  },
  getSubmitData: function() {
    var res = {};
    res[this.name] = this.getValue();
    return res;
  },

  buildGrid() {
    return {
      xtype: "gridfield",
      region: "west",
      name: "list",
      width: 350,
      split: true,
      fields: ["name", "type", "options"],
      buildTbar() {
        return null;
      },
      buildCellEditing() {
        return null;
      },

      columns: [
        {
          text: D.t("Action name"),
          flex: 1,
          sortable: false,
          dataIndex: "name",
          menuDisabled: true,
          editor: false
        },
        {
          text: D.t("Type"),
          width: 70,
          sortable: false,
          dataIndex: "type",
          menuDisabled: true,
          editor: false
        }
      ]
    };
  },

  buildForm() {
    return {
      xtype: "panel",
      style: "background:#ffffff;",
      region: "center",
      layout: "anchor",
      action: "settingspanel",
      padding: 5,
      tbar: [
        {
          text: D.t("Accept action"),
          iconCls: "fa fa-check",
          action: "accept"
        },
        {
          text: D.t("Accept as new"),
          iconCls: "fa fa-plus",
          action: "acceptnew"
        },
        "->",
        {
          text: D.t("Clean"),
          iconCls: "fa fa-eraser",
          action: "clean"
        }
      ],
      defaults: {
        anchor: "100%",
        labelWidth: 150
      },
      items: [
        {
          xtype: "combo",
          fieldLabel: D.t("Action type"),
          aname: "type",
          valueField: "type",
          displayField: "type",
          value: "transfer",
          editable: false,
          store: {
            fields: ["type"],
            data: [
              { type: "transfer" },
              { type: "tag" },
              { type: "message" },
              { type: "internal_message" },
              { type: "error" }
            ]
          }
        },
        {
          xtype: "textfield",
          fieldLabel: D.t("Action name"),
          aname: "name"
        },
        this.buildTransferFields(),
        this.buildTagFields(),
        this.buildMessageFields(),
        this.buildErrorFields(),
        this.buildInternalMessageFields()
      ]
    };
  },

  buildTransferFields() {
    return Ext.create("Crm.modules.tariffs.view.actions.Transfer", {
      action: "transferpanel",
      scope: this
    });
  },

  buildMessageFields() {
    return Ext.create("Crm.modules.tariffs.view.actions.Message", {
      action: "messagepanel",
      hidden: true,
      scope: this
    });
  },

  buildErrorFields() {
    return Ext.create("Crm.modules.tariffs.view.actions.Error", {
      action: "errorpanel",
      hidden: true,
      scope: this
    });
  },
  buildInternalMessageFields() {
    return Ext.create("Crm.modules.tariffs.view.actions.InternalMessage", {
      action: "internalmessagepanel",
      hidden: true,
      scope: this
    });
  },

  buildTagFields() {
    return Ext.create("Crm.modules.tariffs.view.actions.Tag", {
      action: "tagpanel",
      hidden: true,
      scope: this
    });
  },

  buildTbar() {
    return [];
  },

  buildStores() {
    this.id_store = Ext.create("Ext.data.TreeStore", {
      fields: ["_id", "name"],
      root: {}
    });
    this.acc_store = Ext.create("Ext.data.TreeStore", {
      fields: ["_id", "name"],
      root: {}
    });
    this.amount_store = Ext.create("Ext.data.TreeStore", {
      fields: ["_id", "name"],
      root: {}
    });
    this.to_store = Ext.create("Ext.data.TreeStore", {
      fields: ["_id", "name"],
      root: {}
    });
    this.internal_receiver_store = Ext.create("Ext.data.TreeStore", {
      fields: ["_id", "name"],
      root: {}
    });
    this.dataField.on("change", (el, data) => {
      this.acc_store.setRoot({
        expanded: true,
        children: this.buildTreeDataFromObject(data, "root", /^acc/)
      });
      this.amount_store.setRoot({
        expanded: true,
        children: this.buildTreeDataFromObject(data, "root", /^amount/)
      });
      this.id_store.setRoot({
        expanded: true,
        children: this.buildTreeDataFromObject(
          data,
          "root",
          /id/,
          /^[a-f0-9\-]{36}$/
        )
      });
      this.to_store.setRoot({
        expanded: true,
        children: this.buildTreeDataFromObject(
          data,
          "root",
          /mail|phone|id|address|acc_no|acc/
        )
      });
      this.internal_receiver_store.setRoot({
        expanded: true,
        children: this.buildTreeDataFromObject(
          data,
          "root",
          /admin|receiver|maker|internal|inner/
        )
      });
    });
  },

  buildTreeDataFromObject(obj, parent, mask, valueMask) {
    let out = [],
      item = {};
    for (let i in obj)
      if (i != "__conf") {
        item = {
          _id: parent + ":" + i,

          name: i
        };
        if (Ext.isObject(obj[i])) {
          item.children = this.buildTreeDataFromObject(
            obj[i],
            item._id,
            mask,
            valueMask
          );
          item.leaf = false;
          item.expanded = true;
        } else if (Ext.isArray(obj[i])) {
          item.type = "ARRAY";
          if (Ext.isObject(obj[i][0]))
            item.children = this.buildTreeDataFromObject(
              obj[i][0],
              item._id,
              mask,
              valueMask
            );
          item.leaf = false;
          item.expanded = true;
        } else {
          item.leaf = true;
        }

        if (
          (item.leaf &&
            (mask.test(item.name) || (valueMask && valueMask.test(obj[i])))) ||
          (item.children && item.children.length)
        )
          out.push(item);
      }
    return out;
  }
});
