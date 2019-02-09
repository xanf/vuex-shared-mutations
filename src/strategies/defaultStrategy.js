import BroadcastChannelStrategy from "./broadcastChannel";
import LocalStorageStrategy from "./localStorage";

export default function createDefaultStrategy() {
  /* istanbul ignore next: browser-dependent code */
  if (LocalStorageStrategy.available()) {
    return new LocalStorageStrategy();
  }

  /* istanbul ignore next: browser-dependent code */
  if (BroadcastChannelStrategy.available()) {
    return new BroadcastChannelStrategy();
  }

  /* istanbul ignore next: browser-dependent code */
  throw new Error("No strategies available");
}
