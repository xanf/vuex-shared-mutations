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
import createMutationsSharer from 'vuex-shared-mutations'

const store = new Vuex.Store({
  // ...
  plugins: [createMutationsSharer({ predicate: ['action1', 'action2'] })]
})
```

## API

### `createMutationsSharer([options])`

Creates a new instance of the plugin with the given options. The following options
can be provided to configure the plugin for your specific needs:

- `sharingKey <String>`: The key used to share actions via localStorage. (default: __vuex-mutations-sharer__)
- `predicate <Array | Function>`: Either an array of mutation types to be shared or predicate function, which accepts whole mutation object and returns `true` if this mutation should be shared.

## License

MIT © [Illya Klymov](https://github.com/xanf)
