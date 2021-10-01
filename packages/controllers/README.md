# ❄️ Crystallized Controllers (for Lit 2)

[![lit][lit]][lit-url]
[![npm][npm]][npm-url]
[![ruby2js][ruby2js]][ruby2js-url]
<br/>
[![bundlephobia][bundlephobia]][bundlephobia-url]
[![bundlephobia dependency count][bundlephobia-deps]][bundlephobia-url]
[![bundlephobia tree shaking][bundlephobia-shake]][bundlephobia-url]

**[Lit][lit-url]** gives you a simple toolkit for building fast, reactive web components. You can enhance your Lit components with controllers. This package provides:

* [`DeclarativeActionsController`](https://github.com/whitefusionhq/crystalline-element#using-declarativeactionscontroller) - lets you add action attributes to elements in the light DOM as a way of providing declarative event handlers.

* `TargetsController` - lets you easily query child nodes in the light DOM using either selectors or explicit attribute-based identifies. _Docs coming soon!_

----

## Installing

```sh
yarn add @crystallized/controllers
```

or

```
npm i @crystallized/controllers
```

----

## Building Source with Ruby2JS

Requires Ruby 3.0. A Ruby version manager like `rbenv` is recommended. Run `bundle install` to set up the Ruby gems.

Run `yarn build` (which gets run by the `test` and `release` script automatically) to transpile the Ruby `src` files to the JS `dist` folder.

## Testing

Crystalline uses the [Modern Web Test Runner](https://modern-web.dev/guides/test-runner/getting-started/) and [helpers from Open WC](https://open-wc.org/docs/testing/testing-package/) for its test suite.

Run `yarn test` to run the test suite.

## Contributing

1. Fork it (https://github.com/whitefusionhq/crystallized/fork)
2. Create your feature branch (`git checkout -b my-new-feature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin my-new-feature`)
5. Create a new Pull Request

## License

MIT

[lit]: https://img.shields.io/badge/-Lit-324FFF?style=for-the-badge&logo=lit&logoColor=white"
[lit-url]: https://lit.dev
[npm]: https://img.shields.io/npm/v/crystalline-element.svg?style=for-the-badge
[npm-url]: https://npmjs.com/package/crystalline-element
[ruby2js]: https://img.shields.io/badge/Ruby2JS-darkred?style=for-the-badge&logo=ruby
[ruby2js-url]: https://www.ruby2js.com
[bundlephobia]: https://badgen.net/bundlephobia/minzip/crystalline-element
[bundlephobia-deps]: https://badgen.net/bundlephobia/dependency-count/crystalline-element
[bundlephobia-shake]: https://badgen.net/bundlephobia/tree-shaking/crystalline-element
[bundlephobia-url]: https://bundlephobia.com/result?p=crystalline-element
