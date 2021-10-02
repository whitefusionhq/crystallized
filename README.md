# ❄️ Crystallized

[![lit][lit]][lit-url]
[![ruby2js][ruby2js]][ruby2js-url]


**[Lit][lit-url]**: Simple. Fast. Web Components.

**Crystallized**: a collection of **Lit 2 enhancements**, starting with [controllers]((https://github.com/whitefusionhq/crystallized/tree/main/packages/controllers)) inspired by [Stimulus](https://stimulusjs.org). Crystallized includes:

* `DeclarativeActionsController` - lets you add action attributes to elements in the light DOM as a way of providing declarative event handlers.

* `TargetsController` - lets you easily query child nodes in the light DOM using either selectors or explicit attribute-based identifies.

Crystallized uses Ruby 3 and [Ruby2JS][ruby2js-url] to compile its source code to modern ES6+ JavaScript. Crystallized can be used with _any modern JS bundler_ as well as directly in buildless HTML using `script type="module"`.

Lit along with Crystallized works great as a spice on top of server-rendered markup originating from backend frameworks like [Rails](https://rubyonrails.org) or static sites generators like [Bridgetown](https://www.bridgetownrb.com)—providing features not normally found in web component libraries that assume they're only concerned with client-rendered markup and event handling.

You can build an entire suite of reactive frontend components just with Lit/Crystallized, along with a general strategy to enhance your site with a variety of emerging [web components](https://github.com/topics/web-components) and component libraries ([Shoelace](https://shoelace.style) for example).

## Installation & Usage

**[Documentation on using Crystallized's Lit 2 controllers here.](https://github.com/whitefusionhq/crystallized/tree/main/packages/controllers)**

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
[ruby2js]: https://img.shields.io/badge/Ruby2JS-darkred?style=for-the-badge&logo=ruby
[ruby2js-url]: https://www.ruby2js.com
