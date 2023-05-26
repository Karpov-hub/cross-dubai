Ext.define("Crm.modules.accountHolders.view.UsersGrid", {
  extend: "Core.grid.GridContainer",

  title: D.t("All clients"),
  iconCls: "x-fa fa-users",

  filterable: true,
  filterbar: true,

  controllerCls: "Crm.modules.accountHolders.view.UsersGridController",

  requires: ["Ext.window.Toast"],

  fields: [
    "id",
    "first_name",
    "last_name",
    "email",
    "phone",
    "realm",
    "active",
    "activated",
    "kyc",
    "legalname",
    "type",
    "blocked"
  ],

  gridCfg: {
    viewConfig: {
      getRowClass: (record) => {
        if (!record.data.activated) return "disabled";
        else if (!record.data.kyc) return "pending";
      }
    }
  },

  buildColumns: function() {
    return Ext.platformTags.phone
      ? this.buildMobileColumns()
      : this.buildDesktopColumns();
  },

  buildMobileColumns() {
    return [
      {
        text: D.t("Client"),
        flex: 1,
        sortable: true,
        filter: this.buildGroupCombo(),
        dataIndex: "legalname"
      }
    ];
  },

  buildDesktopColumns() {
    return [
      {
        text: D.t("Type"),
        width: 100,
        sortable: true,
        filter: {
          xtype: "combo",
          valueField: "code",
          displayField: "name",
          store: {
            fields: ["code", "name"],
            data: [
              { code: 0, name: D.t("Project") },
              { code: 1, name: D.t("Company") }
            ]
          }
        },
        dataIndex: "type",
        renderer: (v) => {
          if (!v && v !== 0) return "N/A";
          return [D.t("Project"), D.t("Company")][v];
        }
      },
      {
        text: D.t("Client"),
        flex: 1,
        sortable: true,
        filter: this.buildGroupCombo(),
        dataIndex: "legalname"
      },
      {
        text: D.t("E-mail"),
        flex: 1,
        sortable: true,
        filter: true,
        dataIndex: "email"
      },
      {
        text: D.t("Phone"),
        flex: 1,
        sortable: true,
        filter: true,
        dataIndex: "phone"
      },
      {
        text: D.t("Realm"),
        flex: 1,
        sortable: true,
        filter: Ext.create("Crm.modules.realm.view.RealmCombo", {
          name: null,
          fieldLabel: null
        }),
        dataIndex: "realm",
        renderer: (v, m, r) => {
          return v ? v.name : "";
        }
      },
      {
        text: D.t("Activated"),
        width: 100,
        sortable: true,
        filter: {
          xtype: "combo",
          valueField: "key",
          displayField: "val",
          store: {
            fields: ["key", "val"],
            data: [
              { key: "true", val: D.t("YES") },
              { key: "false", val: D.t("NO") }
            ]
          }
        },
        dataIndex: "activated",
        renderer: (v, m, r) => {
          return v ? D.t("YES") : "NO";
        }
      },
      {
        text: D.t("Blocked"),
        width: 100,
        sortable: true,
        filter: {
          xtype: "combo",
          valueField: "key",
          displayField: "val",
          store: {
            fields: ["key", "val"],
            data: [
              { key: "true", val: D.t("Yes") },
              { key: "false", val: D.t("No") }
            ]
          }
        },
        dataIndex: "blocked",
        renderer: (v, m, r) => {
          return v ? D.t("YES") : "NO";
        }
      }
    ];
  },

  buildGroupCombo() {
    return {
      xtype: "combo",
      valueField: "legalname",
      displayField: "legalname",
      name: "merchant_combo",
      editable: !Ext.platformTags.phone,
      queryMode: "local",
      store: Ext.create("Core.data.ComboStore", {
        dataModel: Ext.create("Crm.modules.accountHolders.model.UsersModel"),
        fieldSet: "id,legalname",
        scope: this,
        sorters: [{ property: "legalname", direction: "asc" }]
      })
    };
  },
  buildTbar: function() {
    var items = [
      {
        text: this.buttonAddText,
        tooltip: this.buttonAddTooltip,
        iconCls: "x-fa fa-plus",
        scale: "medium",
        action: "add_client"
      }
    ];

    if (this.importButton) {
      items.push("-", {
        text: this.buttonImportText,
        iconCls: "x-fa fa-cloud-download",
        action: "import"
      });
    }
    if (this.exportButton) {
      items.push("-", {
        text: this.buttonExportText,
        iconCls: "x-fa fa-cloud-upload",
        action: "export"
      });
    }

    items.push("-", {
      tooltip: this.buttonReloadText,
      iconCls: "x-fa fa-sync",
      action: "refresh"
    });

    if (this.filterable) items.push("->", this.buildSearchField());
    return items;
  },

  buildButtonsColumns() {
    const buttons_column = this.callParent(arguments);
    buttons_column[0].width = 100;
    buttons_column[0].items.unshift({
      tooltip: D.t("Show managers"),
      iconCls: "x-fa fa-eye",
      action: "show_managers",
      isDisabled: () => {
        return this.current_user.other_configs.is_manager;
      },
      handler: (grid, idx) => {
        this.showManagers(grid.getStore().getAt(idx).data);
      }
    });
    return buttons_column;
  },

  async showManagers(data) {
    let me = this;
    let managers_data = await me.model.callServerMethod("getManagersByClient", {
      client_id: data.id
    });
    if (!managers_data || !managers_data.length)
      return Ext.toast("Nothing to display");
    const managers_panel = Ext.create("Ext.window.Window", {
      title: D.t("Managers"),
      height: Ext.platformTags.phone ? Ext.Element.getViewportHeight() : 400,
      width: Ext.platformTags.phone ? Ext.Element.getViewportWidth() : 600,
      layout: "fit",
      modal: true,
      resizable: false,
      closable: false,
      draggable: !Ext.platformTags.phone,
      items: [
        {
          name: "managers_grid",
          xtype: "grid",
          store: {
            fields: ["_id", "name", "login"],
            data: managers_data
          },
          columns: [
            {
              text: D.t("Manager"),
              dataIndex: "_id",
              flex: 1,
              renderer(v, m, r) {
                return r.data.name || r.data.login;
              }
            }
          ]
        }
      ],
      buttons: [
        {
          text: D.t("Close"),
          handler: () => {
            managers_panel.close();
          }
        }
      ]
    }).show();
  }
});
