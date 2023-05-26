/**
 * @class Core.data.ComboStore
 * @extend Core.data.Store
 * @private
 * @author Max Tushev <maximtushev@gmail.ru>
 * This is a superclass of {@link Core.data.Store}  
 */
Ext.define("Core.data.ComboStore", {
  extend: "Core.data.Store",

  alias: "store.combostore",

  pageSize: 1000,

  fields: [{ name: "_id" }, { name: "name" }],
  sorters: [],
  constructor: function(options) {
    this.callParent(arguments);
    if (options.sorters)
      for (const item of options.sorters) {
        this.sorters.addSort(item.property, item.direction);
      }
  }
});