module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["./tests", "./src"],
  transform: {
    "^.+\\.[t|j]sx?$": "babel-jest"
  },
  collectCoverageFrom: ["**/*.{ts,js,jsx}"],
  coveragePathIgnorePatterns: [
    "/node_modules/",
    "/tests/.*\\.(ts|js)$",
    "/dist/.*\\.(ts|js)$",
    "/build/.*\\.(ts|js)$"
  ],
  modulePathIgnorePatterns: ["/node_modules/", ".*\\.json$"]
};
