var recursive = require("recursive-readdir");
const fs = require("fs");
let out = [];
let uniqueArray = [];
recursive(
  __dirname + "/../../src",
  ["*.css", "*.scss", "*.json", "*.html", "node_modules", "test"],
  (err, files) => {
    for (let path of files) {
      fs.readFile(path, "utf8", (err, data) => {
        if (err) throw err;
        var res = data.match(new RegExp('throw "\\w*"{1,50}', "g"));
        if (res && res.length) {
          for (let item of res) {
            item = item.replace(/throw /g, "");
            out.push(item);
          }

          uniqueArray = out.filter(function(item, pos) {
            return out.indexOf(item) == pos;
          });

          fs.writeFile(
            __dirname + "/../../upload/error_list.txt",
            uniqueArray,
            (err, res) => {
              if (err) return err;
            }
          );
        }
      });
    }
  }
);
