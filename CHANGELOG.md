# Changelog

## [2.11.0](https://github.com/tokens-bruecke/figma-plugin/compare/v2.10.0...v2.11.0) (2026-03-28)

### Features

- **cli:** add `--oauth-token` flag to support OAuth authentication ([#65](https://github.com/tokens-bruecke/figma-plugin/issues/65))

## [2.9.4](https://github.com/tokens-bruecke/figma-plugin/compare/v2.9.3...v2.9.4) (2026-01-13)

### Bug Fixes

- hardcoded style colors into variables ([403c4a5](https://github.com/tokens-bruecke/figma-plugin/commit/403c4a582da3cd7f1d3a4af3654660b84275c9dc))

## [2.9.3](https://github.com/tokens-bruecke/figma-plugin/compare/v2.9.2...v2.9.3) (2025-12-06)

### Bug Fixes

- Remove pnpm version and install options in release workflow ([62ea535](https://github.com/tokens-bruecke/figma-plugin/commit/62ea535c12639ab21b056eb08209fa1115d33920))

## [2.9.2](https://github.com/tokens-bruecke/figma-plugin/compare/v2.9.1...v2.9.2) (2025-12-06)

### Bug Fixes

- Add zip existence check and force artifact upload ([f9d9b4b](https://github.com/tokens-bruecke/figma-plugin/commit/f9d9b4b8aa7b79cb858140fc0fed2e24eca1faca))

## [2.9.1](https://github.com/tokens-bruecke/figma-plugin/compare/v2.9.0...v2.9.1) (2025-12-06)

### Bug Fixes

- Add Release Please configuration files ([dcedd19](https://github.com/tokens-bruecke/figma-plugin/commit/dcedd19dc186bb97bb770af7701be5c8f821f861))

## [2.7.0](https://github.com/tokens-bruecke/figma-plugin/compare/v2.6.2...v2.7.0) (2025-09-21)

### Features

- Add direct new GitHub token URL with "repo" scope ([f2f68f9](https://github.com/tokens-bruecke/figma-plugin/commit/f2f68f91bb20ded52cb193391bf4eeaca0e6d303))
- Add direct new GitHub token URL with "repo" scope ([aea4d98](https://github.com/tokens-bruecke/figma-plugin/commit/aea4d983b99892f28040b919bc79b161fe4e4aa2))

### Bug Fixes

- file path must be URL-encoded for Gitlab API ([369d43f](https://github.com/tokens-bruecke/figma-plugin/commit/369d43fd01d04ea44a810ebcada07a97c5924072))
- URL encode file path for Gitlab API ([6a590b1](https://github.com/tokens-bruecke/figma-plugin/commit/6a590b15966d4b4188d210d6d8a7dcd4ab07884f))

## [2.6.2](https://github.com/tokens-bruecke/figma-plugin/compare/v2.6.1...v2.6.2) (2025-06-01)

### Bug Fixes

- prettier and file formatting ([43bbca5](https://github.com/tokens-bruecke/figma-plugin/commit/43bbca5a922a2d5653704c56b0c2d6e1060855d2))

## [2.6.1](https://github.com/tokens-bruecke/figma-plugin/compare/v2.6.0...v2.6.1) (2025-04-17)

### Bug Fixes

- handle font style value ([77db500](https://github.com/tokens-bruecke/figma-plugin/commit/77db5001285c9bbee3870f88fb0cb77502f3599a))
- handle font style value ([7b284d6](https://github.com/tokens-bruecke/figma-plugin/commit/7b284d6239bb7f0bf7f9283667e38020ecd523db))
- handle font weight value ([5ff1181](https://github.com/tokens-bruecke/figma-plugin/commit/5ff1181d088d01c9dc64338dd610d3ac745d8d90))

## [2.6.0](https://github.com/tokens-bruecke/figma-plugin/compare/2.5.0...v2.6.0) (2025-04-11)

### Bug Fixes

- fix warning about passing float to figma.ui.resize ([3c5702d](https://github.com/tokens-bruecke/figma-plugin/commit/3c5702d253d402f8c0e7b19ea26a4c44b5e59c75))

### Miscellaneous Chores

- release 2.6.0 ([cf525b1](https://github.com/tokens-bruecke/figma-plugin/commit/cf525b148f465bd109fa5f7c73c891a45acc1115))

## 2.5.0

- [Introduce CLI Based tool that uses Figma Rest API](https://github.com/tokens-bruecke/figma-plugin/pull/33) _by [Sylvain Marcadal](https://github.com/r1m)_ (not yet published to NPM)
- [Fix: support font style strings like "Semi Bold"](https://github.com/tokens-bruecke/figma-plugin/pull/36) _by [Peter Lazar](peterlazar1993)_
- [Fix: precision errors for floats](https://github.com/tokens-bruecke/figma-plugin/pull/37) _by [Peter Lazar](peterlazar1993)_

## 2.4.0

- [Add font style support for italic](https://github.com/tokens-bruecke/figma-plugin/pull/35) _by [Sylvain Marcadal](https://github.com/r1m)_
- [Add support for selfhosted gitlab](https://github.com/tokens-bruecke/figma-plugin/pull/34) _by [Sylvain Marcadal](https://github.com/r1m)_

## 2.3.1

- [Fixes dimension type for vars with single scope](https://github.com/tokens-bruecke/figma-plugin/pull/31)

## 2.3.0

- Added `codeSyntax` property to variables. See this PR — [include variable's "codeSyntax" property in exported token json](https://github.com/tokens-bruecke/figma-plugin/pull/28)

## 2.2.3

- Convert `OPACITY` scope to valid value using this formula `value / 100`.

## 2.2.2

- Do not convert the value to PX units if the variable scope is `FONT_WEIGHT`

## 2.2.1

- Added `paragraphSpacing` and `paragraphIndent` to the typography styles

## 2.2.0

- Added aliases handling for typography styles — [Related issue](https://github.com/tokens-bruecke/figma-plugin/issues/24)
- Added aliases handling for effects

## 2.1.4 and 2.1.5

- Fix wrong font weight output. Related PR — [Right the heuristic wrongs](https://github.com/tokens-bruecke/figma-plugin/pull/20). _by [@JeroenRoodIHS](https://github.com/JeroenRoodIHS)_

## 2.1.3

- Fixed font weights to be numbers. Related PR — [Font weights fix - output as numbers (DTCG format)](https://github.com/tokens-bruecke/figma-plugin/pull/22)

## 2.1.2

- Updated the function to generate text styles. Related PR — [Update textStylesToTokens.ts ](https://github.com/tokens-bruecke/figma-plugin/pull/19)

## 2.1.1

- `$meta` tag moved to `$extensions` object. See issue — [$meta is not valid DTCG](https://github.com/tokens-bruecke/figma-plugin/issues/13)

## 2.1.0

- Multiple `Shadow` and `Blur` styles support added. [Link to the PR](https://github.com/tokens-bruecke/figma-plugin/issues/11)

## 2.0.0

- tokens structure was changed. All modes now moved from variable names into `$extensions/modes` object. In order to make it work with [Cobalt](https://cobalt-ui.pages.dev/guides/modes#with-modes). For morre details see this issue — [Multiple collection and modes](https://github.com/tokens-bruecke/figma-plugin/issues/7). Previous implementation didn't work correctly with multiple modes and aliasees.

## 1.6.0

- `value` string for aliases is now optional

## 1.5.0

- Added `GitHub PR` option to the `Push to server` feature
- `Connect server` renamed to `Push to server`
- _Thanks for contribution to [@distolma](https://github.com/distolma)_

## 1.4.0

- Added `warning` type to the `Toast` component
- structure refactoring
- code refactoring
- updated `Github` errors handling
- added `value` to all aliases at the end of the path. Also support for `DTCG` keys format added
- added storage versioning
- updated DTCG format switching
- added `Copy` button for the tokens preview

## 1.3.0

- Functions names refactoring

## 1.2.0

- Updated method to check `VARIABLE_ALIAS` in `normalizeValue` function
- Handle aliases from another files
- Removed the property `aliasPath` from `$extensions` object, since it's not needed anymore

## 1.1.1

- Updated errors handling for GitHub server

## 1.1.0

- `Update` button animation added
- added token types as a separate package

## 1.0.9

- Fixed `line-height` value conversion. It wasn't rounded to the nearest integer.

## 1.0.8

- Fix for [Reference tokens auto-referencing themselves in the exported JSON](https://github.com/PavelLaptev/tokens-bruecke/issues/1)

## 1.0.7

- Code cleanup

## 1.0.6

- WIP [Reference tokens auto-referencing themselves in the exported JSON](https://github.com/PavelLaptev/tokens-bruecke/issues/1)

## 1.0.5

- Allowed to use plugin in files without variables

## 1.0.4

- Fix scopes conversion
- `$meta` info adding order fixed

## 1.0.3

- HEX color fixed
- Alias variables fixed

## 1.0.2

- Fixed RGBA to HEXA conversion
- Added color styles support
- Added basic support for linear and radial gradients

## 1.0.1

- Fixed Aliases handling. Removed `mode` from the alias string if there is only one mode in the collection.

## 1.0.0

- Initial release
