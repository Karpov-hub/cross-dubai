/* extjs6 test */



Ext = require("extjs-node");

require("proto_correct");

Ext.BaseDir = __dirname;

var Paths = {
  Core: Ext.BaseDir + "/src/Core",
  Database: Ext.BaseDir + "/src/Database",
  Admin: Ext.BaseDir + "/protected/Admin",
  Desktop: Ext.BaseDir + "/protected/Desktop"
};

Ext.Loader.setConfig({
  enabled: true,
  paths: Paths,
  sharedPath: [
    {
      src: /\/protected\/modules\/([a-z0-9]{1,})\/model\//i,
      dst: "/static/admin/crm/modules/$1/model/"
      // : "/static/admin/modules/$1/model/"
    },
    {
      src: /\/protected\/Desktop\/modules\//,
      dst: "/static/admin/"
    }
  ]
});

/*/ Замер потребления памяти
setInterval(function() {
   console.log(Math.round(process.memoryUsage().rss/1024/1024))
}, 1000)
//*/
exports.serve = function(conf, cb) {
  Ext.create("Core.Server", conf).serve(cb);
};
