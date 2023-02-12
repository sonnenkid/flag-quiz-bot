module.exports = function (text, maxCharsPerLine) {
    if (text.length <= maxCharsPerLine) {
        return text;
    } else {
        let words = text.split(" ");
        let result = [];
        let line = [];
        for (let word of words) {
            if ((line.join(" ") + word).length <= maxCharsPerLine) {
                line.push(word);
            } else {
                result.push(line.join(" "));
                line = [word];
            }
        }
        result.push(line.join(" "));
        return result.join("\n");
    }
}