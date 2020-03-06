const { resolve } = require("path");

module.exports = {
  entry: {
    main: resolve("./build/bot.js")
  },
  output: {
    path: resolve("./dist"),
    filename: "bot.js"
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js", ".json"]
  },
  module: {
    rules: [
      // all files with a '.ts' or '.tsx' extension will be handled by 'ts-loader'
      {
        test: /\.tsx?$/,
        use: ["ts-loader"],
        exclude: /node_modules/
      }
    ]
  },
  target: "node",
  externals: {
    fs: "commonjs fs",
    path: "commonjs path",
    "utf-8-validate": "commonjs utf-8-validate",
    bufferutil: "commonjs bufferutil"
  }
};
