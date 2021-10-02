import { fixture, assert, aTimeout, html as testhtml } from "@open-wc/testing"
import { LitElement, html } from "lit"

import { DeclarativeActionsController } from "../dist"

// Fixtures

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

// Tests

describe("DeclarativeActionsController", () => {
  it("handles click properly", async () => {
    const el = await fixture(testhtml`
      <test-element>
        <article>
          <button test-element-action="clickMe">Button</button>
        </article>
      </test-element>
    `)

    el.querySelector("button").click()
    assert.equal(el.shadowRoot.querySelector("test-msg").textContent, "clicked!")
  })

  it("handles mutations properly", async () => {
    const el = await fixture(testhtml`
      <test-element>
        <article></article>
      </test-element>
    `)

    await aTimeout(100)

    el.querySelector("article").innerHTML = '<button test-element-action="clickMe">Button</button>'
    await aTimeout(50) // ensure mutation handlers are run
    el.querySelector("button").click()

    assert.equal(el.shadowRoot.querySelector("test-msg").textContent, "clicked!")
  })

  it("handles nesting properly", async () => {
    const el = await fixture(testhtml`
      <test-element>
        <article>
          <button test-element-action="clickMe">Button</button>
        </article>

        <test-element id="nested">
          <button test-element-action="clickMe">Button 2</button>
        </test-element>
      </test-element>
    `)

    el.querySelector("#nested button").click()
    assert.notEqual(el.shadowRoot.querySelector("test-msg").textContent, "clicked!")
  })
})
