/**
 * Targets controller lets you query for elements in the DOM
 */
class TargetsController {
  /**
   * @param {HTMLElement} host
   * @param {{ targets?: any, shadow?: boolean } | undefined} options
   */
  constructor(host, options) {
    /** @type {HTMLElement} */
    this.host = host
    /** @type {boolean} */
    this.shadow = options?.shadow || false
    /** @type {string} */
    this.nodeName = this.host.localName

    const targets = options?.targets || this.host.constructor.targets

    // Add queries as instance properties
    if (targets) {
      for (let [name, selector] of Object.entries(targets)) {
        if (Array.isArray(selector)) {
          selector = this.targetizedSelector(name, selector[0])

          Object.defineProperty(this.host, name, {
            get: () =>
              Array.from(this.target.querySelectorAll(selector)).filter(
                (node) => this.shadow || node.closest(this.nodeName) == this.host
              ),
          })
        } else {
          selector = this.targetizedSelector(name, selector)

          Object.defineProperty(this.host, name, {
            get: () => {
              const node = this.target.querySelector(selector)
              return node && (this.shadow || node.closest(this.nodeName) == this.host) ? node : null
            },
          })
        }
      }
    }
  }

  /**
   * Depending on how the controller was configured, returns either the host element or its shadow root
   */
  get target() {
    return this.shadow ? this.host.shadowRoot : this.host
  }

  targetizedSelector(name, selector) {
    const prefix = this.shadow ? "host-target" : `${this.nodeName}-target`
    if (selector == "@") {
      return `*[${prefix}='${name}']`
    } else {
      return selector.replace(/@([a-z-]+)/g, `[${prefix}='$1']`)
    }
  }
}

export default TargetsController
