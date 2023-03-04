/**
 * @typedef { import("@preact/signals-core").Signal } Signal
 */

class ReactiveProperty {
  /**
   *
   * @param {HTMLElement} element
   * @param {Signal} signal
   * @param {{ name: string, attribute?: string, reflect?: boolean }} options
   */
  constructor(element, signal, options) {
    /** @type {HTMLElement} */
    this.element = element
    /** @type {Signal} */
    this.signal = signal
    /** @type {string} */
    this.name = options.name
    /** @type {string} */
    this.attribute = options.attribute || options.name
    /** @type {string | null} */
    this.type = null

    if (options.reflect != false) this.setupReflection()

    Object.defineProperty(element, options.name, {
      get() {
        return signal.value
      },
      set(value) {
        signal.value = value
      },
    })
  }

  /**
   * Sets up the signal subscription so when the property value changes, the attribute reflects a
   * string value (or the attribute is removed for null/false)
   */
  setupReflection() {
    if (!this.reflects) {
      this.reflects = true
      this._signalling = true

      this.signal.subscribe((value) => {
        if (this._signalling) return

        this._inCallback = true

        if (Array.isArray(value) || (value !== null && typeof value === "object")) {
          this.element.setAttribute(this.attribute, JSON.stringify(value))
        } else if (value == null || value === false) {
          this.element.removeAttribute(this.attribute)
        } else if (!value) {
          this.element.setAttribute(this.attribute, "")
        } else {
          this.element.setAttribute(this.attribute, value)
        }

        this._inCallback = false
      })

      this._signalling = false
    }
  }

  /**
   * Parses a string attribute value and attempts to set the signal value accordingly
   *
   * @param value {string | undefined} - you can directly pass in the attribute value, or let it get
   *  read in from the element
   */
  refreshFromAttribute(value) {
    const newValue =
      typeof value === "undefined" ? this.element.getAttribute(this.attribute) : value

    if (this._inCallback) return

    this._signalling = true

    if (this.type === "boolean" || (this.type == null && typeof this.signal.peek() === "boolean")) {
      this.type = "boolean"
      this.signal.value = !!newValue
    } else if (
      this.type === "number" ||
      (this.type == null && typeof this.signal.peek() === "number")
    ) {
      this.type = "number"
      this.signal.value = Number(newValue == null ? null : newValue)
    } else if (
      this.type === "object" ||
      (this.type == null &&
        (Array.isArray(this.signal.peek()) || typeof this.signal.peek() === "object"))
    ) {
      this.type = "object"
      try {
        this.signal.value = newValue ? JSON.parse(newValue) : this.signal.peek().constructor()
      } catch (ex) {
        console.warn(`${ex.message} for ${this.element.localName}[${this.attribute}]`)
        this.signal.value = this.signal.peek().constructor()
      }
    } else {
      this.type = "string"
      this.signal.value = newValue
    }

    this._signalling = false
  }
}

export default ReactiveProperty
