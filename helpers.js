'use strict';

function dehash(hashedString) {
    return hashedString.replace('#', '');
}

function detag(taggedString) {
    return taggedString.replace('@', '');
}

/**
 * @param {string} message                          Original message that should be interpolated.
 * @param {Object.<string, string|number>} params   Replace key string with key value.
 */
function replaceInMessage(message, params) {
    if (params) {
        var replacedString = message;
        for (var key in params) {
            if (!params.hasOwnProperty(key)) {
                continue;
            }
            if (typeof (params[key]) === "string" || typeof (params[key]) === "number") {
                replacedString = replacedString.replace(`\$\{${key}\}`, params[key]);
            }
        }
        return replacedString;
    }
    return message;
}

module.exports.dehash = dehash;
module.exports.detag = detag;
module.exports.replaceInMessage = replaceInMessage;