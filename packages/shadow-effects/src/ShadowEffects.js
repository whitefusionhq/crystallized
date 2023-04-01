import { effect } from "@preact/signals-core"

/**
 * @typedef { import("@preact/signals-core").Signal } Signal
 */

/**
 * @typedef { Record<string, (host: HTMLElement, element: HTMLElement, value: unknown) => void> | undefined } Directives
 */

class ShadowEffects {
  /**
   *
   * @param {HTMLElement} host element
   * @param {Directives} directives
   */
  constructor(element, directives) {
    /** @type {HTMLElement} */
    this.element = element
    /** @type {Directives} */
    this.directives = directives

    this.effectDisposals = []
  
    this.processShadowRoot()
  }

  dispose() {
    this.effectDisposals.forEach(disposal => disposal())
    this.effectDisposals = []
  }

  processShadowRoot() {
    this.processNodes(this.element.shadowRoot.querySelectorAll(`[host-effect]`))
  }

  /**
   * `host-effect="$el.textContent = count"`
   * `host-effect="someMethod($el, count)"`
   * `host-effect="$directive(count)"`
   * `host-effect="$el.textContent = count; $directive(count)"`
   */
  processNodes(effectNodes) {
    effectNodes.forEach(node => {
      const syntax = node.getAttribute("host-effect")
      const statements = syntax.split(";").map(item => item.trim())
      statements.forEach(statement => {
        if (statement.startsWith("$el.")) {
          // property assignment
          const expression = statement.split("=").map(item => item.trim())
          expression[0] = expression[0].substring(4)

          this.effectDisposals.push(effect(() => {
            const value = this.element[expression[1]]

            if (this.element.resumed) node[expression[0]] = value
          }))
        } else if (statement.startsWith("$")) {
          // directive
          const [, directiveName, argsStr] = statement.trim().match(/(.*)\((.*)\)/)
          const argStrs = argsStr.split(",").map(item => item.trim())
          argStrs.unshift("$el")

          if (this.directives && this.directives[directiveName.trim().substring(1)]) {
            this.effectDisposals.push(effect(() => {
              const args = argStrs.map(argStr => {
                if (argStr === "$el") {
                  return node
                }

                if (argStr.startsWith("'")) { // string literal
                  return argStr.substring(1, argStr.length -1)
                }

                return this.element[argStr]
              })

              if (this.element.resumed) this.directives[directiveName.trim().substring(1)]?.(this, ...args)
            }))
          }
        } else {
          // method call
          const [, methodName, argsStr] = statement.trim().match(/(.*)\((.*)\)/)
          const argStrs = argsStr.split(",").map(item => item.trim())

          this.effectDisposals.push(effect(() => {
            const args = argStrs.map(argStr => {
              if (argStr === "$el") {
                return node
              }

              if (argStr.startsWith("'")) { // string literal
                return argStr.substring(1, argStr.length -1)
              }

              return this.element[argStr]
            })

            if (this.element.resumed) this.element[methodName.trim()]?.(...args)
          }))
        }
      })
    })
  }
}

export default ShadowEffects
