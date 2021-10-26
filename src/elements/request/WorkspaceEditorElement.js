/* eslint-disable lit-a11y/click-events-have-key-events */
/* eslint-disable class-methods-use-this */
/**
@license
Copyright 2018 The Advanced REST client authors <arc@mulesoft.com>
Licensed under the Apache License, Version 2.0 (the "License"); you may not
use this file except in compliance with the License. You may obtain a copy of
the License at
http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
License for the specific language governing permissions and limitations under
the License.
*/
import { LitElement, html } from 'lit-element';
import { ResizableMixin } from '@anypoint-web-components/awc';
import { MonacoTheme, MonacoStyles } from '@advanced-rest-client/monaco-support';
import '@anypoint-web-components/awc/anypoint-input.js';
import '@anypoint-web-components/awc/anypoint-collapse.js';
import '@anypoint-web-components/awc/anypoint-button.js';
import '@anypoint-web-components/awc/anypoint-icon-button.js';
import '@advanced-rest-client/icons/arc-icon.js';
import styles from './styles/WorkspaceEditor.js';
import {
  descriptionTemplate,
  submitHandler,
  cancelHandler,
  saveHandler,
  versionTemplate,
  publishedTemplate,
  additionalTemplate,
  actionsTemplate,
  providerNameTemplate,
  providerUrlTemplate,
  providerEmailTemplate,
  sendForm,
  keydownHandler,
} from './internals.js';

export const toggleOptions = Symbol('toggleOptions');
export const generateEditorConfig = Symbol('generateEditorConfig');
export const monacoValueChanged = Symbol('monacoValueChanged');
export const monacoInstance = Symbol('monacoInstance');
export const workspaceChanged = Symbol('workspaceChanged');
export const workspaceValue = Symbol('workspaceValue');

/** @typedef {import('lit-element').TemplateResult} TemplateResult */
/** @typedef {import('@advanced-rest-client/events').Workspace.DomainWorkspace} DomainWorkspace */
/** @typedef {import('@anypoint-web-components/awc').AnypointInputElement} AnypointInput */
/** @typedef {import('monaco-editor').editor.IStandaloneEditorConstructionOptions} IStandaloneEditorConstructionOptions */

/* global monaco */

export default class WorkspaceEditorElement extends ResizableMixin(LitElement) {
  static get styles() {
    return [
      styles,
      MonacoStyles,
    ];
  }

  /** 
   * @returns {DomainWorkspace}
   */
  get workspace() {
    return this[workspaceValue];
  }

