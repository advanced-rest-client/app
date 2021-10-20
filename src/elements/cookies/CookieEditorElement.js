import { html, LitElement } from 'lit-element';
import { ResizableMixin } from '@anypoint-web-components/awc';
import '@anypoint-web-components/awc/anypoint-checkbox.js';
import '@anypoint-web-components/awc/anypoint-input.js';
import '@anypoint-web-components/awc/anypoint-button.js';
import elementStyles from '../styles/CookieEditorStyles.js';

/** @typedef {import('lit-html').TemplateResult} TemplateResult */
/** @typedef {import('@advanced-rest-client/events').Cookies.ARCCookie} ARCCookie */
/** @typedef {import('@anypoint-web-components/awc').AnypointInputElement} AnypointInput */
/** @typedef {import('@anypoint-web-components/awc').AnypointCheckboxElement} AnypointCheckbox */

export const cookieChanged = Symbol('cookieChanged');
export const actionsTemplate = Symbol('actionsTemplate');
export const cancelHandler = Symbol('cancelHandler');
export const saveHandler = Symbol('saveHandler');
export const submitHandler = Symbol('submitHandler');
export const inputHandler = Symbol('inputHandler');
export const checkedHandler = Symbol('checkedHandler');
export const inputTemplate = Symbol('inputTemplate');
export const expiresTemplate = Symbol('expiresTemplate');
export const checkedTemplate = Symbol('checkedTemplate');

/**
 * Converts the timestamp to a formatted date string accepted by the input
 * field.
 * @param {Number} time Timestamp.
 * @return {String} Formatted date or undefined if `time` is not set or invalid.
 */
function convertTime(time) {
  if (!time) {
    return '';
  }
  const d = new Date(time);
  if (Number.isNaN(d.getTime())) {
    return '';
  }
  const iso = d.toISOString();
  return iso.substr(0, 16);
}

/**
 * An element to edit cookie metadata.
 */
export default class CookieEditorElement extends ResizableMixin(LitElement) {
  static get styles() {
    return elementStyles;
  }

  /**
   * @return {ARCCookie|undefined}
   */
  get cookie() {
    return this._cookie;
  }

  /**
   * @param {ARCCookie=} value
   */
  set cookie(value) {
    const old = this._cookie;
    /* istanbul ignore if */
    if (old === value) {
      return;
    }
    this._cookie = value;
    this[cookieChanged](value);
  }

  static get properties() {
    return {
      /**
       * Currently existing cookie.
       * Values of this cookie will not change.
       * All new values are sent only in the `save-cookie` event
       */
      cookie: { type: Object },
      /**
       * When set the editor is in read only mode.
       */
      readOnly: { type: Boolean },
      /**
       * Enables outlined theme.
       */
      outlined: { type: Boolean, reflect: true },
      /**
       * Enables Anypoint theme.
       */
      anypoint: { type: Boolean, reflect: true },

      invalid: { type: Boolean, reflect: true },
    };
  }

  constructor() {
    super();
    this.cookie = undefined;
    this.anypoint = false;
    this.outlined = false;
    this.readOnly = false;
    this.invalid = false;

    this._cookieName = '';
    this._cookieValue = '';
    this._cookieDomain = '';
    this._expires = '';
    this._cookiePath = '';
    this._hostOnly = false;
    this._httpOnly = false;
    this._secure = false;
    this._session = false;
  }

  connectedCallback() {
    super.connectedCallback();
    if (!this.hasAttribute('tabindex')) {
      this.setAttribute('tabindex', '-1');
    }
    if (!this.hasAttribute('role')) {
      this.setAttribute('role', 'dialog');
    }
  }

  /**
   * Updates state of the UI controls depending on existing cookie value
   * @param {ARCCookie=} value Cookie to render
   */
  [cookieChanged](value={name: '', domain: '', path: ''}) {
    this._cookieName = value.name || '';
    this._cookieValue = value.value || '';
    this._cookieDomain = value.domain || '';
    this._cookiePath = value.path || '';
    this._hostOnly = !!value.hostOnly;
    this._httpOnly = !!value.httpOnly;
    this._secure = !!value.secure;
    this._session = !!value.session;
    const exp = convertTime(value.expires);
    this._expires = exp || '';
    this.requestUpdate();
  }

  /**
   * Dispatches non-bubbling `cancel` event to the parent element to cancel the editing
   */
  [cancelHandler]() {
    this.dispatchEvent(new CustomEvent('cancel'));
  }

  [saveHandler]() {
    if (!this.validate()) {
      return;
    }
    const values = this.serialize();
    this.dispatchEvent(new CustomEvent('save', {
      detail: values,
    }));
  }

