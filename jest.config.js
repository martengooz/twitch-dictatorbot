module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["./tests", "./src"],
  transform: {
    "^.+\\.[t|j]sx?$": "babel-jest"
  },
  coveragePathIgnorePatterns: [
    "/node_modules/",
    "(.test)\\.(ts|tsx|js)$",
    "/dist/.*\\.(ts|js)$",
    "/build/.*\\.(ts|js)$"
  ]
};
