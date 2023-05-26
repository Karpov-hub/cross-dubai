Ext.define("Crm.modules.accountsPlan.view.TagsFilterCombo", {
  extend: "Core.form.DependedCombo",
  alias: "widget.tagsfiltercombo",

  loadDataModel: function(store, options, pid) {
    var me = this,
      find = {};
    if (pid !== undefined && me.parentField) {
      find = {
        filters: [{ property: me.parentField, value: pid }]
      };
    }
    if (Ext.isString(store.dataModel)) {
      store.dataModel = Ext.create(store.dataModel);
    }

    store.dataModel.readAll(function(data) {
      var list = [];

      data.list.forEach(function(r) {
        var v = r[me.displayField];
        if (!v) return;
        var x = v.split(" ");
        // if (x.length > 1 && x[0].length < 3) x.splice(0, 1);
        if (x.length > 1 && x[0].length < 2) x.splice(0, 1);

        var o = { name: x.join(" ") };

        o[store.dataModel.idField] = r[store.dataModel.idField];

        for (var i in r) {
          if (!o[i]) o[i] = r[i];
        }
        o[me.valueField] = r[me.valueField];

        list.push(o);
      });

      if (options.scope && !options.scope.customSort)
        list.sort(function(a, b) {
          return a.name > b.name ? 1 : -1;
        });
      if (me.tags) {
        let filtered_list = [];
        if (typeof me.tags == "string") me.tags = me.tags.split(",");

        for (let row of list)
          for (let tag of me.tags) {
            if (row.tags) {
              let found_tag = row.tags.find((el) => {
                return el == tag;
              });
              if (found_tag) filtered_list.push(row);
            }
          }

        list = filtered_list;
      }

      store.loadData(list);

      me.fireEvent("dataload", me, list);

      var cval = me.getValue() || me.savedZerro;

      if (cval || cval === 0) {
        me.setValue(cval);
      } else if (me.defaultValue) {
        //me.setValue(me.defaultValue)
      }
    }, find);
    if (options.scope) store.scope = options.scope;
    store.dataActionsSubscribe();
  }
});
