'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var DEFAULT_SHARING_KEY = 'vuex-mutations-sharer';
var DEFAULT_STORAGE_KEY = 'vuex-mutation-sharer-storage';

exports.default = function (_ref) {
  var predicate = _ref.predicate,
      sharingKey = _ref.sharingKey,
      storageKey = _ref.storageKey;
  return function (store) {
    if (typeof window === 'undefined' || !window.localStorage) {
      console.error('[vuex-shared-mutations] localStorage is not available. Disabling plugin');
      return;
    }

    if (typeof predicate !== 'function' && !Array.isArray(predicate)) {
      console.error('[vuex-shared-mutations] Predicate should be either array of mutation names or function. Disabling plugin');
      return;
    }

    try {
      window.localStorage.setItem('vuex-mutations-sharer__test', 'test');
      window.localStorage.removeItem('vuex-mutations-sharer__test');
    } catch (e) {
      console.error('[vuex-shared-mutations] Unable to use setItem on localStorage. Disabling plugin');
      return;
    }

    var committing = false;
    var key = sharingKey || DEFAULT_SHARING_KEY;
    var storageKeyEntry = storageKey || DEFAULT_STORAGE_KEY;

    var shouldShare = typeof predicate === 'function' ? predicate : function (mutation) {
      return predicate.indexOf(mutation.type) !== -1;
    };

    store.subscribe(function (mutation, state) {
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
          console.error('[vuex-shared-mutations] Unable to use setItem on localStorage');
          console.error(e);
        }
      }
    });

    window.addEventListener('storage', function (event) {
      if (!event.newValue) return;
      if (event.key !== key) return;

      try {
        var mutation = JSON.parse(window.localStorage.getItem(storageKeyEntry));
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
};

module.exports = exports['default'];
