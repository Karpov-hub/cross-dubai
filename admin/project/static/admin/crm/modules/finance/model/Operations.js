Ext.define("Crm.modules.finance.model.Operations", {
  /* scope:server */
  getAccountsDir(accounts) {
    const out = {};
    accounts.forEach((acc) => {
      if (acc.dir == "income" || acc.dir == "profit") {
        if (!out.dst) out.dst = [];
        out.dst.push(acc.account);
      }
      if (acc.dir == "spending" || acc.dir == "profit") {
        if (!out.src) out.src = [];
        out.src.push(acc.account);
      }
    });
    return out;
  },

  /* scope:server */
  buildTxWhere(settings) {
    let where = {};
    let accWhere = [];
    let whereAnd = [];
    let statusWhere = [];
    const accounts = this.getAccountsDir(settings.accounts);
    if (accounts.src) accWhere.push({ acc_src: { $in: accounts.src } });
    if (accounts.dst) accWhere.push({ acc_dst: { $in: accounts.dst } });

    if (settings.status_pending)
      statusWhere.push({
        held: true,
        canceled: false
      });
    if (settings.status_canceled)
      statusWhere.push({
        held: true,
        canceled: true
      });
    if (settings.status_approved)
      statusWhere.push({
        held: false,
        canceled: false
      });
    if (settings.status_refund)
      statusWhere.push({
        held: false,
        canceled: true
      });

    if (accWhere.length) {
      whereAnd.push({ $or: accWhere });
    }
    if (statusWhere.length) {
      whereAnd.push({ $or: statusWhere });
    }
    let dur = 30 * 24 * 3600000;
    if (settings.duration) {
      dur = parseInt(settings.duration);
      if (!isNaN(dur)) {
        whereAnd.push({
          ctime: {
            $gte: Ext.Date.format(
              new Date(Date.now() - dur * 3600000),
              "Y-m-d H:i:s"
            )
          }
        });
      }
    }
    if (whereAnd.length) {
      where.$and = whereAnd;
    }
    return { where, accounts };
  }
});
