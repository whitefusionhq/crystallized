import { fixture, assert, aTimeout, html as testhtml } from "@open-wc/testing"
import { signal, computed } from "@preact/signals-core"

import { ShadowEffects, show, classMap, styleMap } from "../dist"

class TestElement extends HTMLElement {
  static {
    customElements.define("test-element", this)
  }

  constructor() {
    super()

    this.attachShadow({ mode: "open" })
    const para = document.createElement("p")
    para.setAttribute("host-effect", "$el.textContent = count; $classMap(paraClasses); $uniqId(); styled($el, 'color', textColor)")
    this.shadowRoot.append(para)

    const output = document.createElement("output")
    output.textContent = "show if green"
    output.setAttribute("host-effect", "$show(textIsGreen); $styleMap(outputStyles)")
    this.shadowRoot.append(output)

    this.countSignal = signal(1)
    this.textColor = signal("red")
    this.textIsGreenSignal = computed(() => this.textColor.value === "green")
  }

  connectedCallback() {
    this.resumed = true
    this.effects = new ShadowEffects(this, {
      show,
      classMap,
      styleMap,
      uniqId: (_, el) => {
        el.id = "uniq123"
      }
    })
  }
  
  disconnectedCallback() {
    this.effects.dispose()
  }

  get count() {
    return this.countSignal.value
  }

  get textIsGreen() {
    return this.textIsGreenSignal.value
  }

  get paraClasses() {
    return {
      "some-class": true,
      "another-class": false
    }
  }

  get outputStyles() {
    return {
      fontWeight: this.textIsGreen ? "bold" : ""
    }
  }

  styled(el, name, color) {
    el.style[name] = color
  }
}

describe("ShadowEffects", () => {
  context("property assignment", () => {
    it("textContent", async () => {
      const el = await fixture(testhtml`
        <test-element></test-element>
      `)
      assert.strictEqual(el.shadowRoot.firstElementChild.textContent, "1")
    })
  })

  context("methods", () => {
    it("styled", async () => {
      const el = await fixture(testhtml`
        <test-element></test-element>
      `)
      assert.strictEqual(el.shadowRoot.firstElementChild.style.color, "red")
      el.textColor.value = "green"
      assert.strictEqual(el.shadowRoot.firstElementChild.style.color, "green")
    })
  })

  context("directives", () => {
    it("show", async () => {
      const el = await fixture(testhtml`
        <test-element></test-element>
      `)
      assert.isTrue(el.shadowRoot.querySelector("output").hidden, "output should be hidden")
      el.textColor.value = "green"
      assert.isNotTrue(el.shadowRoot.querySelector("output").hidden, "output shouldn't be hidden")
    })

    it("classMap", async () => {
      const el = await fixture(testhtml`
        <test-element></test-element>
      `)
      assert.isTrue(el.shadowRoot.firstElementChild.classList.contains("some-class"), "some-class should be set")
      assert.isNotTrue(el.shadowRoot.firstElementChild.classList.contains("another-class"), "another-class shouldn't be set")
    })

    it("styleMap", async () => {
      const el = await fixture(testhtml`
        <test-element></test-element>
      `)
      assert.equal(el.shadowRoot.querySelector("output").style.fontWeight, "")
      el.textColor.value = "green"
      assert.equal(el.shadowRoot.querySelector("output").style.fontWeight, "bold")
    })

    it("uniqId", async () => {
      const el = await fixture(testhtml`
        <test-element></test-element>
      `)
      assert.strictEqual(el.shadowRoot.firstElementChild.id, "uniq123")
    })
  })
})
