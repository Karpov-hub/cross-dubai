Ext.define("Crm.modules.telegram.view.TelegramChannelComponent", {
  extend: "Ext.form.FieldContainer",

  mixins: {
    field: "Ext.form.field.Field"
  },

  requires: ["Ext.window.Toast"],

  layout: Ext.platformTags.phone ? "vbox" : "hbox",

  initComponent: async function() {
    this.fields = [
      {
        xtype: "label",
        text: "Telegram channel:",
        style: "color: #666;",
        margin: "4 0 0 0",
        name: "tg_channel_label",
        hidden: true
      },
      {
        xtype: "button",
        action: "joinTelegramChannel",
        width: 100,
        text: this.channel_name,
        hidden: true,
        margin: "0 3 0 3",
        handler: () => {
          this.joinChannel();
        }
      },
      {
        xtype: "button",
        action: "createTelegramChannel",
        width: 100,
        text: D.t("Create"),
        hidden: true,
        margin: "0 0 0 3",
        handler: () => {
          this.telegramChannelCreationPopUp();
        }
      },
      {
        xtype: "button",
        action: "copyJoinLink",
        tooltip: D.t("Copy join link"),
        iconCls: "x-fa fa-copy",
        width: 50,
        hidden: true,
        margin: "0 3 0 0",
        handler: () => {
          this.copyJoinLink();
        }
      },
      {
        xtype: "button",
        action: "editChannelName",
        width: 50,
        tooltip: D.t("Edit channel name"),
        iconCls: "x-fa fa-edit",
        hidden: true,
        margin: "0 3 0 0",
        handler: () => {
          this.editChannelName();
        }
      },
      {
        xtype: "button",
        action: "deleteTelegramChannel",
        tooltip: D.t("Delete telegram channel"),
        iconCls: "x-fa fa-trash-alt",
        width: 50,
        hidden: true,
        handler: () => {
          this.deleteChannel();
        }
      }
    ];

    if (Ext.platformTags.phone)
      this.items = [
        this.fields[0],
        {
          xtype: "fieldcontainer",
          layout: "hbox",
          items: this.fields.splice(1, this.fields.length - 1)
        }
      ];
    else this.items = this.fields;

    this.model = Ext.create("Crm.modules.telegram.model.TelegramAppModel");

    this.callParent(arguments);

    await this.setHiddenComponents();
  },

  async setHiddenComponents() {
    if (!this.user_id || !this.ref_id) {
      return this.setVisible(false);
    }
    const appExist = await this.model.checkAppExist({
      user_id: this.user_id
    });

    if (!appExist) {
      return this.setVisible(false);
    }
    this.down("[name=tg_channel_label]").setHidden(false);
    const channelExist = await this.model.checkTelegramChannelExist({
      ref_id: this.ref_id
    });

    const createBtn = this.down("[action=createTelegramChannel]");
    const joinBtn = this.down("[action=joinTelegramChannel]");
    const deleteBtn = this.down("[action=deleteTelegramChannel]");
    const copyBtn = this.down("[action=copyJoinLink]");
    const editChannelNameBtn = this.down("[action=editChannelName]");

    if (channelExist) {
      createBtn.setHidden(true);
      joinBtn.setHidden(false);
      deleteBtn.setHidden(false);
      copyBtn.setHidden(false);
      editChannelNameBtn.setHidden(false);
      const channelInfo = await this.model.getChannelInfo({
        ref_id: this.ref_id
      });
      joinBtn.setText(channelInfo.title);
      joinBtn.setTooltip(`Join -> ${channelInfo.title}`);
    } else {
      createBtn.setHidden(false);
      joinBtn.setHidden(true);
      deleteBtn.setHidden(true);
      copyBtn.setHidden(true);
      editChannelNameBtn.setHidden(true);
    }

    const profile = await this.model.callServerMethod("getAdminProfile");

    if (!profile.other_configs) {
      createBtn.setDisabled(true);
      editChannelNameBtn.setDisabled(true);
      deleteBtn.setDisabled(true);
    } else {
      createBtn.setDisabled(!profile.other_configs.tg_create);
      editChannelNameBtn.setDisabled(!profile.other_configs.tg_edit);
      deleteBtn.setDisabled(!profile.other_configs.tg_delete);
    }
  },
  async editChannelName() {
    let me = this;
    const channelInfo = await this.model.getChannelInfo({
      ref_id: this.ref_id
    });
    this.channel_editing_popup = Ext.create("Ext.window.Window", {
      title: D.t("Edit channel"),
      layout: "anchor",
      modal: true,
      width: 250,
      height: 120,
      items: [
        {
          margin: 5,
          xtype: "textfield",
          anchor: "100%",
          name: "title",
          emptyText: D.t("Enter channel name"),
          value: channelInfo.title,
          allowBlank: false
        }
      ],
      buttons: [
        "->",
        {
          iconCls: "x-fa fa-check",
          text: D.t("Save"),
          action: "save",
          handler: () => {
            let title_field = me.channel_editing_popup.down("[name=title]");
            if (title_field.validate())
              me.editChannel().then(() => {
                me.down("[action=joinTelegramChannel]").setTooltip(
                  `Join -> ${title_field.getValue()}`
                );
                me.channel_editing_popup.close();
              });
          }
        },
        {
          iconCls: "x-fa fa-ban",
          text: D.t("Close"),
          action: "close",
          handler: () => {
            me.channel_editing_popup.close();
          }
        }
      ]
    }).show();
    return true;
  },
  telegramChannelCreationPopUp() {
    let me = this;
    this.channel_creation_popup = Ext.create("Ext.window.Window", {
      title: D.t("Create channel"),
      layout: "anchor",
      modal: true,
      width: 250,
      height: 120,
      items: [
        {
          margin: 5,
          xtype: "textfield",
          anchor: "100%",
          name: "title",
          emptyText: D.t("Enter channel name"),
          value: me.title || "",
          allowBlank: false
        }
      ],
      buttons: [
        "->",
        {
          iconCls: "x-fa fa-check",
          text: D.t("Create"),
          action: "create",
          handler: () => {
            let title_field = me.channel_creation_popup.down("[name=title]");
            if (title_field.validate())
              me.createChannel().then(() => me.channel_creation_popup.close());
          }
        },
        {
          iconCls: "x-fa fa-ban",
          text: D.t("Close"),
          action: "close",
          handler: () => {
            me.channel_creation_popup.close();
          }
        }
      ]
    }).show();
    return true;
  },

  async editChannel() {
    this.channel_editing_popup.down("[action=save]").setDisabled(true);
    const channelInfo = await this.model.getChannelInfo({
      ref_id: this.ref_id
    });
    const sendData = {
      id: channelInfo.id,
      title: this.channel_editing_popup.down("[name=title]").getValue()
    };

    const result = await this.model.callApi(
      "telegram-service",
      "editChannelName",
      sendData,
      null,
      this.user_id
    );

    if (result.error) {
      this.channel_editing_popup.down("[action=save]").setDisabled(false);
      return D.a(D.t("Error"), JSON.stringify(result.error));
    }

    await this.setHiddenComponents();
    return { success: true };
  },

  async createChannel() {
    this.channel_creation_popup.down("[action=create]").setDisabled(true);
    const sendData = {
      ref_id: this.ref_id,
      title: this.channel_creation_popup.down("[name=title]").getValue()
    };

    const result = await this.model.callApi(
      "telegram-service",
      "createChannel",
      sendData,
      null,
      this.user_id
    );

    if (result.error) {
      this.channel_creation_popup.down("[action=create]").setDisabled(false);
      return D.a(D.t("Error"), JSON.stringify(result.error));
    }

    await this.setHiddenComponents();
    return { success: true };
  },

  async copyJoinLink() {
    const channelInfo = await this.model.getChannelInfo({
      ref_id: this.ref_id
    });

    if (!channelInfo.join_link) {
      return Ext.toast(D.t("Nothing to copy"));
    }
    navigator.clipboard.writeText(channelInfo.join_link);
    return Ext.toast(D.t("Copied to clipboard"));
  },

  async joinChannel() {
    const channelInfo = await this.model.getChannelInfo({
      ref_id: this.ref_id
    });

    let link = document.createElement("a");

    link.setAttribute("href", channelInfo.join_link);
    link.setAttribute("target", "_blank");
    link.click();
  },

  async deleteChannel() {
    this.down("[action=deleteTelegramChannel]").setDisabled(true);

    const channelInfo = await this.model.getChannelInfo({
      ref_id: this.ref_id
    });

    const result = await this.model.callApi(
      "telegram-service",
      "deleteChannel",
      {
        id: channelInfo.id
      }
    );

    this.down("[action=deleteTelegramChannel]").setDisabled(false);

    if (result.error) {
      return D.a(D.t("Error"), JSON.stringify(result.error));
    }

    await this.setHiddenComponents();
  }
});
