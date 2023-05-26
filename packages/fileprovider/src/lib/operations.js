import watermark from "image-watermark";
import config from "@lib/config";

function addWatermark(srcPath, dstPath) {
  var options = {
    text: "DO NOT FOR COPY",
    resize: "200%",
    dstPath: dstPath,
    align: "dia1",
    color: "rgba(0,0,0,0.1)"
  };
  return new Promise((resolve, reject) => {
    if (config.addWatermark === false) return resolve(true);
    watermark.embedWatermarkWithCb(srcPath, options, err => {
      if (err) reject(err);
      options.align = "dia2";
      watermark.embedWatermarkWithCb(dstPath, options, err => {
        if (err) reject(err);
        resolve(true);
      });
    });
  });
}

export default {
  addWatermark
};
