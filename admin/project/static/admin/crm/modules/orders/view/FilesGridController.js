Ext.define("Crm.modules.orders.view.FilesGridController", {
  extend: "Crm.modules.files.view.FilesGridController",

  setControls: function() {
    var me = this;
    this.control({
      "[action=refresh]": {
        click: function(el) {
          me.reloadData();
        }
      },
      "[action=add]": {
        click: function(el) {
          me.addRecord();
        }
      },
      "[action=download-files]": {
        click: function(el) {
          me.downloadFiles();
        }
      }
    });
    this.view.on("downloadFile", function(grid, indx) {
      me.downloadFile(grid.getStore().getAt(indx).data);
    });
    this.view.on("delete", function(grid, indx) {
      me.deleteRecord(grid.getStore(), indx);
    });
    this.view.on("reloadGrid", function() {
      me.reloadData();
    });
    this.view.on("cancelInvoice", function(grid, indx) {
      me.buildWarning(
        "Are you sure you want to cancel this invoice? You could not reverse this action",
        (result) => {
          if (result === "ok")
            me.cancelInvoice(grid.getStore().getAt(indx).data);
        }
      );
    });
    this.initButtonsByPermissions();
  },

  buildWarning(message, cb) {
    Ext.Msg.show({
      title: "Warning",
      message,
      buttons: Ext.Msg.OKCANCEL,
      icon: Ext.Msg.WARNING,
      fn: cb
    });
  },

  async downloadFiles() {
    let meta_files = this.view
      .down("grid")
      .getSelectionModel()
      .getSelected()
      .items.map((i) => i.data.code);

    if (!meta_files.length)
      meta_files = this.view.store.data.items.map((el) => el.data.code);

    let filename = `order_documents_${this.view.scope.currentData.id}`;

    if (meta_files && !meta_files.length) {
      return D.a("Error", "You have no files to download");
    }

    this.model.getArchiveFiles(
      {
        meta_files,
        filename
      },
      (callback) => {
        let link = document.createElement("a");
        link.setAttribute(
          "href",
          __CONFIG__.downloadFileLink + "/" + "file/" + filename
        );
        link.click();
      }
    );

    this.view
      .down("grid")
      .getSelectionModel()
      .clearSelections();

    this.reloadData();
  },

  async cancelInvoice(data) {
    let reportData = {
      order_id: data.owner_id,
      report_name: "cancellationInvoice",
      file_id: data.id
    };

    let invoice = await this.model.callApi(
      "report-service",
      "generateReport",
      reportData
    );

    if (invoice && !invoice.success) {
      return D.a(
        "Error",
        invoice.error ||
          "Something went wrong, please try again or contact admin"
      );
    } else {
      let model = Ext.create("Crm.modules.orders.model.OrdersModel");
      await model.cancelInvoice({
        file_id: data.id
      });
      let link = document.createElement("a");
      link.setAttribute(
        "href",
        `${__CONFIG__.downloadFileLink}/${invoice.code}`
      );
      link.click();
    }

    this.reloadData();
  }
});
