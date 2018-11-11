# vuex-shared-mutations

Share certain [Vuex](http://vuex.vuejs.org/) mutations across multiple tabs/windows using [localStorage](https://developer.mozilla.org/nl/docs/Web/API/Window/localStorage).

[![NPM version](https://img.shields.io/npm/v/vuex-shared-mutations.svg?style=flat-square)](https://www.npmjs.com/package/vuex-shared-mutations)
[![Build Status](https://img.shields.io/travis/xanf/vuex-shared-mutations.svg?style=flat-square)](https://travis-ci.org/xanf/vuex-shared-mutations)

## Installation

```bash
$ npm install vuex-shared-mutations
```

## Usage

```js
import createMutationsSharer from 'vuex-shared-mutations';

const store = new Vuex.Store({
  // ...
  plugins: [createMutationsSharer({ predicate: ['mutation1', 'mutation2'] })],
});
```

Same as:

```js
import createMutationsSharer from 'vuex-shared-mutations';

const store = new Vuex.Store({
  // ...
  plugins: [
    createMutationsSharer({
      predicate: (mutation, state) => {
        const predicate = ['mutation1', 'mutation2'];

        // Conditionally trigger other plugins subscription event here to
        // have them called only once (in the tab where the commit happened)
        // ie. save certain values to localStorage
        // pluginStateChanged(mutation, state)

        return predicate.indexOf(mutation.type) >= 0;
      },
    }),
  ],
});
```

## API

### `createMutationsSharer([options])`

Creates a new instance of the plugin with the given options. The following options
can be provided to configure the plugin for your specific needs:

- `sharingKey <String>`: The key used to share actions via localStorage. (default: **vuex-mutations-sharer**)
- `storageKey <String>`: The key used to store real action payload via localStorage. (default: **vuex-mutation-sharer-storage**)
- `predicate <Array | Function>`: Either an array of mutation types to be shared or predicate function, which accepts whole mutation object (and state) and returns `true` if this mutation should be shared.

## How it works

When `$store.commit` is called, the plugin is invoked and saves the mutation object to localStorage. This triggers an `storage` event in all other tabs/windows (in the same browser, with the same site domain loaded), which then replays the mutation in that tab/window (during which the sync is turned off to disable recursion).

## Contributing

- Fork
- `> git clone`
- `> yarn` (like npm install)
- `> yarn global add ava` (test runner)
- Make your changes to `src/index.js`
- `> npm run test`
- `> npm run lint`
- If everything is passing: - Update CHANGELOG.md - Commit and Make a pull request

## License

MIT © [Illya Klymov](https://github.com/xanf)
