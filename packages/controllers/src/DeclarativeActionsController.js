/**
 * Controller to loop through DOM on connection + mutations and find declared actions
 */
class DeclarativeActionsController {
  /**
   * @param host {HTMLElement}
   * @param options {{ shadow: boolean } | undefined}
   */
  constructor(host, options) {
    /** @type {HTMLElement} */
    this.host = host
    /** @type {boolean} */
    this.shadow = options?.shadow || false
    /** @type {string} */
    this.nodeName = this.host.localName

    host.addController(this)
  }

  /**
   * Depending on how the controller was configured, returns either the host element or its shadow root
   */
  get target() {
    return this.shadow ? this.host.shadowRoot : this.host
  }

  /**
   * Set up MutationObserver and get ready to look for action definitions
   */
  hostConnected() {
    this.registeredActions = []
    if (this.shadow) {
      this.handleNodeChanges([])
    } else {
      this.handleNodeChanges([{ type: "attributes", target: this.host }])
    }
    this.nodeObserver = new MutationObserver(this.handleNodeChanges.bind(this))
    let config = { attributes: true, childList: true, subtree: true }
    this.nodeObserver.observe(this.target, config)
  }

  /**
   * Disconnect the MutationObserver
   */
  hostDisconnected() {
    // For some reason there are cases where this method is called before node_observer has been initialized.
    // So we can't assume the value is already present...
    if (this.nodeObserver) this.nodeObserver.disconnect()
    this.registeredActions = []
    this.registeredActions
  }

  /**
   * Given an element, returns the default event name (submit, input, change, click)
   *
   * @param node {HTMLElement}
   * @returns {string}
   */
  defaultActionForNode(node) {
    switch (node.nodeName.toLowerCase()) {
      case "form":
        return "submit"

      case "input":
      case "textarea":
        return node.getAttribute("type") == "submit" ? "click" : "input"

      case "select":
        return "change"

      default:
        return "click"
    }
  }

  /**
   * Callback for MutationObserver
   *
   * @param changes {MutationRecord[]}
   */
  handleNodeChanges(changes) {
    let actionAttr = this.shadow ? "ze-action" : `${this.nodeName}-action`

    /**
     * Function to set up event listeners
     *
     * @param node {HTMLElement}
     * @param onlyHostNode {boolean}
     */
    let setupListener = (node, onlyHostNode) => {
      // prettier-ignore
      if (
        !onlyHostNode &&
        Array.from(
          this.target.querySelectorAll(this.nodeName)
        ).filter((el) => el.contains(node)).length > 0
      )
        return

      if (node.hasAttribute(actionAttr)) {
        for (let actionPair of node.getAttribute(actionAttr).split(" ")) {
          let [actionEvent, actionName] = actionPair.split("->")

          if (typeof actionName === "undefined") {
            actionName = actionEvent
            actionEvent = this.defaultActionForNode(node)
          }

          actionEvent = actionEvent.trim()

          if (
            this.registeredActions.find(
              (action) =>
                action.node == node && action.event == actionEvent && action.name == actionName
            )
          )
            continue

          if (this.host[actionName]) {
            node.addEventListener(actionEvent, this.host[actionName].bind(this.host))

            this.registeredActions.push({
              node,
              event: actionEvent,
              name: actionName,
            })
          } else {
            // TODO: should we log a warning?
          }
        }
      }
    }

    if (!this.nodeObserver) {
      // It's a first run situation, so check all child nodes
      for (let node of this.target.querySelectorAll(`[${actionAttr}]`)) {
        setupListener(node, false)
      }
    }

    // Loop through all the mutations
    for (let change of changes) {
      if (change.type == "childList") {
        for (let node of change.addedNodes) {
          if (node.nodeType != 1) continue
          setupListener(node, false)

          for (let insideNode of node.querySelectorAll(`[${actionAttr}]`)) {
            setupListener(insideNode, false)
          }
        }
      } else if (change.type == "attributes") {
        setupListener(change.target, true)
      }
    }
  }

  /**
   * Handles a particular sort of Lit-specific lifecycle
   */
  hostUpdated() {
    if (!this.firstUpdated) {
      this.handleNodeChanges([
        {
          type: "childList",
          addedNodes: this.target.querySelectorAll("*"),
          removedNodes: [],
        },
      ])

      this.firstUpdated = true
    }
  }
}

export default DeclarativeActionsController
