# ❄️ Crystallized: Controllers for Web Components

[![npm][npm]][npm-url]

This package, as part of the [Crystallized](https://github.com/whitefusionhq/crystallized) project, provides:

* [`DeclarativeActionsController`](https://github.com/whitefusionhq/crystallized/tree/main/packages/controllers#using-declarativeactionscontroller) - lets you add action attributes to elements as a way of providing declarative event handlers.

* [`TargetsController`](https://github.com/whitefusionhq/crystallized/tree/main/packages/controllers#using-targetscontroller) - lets you easily query child nodes in the DOM using either selectors or explicit attribute-based identifiers.

You can use **[Lit][lit-url]** (a library for building fast, reactive web components) along with these controllers, or you can build your own "vanilla" web components and enhance them with the full suite of Crystallized utilities. The entire library is under 7KB (before compression!) and has no dependencies.

----

## Installing

```
npm i @crystallized/controllers
```

or

```sh
yarn add @crystallized/controllers
```

## Adding Controller support to HTMLElement

(Skip this section if you're using Lit)

Crystallized functionality is added to custom elements via controllers, [a concept pioneered by Lit](https://lit.dev/docs/api/controllers/). To support using controllers with vanilla HTML elements, simply use the `Controllable` mixin:

```js
import { Controllable } from "@crystallized/controllers"

class MyElement extends Controllable(HTMLElement) {

}
```

## Using DeclarativeActionsController

### Lit

It's very simple to add this controller to any Lit v2+ component. Let's set up a new test component:

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

Because `DeclarativeActionsController` uses a [MutationObserver](https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver) to keep an eye on HTML in the DOM, at any time you can update the markup dynamically and actions will work as expected.

In addition, _actions don't pass component boundaries_. In other words, if you were to add a `test-element` inside of another `test-element`, the action within the nested `test-element` would only call the method for that nested component.

### Vanilla JS

Using the controller with a vanilla web component is just as straightforward as with Lit:

```js
import { Controllable } from "@crystallized/controllers"

const template = Object.assign(document.createElement("template"), {
  innerHTML: `
    <slot></slot>
    <test-msg></test-msg>
  `
})

class TestElement extends Controllable(HTMLElement) {
  actions = new DeclarativeActionsController(this)

  constructor() {
    super()

    if (!this.shadowRoot) {
      this.attachShadow({ mode: "open" }).appendChild(template.content.cloneNode(true))
    }
  }

  clickMe() {
    this.shadowRoot.querySelector("test-msg").textContent = "clicked!"
  }
}
customElements.define("test-element", TestElement)
```

### Discovering Actions within the Shadow DOM

By default, actions are only detected within "light DOM" and do not pierce the shadow DOM. To enable using actions within your component's shadow root (useful when you're not using a Lit template), create another controller and use the `shadow: true` option.

```js
actions = new DeclarativeActionsController(this)
shadowActions = new DeclarativeActionsController(this, { shadow: true })
```

## Using TargetsController

A target is a specific element, or elements, in your DOM you would like to access from your component. Like actions, you can specify targets using special HTML attributes. However, you can also target any element directly regardless of markup by using a selector.

First, let's talk about using targets with the "light DOM". Similarly to the DeclarativeActionsController, you should include the tag name of the component (aka `test-element`) plus `target`, and include an identifier as the attribute value. Then in your targets configuration, you can use the same identifier as the key along with `@` as the value. So for `test-element-target="message"`, you'll add `message: "@"` to the targets config, which then allows you to access the target via `this.message` in your component.

You can also use a different key than the identifier. For example, `test-element-target="thumbnail"` and a config of `thumbnailImage: "@thumbnail"` would allow `this.thumbnailImage` to accesss the `thumbnail` target.

In addition, you can use a CSS-style selector instead. A config of `titleHeading: "h1.title"` would allow `this.titleHeading` to access the first `h1` tag with a `title` class.

In any case where a matching tag isn't available, you'll get a `null` return value.

You can also choose to access multiple matching elements for a target. Simply enclose the identifier/selector in an array within your targets config. So `paragraphs: ["p"]` would return an array of paragraph tags. If nothing matches, you'll receive an empty array.

Here's an example of several target types in action:

```js
import { LitElement, html } from "lit"
import { TargetsController } from "@crystallized/controllers"

class TestElement extends LitElement {
  static targets = {
    message: "@",
    dupMessage: "@message",
    extra: ["p.extra"]
  }

  targets = new TargetsController(this)

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

### Configuring Targets within the Shadow DOM

You can choose _only_ to look for targets in your component's shadow root by passing `{ shadow: true }` as an option. If you want to configure both light DOM targets and shadow DOM targets, you'll need to pass the targets configuration explicitly. Here's an example using a vanilla web component:

```js
class TestElement extends Controllable(HTMLElement) {
  targets = new TargetsController(this, {
    targets: {
      message: "@"
    }
  })

  shadowTargets = new TargetsController(this, {
    shadow: true,
    targets: {
      items: ["li"]
    }
  })

  ////
}
```

## Private Fields

If you can target modern browsers or use a bundler, you could mark the controller variables private since there's no reason they need to be made available as a public API.

```js
class TestElement extends LitElement {
  #targets = new TargetsController(this)
  #actions = new DeclarativeActionsController(this)
}
```

## Crystallized Everywhere, All at Once

We now provide an all-in-one `CrystallizedController` shortcut which is particularly helpful when writing vanilla web components.

```js
#crystallized = new CrystallizedController(this)
```

This is equivalent to the following:

```js
#actions = new DeclarativeActionsController(this)
#shadowActions = new DeclarativeActionsController(this, { shadow: true })
#targets = new TargetsController(this, { shadow: true })
```

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

## Testing

Crystalline uses the [Modern Web Test Runner](https://modern-web.dev/guides/test-runner/getting-started/) and [helpers from Open WC](https://open-wc.org/docs/testing/testing-package/) for its test suite.

Run `npm run test` to run the test suite, or `npm run test:dev` to watch tests and re-run on every change.

## Contributing

1. Fork it (https://github.com/whitefusionhq/crystallized/fork)
2. Create your feature branch (`git checkout -b my-new-feature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin my-new-feature`)
5. Create a new Pull Request

## License

MIT

[npm]: https://img.shields.io/npm/v/@crystallized/controllers.svg?style=for-the-badge
[npm-url]: https://npmjs.com/package/@crystallized/controllers
