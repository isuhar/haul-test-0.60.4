const fs = require("fs")
const mkdirp = require("mkdirp")
const rimraf = require("rimraf")
const path = require("path")
const execSync = require('child_process').execSync;

module.exports = function (options, config) {
    mkdirp.sync(config.output.path);
    rimraf.sync(path.join(config.output.path, "!(records.json)"))

    // генерим индекс хелпа, если его нет
    if (!process.env.BUILD_DIR && !fs.existsSync(path.join(options.docDir, 'user', 'lunr.json'))) {
        execSync('npm run help:index', {stdio: "inherit"});
    }
}