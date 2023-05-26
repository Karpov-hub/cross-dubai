Ext.define("Admin.src.main.TopAccountsController", {
  extend: "Ext.app.ViewController",
  alias: "controller.topaccountscontroller",

  init(view) {
    this.accountsModel = Ext.create("Crm.modules.accounts.model.AccountsModel");

    this.accs_count = 0;
    /*setInterval(() => {
      if (Glob.ws) this.buildAccounts(view);
    }, 2000);
    */
  },
  buildAccounts(view) {
    this.accountsModel.getTopAccs((res) => {
      this.getViewModel().set("accounts", res);
      this.getViewModel().bind("{accounts}", (accs) => {
        if (this.accs_count == 0 || this.accs_count < accs.length)
          this.buildAccountsForm(accs, view);
        accs.forEach((acc) => {
          view.fillAccount(acc.acc_no, acc.balance);
        });
      });
    });
  },
  buildAccountsForm(accs, view) {
    let i = 0;
    if (this.accs_count < accs.length && this.accs_count != 0)
      i = this.accs_count;
    for (i; i < accs.length; i++)
      view.addAccount({
        acc_no: accs[i].acc_no,
        balance: accs[i].balance,
        currency: accs[i].currency,
        owner: accs[i].owner
      });
    this.accs_count = accs.length;
    return;
  },

  addMoney(accObj) {
    this.accountsModel.getOwnerRealm(accObj, (res) => {
      const depositForm = Ext.create("Crm.modules.transfers.view.DepositForm");
      depositForm.show();
      depositForm.controller.setValues({
        realm: res.realm,
        acc: accObj.acc_no,
        currency: accObj.currency
      });
    });
  }
});
