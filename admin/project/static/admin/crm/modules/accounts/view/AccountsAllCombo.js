Ext.define("Crm.modules.accounts.view.AccountsAllCombo", {
  extend: "Core.form.AutocompliteCombo",
  tpl: `<tpl for=".">
         <div class="x-boundlist-item" >
           <b>{acc_no}</b> ({balance:number('0.00')} {currency})<br>
           {acc_name};      
        </div>
      </tpl>`,
  fieldSet: ["id", "acc_no", "acc_name", "currency", "balance"],
  minChars: 2,
  displayField: "acc_no",
  valueField: "acc_no",
  queryParam: "query",
  queryMode: "local",
  remoteFilter: true,
  name: "person",
  dataModel: "Crm.modules.accounts.model.AccountsModel"
});
