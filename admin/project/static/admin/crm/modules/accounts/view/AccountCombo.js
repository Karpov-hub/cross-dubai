Ext.define("Crm.modules.accounts.view.AccountCombo", {
  extend: "Core.form.AutocompliteCombo",
  tpl: `<tpl for=".">
       <div class="x-boundlist-item" >
         <b>{acc_no}</b> ({balance:number('0.00')} {currency})<br>
         Realm: <b>{realmname}</b>; Customer: <b>
         <tpl if="legalname">{legalname}</tpl>
         <tpl if="!legalname">{first_name} {last_name}</tpl> </b>      
      </div>
    </tpl>`,
  fieldSet: [
    "id",
    "acc_no",
    "acc_name",
    "currency",
    "owner",
    "balance",
    "legalname",
    "first_name",
    "last_name",
    "zip",
    "address",
    "country",
    "realm",
    "realmname"
  ],
  minChars: 2,
  displayField: "acc_no",
  valueField: "acc_no",
  queryParam: "query",
  queryMode: "local",
  remoteFilter: true,
  name: "person",
  dataModel: "Crm.modules.accounts.model.AccountsUserModel"
});
