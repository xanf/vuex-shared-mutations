const DEFAULT_KEY = "vuex-shared-mutations";

const globalObj =
  typeof window !== "undefined"
    ? window
    : /* istanbul ignore next: node env */ global;

const MAX_MESSAGE_LENGTH = 4 * 1024;
let messageCounter = 1;

function splitMessage(message) {
  const partsCount = Math.ceil(message.length / MAX_MESSAGE_LENGTH);
  return Array.from({ length: partsCount }).map((_, idx) =>
    message.substr(idx * MAX_MESSAGE_LENGTH, MAX_MESSAGE_LENGTH)
  );
}

export default class LocalStorageStrategy {
  static available(
    { window: windowImpl, localStorage: localStorageImpl } = {
      window: globalObj.window,
      localStorage: globalObj.localStorage
    }
  ) {
    if (!windowImpl || !localStorageImpl) {
      return false;
    }

    try {
      localStorageImpl.setItem("vuex-shared-mutations-test-key", Date.now());
      localStorageImpl.removeItem("vuex-shared-mutations-test-key");
      return true;
    } catch (e) {
      return false;
    }
  }

  constructor(options = {}) {
    const windowImpl = options.window || globalObj.window;
    const localStorageImpl = options.localStorage || globalObj.localStorage;
    if (
      !this.constructor.available({
        window: windowImpl,
        localStorage: localStorageImpl
      })
    ) {
      throw new Error("Strategy unavailable");
    }
    this.uniqueId = `${Date.now()}-${Math.random()}`;
    this.messageBuffer = [];
    this.window = windowImpl;
    this.storage = localStorageImpl;
    this.options = {
      key: DEFAULT_KEY,
      ...options
    };
  }

  // eslint-disable-next-line class-methods-use-this
  addEventListener(fn) {
    return this.window.addEventListener("storage", event => {
      if (!event.newValue) {
        return false;
      }

      if (
        event.key.indexOf("##") === -1 ||
        event.key.split("##")[0] !== this.options.key
      ) {
        return false;
      }
      const message = this.window.JSON.parse(event.newValue);
      /* istanbul ignore next: IE does not follow storage event spec */
      if (message.author === this.uniqueId) {
        return false;
      }
      this.messageBuffer.push(message.messagePart);
      if (this.messageBuffer.length === message.total) {
        const mutation = this.window.JSON.parse(this.messageBuffer.join(""));
        this.messageBuffer = [];
        fn(mutation);
      }
      return true;
    });
  }

  share(message) {
    const rawMessage = this.window.JSON.stringify(message);
    const messageParts = splitMessage(rawMessage);
    messageParts.forEach((m, idx) => {
      messageCounter += 1;
      const key = `${this.options.key}##${idx}`;
      this.storage.setItem(
        key,
        JSON.stringify({
          author: this.uniqueId,
          part: idx,
          total: messageParts.length,
          messagePart: m,
          messageCounter
        })
      );
      this.storage.removeItem(key);
    });
  }
}