  /** 
   * @param {DomainWorkspace=} value
   */
  set workspace(value) {
    const old = this[workspaceValue];
    if (old === value) {
      return;
    }
    const effectiveValue = value || { kind: 'ARC#DomainWorkspace' };
    this[workspaceValue] = effectiveValue;
    this[workspaceChanged](effectiveValue);
    this.requestUpdate('workspace', old);
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
      /**
       * Enables material's outlined theme for inputs.
       */
      outlined: { type: Boolean },
      /**
       * Toggles additional options
       */
      providerInfoOpened: { type: Boolean },
    };
  }

  constructor() {
    super();
    /** 
     * @type {DomainWorkspace}
     */
    this[workspaceValue] = {
      kind: 'ARC#DomainWorkspace',
    };

    this.anypoint = false;
    this.outlined = false;

    this[keydownHandler] = this[keydownHandler].bind(this);
  }

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener('keydown', this[keydownHandler]);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('keydown', this[keydownHandler]);
  }

  /**
   * @param {Map<string | number | symbol, unknown>} args
   */
  firstUpdated(args) {
    super.firstUpdated(args);
    const config = this[generateEditorConfig]();
    // @ts-ignore
    const instance = monaco.editor.create(this.shadowRoot.querySelector('.monaco'), config);
    this[monacoInstance] = instance;
  }

  /**
   * @param {KeyboardEvent} e
   */
  [keydownHandler](e) {
    const { ctrlKey, key } = e;
    if (ctrlKey && key === 'Enter') {
      this[sendForm]();
    }
  }

  /**
   * Clicks on the "submit" button to mimic user click.
   */
  [sendForm]() {
    /** @type HTMLInputElement */ (this.shadowRoot.querySelector('input[type="submit"]')).click();
  }

  /**
   * @param {DomainWorkspace=} workspace
   */
  [workspaceChanged](workspace) {
    if (!workspace || !this[monacoInstance]) {
      return;
    }
    const { meta={} } = workspace;
    const { description='' } = meta;
    this[monacoInstance].setValue(description);
  }

  [toggleOptions]() {
    this.providerInfoOpened = !this.providerInfoOpened;
  }

  /**
   * Sends the `cancel` custom event to cancel the edit.
   */
  [cancelHandler]() {
    this.dispatchEvent(new CustomEvent('close'));
  }

  /**
   * Dispatches the save event with updated workspace.
   */
  [saveHandler]() {
    this.send();
  }

  /**
   * Serializes values into a form.
   * @returns {DomainWorkspace} [description]
   */
  serializeForm() {
    const { workspace } = this;
    const inputs = /** @type AnypointInput[] */ (Array.from(this.shadowRoot.querySelectorAll('form anypoint-input')));
    const values = {};
    inputs.forEach((input) => {
      values[input.name] = input.value;
    });
    if (!workspace.meta) {
      workspace.meta = {};
    }
    if (!workspace.provider) {
      workspace.provider = {};
    }
    if (values['provider.email'] !== undefined) {
      workspace.provider.email = values['provider.email'];
    }
    if (values['provider.name'] !== undefined) {
      workspace.provider.name = values['provider.name'];
    }
    if (values['provider.url'] !== undefined) {
      workspace.provider.url = values['provider.url'];
    }
    if (values['meta.published'] !== undefined) {
      workspace.meta.published = values['meta.published'];
    }
    if (values['meta.version'] !== undefined) {
      workspace.meta.version = values['meta.version'];
    }
    const value = this[monacoInstance].getValue();
    workspace.meta.description = value;
    return workspace;
  }

  /**
   * @returns {boolean} True when all inputs are valid.
   */
  validate() {
    const inputs = /** @type AnypointInput[] */ (Array.from(this.shadowRoot.querySelectorAll('form anypoint-input')));
    let result = true;
    inputs.forEach((input) => {
      if (!input.validate()) {
        result = false;
      }
    });
    return result;
  }

  [generateEditorConfig]() {
    const { workspace } = this;
    const { meta={} } = workspace;
    const { description='' } = meta;
    let config = /** IStandaloneEditorConstructionOptions */ ({
      minimap: {
        enabled: false,
      },
      formatOnType: true,
      folding: true,
      tabSize: 2,
      detectIndentation: true,
      value: description,
    });
    // @ts-ignore
    config = MonacoTheme.assignTheme(monaco, config);
    config.language = 'markdown';
    return config;
  }

  /**
   * Calls the `save()` function on form submit.
   *
   * @param {Event} e
   */
  [submitHandler](e) {
    e.preventDefault();
    this.send();
  }

  /**
   * Validates and submits the form.
   */
  send() {
    if (!this.validate()) {
      return;
    }
    const workspace = this.serializeForm();
    this.dispatchEvent(new CustomEvent('store', {
      detail: workspace,
    }));
  }

  render() {
    return html`
    <h2 class="title">Edit workspace details</h2>
    <form method="POST" @submit="${this[submitHandler]}">
      ${this[descriptionTemplate]()}
      ${this[versionTemplate]()}
      ${this[publishedTemplate]()}
      ${this[additionalTemplate]()}
      ${this[actionsTemplate]()}
      <input type="submit" hidden/>
    </form>`;
  }

  /**
   * @returns {TemplateResult} The template for the description input.
   */
  [descriptionTemplate]() {
    return html`
    <div class="monaco-wrap">
      <label>Description (markdown)</label>
      <div class="monaco"></div>
    </div>`;
  }

  /**
   * @returns {TemplateResult} The template for the version input.
   */
  [versionTemplate]() {
    const { anypoint, outlined, workspace } = this;
    const { meta={} } = workspace;
    return html`
    <anypoint-input
      name="meta.version"
      .value="${meta.version}"
      ?anypoint="${anypoint}"
      ?outlined="${outlined}"
    >
      <label slot="label">Version</label>
    </anypoint-input>`;
  }

  /**
   * @returns {TemplateResult} The template for the published time input.
   */
  [publishedTemplate]() {
    const {
      anypoint,
      outlined,
      workspace,
    } = this;
    const { meta={} } = workspace;
    const { published } = meta;
    return html`
    <anypoint-input
      name="meta.published"
      .value="${published}"
      ?anypoint="${anypoint}"
      ?outlined="${outlined}"
      type="datetime-local"
    >
      <label slot="label">Published</label>
    </anypoint-input>`;
  }

  /**
   * @returns {TemplateResult} The template for the workspace additional meta
   */
  [additionalTemplate]() {
    const { providerInfoOpened } = this;
    return html`
    <section class="additional-options">
      <div
        class="caption"
        @click="${this[toggleOptions]}"
        ?data-caption-opened="${providerInfoOpened}"
      >
        Provider info
        <anypoint-icon-button
          class="caption-icon"
          aria-label="Activate to toggle additional options"
        >
          <arc-icon icon="arrowDropDown"></arc-icon>
        </anypoint-icon-button>
      </div>
      <anypoint-collapse .opened="${providerInfoOpened}">
        <div class="options">
          ${this[providerNameTemplate]()}
          ${this[providerUrlTemplate]()}
          ${this[providerEmailTemplate]()}
        </div>
      </anypoint-collapse>
    </section>`;
  }

  /**
   * @returns {TemplateResult} The template for the provider name value.
   */
  [providerNameTemplate]() {
    const { anypoint, outlined, workspace } = this;
    const { provider={} } = workspace;
    const { name } = provider;
    return html`
    <anypoint-input
      name="provider.name"
      .value="${name}"
      ?anypoint="${anypoint}"
      ?outlined="${outlined}"
    >
      <label slot="label">Author</label>
    </anypoint-input>`;
  }

  /**
   * @returns {TemplateResult} The template for the provider URL value.
   */
  [providerUrlTemplate]() {
    const { anypoint, outlined, workspace } = this;
    const { provider={} } = workspace;
    const { url } = provider;
    return html`
    <anypoint-input
      name="provider.url"
      .value="${url}"
      ?anypoint="${anypoint}"
      ?outlined="${outlined}"
    >
      <label slot="label">Website</label>
    </anypoint-input>`;
  }

  /**
   * @returns {TemplateResult} The template for the provider email value.
   */
  [providerEmailTemplate]() {
    const { anypoint, outlined, workspace } = this;
    const { provider={} } = workspace;
    const { email } = provider;
    return html`
    <anypoint-input
      name="provider.email"
      .value="${email}"
      ?anypoint="${anypoint}"
      ?outlined="${outlined}"
    >
      <label slot="label">Email</label>
    </anypoint-input>`;
  }

  /**
   * @returns {TemplateResult} The template for the action buttons
   */
  [actionsTemplate]() {
    const { anypoint } = this;
    return html`
    <div class="actions">
      <anypoint-button
        @click="${this[cancelHandler]}"
        data-action="cancel-edit"
        title="Cancels any changes"
        ?anypoint="${anypoint}"
      >Cancel</anypoint-button>
      <anypoint-button
        class="action-button"
        @click="${this[saveHandler]}"
        data-action="save"
        title="Save workspace data"
        ?anypoint="${anypoint}"
      >Save</anypoint-button>
    </div>
    `;
  }
}
