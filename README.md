# ❄️ Crystallized

[![lit][lit]][lit-url]
[![npm][npm]][npm-url]
[![ruby2js][ruby2js]][ruby2js-url]
<br/>
[![bundlephobia][bundlephobia]][bundlephobia-url]
[![bundlephobia dependency count][bundlephobia-deps]][bundlephobia-url]
[![bundlephobia tree shaking][bundlephobia-shake]][bundlephobia-url]


**[Lit][lit-url]**: Simple. Fast. Web Components.

**Crystallized**: a collection of **Lit 2 enhancements**, starting with controllers inspired by [Stimulus](https://stimulusjs.org). Crystallized includes:

* [`DeclarativeActionsController`](https://github.com/whitefusionhq/crystalline-element#using-declarativeactionscontroller) - lets you add action attributes to elements in the light DOM as a way of providing declarative event handlers.

* `TargetsController` - lets you easily query child nodes in the light DOM using either selectors or explicit attribute-based identifies. _Docs coming soon!_

Crystallized uses Ruby 3 and [Ruby2JS][ruby2js-url] to compile its source code to modern ES6+ JavaScript ([example](https://unpkg.com/crystalline-element?module)). Crystallized can be used with _any modern JS bundler_ as well as directly in buildless HTML using `script type="module"`.

Lit along with Crystallized works great as a spice on top of server-rendered markup originating from backend frameworks like [Rails](https://rubyonrails.org) or static sites generators like [Bridgetown](https://www.bridgetownrb.com)—providing features not normally found in web component libraries that assume they're only concerned with client-rendered markup and event handling.

You can build an entire suite of reactive frontend components just with Lit/Crystallized, along with a general strategy to enhance your site with a variety of emerging [web components](https://github.com/topics/web-components) and component libraries ([Shoelace](https://shoelace.style) for example).

**NOTE:** this package is currently in the process of transitioning to `@crystallized/controllers`. All of the below information is deprecated. Please come back shortly for updated instructions!

----

## Installing

```sh
yarn add crystalline-element
```

or

```
npm i crystalline-element
```

## Using DeclarativeActionsController

[![Demo on CodePen](https://img.shields.io/badge/Demo%20Site-blue?style=for-the-badge&logo=codepen)](https://codepen.io/jaredcwhite/pen/ExWydPp)

It's very simple to add this controller to any Lit 2 component. First let's set up a new test component:

```js
import { LitElement, html } from "lit"
import { DeclarativeActionsController } from "crystalline-element/controllers"

class TestElement extends LitElement {
  actions = new DeclarativeActionsController(this)

  clickMe() {
    this.shadowRoot.querySelector("test-msg").textContent = "clicked!"
  }

  render() {
    return html`
      <slot></slot>
      <test-msg></test-msg>
    `
  }
}
customElements.define("test-element", TestElement)
```

You'll notice that currently nothing actually calls the `clickMe` method. Don't worry! We'll declaratively handle that in our regular HTML template:

```html
<test-element>
  <article>
    <button test-element-action="clickMe">Button</button>
  </article>
</test-element>
```

The tag name of the component (`text-element`) plus `action` sets up the event handler via an action attribute, with the method name `clickMe` being the value of the attribute. This is shorthand for `click->clickMe`. The controller defaults to `click` if no event type is specified (with a few exceptions, such as `submit` for forms and `input`  or `change` for various form controls).

Because `DeclarativeActionsController` uses a [MutationObserver](https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver) to keep an eye on HTML in the light DOM, at any time you can update the markup dynamically and actions will work as expected.

In addition, actions don't pass component boundaries. In other words, if you were to add a `test-element` inside of another `test-element`, the action within the nested `test-element` would only call the method for that nested component.

**Note:** actions are only detected within light DOM and do not traverse shadow trees of child components.

## Using CrystallineElement

[![Demo on CodePen](https://img.shields.io/badge/Demo%20Site-blue?style=for-the-badge&logo=codepen)](https://codepen.io/jaredcwhite/pen/yLJWRrq)

CrystallineElement is very easy to use. Simply import it, along with helpers from Lit directly, and you can start writing new web components.

_More documentation coming soon…_

### Ruby Example

```ruby
import [ CrystallineElement, crystallize ], from: "https://cdn.skypack.dev/crystalline-element"
import [ html, css ], from: "https://cdn.skypack.dev/lit"

class MyComponent < CrystallineElement
  property :name, String

  stylesheet css <<~CSS
    p {
      font-weight: bold;
    }
  CSS
 
  define "my-component" # always add below properties, stylesheets, etc.

  def render()
    html "<p>Hello World! Nice to meet you, #{self.name}</p>"
  end
end

class LightDomOnlyComponent < CrystallineElement
  define "light-dom-only", shadow_dom: false

  # ...
end

localVariable = "functional"

crystallize("functional-component", 
  properties: {
    greeting: { type: String }
  }
) do |comp|
  html <<~HTML
    <p>#{comp.greeting}, you can write "#{localVariable}" components with a handy shorthand!</p>
  HTML
end
```

### JavaScript Example

```js
import { CrystallineElement, crystallize } from "https://cdn.skypack.dev/crystalline-element"
import { html, css } from "https://cdn.skypack.dev/lit"

class MyComponent extends CrystallineElement {
  static get properties() {
    return {
      name: { type: String }
    }
  }

  static get styles() {
    return css`
      p {
        font-weight: bold;
      }
    `
  }

  render() {
    return html`<p>Hello World! Nice to meet you, ${this.name}</p>`
  }
}

MyComponent.define("my-component")

class LightDomOnlyComponent extends CrystallineElement {
  // ...
}

LightDomComponent.define("light-dom-only", { shadowDom: false })

const localVariable = "functional"

crystallize("functional-component", {
  properties: {
    greeting: { type: String }
  }
}, comp => html`
  <p>${comp.greeting}, you can write "${localVariable}" components with a handy shorthand!</p>
`)
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
