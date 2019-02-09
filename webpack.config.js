const path = require("path");

const mode =
  process.env.NODE_ENV === "production" ? "production" : "development";

module.exports = {
  mode,
  entry: "./src/vuexSharedMutations.js",
  devtool: "source-map",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "vuex-shared-mutations.js",
    library: "vuexSharedMutations",
    libraryTarget: "umd",
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        include: [path.resolve(__dirname, "src")],
        use: {
          loader: "babel-loader",
        },
      },
      {
        test: /\.js$/,
        include: [
          path.resolve(__dirname, "tests"),
          path.resolve(__dirname, "node_modules", "chai-as-promised"),
        ],
        use: {
          loader: "babel-loader",
        },
      },
    ],
  },
};
