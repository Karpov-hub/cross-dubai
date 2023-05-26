Ext.define("Crm.modules.files.view.FilesGridController", {
  extend: "Core.grid.GridController",

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
    this.initButtonsByPermissions();
  },

  async downloadFiles() {
    const meta_files = this.view.store.data.items.map((el) => el.data.code);
    if(meta_files && !meta_files.length) {
      return D.a('Error', 'You have no files to download')
    }
    let filename = `contract_documents_${this.view.scope.currentData.id}`;

    this.model.getArchiveFiles(
      {
        meta_files,
        filename
      },
      (callback) => {
        let link = document.createElement("a");
        link.setAttribute("href", __CONFIG__.downloadFileLink + "/" + "file/" + filename);
        link.click();
      }
    );
  },

  downloadFile: function(store) {
    let link = document.createElement("a");
    link.setAttribute("href", __CONFIG__.downloadFileLink + "/" + store.code);
    link.click();
  },

  gotoRecordHash: function(data) {
    if (!!this.view.observeObject) {
      window.__CB_REC__ = this.view.observeObject;
    }
    if (data && data[this.view.model.idField]) {
      Ext.create(this.generateDetailsCls(), {
        noHash: true,
        scope: this.view,
        recordId: data[this.view.model.idField]
      });
    }
  }
});
