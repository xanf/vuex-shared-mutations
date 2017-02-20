# Change Log
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## [Unreleased]
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
