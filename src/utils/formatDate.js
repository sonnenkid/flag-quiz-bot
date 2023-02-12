module.exports = function (date) {
    return date.toISOString().split("T")[0];
}