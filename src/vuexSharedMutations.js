import createDefaultStrategy from "./strategies/defaultStrategy";

export {
  default as BroadcastChannelStrategy
} from "./strategies/broadcastChannel";
export { default as LocalStorageStratery } from "./strategies/localStorage";

export default ({ predicate, strategy, ...rest } = {}) => {
  /* istanbul ignore next: deprecation warning */
  if ("storageKey" in rest || "sharingKey" in rest) {
    window.console.warn(
      "Configuration directly on plugin was removed, configure specific strategies if needed"
    );
  }

  if (!Array.isArray(predicate) && typeof predicate !== "function") {
    throw new Error(
      "Either array of accepted mutations or predicate function must be supplied"
    );
  }

  const predicateFn =
    typeof predicate === "function"
      ? predicate
      : ({ type }) => predicate.indexOf(type) !== -1;

  let sharingInProgress = false;
  const selectedStrategy = strategy || createDefaultStrategy();
  return store => {
    store.subscribe((mutation, state) => {
      if (sharingInProgress) {
        return Promise.resolve(false);
      }

      return Promise.resolve(predicateFn(mutation, state)).then(shouldShare => {
        if (!shouldShare) {
          return;
        }
        selectedStrategy.share(mutation);
      });
    });

    selectedStrategy.addEventListener(mutation => {
      try {
        sharingInProgress = true;
        store.commit(mutation.type, mutation.payload);
      } finally {
        sharingInProgress = false;
      }
      return "done";
    });
  };
};
