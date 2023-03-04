# ❄️ Crystallized: ReactiveProperty

[![npm][npm]][npm-url]

A tiny library for data parsing and reactive sync for an element attribute/property using Signals. Part of the Crystallized project.

## Installation

...

## Rationale

The `ReactiveProperty` class takes advantage of fine-grained reactivity using Signals\* to solve a state problem often encountered in building vanilla web components. Here's an example of what we're dealing with:

```html
<my-counter count="1">
  <output>1</output>
  <button id="inc">Inc +</button>
  <button id="dec">Dec +</button>
</my-counter>
```

It's a typical "counter" example: click the + or - buttons, see the counter update.

In component-speak, we see here that `count` is a prop of the `my-counter` component. In this particular instance it's set to `1`. Even with this very simple example, we run into an immediate conundrum:

* The type of the `count` attribute is not `1`. It's `"1"` (a string). So the simplistic JavaScript code `"1" + 1` doesn't result in `2`, it's `11`. You need to parse the attribute's string value to a number before using it as a property value.
* You need to build getters/setters so `myCounterInstance.count` is available through the component API.
* In most cases, prop mutations should reflect back to the attribute. `myCounterInstance.count = 10` should result in `count="10"` on the HTML attribute. Generally this means serializing values to strings, but in some cases it means removing the attribute. `el.booleanProp = false` shouldn't result in a `boolean-prop="false"` attribute but should remove `booleanprop` entirely.
* Handling both attributes and properties with value parsing and reflection isn't the end of it. You also need to avoid an infinite loop (setting a property reflects the attribute which then sets the property which then reflects the attribute which then…).
* _And_ to top it all off, you need to be able to observe attribute/prop changes in order to do something—the side effect of the mutation.

Given all this, you're left with two choices:

1. You can build all of this boilerplate yourself and include that custom code in all of your web components. Because obviously trying to write this over and over by hand is a real PITA! (Believe me, I've done it! I know!)
2. You can reach for a helpful web component library which does all this for you.

Unfortunately, the second option typically doesn't mean reaching for a library which _only_ solves these problems. It solves a host of other problems (templates, rendering lifecycles, and various other UI component model considerations).

Personally, I tend to like libraries which **do one thing and one thing only—well**. ReactiveProperty doesn't care about templates. Doesn't care about rendering lifecycles. Doesn't care about element base classes or mixins or controllers or hooks or any of that.

**All it does it give you reactive properties. Boom. Done**

And it does this thanks to the amazing new Signals library from the folks at Preact.

\* Signals is _not_ part of Preact. It's a very simple, small, zero-dependency library. It's usable _within_ React as well as any other framework. That's why you can easily use it with any vanilla JS code! And because ReactiveProperty only uses a fraction of the Preact Signals API, you can even opt for a different signals library as long as the interface is the same (aka provides a `value` getter/setter and a `subscribe` method for a watch callback).

## Usage

```js
import { signal, effect } from "@preact/signals-core"

class MyCounter extends HTMLElement {
  static observedAttributes = ["count"]

  constructor() {
    super()

    // Set up a bucket to manage our reactive property definitions
    this.attributeProps = {}

    // Add a reactive property for `count`
    this.attributeProps["count"] = new ReactiveProperty(
      this, // pass reference to this element instance
      signal(0), // create a signal with an initial value
      {
        name: "count", // the name of the property
        // attribute: "count-attr", // if you need a different attribute name
        // reflect: false, // turn off the prop->attribute reflection if need be
      }
    )
  }

  connectedCallback() {
    setTimeout(() => { // I always wait a beat so the DOM tree is fully connected
      this.querySelector("#inc").addEventListener("click", () => this.count++)
      this.querySelector("#dec").addEventListener("click", () => this.count--)

      // Whenever the `count` value is mutated, update the DOM accordingly
      this._disposeEffect = effect(() => {
        this.querySelector("output").textContent = this.count
      })
    })
  }

  disconnectedCallback() {
    // Dispose of the rendering effect since the element's been removed from the DOM
    this._disposeEffect?.()
  }

  attributeChangedCallback(name, oldValue, newValue) {
    this.attributeProps[name]?.refreshFromAttribute(newValue)
  }
}

customElements.define("my-counter", this)
```

What I love about this example is you can read the code _and immediately understand what is happening_. What ends up happening may feel a bit magical, but there's really no magic at all.

Under the hood, there's a `count` signal which we've initialized with `0`. `this.count++` is effectively `prop.signal.value = prop.signal.value + 1` and `this.count--` is effectively `prop.signal.value = prop.signal.value - 1`. The side effect function we've written will then at the call site, and any time thereafter when the value mutates, take that value and update the `<output>` element accordingly.

ReactiveProperty knows that the initial value of the property is a number type, so it always typecasts attribute changes from strings to numbers. Same for booleans (`true/false`), arrays (`[]`), and objects (`{}`). Strings of course are easiest to deal with.

So whether the `count` attribute is set/updated through HTML-based APIs, or the `count` prop is set/updated through JS-based APIs, the signal value is always updated accordingly, and that then will trigger your side-effect.

Because you're using Signals, you can take advantage of computed values as well, which unlocks a whole new arena of power:

```js
import { signal, computed, effect } from "@preact/signals-core"

// add to the bottom of your `constructor`:
this.multipliedBy100 = computed(() => this.count * 100 )
```

Now every time the `count` prop mutates, the `this.multipliedBy100.value` signal will equal that number times one hundred. And you can access `this.multipliedBy100.value` directly in an effect to update UI with that value also!

You can set up multiple effects to handle different part of your component UI, which is why this approach is termed "fine-grained" reactivity. Instead of a giant `render` method where your component has to supply a template handling all of the data your component supports, you can react to data updates in effects and surgically alter the DOM only when and where needed. And the potential is high for an additional, slightly-abstract library to take advantage of this to provide markup-based, declarative bindings between DOM and reactive data.

----

## Testing

Crystallized uses the [Modern Web Test Runner](https://modern-web.dev/guides/test-runner/getting-started/) and [helpers from Open WC](https://open-wc.org/docs/testing/testing-package/) for its test suite.

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