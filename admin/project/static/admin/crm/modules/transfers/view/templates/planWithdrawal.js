Ext.define("Crm.modules.transfers.view.templates.planWithdrawal", {
  build() {
    return `
    <ul>
        <li>Transfer status: <span>{status}</span></li>
        <li>Date: <span>{ctime:date("d.m.Y H:i")}</span></li>
        <li>Withdrawal amount: <span>{amount} {currency}</span></li>
        <li>Fees and deductions: <span>{fees} {feesCurrency}</span></li>
        <li>Amount less deductions: <span>{finAmount} {finCurrency}</span></li>
        <li>Exchange rate: <span> {exchangeRate}</span></li>
        <tpl if="sentToClient"><li>Sent to client: <span>{sentToClient} {sentCurrency}</span> </li></tpl> 
        <tpl if="sentAmount"><li>Sent from NIL: <span>{sentAmount} {sentCurrency}</span></li></tpl>
        <tpl if="hash"><li>Transaction hash: <span>{hash}</span></li></tpl>
    </ul>`;
  }
});
