# vuex-shared-mutations

Share certain [Vuex](http://vuex.vuejs.org/) mutations across multiple tabs/windows. [![NPM version](https://img.shields.io/npm/v/vuex-shared-mutations.svg?style=flat-square)](https://www.npmjs.com/package/vuex-shared-mutations) [![Build Status](https://img.shields.io/travis/xanf/vuex-shared-mutations.svg?style=flat-square)](https://travis-ci.org/xanf/vuex-shared-mutations) [![BrowserStack Status](https://www.browserstack.com/automate/badge.svg?badge_key=eDZyK0F0MlE1RzJuRHJHYVZLYWJIZ0JWdnNxdDM0M256dm1DMVBSVUd5bz0tLUhYN3FteXkvaDROSmtSbmZZREFiYnc9PQ==--9fd2deea21df436f47ded98bcd65032e88012900)](https://www.browserstack.com/automate/public-build/eDZyK0F0MlE1RzJuRHJHYVZLYWJIZ0JWdnNxdDM0M256dm1DMVBSVUd5bz0tLUhYN3FteXkvaDROSmtSbmZZREFiYnc9PQ==--9fd2deea21df436f47ded98bcd65032e88012900)

- [Basic example](https://qk441m1kmq.codesandbox.io/)
- [Nuxt example](https://98qn583znp.sse.codesandbox.io/)

## Installation

```bash
$ npm install vuex-shared-mutations
```

## Usage

```js
import createMutationsSharer from "vuex-shared-mutations";

const store = new Vuex.Store({
  // ...
  plugins: [createMutationsSharer({ predicate: ["mutation1", "mutation2"] })]
});
```

Same as:

```js
import createMutationsSharer from "vuex-shared-mutations";

const store = new Vuex.Store({
  // ...
  plugins: [
    createMutationsSharer({
      predicate: (mutation, state) => {
        const predicate = ["mutation1", "mutation2"];
        // Conditionally trigger other plugins subscription event here to
        // have them called only once (in the tab where the commit happened)
        // ie. save certain values to localStorage
        // pluginStateChanged(mutation, state)
        return predicate.indexOf(mutation.type) >= 0;
      }
    })
  ]
});
```

## API

### `createMutationsSharer([options])`

Creates a new instance of the plugin with the given options. The following options
can be provided to configure the plugin for your specific needs:

- `predicate <Array<string> | (mutation: { type: string, payload: any }, state: any) => boolean>`: Either an array of mutation types to be shared or predicate function, which accepts whole mutation object (and state) and returns `true` if this mutation should be shared.
- `strategy: { addEventListener: (fn: function) => any, share(any) => any }` - strategy is an object which provides two functions:
  - `addEventListener` - plugin will subscribe to changes events using this function
  - `share` - plugin will call this function when data should be shared

## How it works

Initially, this plugin started as a small plugin to share data between tabs using `localStorage`. But several inconsistencies in Internet Explorer lead to entire plugin rewrite and now it is not tied to localStorage anymore
If you do not supply strategy system will use [BroadcastChannel](https://developer.mozilla.org/en-US/docs/Web/API/BroadcastChannel) if available and downgrade to localStorage if it fails.

If you need to configure strategies you can do that by hand, for example:

```
import createMutationsSharer, { BroadcastStrategy } from 'vuex-shared-mutations';

const store = new Vuex.Store({
  // ...
  plugins: [
    createMutationsSharer({
      predicate: ['m-1'],
      strategy: new BroadcastStrategy({ key: 'CHANNEL_NAME' })
    }),
  ],
});
```

Options accepted by `BroadcastStrategy`: - `key: string` - channel name, using for sharing

Options accepted by `LocalStorageStrategy`: - `key: string` - key, used in localStorage (default: 'vuex-shared-mutations') - `maxMessageLength: number` - In some browsers (hello, Internet Explorer), when you're setting big payload on localStorage, "storage" event is not triggered. This strategy bypasses it by splitting message in chunk. If you do not need to support old browsers, you can increase this number (default: 4096)

## Contributing

- Fork
- `> git clone`
- `> npm install`
- Make your changes
- `> npm run test` (assuming you have Chrome installed in your system)
- `> npm run lint`
- If everything is passing: - Update CHANGELOG.md - Commit and Make a pull request

## License

MIT © [Illya Klymov](https://github.com/xanf)
