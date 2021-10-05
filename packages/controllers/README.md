# ❄️ Crystallized Controllers (for Lit 2)

[![lit][lit]][lit-url]
[![npm][npm]][npm-url]
[![ruby2js][ruby2js]][ruby2js-url]
<br/>
[![bundlephobia][bundlephobia]][bundlephobia-url]
[![bundlephobia dependency count][bundlephobia-deps]][bundlephobia-url]
[![bundlephobia tree shaking][bundlephobia-shake]][bundlephobia-url]

**[Lit][lit-url]** gives you a simple toolkit for building fast, reactive web components. You can enhance your Lit components with controllers. This package, as part of the [Crystallized](https://github.com/whitefusionhq/crystallized) project, provides:

* [`DeclarativeActionsController`](https://github.com/whitefusionhq/crystallized/tree/main/packages/controllers#using-declarativeactionscontroller) - lets you add action attributes to elements in the light DOM as a way of providing declarative event handlers.

* [`TargetsController`](https://github.com/whitefusionhq/crystallized/tree/main/packages/controllers#using-targetscontroller) - lets you easily query child nodes in the light DOM using either selectors or explicit attribute-based identifiers.

----

## Installing

```sh
yarn add @crystallized/controllers
```

or

```
npm i @crystallized/controllers
```

## Using DeclarativeActionsController

It's very simple to add this controller to any Lit 2 component. First let's set up a new test component:

```js
import { LitElement, html } from "lit"
import { DeclarativeActionsController } from "@crystallized/controllers"

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

The tag name of the component (aka `test-element`) plus `action` sets up the event handler via an action attribute, with the method name `clickMe` being the value of the attribute. This is shorthand for `click->clickMe`. The controller defaults to `click` if no event type is specified (with a few exceptions, such as `submit` for forms and `input`  or `change` for various form controls).

Because `DeclarativeActionsController` uses a [MutationObserver](https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver) to keep an eye on HTML in the light DOM, at any time you can update the markup dynamically and actions will work as expected.

In addition, _actions don't pass component boundaries_. In other words, if you were to add a `test-element` inside of another `test-element`, the action within the nested `test-element` would only call the method for that nested component.

**Note:** actions are only detected within light DOM and do not traverse shadow trees of child components.

## Using TargetsController

A target is a specific element, or elements, in your light DOM you would like to access from your component. Like actions, you can specify targets using special HTML attributes. However, you can also target any element directly regardless of markup by using a selector.

To use attributed targets, use the tag name of the component (aka `test-element`) plus `target`, and include an identifier as the attribute value. Then in your targets configuration, you can use the same identifier as the key along with `@` as the value. So for `test-element-target="message"`, you'll add `message: "@"` to the targets config, which then allows you to access the target via `this.message` in your component.

You can also use a different key than the identifier. For example, `test-element-target="thumbnail"` and a config of `thumbnailImage: "@thumbnail"` would allow `this.thumbnailImage` to accesss the `thumbnail` target.

In addition, you can use a CSS-style selector instead. A config of `titleHeading: "h1.title"` would allow `this.titleHeading` to access the first `h1` tag with a `title` class.

In any case where a matching tag isn't available, you'll get a `null` return value.

You can also choose to access multiple matching elements for a target. Simply enclose the identifier/selector in an array within your targets config. So `paragraphs: ["p"]` would return an array of paragraph tags. If nothing matches, you'll receive an empty array.

Here's an example of several target types in action:

```js
import { LitElement, html } from "lit"
import { TargetsController } from "@crystallized/controllers"

class TestElement extends LitElement {
  targets = new TargetsController(this)

  static get targets() {
    return {
      message: "@",
      dupMessage: "@message",
      extra: ["p.extra"]
    }
  }

  clickMe() {
    this.shadowRoot.querySelector("test-msg").textContent = this.message.textContent + this.dupMessage.textContent + this.extra[0].textContent
  }

  render() {
    return html`
      <slot></slot>
      <test-msg></test-msg>
      <button @click=${this.clickMe}>Click Me</button>
    `
  }
}
customElements.define("test-element", TestElement)
```

```html
<test-element>
  <source-message test-element-target="message">clicked!</source-message>
  <p class="extra">howdy</p>
</test-element>
```

In this example, if you click the component's button labeled "Click Me", it will access the `message` target, the `dupMessage` target (which actually happens to reference the same element), and the first element in the `extra` array, and concatenate all text content together to insert `clicked!clicked!howdy` into the `test-msg` element.

Like with actions, targets don't cross component boundaries. So if you nest Tag B inside of Tag A and they're the same component tag, any targets you try to access in Tag A's code will not be contained within Tag B.

### Using with TypeScript

While this project wasn't specifically built with TypeScript in mind, it's very easy to set up your TS project to support targets. (There's nothing necessary to set up for actions since they're entirely declarative and HTML-driven.)

First, in a `types.d.ts` file or something to that effect, add:

```
declare module '@crystallized/controllers';
```

Next, you'll want to add additional types to your Lit element class underneath the `targets` configuration. For example:

```js
  static targets = {
    message: "@"
  }

  message?: HTMLElement;
```

If you want to get more specific about the target element type, just specify the appropriate DOM class name. For example:

```js
  static targets = {
    namefield: "@",
    textareas: ["textarea"]
  }

  namefield?: HTMLInputElement; // single element
  textareas?: HTMLTextAreaElement[]; // array of elements
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
[npm]: https://img.shields.io/npm/v/@crystallized/controllers.svg?style=for-the-badge
[npm-url]: https://npmjs.com/package/@crystallized/controllers
[ruby2js]: https://img.shields.io/badge/Ruby2JS-darkred?style=for-the-badge&logo=ruby
[ruby2js-url]: https://www.ruby2js.com
[bundlephobia]: https://badgen.net/bundlephobia/minzip/@crystallized/controllers
[bundlephobia-deps]: https://badgen.net/bundlephobia/dependency-count/@crystallized/controllers
[bundlephobia-shake]: https://badgen.net/bundlephobia/tree-shaking/@crystallized/controllers
[bundlephobia-url]: https://bundlephobia.com/result?p=@crystallized/controllers
