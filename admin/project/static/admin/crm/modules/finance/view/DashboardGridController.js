Ext.define("Crm.modules.finance.view.DashboardGridController", {
  extend: "Core.grid.GridController",

  requires: ["Ext.ux.layout.ResponsiveColumn"],

  setControls() {
    this.control({
      "[action=addmetric]": {
        click: () => {
          this.addMetric();
        }
      },
      "[action=adddashboard]": {
        click: () => {
          this.addDashboard();
        }
      },
      "[action=removedashboard]": {
        click: () => {
          this.removeDashboard();
        }
      }
    });
    this.view.on("changemetric", el => {
      this.editMetric(el);
    });
    this.view.tabPanel.on("tabchange", (tabPanel, newCard, oldCard) => {
      this.onTabActivate(newCard, oldCard);
    });
    this.readDashboards();
    this.runRefreshAction();

    this.callParent();
  },
  runRefreshAction() {
    setInterval(() => {
      if (!this.currentTab) return;
      this.currentTab.items.items.forEach(item => {
        item.fireEvent("refresh", item);
      });
    }, 60000); // update data in metrics in current tab
  },
  addMetric() {
    if (this.currentTab) this.editMetric();
  },

  addDashboard() {
    D.p("New dashboard", "Enter dashboard title", [], async title => {
      if (title) {
        const res = await this.model.addDashboard({ title });
        if (res) {
          const tab = this.addTab(res);
          this.view.tabPanel.setActiveItem(tab);
        }
      }
    });
  },

  addTab(sets) {
    return this.view.tabPanel.add({
      _id: sets.id,
      title: sets.name,
      layout: "responsivecolumn",
      settings: sets.settings || [],
      isRendered: false
    });
  },

  async readDashboards() {
    const { list } = await this.model.getDashboards();
    let first;
    list.forEach(item => {
      const t = this.addTab(item);
      if (!first) first = t;
    });
    if (first) {
      this.view.tabPanel.setActiveItem(first);
    }
  },

  removeDashboard() {
    if (this.currentTab)
      D.c(
        "Deleting a dashboard",
        `The dashboard "%s" will removed. Are you sure?`,
        [this.currentTab.title],
        async () => {
          const res = await this.model.removeDashboard(this.currentTab._id);
          if (res && res.success) {
            this.view.tabPanel.remove(this.currentTab);
            this.currentTab = null;
          }
        }
      );
  },

  onTabActivate(newCard, oldCard) {
    this.currentTab = newCard;
    if (!this.currentTab.isRendered) {
      this.renderCurrentDashboard();
    }
  },

  calcSizeValue(val) {
    if (/^[0-9]{1,}$/.test(val)) return parseInt(val);
    return val;
  },

  async renderCurrentDashboard() {
    const { list } = await this.model.getMetrics(this.currentTab._id);
    if (list) {
      list.forEach(metric => {
        const cfg = {
          scope: this.view,
          height: this.calcSizeValue(metric.height),
          settings: metric
        };
        if (/big/.test(metric.width)) cfg.userCls = metric.width;
        else cfg.width = this.calcSizeValue(metric.width);
        this.currentTab.add(
          Ext.create("Crm.modules.finance.view.MetricWrapper", cfg)
        );
      });
      this.currentTab.isRendered = true;
    }
  },

  editMetric(el) {
    Ext.create("Crm.modules.finance.view.DashboardForm", {
      noHash: true,
      dashboard: this.currentTab,
      recordId: el ? el.settings.id : null,
      listeners: {
        save: () => {
          this.resetCurrentPanel();
        },
        remove: () => {
          this.resetCurrentPanel();
        }
      }
    });
  },

  resetCurrentPanel() {
    this.currentTab.removeAll();
    this.currentTab.isRendered = false;
    this.renderCurrentDashboard();
  },

  gotoRecordHash(data) {
    Ext.create("Crm.modules.transfers.view.TransfersForm", {
      noHash: true,
      recordId: data.transfer_id
    });
  }
});
