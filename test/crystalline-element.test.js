import { fixture, assert, aTimeout, html as testhtml } from "@open-wc/testing"
import { CrystallineElement, crystallize } from "../dist/index"
import { html, css } from "lit"

// Fixtures

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

class TargetsComponent extends CrystallineElement {
  static get targets() {
    return {
      "button": "button",
      "buttons": ["button"]
    }
  }
}
TargetsComponent.define("targets-component", {shadowDom: true})

const localVariable = "functional"

crystallize("functional-component", {
  properties: {
    greeting: { type: String }
  }
}, comp => html`
  <p>${comp.greeting}, you can write "${localVariable}" components with a handy shorthand!</p>
`)

// Tests

describe("CrystallineElement", () => {
  it("renders state", async () => {
    const el = await fixture(testhtml`
      <my-component name="Test Runner"></my-component>
    `)

    assert.include(el.shadowRoot.innerHTML, "<p>Hello World! Nice to meet you")
    assert.include(el.shadowRoot.innerHTML, "Test Runner</p>")
  })

  it("works with a functional interface", async() => {
    const el = await fixture(testhtml`
      <functional-component greeting="Bring on the func"></functional-component>
    `)

    assert.include(el.shadowRoot.innerHTML, "Bring on the func, you can write")
    assert.include(el.shadowRoot.innerHTML, "functional\" components")
  })

  it("supports targets", async() => {
    const el = await fixture(testhtml`
      <targets-component>
        <button id="outer">Outer Button</button>
        <targets-component>
          <button id="inner">Inner Button</button>
        </targets-component>
      </targets-component>
    `)

    assert.equal(el._button, el.querySelector("#outer"))
    assert.equal(el._buttons.length, 1)
    assert.equal(el._buttons[0], el.querySelector("#outer"))
  })
})
