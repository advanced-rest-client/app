/* eslint-disable class-methods-use-this */
/**
@license
Copyright 2021 The Advanced REST client authors <arc@mulesoft.com>
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
import { MonacoTheme, MonacoStyles } from '@advanced-rest-client/monaco-support';
import '@anypoint-web-components/awc/anypoint-input.js';
import '@anypoint-web-components/awc/anypoint-button.js';
import { ArcModelEvents } from '@advanced-rest-client/events';
import elementStyles from './styles/MetaEditor.js';

/* global  monaco */
/** @typedef {import('@advanced-rest-client/events').Project.ARCProject} ARCProject */
/** @typedef {import('monaco-editor').editor.IStandaloneEditorConstructionOptions} IStandaloneEditorConstructionOptions */

export const inputHandler = Symbol('inputHandler');
export const generateEditorConfig = Symbol('generateEditorConfig');
export const monacoValueChanged = Symbol('monacoValueChanged');
export const monacoInstance = Symbol('monacoInstance');
export const descriptionTemplate = Symbol('descriptionTemplate');
export const saveActionTemplate = Symbol('saveActionTemplate');
export const cancelActionTemplate = Symbol('cancelActionTemplate');
export const savingValue = Symbol('savingValue');
export const nameInputTemplate = Symbol('nameInputTemplate');
export const projectValue = Symbol('projectValue');
export const processProjectValue = Symbol('processProjectValue');
export const saveHandler = Symbol('saveHandler');

export default class ProjectMetaEditorElement extends LitElement {
  static get styles() {
    return [elementStyles, MonacoStyles];
  }

  /**
   * @returns {ARCProject}
   */
  get project() {
    return this[projectValue];
  }

  /**
   * @param {ARCProject} value 
   */
  set project(value) {
    const old = this[projectValue];
    if (old === value) {
      return;
    }
    this[projectValue] = value;
    this[processProjectValue](value);
  }

  static get properties() {
    return {
      /**
       * The name of the project.
       */
      name: { type: String },
      /**
       * Project's description.
       */
      description: { type: String },
      /**
       * Enables Anypoint theme
       */
      anypoint: { type: Boolean },
      /**
       * Enables Material Design outlined style for inputs.
       */
      outlined: { type: Boolean }
    };
  }

  constructor() {
    super();
    /**
     * @type {string}
     */
    this.name = undefined;
    /**
     * @type {string}
     */
    this.description = undefined;
    this.anypoint = false;
    this.outlined = false;
    this[savingValue] = false;

    this[monacoValueChanged] = this[monacoValueChanged].bind(this);
  }

  /**
   * @param {Map<string | number | symbol, unknown>} args
   */
  firstUpdated(args) {
    super.firstUpdated(args);
    const config = this[generateEditorConfig]();
    // @ts-ignore
    const instance = monaco.editor.create(this.shadowRoot.querySelector('.monaco'), config);
    instance.onDidChangeModelContent(this[monacoValueChanged]);
    this[monacoInstance] = instance;
  }

  /**
   * 
   * @param {ARCProject} value 
   */
  [processProjectValue](value) {
    this.name = value && value.name;
    this.description = value && value.description;
    if (this[monacoInstance]) {
      this[monacoInstance].setValue(this.description || '');
    }
  }

  [generateEditorConfig]() {
    let config = /** IStandaloneEditorConstructionOptions */ ({
      minimap: {
        enabled: false,
      },
      formatOnType: true,
      folding: true,
      tabSize: 2,
      detectIndentation: true,
      value: this.description,
    });
    // @ts-ignore
    config = MonacoTheme.assignTheme(monaco, config);
    config.language = 'markdown';
    return config;
  }

  [monacoValueChanged]() {
    this.description =  this[monacoInstance].getValue();
  }

  /**
   * Sends the `cancel-edit` custom event to the parent element.
   */
  cancel() {
    this.dispatchEvent(new CustomEvent('close'));
  }

  async [saveHandler]() {
    const { project } = this;
    if (!project) {
      return;
    }
    const cp = { ...project };
    cp.name = this.name;
    cp.description = this.description;
    this[savingValue] = true;
    this.requestUpdate();
    const record = await ArcModelEvents.Project.update(this, cp);
    this.project = record && record.item;
    this[savingValue] = false;
    this.requestUpdate();
    this.cancel();
  }

  /**
   * @param {Event} e 
   */
  [inputHandler](e) {
    const input = /** @type HTMLInputElement */ (e.target);
    const { name, value } = input;
    this[name] = value;
  }

  render() {
    return html`
    ${this[nameInputTemplate]()}
    ${this[descriptionTemplate]()}
    <div class="actions">
      ${this[cancelActionTemplate]()}
      ${this[saveActionTemplate]()}
    </div>`;
  }

  [nameInputTemplate]() {
    const { anypoint, outlined, name } = this;
    return html`
    <anypoint-input
      required
      autoValidate
      ?anypoint="${anypoint}"
      ?outlined="${outlined}"
      .value="${name}"
      name="name"
      @change="${this[inputHandler]}"
    >
      <label slot="label">Project name</label>
    </anypoint-input>
    `;
  }

  [descriptionTemplate]() {
    return html`
    <div class="monaco-wrap">
      <label>Description (markdown)</label>
      <div class="monaco"></div>
    </div>`;
  }

  [saveActionTemplate]() {
    const { anypoint } = this;
    return html`<anypoint-button
      @click="${this[saveHandler]}"
      data-action="save"
      title="Saves the project meta"
      aria-label="Activate to save the project meta"
      ?anypoint="${anypoint}"
      ?disabled="${this[savingValue]}"
    >
      Save
    </anypoint-button>
    `;
  }

  [cancelActionTemplate]() {
    const { anypoint } = this;
    return html`<anypoint-button
      @click="${this.cancel}"
      data-action="cancel"
      title="Cancel the change"
      aria-label="Activate to cancel the dialog"
      ?anypoint="${anypoint}"
      ?disabled="${this[savingValue]}"
    >
      Cancel
    </anypoint-button>
    `;
  }
}
