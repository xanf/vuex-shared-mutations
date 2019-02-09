/*eslint-disable */
const wallabyWebpack = require("wallaby-webpack");
const webpackPostprocessor = wallabyWebpack();
module.exports = function(wallaby) {
  return {
    files: [
      { pattern: "src/**/*.js", load: false },
      { pattern: "!src/**/*.test.js" },
      { pattern: "tests/fixtures/publishOnWindow.js" }
    ],
    tests: [
      { pattern: "src/**/*.test.js", load: false },
      { pattern: "tests/**/*.js", load: false },
      { pattern: "!tests/fixtures/**" }
    ],
    testFramework: "mocha",
    compilers: {
      "**/*.js": wallaby.compilers.babel()
    },
    env: {
      type: "browser",
      kind: "chrome"
    },

    postprocessor: webpackPostprocessor,

    bootstrap() {
      window.__moduleBundler.loadTests();
    },

    hints: {
      ignoreCoverage: /istanbul ignore next/ // or /istanbul ignore next/, or any RegExp
    },

    middleware: (app, express) => {
      app.use("/base", express.static(__dirname));
    }
  };
};
