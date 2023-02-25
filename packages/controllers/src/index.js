import DeclarativeActionsController from "./DeclarativeActionsController"
import TargetsController from "./TargetsController"

export const Controllable = (Base) => {
  return class Controllable extends Base {
  	addController(controller) {
			;(this.__controllers ??= []).push(controller)
			if (this.initialized && this.isConnected) {
				controller.hostConnected?.()
			}
		}

		connectedCallback() {
			this.__controllers?.forEach((c) => c.hostConnected?.())
			this.initialized = true
		}

		disconnectedCallback() {
			this.__controllers?.forEach((c) => c.hostDisconnected?.())
			this.initialized = false
		}

		attributeChangedCallback(name, oldValue, newValue) {
	    this.__controllers?.forEach((c) => c.hostAttributeChanged?.(name, oldValue, newValue))
		}
  }
}

export class CrystallizedController {
  constructor(host) {
    this.host = host
    this.actions = new DeclarativeActionsController(host)
	  this.shadowActions = new DeclarativeActionsController(host, { shadow: true })
	  this.targets = new TargetsController(host, { shadow: true })
  }
}

export { DeclarativeActionsController, TargetsController }
