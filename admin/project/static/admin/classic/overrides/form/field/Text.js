Ext.form.field.Text.override({
  preSubTpl: [
    '<div id="{cmpId}-triggerWrap" data-ref="triggerWrap"',
    "<tpl if=\"ariaEl == 'triggerWrap'\">",
    '<tpl foreach="ariaElAttributes"> {$}="{.}"</tpl>',
    "<tpl else>",
    ' role="presentation"',
    "</tpl>",
    ' class="{triggerWrapCls} {triggerWrapCls}-{ui}">',
    '<tpl if="helpText">',
    '<i class="x-fa fa-question-circle help-icon-object" title="{helpText}"></i>',
    "</tpl>",
    '<div id={cmpId}-inputWrap data-ref="inputWrap"',
    ' role="presentation" class="{inputWrapCls} {inputWrapCls}-{ui}">'
  ],

  getSubTplMarkup: function(fieldData) {
    var me = this,
      data = me.getSubTplData(fieldData),
      preSubTpl = me.lookupTpl("preSubTpl"),
      postSubTpl = me.lookupTpl("postSubTpl"),
      markup = "";

    data.helpText = this.helpText;

    if (preSubTpl) {
      markup += preSubTpl.apply(data);
    }

    markup += me.lookupTpl("fieldSubTpl").apply(data);

    if (postSubTpl) {
      markup += postSubTpl.apply(data);
    }

    return markup;
  }
});
