"use strict";

/**
 * Removes the # character from a string.
 * @param {string} hashedString Any string.
 */
function dehash(hashedString: string): string {
  return hashedString.replace("#", "");
}

/**
 * Removes the @ character from a string.
 * @param {string} taggedString Any string.
 */
function detag(taggedString: string): string {
  return taggedString.replace("@", "");
}

/**
 * Replaces every occurance of a template string expressions variable with provided template values.
 * @param {string} message Original message with template string expressions.
 * @param {{key: string, value: string|number}} replacements Replace every occurance of ${<key>} with <value> in <message>.
 * @return {string} Replaced string.
 */
function replaceInMessage(
  message: string,
  replacements: { key: string; value: string | number }
): string {
  if (replacements) {
    let replacedString = message;
    for (const key in replacements) {
      if (
        typeof replacements[key] === "string" ||
        typeof replacements[key] === "number"
      ) {
        const re = new RegExp(`\\$\\{${key}\\}`, "g");
        replacedString = replacedString.replace(re, replacements[key]);
      }
    }
    return replacedString;
  }
  return message;
}

export { dehash, detag, replaceInMessage };
