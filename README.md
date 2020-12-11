# ❄️ CrystallineElement

[![npm][npm]][npm-url]
[![node][node]][node-url]
[![bundlephobia][bundlephobia]][bundlephobia-url]


[LitElement](https://lit-element.polymer-project.org) is "a simple base class for creating fast, lightweight web components".

CrystallineElement is a base subclass of LitElement which provides a number of useful enhancements inspired by [Stimulus](https://stimulusjs.org). It's written in Ruby-like syntax and compiled by [Ruby2JS](https://github.com/rubys/ruby2js) as ES6+ Javascript. [Here's proof. 😄](https://unpkg.com/crystalline-element/dist/index.js) It works quite nicely in a Ruby2JS context, but it can be used in pure JS as well—even directly in buildless HTML using `script type="module"`.

CrystallineElement works great as a spice on top of server-rendered markup originating from backend frameworks like [Rails](https://rubyonrails.org) or static sites generators like [Bridgetown](https://www.bridgetownrb.com)—providing features not normally found in web component libraries that assume they're only concerned with client-rendered markup and event handling.

**Enjoy writing functional components?** While I am of the opinion classes work quite well most of the time, for very simple components or components constructed out of many separate `lit-html` snippets, you might long for a functional shorthand. In those cases, `crystallize` will do just the trick!

You can build an entire suite of reactive frontend components just with CrystallineElement, along with a general strategy to enhance your site with a variety of emerging [web components](https://github.com/topics/web-components) and component libraries ([Shoelace](https://shoelace.style) for example).

----

**[Demo on CodePen](https://codepen.io/jaredcwhite/pen/yLJWRrq)**

_Documentation coming soon…_

## JavaScript Example

```js
import { CrystallineElement, crystallize } from "https://cdn.skypack.dev/crystalline-element"
import { html, css } from "https://cdn.skypack.dev/lit-element"

class MyComponent extends CrystallineElement {
  static get styles {
    return css`
      p {
        font-weight: bold;
      }
    `
  }

  // ...

  render() {
    return html`<p>Hello World!</p>`
  }
}

MyComponent.define("my-component")

class LightDomComponent extends CrystallineElement {
  // ...
}

LightDomComponent.define("light-dom", { shadowDom: false })

const localVariable = "functional"

crystallize("functional-component", {
  properties: {
    greeting: { type: String }
  }
}, comp => html`
  <p>${comp.greeting}, you can write "${localVariable}" components with a handy shorthand!
`)
```

## Ruby Example

```ruby
import [ CrystallineElement, crystallize ], from: "https://cdn.skypack.dev/crystalline-element"
import [ html, css ], from: "https://cdn.skypack.dev/lit-element"

class MyComponent < CrystallineElement
  self.styles = css <<~CSS
    p {
      font-weight: bold;
    }
  CSS
 
  define "my-component"

  # ...

  def render()
    html "<p>Hello World!</p>"
  end
end

class LightDomComponent < CrystallineElement
  define "light-dom", shadow_dom: false

  # ...
end

localVariable = "functional"

crystallize("functional-component", 
  properties: {
    greeting: { type: String }
  }
) do |comp|
  html <<~HTML
    <p>#{comp.greeting}, you can write "#{localVariable}" components with a handy shorthand!
  HTML
end
```

## Contributing

1. Fork it (https://github.com/whitefusionhq/crystalline-element/fork)
2. Create your feature branch (`git checkout -b my-new-feature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin my-new-feature`)
5. Create a new Pull Request

## License

MIT

[npm]: https://img.shields.io/npm/v/crystalline-element.svg
[npm-url]: https://npmjs.com/package/crystalline-element
[node]: https://img.shields.io/node/v/crystalline-element.svg
[node-url]: https://nodejs.org
[bundlephobia]: https://badgen.net/bundlephobia/minzip/crystalline-element
[bundlephobia-url]: https://bundlephobia.com/result?p=crystalline-element
