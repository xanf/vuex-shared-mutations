const path = require("path");
const webpackConfig = require("./webpack.config");

const rule = webpackConfig.module.rules.find(r =>
  r.include.find(p => p.includes("src"))
);

if (!rule.use.options) {
  rule.use.options = {};
}
rule.use.options.plugins = [
  ...(rule.use.options.plugins || []),
  // eslint-disable-next-line global-require,import/no-extraneous-dependencies
  require("babel-plugin-istanbul")
];

delete webpackConfig.output;

const customLaunchers = {
  bs_chrome: {
    base: "BrowserStack",
    browser: "Chrome",
    browser_version: "72.0",
    os: "Windows",
    os_version: "10"
  },
  bs_firefox: {
    base: "BrowserStack",
    browser: "Firefox",
    browser_version: "65.0",
    os: "OS X",
    os_version: "Mojave"
  },
  bs_safari: {
    base: "BrowserStack",
    browser: "Safari",
    browser_version: "12.0",
    os: "OS X",
    os_version: "Mojave"
  },
  bs_ie_11: {
    base: "BrowserStack",
    browser: "IE",
    browser_version: "11.0",
    os: "Windows",
    os_version: "8.1"
  },
  bs_ie_10: {
    base: "BrowserStack",
    browser: "IE",
    browser_version: "10.0",
    os: "Windows",
    os_version: "7"
  },
  bs_ie_9: {
    base: "BrowserStack",
    browser: "IE",
    browser_version: "9.0",
    os: "Windows",
    os_version: "7"
  }
};

function fixMocha(files) {
  files.unshift({
    pattern: path.resolve(__dirname, "./node_modules/core-js/client/core.js"),
    included: true,
    served: true,
    watched: false
  });
}
fixMocha.$inject = ["config.files"];

module.exports = function karmaConfig(config) {
  const browserStack = {
    username: process.env.BROWSERSTACK_USERNAME,
    accessKey: process.env.BROWSERSTACK_ACCESSKEY
  };

  const reporters = ["progress", "coverage"];
  if (browserStack.username) {
    reporters.push("BrowserStack");
  }

  config.set({
    basePath: "",
    concurrency: 1,
    client: {
      useIframe: false,
      runInParent: true
    },
    frameworks: ["mocha", "inline-mocha-fix"],
    plugins: [
      "karma-*",
      {
        "framework:inline-mocha-fix": ["factory", fixMocha]
      }
    ],
    files: [
      "node_modules/@babel/polyfill/dist/polyfill.js",
      "src/**/*.js",
      "tests/e2e.test.js",
      "./node_modules/vue/dist/vue.min.js",
      "./node_modules/vuex/dist/vuex.min.js",
      "./dist/vuex-shared-mutations.js",
      { pattern: "./tests/fixtures/publishOnWindow.js" },
      { pattern: "./tests/fixtures/testTab.html", included: false }
    ],

    exclude: [],

    preprocessors: {
      "src/**/*.js": ["webpack"],
      "tests/**/*.js": ["webpack"]
    },

    port: 9876,
    colors: true,

    logLevel: config.LOG_INFO,
    autoWatch: true,

    browserStack,
    customLaunchers,
    browsers: browserStack.username
      ? Object.keys(customLaunchers)
      : ["ChromeHeadless"],
    customHeaders: [
      {
        match: ".*\\.html",
        name: "X-UA-Compatible",
        value: "IE=edge"
      }
    ],
    singleRun: false,
    webpack: webpackConfig,
    reporters,
    captureTimeout: 60 * 5 * 1000,
    browserNoActivityTimeout: 60 * 5 * 1000
  });
};
