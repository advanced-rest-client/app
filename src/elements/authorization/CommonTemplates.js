import { html } from 'lit-element';
import { classMap } from 'lit-html/directives/class-map.js';
import { ifDefined } from 'lit-html/directives/if-defined.js';

/** @typedef {import('lit-html').TemplateResult} TemplateResult */

/**
 * @typedef {Object} InputConfiguration
 * @property {any=} type Type of the control
 * @property {any=} autocomplete Whether `autocomplete` is on. Default to `true`.
 * @property {boolean=} outlined
 * @property {boolean=} anypoint
 * @property {boolean=} readOnly
 * @property {boolean=} disabled
 * @property {boolean=} required
 * @property {boolean=} autoValidate
 * @property {string=} invalidLabel Invalid message
 * @property {string=} infoLabel Info message
 * @property {object=} classes CSS class names
 */

/**
 * Renders an input element for for the view.
 *
 * @param {string} name Input name
 * @param {string|number} value Current input value
 * @param {string} label The label to render
 * @param {Function} changeHandler Handler for the input event.
 * @param {InputConfiguration=} [opts={}] Optional configuration options
 * @return {TemplateResult}
 */
export const inputTemplate = (name, value, label, changeHandler, opts = {}) => {
  const config = { ...opts };
  config.type = opts.type || 'text';
  if (opts.autocomplete === undefined) {
    config.autocomplete = 'on';
  }
  return html`
    <anypoint-input
      .value="${value}"
      @change="${changeHandler}"
      name="${name}"
      type="${config.type}"
      ?required="${config.required}"
      ?autoValidate="${config.autoValidate}"
      autocomplete="${ifDefined(config.autocomplete)}"
      ?outlined="${config.outlined}"
      ?anypoint="${config.anypoint}"
      ?readOnly="${config.readOnly}"
      ?disabled="${config.disabled}"
      invalidMessage="${ifDefined(config.invalidLabel)}"
      infoMessage="${ifDefined(config.infoLabel)}"
      class="${classMap(config.classes)}"
    >
      <label slot="label">${label}</label>
    </anypoint-input>
  `;
};

/**
 * Renders a password input element for the view.
 *
 * @param {String} name Input name
 * @param {String} value Current input value
 * @param {String} label The label to render
 * @param {Function} inputHandler Handler for the input event.
 * @param {InputConfiguration=} [opts={}] Optional configuration options
 * @return {TemplateResult}
 */
export const passwordTemplate = (
  name,
  value,
  label,
  inputHandler,
  opts = {}
) => {
  const config = { ...opts };
  config.type = opts.type || 'text';
  if (opts.autocomplete === undefined) {
    config.autocomplete = 'on';
  }
  return html`
    <anypoint-masked-input
      .value="${value}"
      @change="${inputHandler}"
      name="${name}"
      type="${config.type}"
      ?required="${config.required}"
      ?autoValidate="${config.autoValidate}"
      autocomplete="${ifDefined(config.autocomplete)}"
      ?outlined="${config.outlined}"
      ?anypoint="${config.anypoint}"
      ?readOnly="${config.readOnly}"
      ?disabled="${config.disabled}"
      invalidMessage="${ifDefined(config.invalidLabel)}"
      infoMessage="${ifDefined(config.infoLabel)}"
      class="${classMap(config.classes)}"
    >
      <label slot="label">${label}</label>
    </anypoint-masked-input>
  `;
};
