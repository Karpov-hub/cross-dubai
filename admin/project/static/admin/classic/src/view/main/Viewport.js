Ext.define("Admin.view.main.Viewport", {
  extend: "Ext.container.Viewport",
  xtype: "mainviewport",

  requires: [
    "Ext.list.Tree",
    "Admin.view.main.TopAccounts",
    // "Admin.view.main.NFPanel",
    "Admin.view.main.MasterPanel",
    "Admin.view.main.AlertPanel",
    "Admin.view.main.NBPanel",
    "Admin.view.main.NRPanel",
    "Admin.view.main.SysNotificationsPanel",
    "Admin.view.main.CheckerListPanel",
    "Admin.view.main.SupportWidget"
  ],

  controller: "mainviewport",
  viewModel: {
    type: "mainviewport"
  },

  cls: "sencha-dash-viewport",
  itemId: "mainView",

  layout: {
    type: "vbox",
    align: "stretch"
  },

  listeners: {
    //render: 'onMainViewRender'
  },

  items: [
    {
      xtype: "toolbar",
      cls: "sencha-dash-dash-headerbar toolbar-btn-shadow",
      height: 64,
      itemId: "headerBar",
      items: [
        {
          xtype: "component",
          reference: "senchaLogo",
          width: Ext.platformTags.phone ? 64 : 250,
          cls: "sencha-logo",
          html: '<div class="main-logo">&nbsp;</div>'
        },
        {
          margin: "0 0 0 8",
          cls: "delete-focus-bg",
          iconCls: "x-fa fa-bars",
          id: "main-navigation-btn",
          handler: Ext.platformTags.phone
            ? "onToggleMicroNavSize"
            : "onToggleNavigationSize"
        },
        // {
        //   xtype: "tbspacer",
        //   flex: 1
        // },
        {
          xtype: "alertpanel"
        },
        {
          xtype: "topaccountspanel"
        },
        {
          xtype: "tbspacer",
          flex: 1
        },
        {
          xtype: "support_widget",
          reference: "supportWidgetMobile",
          hidden:!Ext.platformTags.phone
        },
        {
          xtype: "system_notifications_panel"
        },
        {
          xtype: "checker_list_panel"
        },
        // {
        //   cls: "delete-focus-bg",
        //   iconCls: "x-fa fa-envelope-o message-offline",
        //   href: "#Crm.modules.messages.view.MessagesGrid",
        //   hrefTarget: "_self",
        //   tooltip: D.t("Messages"),
        //   bind: {
        //     iconCls: "x-fa fa-envelope-o message-{newMsg}",
        //     text: "{msgCount}",
        //     tooltip: D.t("New messages: {msgCount}")
        //   }
        // },
        {
          cls: "delete-focus-bg",
          hidden: Ext.platformTags.phone ? true : false,
          bind: {
            iconCls: "x-fa fa-server status-{status}",
            tooltip: "{status}"
          }
        },
        {
          //xtype: 'tbtext',
          hidden: Ext.platformTags.phone ? true : false,
          bind: {
            text: "{user.name}"
          },
          href: "#Crm.modules.profile.view.Profile",
          hrefTarget: "_self",
          cls: "top-user-name"
        },
        {
          text: Ext.platformTags.phone ? "" : D.t("Logout"),
          view: "Admin.view.authentication.Login",
          iconCls: "x-fa fa-sign-out-alt",
          handler: () => {
            D.c("Logout", "Are you sure?", [], () => {
              location = "#authentication.login";
            });
            //href: '#authentication.login'
          }
        }
      ]
    },
    {
      xtype: "maincontainerwrap",
      id: "main-view-detail-wrap",
      reference: "mainContainerWrap",
      flex: 1,
      items: [
        {
          xtype: "treelist",
          reference: "navigationTreeList",
          itemId: "navigationTreeList",
          ui: "navigation",
          store: "NavigationTree",
          micro: Ext.platformTags.phone,
          width: Ext.platformTags.phone ? 64 : 250,
          expanderFirst: false,
          expanderOnly: false,
          listeners: {
            selectionchange: "onNavigationTreeSelectionChange"
          }
        },
        {
          xtype: "container",
          flex: 1,
          style: "oveflow-y: auto;",
          reference: "mainCardPanel",
          cls: "sencha-dash-right-main-container",
          itemId: "contentPanel",
          layout: {
            type: "card",
            anchor: "100%"
          }
        }
      ]
    },
    {
      xtype: "support_widget",
      reference: "supportWidgetDesktop",
      hidden: Ext.platformTags.phone,
      floating: true,
      renderTo: Ext.platformTags.phone ? null : Ext.getBody(),
      alwaysOnTop: true
    }
  ]
});