  /**
   * @returns {ARCCookie}
   */
  serialize() {
    const cookie = /** @type ARCCookie */ ({
      name: this._cookieName,
      value: this._cookieValue || '',
      domain: this._cookieDomain,
      path: this._cookiePath,
      hostOnly: this._hostOnly,
      httpOnly: this._httpOnly,
      secure: this._secure,
      session: this._session,
    });
    const typedExpires = new Date(this._expires);
    if (!Number.isNaN(typedExpires.getTime())) {
      cookie.expires = typedExpires.getTime();
    }
    return cookie;
  }

  /**
   * Checks whether the form is valid.
   */
  validate() {
    const inputs = Array.from(this.shadowRoot.querySelectorAll('form anypoint-input'));
    // @ts-ignore
    const isInvalid = inputs.some((item) => item.validate && item.validate() === false);
    this.invalid = isInvalid;
    return !isInvalid;
  }

  /**
   * Updates local property value on user input
   *
   * @param {CustomEvent} e
   */
  [inputHandler](e) {
    const node = /** @type AnypointInput */ (e.target);
    const { property } = node.dataset;
    this[`_${property}`] = node.value;
  }

  /**
   * Updates local property value on user checkbox selection
   *
   * @param {CustomEvent} e
   */
  [checkedHandler](e) {
    const node = /** @type AnypointCheckbox */ (e.target);
    const { property } = node.dataset;
    this[`_${property}`] = node.checked;
  }

  /**
   * @return {TemplateResult}
   */
  render() {
    return html`
      <h2>Edit cookie</h2>
      <form method="POST">
        ${this[inputTemplate]('cookieName', 'name', this._cookieName, 'Cookie name (required)', true)}
        ${this[inputTemplate]('cookieValue', 'value', this._cookieValue, 'Value')}
        ${this[inputTemplate]('cookieDomain', 'domain', this._cookieDomain, 'Domain (required)', true)}
        ${this[inputTemplate]('cookiePath', 'path', this._cookiePath, 'Path (required)', true)}
        ${this[expiresTemplate](this._expires)}
        ${this[checkedTemplate]('hostOnly', 'hostOnly', 'Host only', this._hostOnly)}
        ${this[checkedTemplate]('httpOnly', 'httpOnly', 'HTTP only', this._httpOnly)}
        ${this[checkedTemplate]('secure', 'secure', 'Secure', this._secure)}
        ${this[checkedTemplate]('session', 'session', 'Session', this._session)}
      </form>
      ${this[actionsTemplate]()}
    `;
  }

  /**
   * @param {string} property
   * @param {string} name
   * @param {string} value
   * @param {string} label
   * @param {boolean=} required
   * @return {TemplateResult}
   */
  [inputTemplate](property, name, value, label, required=false) {
    const {
      anypoint,
      readOnly,
      outlined,
    } = this;
    const im = required ? `${name} is required` : '';
    return html`
    <anypoint-input
      data-property="${property}"
      name="${name}"
      ?required="${required}"
      ?autoValidate="${required}"
      invalidMessage="${im}"
      .value="${value}"
      ?readonly="${readOnly}"
      ?anypoint="${anypoint}"
      ?outlined="${outlined}"
      @value-changed="${this[inputHandler]}"
    >
      <label slot="label">${label}</label>
    </anypoint-input>`;
  }

  /**
   * @param {string} value
   * @return {TemplateResult}
   */
  [expiresTemplate](value) {
    const {
      anypoint,
      readOnly,
      outlined,
    } = this;
    return html`
    <anypoint-input
      data-property="expires"
      type="datetime-local"
      name="expires"
      pattern="[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}"
      autoValidate
      .value="${value}"
      ?readonly="${readOnly}"
      ?anypoint="${anypoint}"
      ?outlined="${outlined}"
      @value-changed="${this[inputHandler]}"
    >
      <label slot="label">Expires</label>
    </anypoint-input>
    `;
  }

  /**
   * @param {string} property
   * @param {string} name
   * @param {string} label
   * @param {boolean} checked
   * @return {TemplateResult}
   */
  [checkedTemplate](property, name, label, checked) {
    const { readOnly, } = this;
    return html`
    <anypoint-checkbox
      data-property="${property}"
      name="${name}"
      .checked="${checked}"
      ?disabled="${readOnly}"
      @checked-changed="${this[checkedHandler]}"
    >${label}</anypoint-checkbox>`;
  }

  [actionsTemplate]() {
    const {
      anypoint,
      readOnly,
    } = this;
    return html`
    <div class="actions">
      <anypoint-button
        @click="${this[cancelHandler]}"
        ?disabled="${readOnly}"
        ?anypoint="${anypoint}"
        data-action="cancel-action"
      >Cancel</anypoint-button>
      <anypoint-button
        @click="${this[saveHandler]}"
        data-action="save-action"
        ?disabled="${readOnly}"
        ?anypoint="${anypoint}"
        class="action-button"
      >Save</anypoint-button>
    </div>
    `
  }
}
