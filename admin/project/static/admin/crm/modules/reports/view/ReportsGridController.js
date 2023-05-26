Ext.define("Crm.modules.reports.view.ReportsGridController", {
  extend: "Crm.modules.files.view.FilesGridController",

  gotoRecordHash: function() {},

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
      },
      "[action=create-report]": {
        click: function(el) {
          me.createReport();
        }
      }
    });
    this.view.on("downloadFile", function(grid, indx) {
      me.downloadFile(grid.getStore().getAt(indx).data);
    });
    // this.view.on("delete", function(grid, indx) {
    //   me.deleteRecord(grid.getStore(), indx);
    // });
    this.view.on("reloadGrid", function() {
      me.reloadData();
    });
    this.initButtonsByPermissions();
  },

  async downloadFiles() {
    let meta_files = this.view
      .down("grid")
      .getSelectionModel()
      .getSelected()
      .items.map((i) => i.data.code);

    if (!meta_files.length)
      meta_files = this.view.store.data.items.map((el) => el.data.code);

    let filename = "Data record";

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

  async createReport() {
    let report = await this.model.callApi("report-service", "generateReport", {
      manually: true,
      report_name: "DataRecordReport",
      format: "xlsx"
    });
    if (report && !report.success) {
      return D.a(
        "Error",
        report.error ||
          "Something went wrong, please try again or contact admin"
      );
    }
    let link = document.createElement("a");
    link.setAttribute("href", `${__CONFIG__.downloadFileLink}/${report.code}`);
    link.click();
  }
});
