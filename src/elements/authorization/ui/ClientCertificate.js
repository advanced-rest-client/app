/* eslint-disable class-methods-use-this */
import { html } from 'lit-html';
import { ArcNavigationEvents, TelemetryEvents } from '@advanced-rest-client/events';
import AuthUiBase from "./AuthUiBase.js";

/** @typedef {import('../types').AuthUiInit} AuthUiInit */
/** @typedef {import('@advanced-rest-client/events').Authorization.CCAuthorization} CCAuthorization */
/** @typedef {import('@advanced-rest-client/events').ClientCertificate.ARCCertificateIndex} ARCCertificateIndex */
/** @typedef {import('lit-element').TemplateResult} TemplateResult */

export default class ClientCertificate extends AuthUiBase {
  /**
     * @return {Boolean} `true` if `items` is set and has cookies
     */
  get hasItems() {
    const { items } = this;
    return !!(items && items.length);
  }

  /**
   * @param {AuthUiInit} init
   */
  constructor(init) {
    super(init);
    /** 
     * The id of selected certificate.
     */
    this.selected = undefined;
    /**
     * When set it renders `none` option in the list of certificates.
     */
    this.none = false;
    /**
     * When set it renders `import certificate` button.
     * When enabled the application must handle
     * `client-certificate-import` event dispatched by this element
     * to render some kind of UI to import a certificate.
     * The element does not have an UI to import certificates.
     *
     * The event bubbles and is cancelable.
     */
    this.importButton = false;
    /** 
     * @type {ARCCertificateIndex[]}
     */
    this.items = undefined;

    this.selectedHandler = this.selectedHandler.bind(this);
    this.importHandler = this.importHandler.bind(this);
  }

  reset() {
    this.selected = undefined;
  }

  /**
   * Restores previously serialized Basic authentication values.
   * @param {CCAuthorization} state Previously serialized values
   */
  restore(state) {
    this.selected = state && state.id || undefined;
  }

  /**
   * Creates a settings object with user provided data for current method.
   *
   * @return {CCAuthorization} User provided data
   */
  serialize() {
    const { selected } = this;
    if (!selected || selected === 'none') {
      // @ts-ignore
      return {};
    }
    return {
      id: this.selected,
    };
  }

  selectedHandler(e) {
    const { selectedItem } = e.target;
    if (!selectedItem) {
      return;
    }
    const { checked, dataset } = selectedItem;
    if (!checked || this.selected === dataset.id) {
      return;
    }
    this.selected = dataset.id;
    this.notifyChange();

    TelemetryEvents.event(this.target, {
      category: 'Certificates',
      action: 'Authorization',
      label: 'selected-certificate'
    });
  }

  importHandler() {
    ArcNavigationEvents.navigate(this.target, 'client-certificate-import');
    TelemetryEvents.event(this.target, {
      category: 'Certificates',
      action: 'Authorization',
      label: 'navigate-import'
    });
  }

  render() {
    const { hasItems } = this;
    return html`
    ${this.importTemplate()}
    ${hasItems ? this.contentTemplate() : this.emptyTemplate()}`;
  }

  contentTemplate() {
    const { items, selected } = this;
    return html`
    <div class="list">
      <anypoint-radio-group
        attrForSelected="data-id"
        .selected="${selected}"
        @selectedchange="${this.selectedHandler}"
      >
        ${this.defaultItemTemplate()}
        ${items.map((item) => this.certItemTemplate(item))}
      </anypoint-radio-group>
    </div>`;
  }

  emptyTemplate() {
    return html`<p class="empty-screen">There are no certificates installed in this application.</p>`;
  }

  defaultItemTemplate() {
    const { none } = this;
    if (!none) {
      return '';
    }
    return html`<anypoint-radio-button data-id="none" class="default">None</anypoint-radio-button>`;
  }

  /**
   * @param {ARCCertificateIndex} item The item to render
   * @returns {TemplateResult} The template for the dropdown item.
   */
  certItemTemplate(item) {
    return html`
    <anypoint-radio-button data-id="${item._id}">
      <div class="cert-meta">
        <span class="name">${item.name}</span>
        <span class="created">Added: ${this.dateTimeTemplate(item.created)}</span>
      </div>
    </anypoint-radio-button>`;
  }

  /**
   * @param {number} created The certificate created time.
   * @returns {TemplateResult} The template for the cert time element.
   */
  dateTimeTemplate(created) {
    return html`<date-time
      .date="${created}"
      year="numeric"
      month="numeric"
      day="numeric"
      hour="numeric"
      minute="numeric"
    ></date-time>`;
  }

  importTemplate() {
    const { importButton } = this;
    if (!importButton) {
      return '';
    }
    return html`
    <anypoint-button
      title="Opens a dialog that allows to import client certificate"
      aria-label="Activate to open import certificate dialog"
      @click="${this.importHandler}"
    >Import certificate</anypoint-button>`;
  }
}
