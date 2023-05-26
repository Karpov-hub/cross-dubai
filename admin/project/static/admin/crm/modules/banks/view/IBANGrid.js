Ext.define("Crm.modules.banks.view.IBANGrid", {
  extend: "Core.grid.GridContainer",

  requires: ["Core.grid.ComboColumn"],

  //iconCls: "x-fa fa-university",

  detailsInDialogWindow: true,

  buildColumns: function() {
    return [
      {
        text:D.t("Account holder name"),
        flex:1,
        sortable:true,
        dataIndex:'acc_holder_name',
        renderer:(v,m,r)=>{
          return r.data.first_name && r.data.last_name ?
            `${r.data.first_name} ${r.data.last_name}` :
            r.data.name ? r.data.name : `—`
        }
      },
      {
        hidden:true,
        dataIndex:'owner'
      },
      {
        hidden:true,
        dataIndex:'bank_id'
      },
      {
        text:D.t("Bank name"),
        flex:1,
        sortable:true,
        dataIndex:'bank_name'
      },
      {
        text:D.t("IBAN/Account №"),
        flex:1,
        sortable:true,
        dataIndex:'iban'
      },
      {
        text:D.t("SWIFT code"),
        flex:1,
        sortable:true,
        dataIndex:'swift'
      },
      {
        text:D.t("Bank address"),
        flex:1,
        sortable:true,
        dataIndex:'address1'
      },
      {
        text:D.t("Bank country"),
        flex:1,
        sortable:true,
        dataIndex:'country_name'
      }
    ];
  },
  // buildPlugins() {
  //   let plugins = this.callParent();
  //   plugins.push({
  //     ptype: "rowwidget",
  //     onWidgetAttach: function(plugin, view, record) {
  //       view.down("panel").setData(record.data);
  //     },
  //     widget: {
  //       xtype: "container",
  //       layout: {
  //         type: "vbox",
  //         pack: "start",
  //         align: "stretch"
  //       },
  //       items: [
  //         {
  //           xtype: "panel",
  //           cls: "transfer-details",
  //           tpl: `<tpl for="file">
  //           <a href="${__CONFIG__.downloadFileLink}/{code}">{filename}</a> ({[parseInt(values.file_size/1024)]}K) <br/>
  //         </tpl>`
  //         }
  //       ]
  //     }
  //   });
  //   return plugins;
  // },
  // detailsTpl() {
  //   return new Ext.XTemplate("<p>{notes}</p>");
  // }
});
