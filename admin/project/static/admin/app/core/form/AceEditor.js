Ext.define("Core.form.AceEditor", {
  extend: "Ext.form.field.Base",
  alias: "widget.aceeditortextarea",
  fieldSubTpl: [
    '<div foo="aaa" id="{aceWrapperDivId}" ',
    'style="height: 100%"',
    '<tpl if="fieldStyle"> style="{fieldStyle}"</tpl>',
    '<tpl if="fieldCls"> class="{fieldCls}"</tpl>',
    ">",
    '<div id="{aceDivId}" ',
    'style="height: 100%"',
    "></div>",
    "</div>"
  ],
  defaultAceEditorOptions: {
    mode: "ace/mode/json",
    highlightActiveLine: true,
    showPrintMargin: false
  },
  aceOptions: {},
  value: "",
  lastValue: "",
  minHeight: 100,
  allowBlank: true,
  blankText: "This field is required",
  extraFieldBodyCls: Ext.baseCSSPrefix + "form-text-wrap-default",
  invalidCls: Ext.baseCSSPrefix + "form-invalid-ace-field-default",
  initComponent: function() {
    this.isReady = false;
    this.on(
      "afterrender",
      () => {
        setTimeout(() => {
          this.initAceEditor();
        }, 100);
      },
      this
    );
    this.callParent();
  },
  getAceEditor: function() {
    if (!this.aceEditor) {
      this.aceEditor = ace.edit(this.getAceDivId());
    }
    return this.aceEditor;
  },
  initAceEditor: function(el) {
    var me = this,
      aceOptions = Ext.Object.merge(
        this.defaultAceEditorOptions,
        this.aceOptions
      );
    this.getAceEditor().setOptions(aceOptions);
    this.getAceEditor()
      .getSession()
      .setValue(this.getValue());
    this.getAceEditor()
      .getSession()
      .setMode(this.defaultAceEditorOptions.mode);
    this.getAceEditor()
      .getSession()
      .on("change", function() {
        me.onChange.call(me);
      });
    this.getAceEditor()
      .getSession()
      .setTabSize(2);
    this.getAceEditor()
      .getSession()
      .setUseWrapMode(true);
    this.getAceEditor().setAutoScrollEditorIntoView(true);
    this.getAceEditor().renderer.on("afterRender", () => {
      this.isReady = true;
    });
  },
  onChange: function() {
    this.lastValue = this.value;
    this.value = this.getAceEditor()
      .getSession()
      .getValue();
    this.isCodeValid();
    this.fireEvent("change", this, this.value, this.lastValue);
    this.callParent([this.value, this.lastValue]);
  },
  isCodeValid: function() {
    var annotations = this.getAceEditor()
      .getSession()
      .getAnnotations();
    if (annotations.length > 0) {
      this.fireEvent("annotation", annotations);
    }
    Ext.Array.each(
      annotations,
      function(annotation) {
        if (annotation.type == "info") {
          this.fireEvent("infoannotation");
          return false;
        }
      },
      this
    );
    Ext.Array.each(
      annotations,
      function(annotation) {
        if (annotation.type == "error") {
          this.fireEvent("errorannotation");
          return false;
        }
      },
      this
    );
    Ext.Array.each(
      annotations,
      function(annotation) {
        if (annotation.type == "warning") {
          this.fireEvent("worningannotation");
          return false;
        }
      },
      this
    );
    return this;
  },
  getValue: function() {
    var value = this.value;
    return value;
  },
  setValue: function(val) {
    if (this.isReady) this.aceEditor.getSession().setValue(val);
    else {
      setTimeout(() => {
        this.setValue(val);
      }, 500);
    }
  },
  getSubmitValue: function() {
    var value = this.value;
    return value;
  },
  getSubTplData: function(fieldData) {
    fieldData.aceWrapperDivId = this.getAceWrapperDivId();
    fieldData.aceDivId = this.getAceDivId();
    fieldData.height = this.height || this.minHeight;
    fieldData.minHeight = this.minHeight;
    fieldData.fieldCls = this.fieldCls;
    return fieldData;
  },
  getAceWrapperDivId: function() {
    return this.getId() + "-aceDivWrapperId";
  },
  getAceWrapperEl: function() {
    return Ext.get(this.getAceWrapperDivId());
  },
  getAceDivId: function() {
    return this.getId() + "-aceDivId";
  },
  getErrors: function(value) {
    var errors = this.callParent([value]);
    if (!this.allowBlank && this.value.length == 0) {
      errors.push(this.blankText);
    }
    if (errors && errors.length > 0) {
      this.getAceWrapperEl().addCls(this.invalidCls);
    } else {
      this.getAceWrapperEl().removeCls(this.invalidCls);
    }
    return errors;
  }
});
