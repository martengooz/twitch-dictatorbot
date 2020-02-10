function dehash(hashedString) {
    return hashedString.replace('#', '');
}
function detag(taggedString) {
    return taggedString.replace('@', '');
}

module.exports.dehash = dehash;
module.exports.detag = detag;