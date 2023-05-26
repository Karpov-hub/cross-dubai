Ext.define("Crm.modules.tariffs.view.DataBuilder", {
  extend: "Ext.form.FieldContainer",

  mixins: {
    field: "Ext.form.field.Field"
  },

  requires: [],

  border: false,
  bodyBorder: true,
  layout: "border",

  initComponent() {
    this.store = this.buildStore();
    this.items = this.buildGrid();
    this.callParent();
  },

  setValue(value) {
    this.value = value;
    if (value) {
      const data = {
        expanded: true,
        children: this.createTreeDataFromObject(value, "root")
      };
      this.grid.setRootNode(data);
    }
    this.fireEvent("change", this, value);
  },

  getValue() {
    if (!this.value) return null;
    this.value = Ext.apply(this.readTreeData(this.grid.getRootNode()), {
      __conf: this.value.__conf
    });
    return this.value;
  },

  readTreeData(node) {
    let out = {};

    node.childNodes.forEach((n) => {
      if (n.data.leaf) {
        out[n.data.name] = n.data.example;
      } else {
        out[n.data.name] = this.readTreeData(n);
      }
    });
    return out;
  },

  getSubmitData() {
    var res = {};
    res[this.name] = this.getValue();
    return res;
  },

  buildStore() {
    return Ext.create("Ext.data.TreeStore", {
      fields: ["_id", "name", "type", "isLayover", "example"],
      root: {}
    });
  },

  buildGrid() {
    this.grid = Ext.create("Ext.tree.Panel", {
      region: "center",
      rootVisible: false,
      store: this.store,
      scrollable: "y",
      listeners: {
        celldblclick: (el, td, cellIndex, record) => {
          this.fireEvent("celldblclick", record);
        }
      },
      columns: [
        {
          xtype: "treecolumn",
          text: D.t("Properties"),
          dataIndex: "name",
          flex: 1,
          renderer: function(val, meta, rec) {
            if (rec.get("isLayover")) {
              meta.tdStyle = "color: gray; font-style: italic;";
            }
            return val;
          }
        },
        {
          text: D.t("Value example"),
          dataIndex: "example",
          flex: 1
        },
        {
          text: D.t("Field type"),
          dataIndex: "type",
          width: 100
        }
      ]
    });

    return this.grid;
  },

  createTreeDataFromObject(obj, parent) {
    let out = [],
      item = {};
    for (let i in obj)
      if (i != "__conf") {
        item = {
          _id: parent + ":" + i,
          name: i,
          example: ""
        };
        if (Ext.isObject(obj[i])) {
          item.children = this.createTreeDataFromObject(obj[i], item._id);
          item.type = "OBJECT";
          item.leaf = false;
          item.expanded = true;
        } else if (Ext.isArray(obj[i])) {
          item.type = "ARRAY";
          if (Ext.isObject(obj[i][0]))
            item.children = this.createTreeDataFromObject(obj[i][0], item._id);
          else {
            item.children = [
              {
                name: "[]",
                type: this.getTypeByValue(obj[i][0]),
                leaf: true,
                example: obj[i][0]
              }
            ];
          }
          item.leaf = false;
          item.expanded = true;
        } else {
          item.leaf = true;
          item.type = this.getTypeByValue(obj[i]);
          item.example = obj[i];
        }
        out.push(item);
      }
    return out;
  },
  getTypeByValue(value) {
    if (/^[a-f0-9\-]{36}$/.test(value)) return "UUID";
    if (/^[0-9]{2}.[0-9]{2}.[0-9]{4}$/.test(value)) return "DATE";
    if (/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(value)) return "DATE";
    if (Ext.isNumber(value)) return "NUMBER";
    if (Ext.isBoolean(value)) return "BOOLEAN";
    return "STRING";
  }
});
