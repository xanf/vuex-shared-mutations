const DEFAULT_SHARING_KEY = 'vuex-mutations-sharer';
const DEFAULT_STORAGE_KEY = 'vuex-mutation-sharer-storage';

export default ({ predicate, sharingKey, storageKey }) => store => {
  if (typeof window === 'undefined' || !window.localStorage) {
    console.error(
      '[vuex-shared-mutations] localStorage is not available. Disabling plugin',
    );
    return;
  }

  if (typeof predicate !== 'function' && !Array.isArray(predicate)) {
    console.error(
      '[vuex-shared-mutations] Predicate should be either array of mutation names or function. Disabling plugin',
    );
    return;
  }

  try {
    window.localStorage.setItem('vuex-mutations-sharer__test', 'test');
    window.localStorage.removeItem('vuex-mutations-sharer__test');
  } catch (e) {
    console.error(
      '[vuex-shared-mutations] Unable to use setItem on localStorage. Disabling plugin',
    );
    return;
  }

  let committing = false;
  const key = sharingKey || DEFAULT_SHARING_KEY;
  const storageKeyEntry = storageKey || DEFAULT_STORAGE_KEY;

  const shouldShare =
    typeof predicate === 'function'
      ? predicate
      : mutation => predicate.indexOf(mutation.type) !== -1;

  store.subscribe((mutation, state) => {
    if (committing) return;
    if (shouldShare(mutation, state)) {
      try {
        // IE11 does not produce storage event in case of big payload
        // We are hacking around this by using two entries - one to actually
        // store relevant data - and one for notifications
        window.localStorage.setItem(storageKeyEntry, JSON.stringify(mutation));
        window.localStorage.setItem(key, 'notification');
        window.localStorage.removeItem(key);
        window.localStorage.removeItem(storageKeyEntry);
      } catch (e) {
        console.error(
          '[vuex-shared-mutations] Unable to use setItem on localStorage',
        );
        console.error(e);
      }
    }
  });

  window.addEventListener('storage', event => {
    if (!event.newValue) return;
    if (event.key !== storageKeyEntry) return;

    try {
      const mutation = JSON.parse(event.newValue);
      committing = true;
      store.commit(mutation.type, mutation.payload);
    } catch (error) {
      console.error(
        '[vuex-shared-mutations] Unable to parse shared mutation data',
      );
      console.error(event.newValue, error);
    } finally {
      committing = false;
    }
  });
};
