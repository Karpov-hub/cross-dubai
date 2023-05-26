Ext.define("Crm.modules.dailyBalances.view.dailyBalancesFormController", {
  extend: "Core.form.FormController",

  _getSkHtml(data) {
    let result = "<table>";
    result += "<tr>";
    for (let j = 0; j < data.sk_balances.result.length; j++) {
      result += "<tr>";
      result += `<td style='font-weight: bold;'> ${data.sk_balances.result[j].abbr}: </td>`;
      result += "<td>" + data.sk_balances.result[j].balance + "</td>";
      result += "</tr>";
    }
    result += "</tr>";
    result += "</table>";

    return result;
  },

  _getNilHtml(data) {
    let currencies = ["USD", "UST", "USC", "ETH", "BTC", "EUR", "TRX", "BNB"];
    let balances = Object.keys(data.nil_balances.result).map((key) => {
      return {
        abbr: key,
        balance: data.nil_balances.result[key]
      };
    });

    let result = "<table>";
    result += "<tr>";
    for (let j = 0; j < balances.length; j++) {
      if (currencies.includes(balances[j].abbr)) {
        result += "<tr>";
        result += `<td style='font-weight: bold;'> ${balances[j].abbr}: </td>`;
        result += "<td>" + balances[j].balance + "</td>";
        result += "</tr>";
      }
    }
    result += "</tr>";
    result += "</table>";

    return result;
  },

  async setValues(data) {
    let skPanel = this.view.down("[action=sk_panel]");
    let nilPanel = this.view.down("[action=nil_panel]");

    let skHtml = await this._getSkHtml(data);
    let nilHtml = await this._getNilHtml(data);

    skPanel
      .getEl()
      .down("iframe", true).contentWindow.document.body.innerHTML = skHtml;
    nilPanel
      .getEl()
      .down("iframe", true).contentWindow.document.body.innerHTML = nilHtml;

    let doh_balances = "";
    let rtp_balances = "";

    if (data.doh_totals)
      Object.keys(data.doh_totals).forEach(
        (key) => (doh_balances += `${key}: ${data.doh_totals[key]} `)
      );
    if (data.rtp_totals)
      Object.keys(data.rtp_totals).forEach(
        (key) => (rtp_balances += `${key}: ${data.rtp_totals[key]} `)
      );

    if (doh_balances)
      this.view
        .down("[action=deposits_panel]")
        .setTitle("Deposits on hold - " + doh_balances);
    if (rtp_balances)
      this.view
        .down("[action=payout_panel]")
        .setTitle("Ready to payout - " + rtp_balances);

    this.view
      .down("[action=deposits_panel]")
      .add(
        await this.buildExpandedGridDepositOnHold(data.deposits_on_hold.result)
      );
    this.view
      .down("[action=payout_panel]")
      .add(
        await this.buildExpandedGridReadyToPayout(data.ready_to_payout.result)
      );
    this.callParent(arguments);
  },
  async buildExpandedGridReadyToPayout(data) {
    let builded_data = [];
    for (let item of data) {
      let found_item = builded_data.find((el) => {
        return el.id_merchant == item.id_merchant;
      });
      if (!found_item)
        builded_data.push({
          id_merchant: item.id_merchant,
          merchant_name: item.merchant_name,
          balances: [{ currency: item.currency, balance: item.balance }]
        });
      else
        found_item.balances.push({
          currency: item.currency,
          balance: item.balance
        });
    }
    return {
      xtype: "grid",
      store: { data: builded_data },
      columns: [
        {
          dataIndex: "id_merchant",
          hidden: true
        },
        {
          flex: 1,
          text: "Merchant name",
          dataIndex: "merchant_name"
        }
      ],
      plugins: {
        ptype: "rowwidget",
        onWidgetAttach: function(plugin, view, record) {
          view
            .down("grid")
            .getStore()
            .loadData(record.data.balances);
        },
        widget: {
          xtype: "container",
          layout: "fit",
          items: [
            {
              xtype: "grid",
              store: { data: [] },
              columns: [
                {
                  flex: 1,
                  dataIndex: "currency",
                  text: "Currency"
                },
                {
                  flex: 1,
                  text: "Balance",
                  dataIndex: "balance",
                  xtype: "numbercolumn",
                  format: "0.00"
                }
              ]
            }
          ]
        }
      }
    };
  },

  async buildExpandedGridDepositOnHold(data) {
    return {
      xtype: "grid",
      store: { data },
      columns: [
        {
          dataIndex: "merchant_id",
          hidden: true
        },
        {
          flex: 1,
          text: "Merchant name",
          dataIndex: "merchant_name"
        }
      ],
      plugins: {
        ptype: "rowwidget",
        onWidgetAttach: function(plugin, view, record) {
          view
            .down("grid")
            .getStore()
            .loadData(record.data.deposits);
        },
        widget: {
          xtype: "container",
          layout: "fit",
          items: [
            {
              xtype: "grid",
              store: { data: [] },
              columns: [
                {
                  flex: 1,
                  dataIndex: "currency",
                  text: "Currency"
                },
                {
                  flex: 1,
                  text: "Amount",
                  dataIndex: "amount",
                  xtype: "numbercolumn",
                  format: "0.00"
                }
              ]
            }
          ]
        }
      }
    };
  }
});
