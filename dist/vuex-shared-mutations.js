'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var DEFAULT_SHARING_KEY = 'vuex-mutations-sharer';

exports.default = function (_ref) {
  var predicate = _ref.predicate,
      sharingKey = _ref.sharingKey;
  return function (store) {
    if (!window || !window.localStorage) {
      console.error('[vuex-action-sharer] localStorage is not available. Disabling plugin');
      return;
    }

    if (typeof predicate !== 'function' && !Array.isArray(predicate)) {
      console.error('[vuex-action-sharer] Predicate should be either array of mutation names or function. Disabling plugin');
      return;
    }

    var committing = false;
    var key = sharingKey || DEFAULT_SHARING_KEY;

    var shouldShare = typeof predicate === 'function' ? predicate : function (mutation) {
      return predicate.includes(mutation.type);
    };

    store.subscribe(function (mutation) {
      if (committing) return;
      if (shouldShare(mutation)) {
        try {
          window.localStorage.setItem(key, JSON.stringify(mutation));
        } catch (e) {
          console.error('[vuex-action-sharer] Unable to use setItem on localStorage');
          console.error(e);
        }
      }
    });

    window.addEventListener('storage', function (event) {
      if (event.key === key) {
        try {
          var mutation = JSON.parse(event.newValue);
          committing = true;
          store.commit(mutation.type, mutation.payload);
        } catch (error) {
          console.error('[vuex-action-sharer] Unable to parse shared mutation data');
          console.error(event.newValue, error);
        } finally {
          committing = false;
        }
      }
    });
  };
};

module.exports = exports['default'];
