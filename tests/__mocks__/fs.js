"use strict";

const fs = jest.genMockFromModule("fs");

let mockFiles = Object.create(null);
function __setMockFiles(newMockFiles) {
  mockFiles = Object.create(null);
  for (const file in newMockFiles) {
    mockFiles[file] = newMockFiles[file];
  }
}

function existsSync(directoryPath) {
  return directoryPath in mockFiles;
}

function readFileSync(path) {
  return mockFiles[path] || "";
}

fs.__setMockFiles = __setMockFiles;
fs.existsSync = existsSync;
fs.readFileSync = readFileSync;

module.exports = fs;
