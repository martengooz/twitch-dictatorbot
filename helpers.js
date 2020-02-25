"use strict";

/**
 * Removes the # character from a string.
 * @param {string} hashedString Any string.
 */
function dehash(hashedString) {
  return hashedString.replace("#", "");
}

/**
 * Removes the @ character from a string.
 * @param {string} taggedString Any string.
 */
function detag(taggedString) {
  return taggedString.replace("@", "");
}

/**
 * Replaces every occurance of a template string expressions variable with provided template values.
 * @param {string} message Original message with template string expressions.
 * @param {{key: string, value: string|number}} replacements Replace every occurance of ${<key>} with <value> in <message>.
 * @return {string} Replaced string.
 */
function replaceInMessage(message, replacements) {
  if (replacements) {
    var replacedString = message;
    for (var key in replacements) {
      if (!(key in replacements)) {
        continue;
      }
      if (
        typeof replacements[key] === "string" ||
        typeof replacements[key] === "number"
      ) {
        var re = new RegExp(`\\$\\{${key}\\}`, "g");
        replacedString = replacedString.replace(re, replacements[key]);
      }
    }
    return replacedString;
  }
  return message;
}

module.exports.dehash = dehash;
module.exports.detag = detag;
module.exports.replaceInMessage = replaceInMessage;
