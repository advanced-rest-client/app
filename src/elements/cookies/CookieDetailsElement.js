import { html, LitElement } from 'lit-element';
import { ResizableMixin } from '@anypoint-web-components/awc';
import { SessionCookieEvents } from '@advanced-rest-client/events';
import '@github/time-elements';
import '@advanced-rest-client/icons/arc-icon.js';
import '@anypoint-web-components/awc/anypoint-button.js';
import elementStyles from '../styles/CookieDetailsStyles.js';

/** @typedef {import('@advanced-rest-client/events').Cookies.ARCCookie} ARCCookie */
/** @typedef {import('lit-html').TemplateResult} TemplateResult */

export const deleteHandler = Symbol('deleteHandler');
export const editHandler = Symbol('editHandler');
export const actionsTemplate = Symbol('actionsTemplate');

/**
 * @param {string} label
 * @param {string} value
 * @return {TemplateResult}
 */
function rowTemplate(label, value='') {
  return html`
  <div class="meta-row lh">
    <span class="label">${label}</span>
    <span class="value">${value}</span>
  </div>
  `;
}

/**
 * @param {ARCCookie} cookie The cookie being rendered.
 * @return {TemplateResult|string} Template for the expires field of the cookie
 */
function expiresTemplate(cookie) {
  if (!cookie.expires) {
    return '';
  }
  const d = new Date(cookie.expires);
  const timeStr = d.toISOString();
  const now = Date.now();
  const label = now > cookie.expires ? 'Expired' : 'Expires';
  return html`
  <div class="meta-row lh">
    <span class="label">${label}</span>
    <span class="value">
      <relative-time datetime="${timeStr}"></relative-time> at
      <local-time datetime="${timeStr}" hour="numeric" minute="numeric" second="numeric"></local-time>
    </span>
  </div>`
}

/**
 * @param {boolean} value
 * @return {string}
 */
function booleanLabel(value) {
  return value ? 'Yes': 'No';
}

/**
 * A cookie details view element
 */
export default class CookieDetailsElement extends ResizableMixin(LitElement) {
  static get styles() {
    return elementStyles;
  }

  static get properties() {
    return {
      /**
       * A cookie to render
       */
      cookie: { type: Object },
    };
  }

  constructor() {
    super();
    this.cookie = null;
  }

  /**
   * Dispatches non-bubbling `delete` event to the parent element to perform the delete action.
   */
  async [deleteHandler]() {
    await SessionCookieEvents.delete(this, [{ ...this.cookie }]);
  }

  /**
   * Dispatches non-bubbling `edit` event to the parent element to perform the delete action.
   */
  [editHandler]() {
    this.dispatchEvent(new CustomEvent('edit'));
  }

  /**
   * @return {TemplateResult}
   */
  render() {
    const cookie = /** @type ARCCookie */ (this.cookie || {});
    const { hostOnly=false, httpOnly=false, secure=false, session=false } = cookie;
    return html`
      <h2>${cookie.name}</h2>
      ${rowTemplate('Value', cookie.value)}
      ${rowTemplate('Domain', cookie.domain)}
      ${rowTemplate('Path', cookie.path)}
      ${expiresTemplate(cookie)}
      ${rowTemplate('Host only', booleanLabel(hostOnly))}
      ${rowTemplate('HTTP only', booleanLabel(httpOnly))}
      ${rowTemplate('Secure', booleanLabel(secure))}
      ${rowTemplate('Session', booleanLabel(session))}
      ${this[actionsTemplate]()}
    `;
  }

  [actionsTemplate]() {
    return html`
    <div class="actions lh">
      <anypoint-button
        @click="${this[deleteHandler]}"
        data-action="delete-action"
      >
        <arc-icon icon="deleteIcon"></arc-icon>
        Delete
      </anypoint-button>
      <anypoint-button
        @click="${this[editHandler]}"
        data-action="edit-action"
      >
        <arc-icon icon="edit"></arc-icon>
        Edit
      </anypoint-button>
    </div>
    `
  }
}
