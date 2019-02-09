import chai from "chai";
import td from "testdouble";
import tdChai from "testdouble-chai";
import LocalStorageStrategy from "./localStorage";

chai.use(tdChai(td));
const { expect } = chai;

describe("LocalStorageStrategy", () => {
  it("should report as unavailble if window is undefined", () => {
    expect(
      LocalStorageStrategy.available({
        window: undefined
      })
    ).to.equal(false);
  });

  it("should report as unavailble if localStorage is undefined", () => {
    expect(
      LocalStorageStrategy.available({
        window: {},
        localStorage: undefined
      })
    ).to.equal(false);
  });

  it("should throw if localStorage is not working properly", () => {
    expect(() => {
      // eslint-disable-next-line no-new
      new LocalStorageStrategy({
        window,
        localStorage: {
          setItem: () => {
            throw new Error();
          }
        }
      });
    }).to.throw(Error);
  });

  it("should call setItem / removeItem on localStorage when share is called", () => {
    const dummyStorage = {
      setItem: td.func(),
      removeItem: td.func()
    };
    const key = "TEST-KEY";
    const strategy = new LocalStorageStrategy({
      key,
      localStorage: dummyStorage
    });
    const message = { demo: "message" };
    strategy.share(message);
    td.verify(
      dummyStorage.setItem(
        td.matchers.contains(key),
        td.matchers.contains(`"part":0`)
      )
    );
    td.verify(dummyStorage.removeItem(td.matchers.contains(key)));
  });

  it("should call setItem / removeItem multiple times when called on long message", () => {
    const dummyStorage = {
      setItem: td.func(),
      removeItem: td.func()
    };
    const key = "TEST-KEY";
    const strategy = new LocalStorageStrategy({
      key,
      localStorage: dummyStorage
    });
    const message = { demo: "m".repeat(64 * 1024) };
    strategy.share(message);
    td.verify(
      dummyStorage.setItem(
        td.matchers.contains(key),
        td.matchers.contains(`"part":1`)
      )
    );
  });

  it("should subscribe to storage event on window", () => {
    const dummyWindow = {
      addEventListener: td.func()
    };
    const dummyFn = () => {};

    const strategy = new LocalStorageStrategy({
      localStorage: {
        setItem: td.func(),
        removeItem: td.func()
      },
      window: dummyWindow
    });
    strategy.addEventListener(dummyFn);
    td.verify(dummyWindow.addEventListener("storage", td.matchers.anything()));
  });

  it("should ignore updates of other keys in localStorage", () => {
    let handler = null;

    const dummyWindow = {
      addEventListener: (key, fn) => {
        handler = fn;
      }
    };

    const dummyFn = td.func();
    const KEY = "TEST-KEY";

    const strategy = new LocalStorageStrategy({
      key: KEY,
      localStorage: {
        setItem: td.func(),
        removeItem: td.func()
      },
      window: dummyWindow
    });
    strategy.addEventListener(dummyFn);
    expect(
      handler({
        newValue: "1",
        key: "some-other-key"
      })
    ).to.equal(false);
  });

  it("should not trigger on empty value", () => {
    let handler = null;

    const dummyWindow = {
      addEventListener: (key, fn) => {
        handler = fn;
      }
    };

    const dummyFn = td.func();
    const KEY = "TEST-KEY";

    const strategy = new LocalStorageStrategy({
      key: KEY,
      localStorage: {
        setItem: td.func(),
        removeItem: td.func()
      },
      window: dummyWindow
    });
    strategy.addEventListener(dummyFn);
    expect(
      handler({
        newValue: null,
        key: KEY
      })
    ).to.equal(false);
  });

  it("should correctly parse split message", () => {
    let handler = null;

    const dummyWindow = {
      addEventListener: (key, fn) => {
        handler = fn;
      },
      JSON
    };

    const dummyFn = td.func();
    const KEY = "TEST-KEY";

    const strategy = new LocalStorageStrategy({
      key: KEY,
      localStorage: {
        setItem: td.func(),
        removeItem: td.func()
      },
      window: dummyWindow
    });
    strategy.addEventListener(dummyFn);
    handler({
      newValue: JSON.stringify({
        part: 0,
        total: 2,
        messagePart: "tr" /* partial of "true" */
      }),
      key: `${KEY}##0`
    });
    expect(dummyFn).not.have.been.called;
    handler({
      newValue: JSON.stringify({
        part: 1,
        total: 2,
        messagePart: "ue" /* partial of "true" */
      }),
      key: `${KEY}##1`
    });
    expect(dummyFn).have.been.calledWith(true);
  });
});
