// Controller to loop through light DOM on connection + mutations and find
// declared actions
class DeclarativeActionsController {
  constructor(host) {
    this._host = host;
    host.addController(this)
  };

  // Set up MutationObserver and get ready to look for action definitions
  hostConnected() {
    this._registeredActions = [];
    this.handleNodeChanges([{type: "attributes", target: this._host}]);
    this._nodeObserver = new MutationObserver(this.handleNodeChanges.bind(this));
    let config = {attributes: true, childList: true, subtree: true};
    return this._nodeObserver.observe(this._host, config)
  };

  hostDisconnected() {
    this._nodeObserver.disconnect();
    this._registeredActions = [];
    return this._registeredActions
  };

  defaultActionForNode(node) {
    switch (node.nodeName.toLowerCase()) {
    case "form":
      return "submit";

    case "input":
    case "textarea":
      return node.getAttribute("type") == "submit" ? "click" : "input";

    case "select":
      return "change";

    default:
      return "click"
    }
  };

  // Callback for MutationObserver
  handleNodeChanges(changes) {
    let hostName = this._host.nodeName.toLowerCase();
    let actionAttr = `${hostName}-action`;

    // Lambda to set up event listeners
    let setupListener = (node, onlyHostNode) => {
      if (!onlyHostNode && Array.from(this._host.querySelectorAll(hostName)).filter(el => (
        el.contains(node)
      )).length > 0) return;

      if (node.hasAttribute(actionAttr)) {
        for (let actionPair of node.getAttribute(actionAttr).split(" ")) {
          let [actionEvent, actionName] = actionPair.split("->");

          if (typeof actionName === 'undefined') {
            actionName = actionEvent;
            actionEvent = this.defaultActionForNode(node)
          };

          actionEvent = actionEvent.trim();

          if (this._registeredActions.find(action => (
            action.node == node && action.event == actionEvent && action.name == actionName
          ))) continue;

          node.addEventListener(
            actionEvent,
            this._host[actionName].bind(this._host)
          );

          this._registeredActions.push({
            node,
            event: actionEvent,
            name: actionName
          })
        }
      }
    };

    if (!this._nodeObserver) {
      // It's a first run situation, so check all child nodes
      for (let node of this._host.querySelectorAll(`[${actionAttr}]`)) {
        setupListener(node, false)
      }
    };

    // Loop through all the mutations
    for (let change of changes) {
      if (change.type == "childList") {
        for (let node of change.addedNodes) {
          if (node.nodeType != 1) continue;
          setupListener(node, false);

          for (let insideNode of node.querySelectorAll(`[${actionAttr}]`)) {
            setupListener(insideNode, false)
          }
        }
      } else if (change.type == "attributes") {
        setupListener(change.target, true)
      }
    }
  };

  hostUpdated() {
    if (!this._firstUpdated) {
      this.handleNodeChanges([{
        type: "childList",
        addedNodes: this._host.querySelectorAll("*"),
        removedNodes: []
      }]);

      this._firstUpdated = true;
      return this._firstUpdated
    }
  }
};

// Targets let you query for elements in the light DOM
class TargetsController {
  constructor(host) {
    this._host = host;
    this._nodeName = this._host.nodeName;

    // Add queries as instance properties
    if (this._host.constructor.targets) {
      for (let [name, selector] of Object.entries(this._host.constructor.targets)) {
        if (Array.isArray(selector)) {
          selector = this.targetizedSelector(name, selector[0]);

          Object.defineProperty(this._host, name, {get: () => (
            Array.from(this._host.querySelectorAll(selector)).filter(node => (
              node.closest(this._nodeName) == this._host
            ))
          )})
        } else {
          selector = this.targetizedSelector(name, selector);

          Object.defineProperty(this._host, name, {get: () => {
            let node = this._host.querySelector(selector);
            return node && node.closest(this._nodeName) == this._host ? node : null
          }})
        }
      }
    }
  };

  targetizedSelector(name, selector) {
    if (selector == "@") {
      name = name.replace(/_/g, "-").replace(/([^A-Z])([A-Z])/g, "$1-$2").toLowerCase();
      return `*[${this._nodeName}-target='${name}']`
    } else {
      return selector.replace(
        /@([a-z-]+)/g,
        `[${this._nodeName}-target='$1']`
      )
    }
  }
};

export { DeclarativeActionsController, TargetsController }