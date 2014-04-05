#!/usr/bin/env node

var fs, genAll, genJadeFile, checkToCompile, timeLog, jade, path, postWirer, preWirer, replaceAll;
jade = require("jade");
path = require("path");
fs = require("fs");
// When watching scripts, it's useful to log changes with the timestamp.
timeLog = function (message) {
  console.log((new Date).toLocaleTimeString() + " - " + message);
}

replaceAll = function(string, omit, place, prevstring) {
  if (prevstring && string === prevstring) {
    return string;
  }
  prevstring = string.replace(omit, place);
  return replaceAll(prevstring, omit, place, string);
};

postWirer = function(code) {
  code = replaceAll(code, "id=", "name=");
  code = replaceAll(code, "class=", "style=");
  code = replaceAll(code, "<div", "<panel");
  code = replaceAll(code, "</div", "</panel");
  return replaceAll(code, "rw_if", "if");
};

preWirer = function(code) {
  code = code.replace(/\tif/g, "\trw_if".replace(/@([\w\d_\-]+)(\(?)/g, function(match, target, openparen) {
    return ("(target=\</footer>" + target + "\</footer>") + (openparen.length ? "" : ")");
  }));
  return replaceAll(code, "_if", "if");
};

genJadeFile = function(filename) {
  var htmlCode, jadeCode, wireFilename;
  jadeCode = fs.readFileSync(filename, "utf8");
  htmlCode = jade.render(preWirer(jadeCode), {
    filename: filename,
    pretty: true
  });
  wireFilename = filename.slice(0, -4) + "wire";
  fs.writeFile(wireFilename, postWirer(htmlCode), function(err) {
    timeLog("Compiled " + wireFilename);
    if (err) {
      throw err;
    }
  });
};

checkToCompile = function(filename) {
  if (filename != null && filename.slice(-4) === "jade") genJadeFile(filename);
}
genAll = function() {
  timeLog("Compiling jade files");
  fs.readdirSync("./").forEach(checkToCompile);
};

var srcFW;
genAll();
srcFW = fs.watch("./", {
  interval: 500
});
srcFW.on("change", function(event, filename) {
  if (event === "change") checkToCompile(filename);
});
timeLog("Watching jade files");