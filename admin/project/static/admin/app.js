Ext.Loader.setConfig({
  enabled: true,
  paths: {
    Core: "app/core",
    Crm: "crm",
    Admin: "classic/src",
    Desktop: "app",
    main: "app/main"
    // "Ext.ux.Printer": "./print/Printer.js",
    // "Ext.ux.Printer.BaseRenderer": "./print/renderers/Base.js"
  }
});

// Ext.Loader.setPath({
//   mAdmin: "ext/modern/modern/src"
// });

LOCALE = {};
Glob = {};

Ext.create("Ext.tip.ToolTip");
//Ext.create("Ext.ux.Printer");
//Ext.create("Ext.ux.Printer.BaseRenderer");

Ext.application({
  name: "Admin",
  extend: "Admin.Application",
  requires: ["Admin.*", "main.*", "Core.*"],
  mainView: "Admin.view.main.Viewport"
});
