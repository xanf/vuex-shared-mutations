const DEFAULT_SHARING_KEY = 'vuex-mutations-sharer';

export default ({ predicate, sharingKey }) => store => {
  if (typeof window === 'undefined' || !window.localStorage) {
    console.error('[vuex-shared-mutations] localStorage is not available. Disabling plugin');
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

  const shouldShare = typeof predicate === 'function'
    ? predicate
    : mutation => predicate.indexOf(mutation.type) !== -1;

  store.subscribe(mutation => {
    if (committing) return;
    if (shouldShare(mutation)) {
      try {
        window.localStorage.setItem(key, JSON.stringify(mutation));
        window.localStorage.removeItem(key);
      } catch (e) {
        console.error('[vuex-shared-mutations] Unable to use setItem on localStorage');
        console.error(e);
      }
    }
  });

  window.addEventListener('storage', event => {
    if (event.newValue === null) return;
    if (event.key !== key) return;

    try {
      const mutation = JSON.parse(event.newValue);
      committing = true;
      store.commit(mutation.type, mutation.payload);
    } catch (error) {
      console.error('[vuex-shared-mutations] Unable to parse shared mutation data');
      console.error(event.newValue, error);
    } finally {
      committing = false;
    }
  });
};
