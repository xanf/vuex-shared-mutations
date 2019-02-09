import chai from "chai";
import td from "testdouble";
import tdChai from "testdouble-chai";
import BroadcastChannelStrategy from "./broadcastChannel";

chai.use(tdChai(td));
const { expect } = chai;

describe("BroadcastChannelStrategy", () => {
  it("should report as unavailable if BroadcastChannel is not available", () => {
    expect(
      () =>
        new BroadcastChannelStrategy({
          BroadcastChannel: { dummy: true }
        })
    ).to.throw(Error);
  });

  it("should respect key options", () => {
    const FakeChannel = td.constructor(["postMessage"]);
    const KEY = "CUSTOM KEY";
    const strategy = new BroadcastChannelStrategy({
      key: KEY,
      BroadcastChannel: FakeChannel
    });
    const message = { demo: "message" };
    strategy.share(message);
    expect(FakeChannel).have.been.calledWith(KEY);
  });

  it("should call postMessage on broadcastChannel when share is called", () => {
    const dummyChannel = {
      postMessage: td.func()
    };
    const strategy = new BroadcastChannelStrategy({
      BroadcastChannel: () => dummyChannel
    });
    const message = { demo: "message" };
    strategy.share(message);
    expect(dummyChannel.postMessage).to.have.been.calledWith(message);
  });

  it("should subscribe to message event", () => {
    const dummyChannel = {
      addEventListener: td.func()
    };
    const strategy = new BroadcastChannelStrategy({
      BroadcastChannel: () => dummyChannel
    });
    const dummyFn = () => {};
    strategy.addEventListener(dummyFn);
    expect(dummyChannel.addEventListener).to.have.been.calledWith(
      "message",
      td.matchers.anything()
    );
  });
});
