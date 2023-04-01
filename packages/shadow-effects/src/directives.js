/**
 * @typedef { import("./ShadowEffects.js").default } ShadowEffects
 */

/**
 * Set element `hidden` to false if value is true
 * 
 * @param {ShadowEffects} effects
 * @param {HTMLElement} el
 * @param {boolean} value
 */
export const show = (effects, el, value) => {
  el.hidden = !value
}

/**
 * Set element `hidden` to true if value is true
 * 
 * @param {ShadowEffects} effects
 * @param {HTMLElement} el
 * @param {boolean} value
 */
export const hide = (effects, el, value) => {
  el.hidden = !!value
}

/**
 * Toggle classes based on a key/value object
 * 
 * @param {ShadowEffects} effects
 * @param {HTMLElement} el
 * @param {Record<string, boolean>} obj
 */
export const classMap = (effects, el, obj) => {
  Object.entries(obj).forEach(([k, v]) => {
    el.classList.toggle(k, v)
  })
}

/**
 * Set inline styles based on a key/value object
 * 
 * @param {ShadowEffects} effects
 * @param {HTMLElement} el
 * @param {Record<string, boolean>} obj
 */
export const styleMap = (effects, el, obj) => {
  Object.entries(obj).forEach(([k, v]) => {
    el.style[k] = v
  })
}
