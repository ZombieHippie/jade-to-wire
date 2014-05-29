var fs = require("fs")
var jadeToWire = require("../main")

var genWireFile = function(filename) {
    var jadeCode = fs.readFileSync(filename, "utf8")
    var jadeOptions = { filename: filename }
    jadeToWire.toWire(jadeCode, jadeOptions, function (wire) {
        var wireFilename = filename.slice(0, -4) + "wire"
        fs.writeFile(wireFilename, wire, function(err) {
            jadeToWire.timeLog("Compiled " + wireFilename)
            if (err) {
              throw err
            }
          })
      })
  }

var checkToCompile = function(filename) {
    if (filename != null && filename.slice(-4) === "jade") genWireFile(filename)
  }

var genAll = function() {
    jadeToWire.timeLog("Compiling jade files")
    fs.readdirSync("./").forEach(checkToCompile)
  }

exports.run = function () {
    genAll()    

    var srcFW = fs.watch("./", {
        interval: 500
      })
    srcFW.on("change", function(event, filename) {
        if (event === "change") checkToCompile(filename)
      })
    jadeToWire.timeLog("Watching jade files")
  }