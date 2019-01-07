'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var DEFAULT_SHARING_KEY = 'vuex-mutations-sharer';
var DEFAULT_STORAGE_KEY = 'vuex-mutation-sharer-storage';

exports.default = function (_ref) {
  var predicate = _ref.predicate,
      _ref$sharingKey = _ref.sharingKey,
      sharingKey = _ref$sharingKey === undefined ? DEFAULT_SHARING_KEY : _ref$sharingKey,
      _ref$storageKey = _ref.storageKey,
      storageKey = _ref$storageKey === undefined ? DEFAULT_STORAGE_KEY : _ref$storageKey,
      _ref$timeout = _ref.timeout,
      timeout = _ref$timeout === undefined ? 0 : _ref$timeout;
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
          window.localStorage.setItem(storageKey, JSON.stringify(mutation));
          window.localStorage.setItem(sharingKey, 'notification-' + Date.now());
          if (timeout) {
            setTimeout(function () {
              window.localStorage.removeItem(sharingKey);
              window.localStorage.removeItem(storageKey);
            }, timeout);
          }
        } catch (e) {
          console.error('[vuex-shared-mutations] Unable to use setItem on localStorage');
          console.error(e);
        }
      }
    });

    window.addEventListener('storage', function (event) {
      if (!event.newValue) return;
      if (event.key !== sharingKey) return;

      try {
        var mutation = JSON.parse(window.localStorage.getItem(storageKey));
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
