import pug from "pug";
import FileProvider from "@lib/fileprovider";
import pdf from "html-pdf";

async function generate(data, string_pug, options, filename) {
  return new Promise(async (resolve, reject) => {
    let html = await pug.render(string_pug, {
      pretty: true,
      data
    });

    await pdf.create(html, options || {}).toBuffer(async function(err, buffer) {
      let file = {};
      file.data = buffer;
      file.name = filename || "File.pdf";
      let res = await FileProvider.push(file, 300);
      resolve(res);
    });
  });
}

export default {
  generate
};
