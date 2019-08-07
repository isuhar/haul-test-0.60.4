var processMessages = require("./processMessages")

module.exports = function(content, map) {
    this.cacheable && this.cacheable()
    var structure = JSON.parse(content)
    structure = processMessages(structure)
    this.callback(null, JSON.stringify(structure), map)
}
