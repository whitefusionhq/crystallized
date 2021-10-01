import { fixture, assert, aTimeout, html as testhtml } from "@open-wc/testing"
import { LitElement, html } from "lit"

import { TargetsController } from "../dist"

// Fixtures

class TestElement extends LitElement {
  targets = new TargetsController(this)

  static get targets() {
    return {
      "message": "@",
      "dupMessage": "@message",
      "extra": ["extra-message"]
    }
  }

  clickMe() {
    this.shadowRoot.querySelector("test-msg").textContent = this._message.textContent + this._dupMessage.textContent + this._extra[0].textContent
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

class NestedTargetsComponent extends LitElement {
  targets = new TargetsController(this)

  static get targets() {
    return {
      "button": "button",
      "buttons": ["button"]
    }
  }
}
customElements.define("targets-component", NestedTargetsComponent)

// Tests

describe("TargetsController", () => {
  it("finds the right elements", async () => {
    const el = await fixture(testhtml`
      <test-element>
        <source-message test-element-target="message">clicked!</source-message>
        <extra-message>howdy</extra-message>
      </test-element>
    `)

    el.shadowRoot.querySelector("button").click()
    assert.equal(el.shadowRoot.querySelector("test-msg").textContent, "clicked!clicked!howdy")
  })

  it("supports nested targets", async() => {
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

    const nestedEl = el.querySelector("targets-component")
    assert.equal(nestedEl._buttons.length, 1)
    assert.equal(nestedEl._buttons[0], el.querySelector("#inner"))
  })
})
