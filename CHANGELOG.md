# Change Log

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## [0.0.7 - 2019-01-07]

- Proper build of 0.0.6, no major changes

## [0.0.6 - 2019-01-07]

### Fixed

- Issue introduced in 0.0.5 when plugin failed to work in Chrome due to concurrency issues (#13)

## [0.0.5 - 2018-11-11]

Thanks to [@jameswragg](https://github.com/jameswragg) and [@justin-schroeder](https://github.com/justin-schroeder) for this version

### Fixed

- IE11 is not triggering storage events if payload is bigger than 16kb

## [0.0.4 - 2018-06-22]

Credits to [@qkdreyer ](https://github.com/qkdreyer) for this version

### Fixed

- Bump vuex peer dependency

## [0.0.3 - 2017-02-20]

Credits to [@LeonardPauli](https://github.com/LeonardPauli) for this version

### Fixed

- Repeating the same mutation would previously only have shared the first commit

### Added

- Readme section "Contributing"
- Readme section "How it works"
- Readme predicate function usage example
- Passing `state` to predicate function allows for invoking other plugins in the predicate

## [0.0.2] - 2017-02-01

### Added

- Print error and fail early if localStorage.setItem throws an error

### Changed

- Print error instead of crashing when window is not available (SSR)

### Changed

- Properly report plugin name in error messages

## 0.0.1 - 2017-01-31

Initial release

[0.0.2]: https://github.com/xanf/vuex-shared-mutations/compare/v0.0.1...v0.0.2
