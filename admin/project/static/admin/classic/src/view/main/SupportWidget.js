Ext.define("Admin.view.main.SupportWidget", {
  extend: "Ext.panel.Panel",
  xtype: "support_widget",

  viewModel: Ext.create("Admin.view.main.SupportWidgetModel"),

  requires: [
    "Admin.view.main.SupportWidgetController",
    "Admin.view.main.SupportMessagesGridController"
  ],
  controller: "supportwidgetcontroller",

  layout: "anchor",
  margin: "0 5 0 5",

  initComponent() {
    this.items = this.buildItems();
    this.callParent(arguments);
  },

  afterRender: function() {
    this.callParent(arguments);
    if (Ext.platformTags.phone) return;
    this.setPosition([
      Math.floor(Ext.Element.getViewportWidth() * 0.95),
      Math.floor(Ext.Element.getViewportHeight() * 0.95)
    ]);
  },

  buildItems() {
    const model = Ext.create("Crm.modules.support.model.SupportModel");
    return [
      Ext.platformTags.phone
        ? this.mobileButton(model)
        : this.desktopButton(model),
      this.buildDialogsWindow(model)
    ];
  },

  buildDialogsWindow(model) {
    const filelist_panel = Ext.create("Crm.modules.docs.view.FilesList", {
      name: "files",
      buttonText: null,
      buttonIconCls: "x-fa fa-paperclip",
      margin: 5,
      width: 280,
      hidden: true
    });
    changeActiveItem = (dialog_win, active_item) => {
      const layout = dialog_win.getLayout();
      layout.setActiveItem(active_item);
      return dialog_win.items.indexOf(layout.getActiveItem());
    };
    let active_item = 0;
    let messagesIddle = null;
    let shift_pressed = false;
    const dialog_win = Ext.create("Ext.panel.Panel", {
      title: D.t("Dialogs"),
      layout: "card",
      name: "dialogs_window",
      controller: "supportmessagesgridcontroller",
      hidden: true,
      floating: true,
      modal: true,
      frame: true,
      resizable: !Ext.platformTags.phone,
      closable: false,
      draggable: !Ext.platformTags.phone,
      closable: true,
      closeAction: "hide",
      scrollable: true,
      width: Ext.platformTags.phone ? Ext.Element.getViewportWidth() : 400,
      height: Ext.platformTags.phone ? Ext.Element.getViewportHeight() : 600,
      items: [
        {
          xtype: "grid",
          layout: "fit",
          width: Ext.platformTags.phone ? Ext.Element.getViewportWidth() : 400,
          name: "dialogs_list",
          store: {},
          columns: [
            {
              dataIndex: "dialogs_data",
              flex: 1,
              renderer(v, m, r) {
                m.tdStyle = r.data.is_new ? "background:#ADD8E6;" : "";
                let col = Ext.platformTags.phone
                  ? Ext.Element.getViewportWidth()
                  : 400 / 12;
                return `
                <div>
                  <p><b>${r.data.client_name}</b></p>
                  <div>
                    <div>${r.data.last_message || ""}</div>
                    <div style = "width: ${col *
                      4}; float:right;">${Ext.Date.format(
                  new Date(r.data.ctime),
                  "d.m.Y h:i:s"
                )}
                    </div>
                  <div>
                </div>
                `;
              }
            }
          ],
          listeners: {
            itemdblclick: async (scope, rec) => {
              const mask = new Ext.LoadMask({
                msg: D.t("Loading..."),
                target: scope
              });
              mask.show();
              let messages_grid = dialog_win.down("[name=client_messages]");
              const loadGridData = async () => {
                const client_messages = await dialog_win.controller.getClientMessages(
                  model,
                  rec.data
                );
                messages_grid.setStore(client_messages);
                messages_grid.scrollBy(0, messages_grid.scrollable.position.y);
              };
              messages_grid.scrollBy(0, 9999999, true);
              loadGridData();
              messagesIddle = setInterval(async () => {
                loadGridData();
              }, 10000);
              dialog_win.down("[name=client_id]").setValue(rec.data.client_id);
              dialog_win
                .down("[name=dialog_panel]")
                .setTitle(rec.data.client_name);
              active_item++;
              active_item = changeActiveItem(dialog_win, active_item);
              mask.hide();
            }
          }
        },
        {
          xtype: "panel",
          layout: "anchor",
          header: {
            xtype: "header",
            titlePosition: 0,
            items: [
              {
                xtype: "button",
                iconCls: "x-fa fa-arrow-left",
                tooltip: D.t("Return to dialogs"),
                handler: () => {
                  active_item--;
                  active_item = changeActiveItem(dialog_win, active_item);
                  clearInterval(messagesIddle);
                }
              }
            ]
          },
          name: "dialog_panel",
          items: [
            {
              xtype: "textfield",
              hidden: true,
              name: "client_id"
            },
            {
              xtype: "grid",
              width: Ext.platformTags.phone
                ? Ext.Element.getViewportWidth()
                : 400,
              height: Ext.platformTags.phone
                ? (Ext.Element.getViewportHeight() - 190)
                : 400,
              layout: "fit",
              name: "client_messages",
              store: {},
              columns: [
                {
                  dataIndex: "message",
                  flex: 1,
                  renderer(v, m, r) {
                    const client_id = dialog_win
                      .down("[name=client_id]")
                      .getValue();
                    return `
                    <div>
                      <div style="width:70%; padding:8px; border-radius:15px;${
                        r.data.sender == client_id
                          ? "float:left;background:#bfeaff;"
                          : "float:right;background:#ebebeb;"
                      }">
                        <p><b>${r.data.sender_name}</b></p>
                        <div>
                          <div>${r.data.text || ""}</div>
                          <div style = "float:right;">${Ext.Date.format(
                            new Date(r.data.ctime),
                            "d.m.Y H:i:s"
                          )}
                          </div>
                        <div>
                      </div>
                    </dib>
                    `;
                  }
                }
              ]
            },
            {
              xtype: "fieldcontainer",
              layout: "hbox",
              items: [
                {
                  xtype: "textarea",
                  name: "message",
                  enableKeyEvents: true,
                  emptyText: D.t("Type something here..."),
                  flex: 1,
                  listeners: {
                    keydown: (el, e) => {
                      if (e.event.key == "Shift") shift_pressed = true;
                    },
                    keyup: (el, e) => {
                      if (e.event.key == "Shift") shift_pressed = false;
                      if (!shift_pressed && e.event.key == "Enter") {
                        dialog_win.controller.sendMessage(
                          dialog_win,
                          model,
                          dialog_win.down("[name=client_id]").getValue(),
                          dialog_win.down("[name=message]").getValue()
                        );
                        dialog_win.down("[name=message]").setValue("");
                      }
                    }
                  }
                },
                {
                  xtype: "button",
                  tooltip: D.t("Send"),
                  iconCls: "x-fa fa-envelope-open",
                  width: 50,
                  handler: () => {
                    dialog_win.controller.sendMessage(
                      dialog_win,
                      model,
                      dialog_win.down("[name=client_id]").getValue(),
                      dialog_win.down("[name=message]").getValue()
                    );
                    dialog_win.down("[name=message]").setValue("");
                  }
                }
              ]
            }
          ]
        }
      ]
    });
    return dialog_win;
  },

  mobileButton(model) {
    return {
      xtype: "button",
      action: "unread_messages",
      iconCls: "x-fa fa-life-ring",
      padding: 2,
      margin: 0,
      handler: async (el) => {
        let res = await this.controller.getMessages(model);
        let dialogsWindow = this.buildDialogsWindow(model);
        dialogsWindow.setVisible(true);
        dialogsWindow.down("[name=dialogs_list]").setStore({
          fields: [
            "client_id",
            "client_name",
            "last_message",
            "is_new",
            "ctime"
          ],
          data: res.dialogs
        });
      }
    };
  },

  desktopButton(model) {
    return {
      xtype: "button",
      action: "unread_messages",
      iconCls: "x-fa fa-life-ring",
      scale: "large",
      handler: async (el) => {
        await this.controller.getMessages(model);
        el.ownerCt.down("[name=dialogs_window]").showBy(el, "t", [-350, -570]);
      }
    };
  }
});
