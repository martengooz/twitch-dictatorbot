module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["./tests", "./src"],
  transform: {
    "^.+\\.[t|j]sx?$": "babel-jest"
  }
};
