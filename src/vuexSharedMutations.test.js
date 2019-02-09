import chai from "chai";
import td from "testdouble";
import tdChai from "testdouble-chai";
import createMutationsSharer from "./vuexSharedMutations";

chai.use(tdChai(td));

const { expect } = chai;
describe("Vuex shared mutations", () => {
  it("should throw an error if predicate function is not supplied", () => {
    expect(() => {
      createMutationsSharer();
    }).to.throw(Error);
  });

  it("should accept array as predicate", () => {
    expect(() => {
      createMutationsSharer({
        predicate: ["m-1"]
      });
    }).to.not.throw(Error);
  });

  it("should accept function as predicate", () => {
    expect(() => {
      createMutationsSharer({
        predicate: td.func()
      });
    }).to.not.throw(Error);
  });

  it("should share relevant mutation", () => {
    let capturedHandler;
    const fakeStrategy = {
      share: td.func(),
      addEventListener: td.func()
    };

    const fakeStore = {
      subscribe(fn) {
        capturedHandler = fn;
      }
    };

    createMutationsSharer({
      predicate: ["m-1"],
      strategy: fakeStrategy
    })(fakeStore);

    return capturedHandler({ type: "m-1", payload: "lol" }).then(() => {
      expect(fakeStrategy.share).to.have.been.called;
    });
  });

  it("should not share irrelevant mutation", () => {
    let capturedHandler;
    const fakeStrategy = {
      share: td.func(),
      addEventListener: td.func()
    };

    const fakeStore = {
      subscribe(fn) {
        capturedHandler = fn;
      }
    };

    createMutationsSharer({
      predicate: ["m-1"],
      strategy: fakeStrategy
    })(fakeStore);
    return capturedHandler({ type: "m-2", payload: "lol" }).then(() => {
      expect(fakeStrategy.share).not.have.been.called;
    });
  });

  it("should respect predicate function when sharing mutation", () => {
    let capturedHandler;
    const fakeStrategy = {
      share: td.func(),
      addEventListener: td.func()
    };

    const fakeStore = {
      subscribe(fn) {
        capturedHandler = fn;
      }
    };

    createMutationsSharer({
      predicate: ({ type }) => ["m-1"].indexOf(type) !== -1,
      strategy: fakeStrategy
    })(fakeStore);

    return capturedHandler({ type: "m-1", payload: "lol" }).then(() => {
      expect(fakeStrategy.share).have.been.called;
    });
  });

  it("should not reshare event received from strategy", () => {
    let capturedStrategyHandler;
    const share = td.func();
    const fakeStrategy = {
      share,
      addEventListener: fn => {
        capturedStrategyHandler = fn;
      }
    };

    let subscription;
    const fakeStore = {
      subscribe(fn) {
        subscription = fn;
      },
      commit: td.func()
    };
    td.when(
      fakeStore.commit(td.matchers.anything(), td.matchers.anything())
    ).thenDo((type, payload) => {
      subscription({ type, payload });
    });

    const predicate = td.func();
    createMutationsSharer({
      predicate: ["d1"],
      strategy: fakeStrategy
    })(fakeStore);

    capturedStrategyHandler({ type: "d1", payload: {} });
    expect(fakeStore.commit).to.have.been.called;
    expect(predicate).not.have.been.called;
    expect(share).not.have.been.called;
  });
});
