import { fixture, assert, aTimeout, html as testhtml } from "@open-wc/testing"
import { signal, effect } from "@preact/signals-core"

import { ReactiveProperty } from "../dist"

class TestElement extends HTMLElement {
  static observedAttributes = ["str", "unreflected-str", "num", "arr", "obj"]

  static {
    customElements.define("test-element", this)
  }

  constructor() {
    super()

    this.attachShadow({ mode: "open" })
    this.shadowRoot.append(document.createElement("p"))

    this.attributeProps = {}

    this.attributeProps["str"] = new ReactiveProperty(this, signal("yo"), {
      name: "str",
    })

    this.attributeProps["unreflected-str"] = new ReactiveProperty(this, signal(""), {
      name: "unreflectedStr",
      attribute: "unreflected-str",
      reflect: false,
    })

    this.attributeProps["num"] = new ReactiveProperty(this, signal(0), {
      name: "num",
    })

    this.attributeProps["arr"] = new ReactiveProperty(this, signal([]), {
      name: "arr",
    })

    this.attributeProps["obj"] = new ReactiveProperty(this, signal({}), {
      name: "obj",
    })

    effect(() => {
      this.shadowRoot.querySelector("p").textContent = this.str.toUpperCase()
    })
  }

  attributeChangedCallback(name, oldValue, newValue) {
    this.attributeProps[name]?.refreshFromAttribute(newValue)
  }
}

describe("ReactiveProperty", () => {
  context("string value", () => {
    it("uses data from the attribute", async () => {
      const el = await fixture(testhtml`
        <test-element></test-element>
      `)
      assert.strictEqual(el.str, "yo")

      const el2 = await fixture(testhtml`
        <test-element str="Hello World"></test-element>
      `)
      assert.strictEqual(el2.str, "Hello World")
    })

    it("reacts to attribute changes", async () => {
      const el = await fixture(testhtml`
        <test-element></test-element>
      `)
      assert.strictEqual(el.str, "yo")

      el.setAttribute("str", "From Attribute")
      assert.strictEqual(el.str, "From Attribute")
    })

    it("reflects back by default", async () => {
      const el = await fixture(testhtml`
        <test-element></test-element>
      `)
      el.str = "setting the property"

      assert.strictEqual(el.getAttribute("str"), "setting the property")
    })

    it("doesn't reflect when option is set", async () => {
      const el = await fixture(testhtml`
        <test-element></test-element>
      `)
      el.unreflectedStr = "setting the property"

      assert.strictEqual(el.getAttribute("unreflected-str"), null)

      el.setAttribute("unreflected-str", "From Attribute")
      assert.strictEqual(el.unreflectedStr, "From Attribute")
    })

    it("works fine with effects", async () => {
      const el = await fixture(testhtml`
        <test-element></test-element>
      `)
      assert.strictEqual(el.shadowRoot.firstElementChild.textContent, "YO")

      el.str = "all upper case"
      assert.strictEqual(el.shadowRoot.firstElementChild.textContent, "ALL UPPER CASE")
    })
  })

  context("number value", () => {
    it("uses data from the attribute", async () => {
      const el = await fixture(testhtml`
        <test-element></test-element>
      `)
      assert.strictEqual(el.num, 0)

      const el2 = await fixture(testhtml`
        <test-element num="35000"></test-element>
      `)
      assert.strictEqual(el2.num, 35_000)
    })

    it("reacts to attribute changes", async () => {
      const el = await fixture(testhtml`
        <test-element></test-element>
      `)
      assert.strictEqual(el.num, 0)

      el.setAttribute("num", "12345")
      assert.strictEqual(el.num, 12345)

      el.setAttribute("num", "")
      assert.strictEqual(el.num, 0)

      el.setAttribute("num", "1")
      assert.strictEqual(el.num, 1)

      el.removeAttribute("num")
      assert.strictEqual(el.num, 0)
    })

    it("reflects back", async () => {
      const el = await fixture(testhtml`
        <test-element></test-element>
      `)
      el.num = 112233

      assert.strictEqual(el.getAttribute("num"), "112233")
    })
  })

  context("array value", () => {
    it("uses data from the attribute", async () => {
      const el = await fixture(testhtml`
        <test-element></test-element>
      `)
      assert.deepEqual(el.arr, [])

      const el2 = await fixture(testhtml`
        <test-element arr="[1,2,3]"></test-element>
      `)
      assert.deepEqual(el2.arr, [1, 2, 3])
    })

    it("reacts to attribute changes", async () => {
      const el = await fixture(testhtml`
        <test-element></test-element>
      `)
      assert.deepEqual(el.arr, [])

      el.setAttribute("arr", '["1", 2]')
      assert.deepEqual(el.arr, ["1", 2])

      el.setAttribute("arr", "")
      assert.deepEqual(el.arr, [])

      el.setAttribute("arr", "[1]")
      assert.deepEqual(el.arr, [1])

      el.removeAttribute("arr")
      assert.deepEqual(el.arr, [])
    })

    it("reflects back", async () => {
      const el = await fixture(testhtml`
        <test-element></test-element>
      `)
      el.arr = [1, 2, "3"]

      assert.deepEqual(el.getAttribute("arr"), '[1,2,"3"]')
    })
  })

  context("object value", () => {
    it("uses data from the attribute", async () => {
      const el = await fixture(testhtml`
        <test-element></test-element>
      `)
      assert.deepEqual(el.obj, {})

      const el2 = await fixture(testhtml`
        <test-element obj="{&quot;foo&quot;:&quot;bar&quot;}"></test-element>
      `)
      assert.deepEqual(el2.obj, { foo: "bar" })
    })

    it("reacts to attribute changes", async () => {
      const el = await fixture(testhtml`
        <test-element></test-element>
      `)
      assert.deepEqual(el.obj, {})

      el.setAttribute("obj", '{"one": 1}')
      assert.deepEqual(el.obj, { one: 1 })

      el.setAttribute("obj", "")
      assert.deepEqual(el.obj, {})

      el.setAttribute("obj", '{"two": 2}')
      assert.deepEqual(el.obj, { two: 2 })

      el.removeAttribute("obj")
      assert.deepEqual(el.obj, {})
    })

    it("reflects back", async () => {
      const el = await fixture(testhtml`
        <test-element></test-element>
      `)
      el.obj = { three: [1, 2, 3] }

      assert.deepEqual(el.getAttribute("obj"), '{"three":[1,2,3]}')

      el.obj = { ...el.obj, name: "Worf" }

      assert.deepEqual(el.getAttribute("obj"), '{"three":[1,2,3],"name":"Worf"}')

      delete el.obj.three
      el.obj = { ...el.obj }

      assert.deepEqual(el.getAttribute("obj"), '{"name":"Worf"}')
    })
  })
})
