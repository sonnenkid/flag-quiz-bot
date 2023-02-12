const unorm = require('unorm');

module.exports = function (text) {
    return unorm.nfkd(text).replace(/[\u0300-\u036F]/g, '').toLowerCase();
}