/* eslint-disable no-param-reassign */
import chai from "chai";

const { expect } = chai;
const WAIT_DELAY = 10000;

const TEST_PAGE = "/base/tests/fixtures/testTab.html";
const openedFrames = [];

const sleep = ms => new Promise(ok => setTimeout(ok, ms));

function openFrame(url) {
  const iframe = document.createElement("iframe");
  iframe.src = url;
  document.body.appendChild(iframe);
  openedFrames.push(iframe);
  return iframe.contentWindow;
}

function closeWindows() {
  openedFrames.forEach(f => {
    f.parentNode.removeChild(f);
  });
  openedFrames.length = 0;
}

const STEP = 100;
function waitForLoad(w, timeout) {
  if (timeout < 0) {
    throw new Error("Timeout loading window");
  }

  if (w.loaded) {
    return Promise.resolve(w);
  }
  return sleep(STEP).then(() => waitForLoad(w, timeout - STEP));
}

function waitForValue(fn, value, timeout) {
  if (timeout < 0) {
    throw new Error("Timed out");
  }
  if (fn() === value) {
    return Promise.resolve(true);
  }
  return sleep(STEP).then(() => waitForValue(fn, value, timeout - STEP));
}

describe("Vuex shared mutations", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(closeWindows);
  it("should share mutation between multiple tabs using BroadcastChannel", function t() {
    if (typeof BroadcastChannel === "undefined") {
      this.skip();
    }

    this.timeout(WAIT_DELAY * 10);
    const firstWindow = openFrame(TEST_PAGE);
    const secondWindow = openFrame(TEST_PAGE);
    return Promise.all([
      waitForLoad(firstWindow, WAIT_DELAY),
      waitForLoad(secondWindow, WAIT_DELAY)
    ]).then(() => {
      const [firstStore, secondStore] = [firstWindow, secondWindow].map(w => {
        if (!w.createStore) {
          throw new Error("Missing createStore on window, check fixture");
        }
        return w.createStore("BroadcastChannel");
      });

      firstStore.commit("increment");
      return waitForValue(
        () => secondStore.state.count,
        firstStore.state.count,
        WAIT_DELAY
      );
    });
  });

  it("should share mutation between multiple tabs using localStorage", function t() {
    this.timeout(WAIT_DELAY * 10);
    const firstWindow = openFrame(TEST_PAGE);
    const secondWindow = openFrame(TEST_PAGE);
    return Promise.all([
      waitForLoad(firstWindow, WAIT_DELAY),
      waitForLoad(secondWindow, WAIT_DELAY)
    ]).then(() => {
      const [firstStore, secondStore] = [firstWindow, secondWindow].map(w =>
        w.createStore("localStorage")
      );

      firstStore.commit("increment");
      return waitForValue(
        () => secondStore.state.count,
        firstStore.state.count,
        WAIT_DELAY
      );
    });
  });

  it("should share huge mutation between multiple tabs using localStorage", function t() {
    if (typeof localStorage === "undefined") {
      this.skip();
    }

    this.timeout(WAIT_DELAY * 20);
    const firstWindow = openFrame(TEST_PAGE);
    const secondWindow = openFrame(TEST_PAGE);

    return Promise.all([
      waitForLoad(firstWindow, WAIT_DELAY),
      waitForLoad(secondWindow, WAIT_DELAY)
    ]).then(() => {
      const [firstStore, secondStore] = [firstWindow, secondWindow].map(w =>
        w.createStore("localStorage")
      );

      const HUGE_MESSAGE = "HUGE".repeat(100 * 1024);
      firstStore.commit("setMessage", { message: HUGE_MESSAGE });
      expect(firstStore.state.message).to.equal(HUGE_MESSAGE);
      return waitForValue(
        () => secondStore.state.message,
        HUGE_MESSAGE,
        WAIT_DELAY * 10
      );
    });
  });

  it("should share mutation between multiple tabs with default strategy", function t() {
    this.timeout(WAIT_DELAY * 10);
    const firstWindow = openFrame(TEST_PAGE);
    const secondWindow = openFrame(TEST_PAGE);
    return Promise.all([
      waitForLoad(firstWindow, WAIT_DELAY),
      waitForLoad(secondWindow, WAIT_DELAY)
    ]).then(() => {
      const [firstStore, secondStore] = [firstWindow, secondWindow].map(w =>
        w.createStore()
      );

      firstStore.commit("increment");
      return waitForValue(
        () => secondStore.state.count,
        firstStore.state.count,
        WAIT_DELAY
      );
    });
  });
});
