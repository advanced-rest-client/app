/* eslint-disable class-methods-use-this */
import { LitElement, html } from 'lit-element';
import { ResizableMixin } from '@anypoint-web-components/awc';
import '@github/time-elements';
import '@advanced-rest-client/icons/arc-icon.js';
import '@anypoint-web-components/awc/anypoint-button.js';
import '@advanced-rest-client/highlight/arc-marked.js';
import { MarkdownStyles } from '@advanced-rest-client/highlight';
import styles from './styles/WorkspaceDetails.js';
import {
  editHandler,
  descriptionTemplate,
} from './internals.js';

export const noDataTemplate = Symbol('noDataTemplate');
export const valueTemplate = Symbol('valueTemplate');

/** @typedef {import('lit-element').TemplateResult} TemplateResult */
/** @typedef {import('@advanced-rest-client/events').Workspace.DomainWorkspace} DomainWorkspace */

export default class WorkspaceDetailsElement extends ResizableMixin(LitElement) {
  static get styles() {
    return [
      MarkdownStyles,
      styles
    ];
  }

  static get properties() {
    return {
      /**
       * The workspace object being rendered
       */
      workspace: { type: Object },
      /**
       * Enables Anypoint theme
       */
      anypoint: { type: Boolean },
    };
  }

  constructor() {
    super();
    /** 
     * @type {DomainWorkspace}
     */
    this.workspace = undefined;

    this.anypoint = false;
  }

  /**
   * Sends non-bubbling `edit` event to the parent element to perform
   * edit action.
   */
  [editHandler]() {
    this.dispatchEvent(new CustomEvent('edit'));
  }

  render() {
    const { workspace, anypoint } = this;
    if (!workspace) {
      return html``;
    }

    const { meta={}, provider={} } = workspace;
    const { version, published, } = meta;
    const { email, url, name: providerName } = provider;

    return html`
    <h2 class="title">Workspace details</h2>
    ${this[descriptionTemplate]()}
    <div class="meta-row">
      <div class="label">
        Version
      </div>
      ${this[valueTemplate](version)}
    </div>

    <div class="meta-row">
      <div class="label">
        Published
      </div>
      ${published ? html`<div class="value">
        <relative-time datetime="${published}"></relative-time> at
        <local-time datetime="${published}" hour="numeric" minute="numeric" second="numeric"></local-time>
      </div>` : this[noDataTemplate]()}
    </div>

    <h3>Provider</h3>

    <div class="meta-row">
      <div class="label">
        Author
      </div>
      ${this[valueTemplate](providerName)}
    </div>

    <div class="meta-row">
      <div class="label">
        Address
      </div>
      ${this[valueTemplate](url)}
    </div>

    <div class="meta-row">
      <div class="label">
        Contact
      </div>
      ${this[valueTemplate](email)}
    </div>

    <div class="actions">
      <anypoint-button
        @click="${this[editHandler]}"
        data-action="edit-meta"
        title="Opens workspace editor"
        ?anypoint="${anypoint}"
      >
        <arc-icon icon="edit"></arc-icon>
        Edit
      </anypoint-button>
    </div>`;
  }

  /**
   * @returns {TemplateResult|string} The template for the workspace description 
   */
  [descriptionTemplate]() {
    const { workspace } = this;
    const { meta={} } = workspace;
    const { description } = meta;
    if (!description) {
      return '';
    }
    return html`
    <arc-marked .markdown="${description}" sanitize>
      <div class="markdown-html markdown-body description"></div>
    </arc-marked>
    `;
  }

  /**
   * @returns {TemplateResult} 
   */
  [noDataTemplate]() {
    return html`<div class="value empty">No data</div>`;
  }

  /**
   * @param {string} value
   * @returns {TemplateResult} 
   */
  [valueTemplate](value) {
    return value ? html`<div class="value">${value}</div>` : this[noDataTemplate]();
  }
}
