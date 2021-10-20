/* eslint-disable no-plusplus */
/* eslint-disable no-bitwise */
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
// import * as monaco from 'monaco-editor'; // /esm/vs/editor/editor.main.js
import { RequestEvents } from '@advanced-rest-client/events';
import { ResizableMixin } from '@anypoint-web-components/awc';
import { MonacoTheme, MonacoHelper, MonacoStyles } from '@advanced-rest-client/monaco-support';
import elementStyles from '../styles/BodyEditor.styles.js';

/** @typedef {import('monaco-editor').editor.IStandaloneCodeEditor} IStandaloneCodeEditor */
/** @typedef {import('monaco-editor').editor.IStandaloneEditorConstructionOptions} IStandaloneEditorConstructionOptions */
/** @typedef {import('monaco-editor').editor.IEditorOptions} IEditorOptions */
/** @typedef {import('../../types').MonacoSchema} MonacoSchema */

/* global monaco */

import {
  valueValue,
  monacoInstance,
  contentTypeValue,
  languageValue,
  setLanguage,
  setupActions,
  valueChanged,
  changeTimeout,
  notifyChange,
  generateEditorConfig,
  readOnlyValue,
  setEditorConfigProperty,
  resizeHandler,
  refreshEditor,
  refreshDebouncer,
  modelUri,
  validationSchemas,
  getCurrentSchemas,
  updateEditorSchemas,
  createDefaultSchema,
} from './internals.js';

let modelId = 0;

export default class BodyRawEditorElement extends ResizableMixin(LitElement) {
  static get styles() {
    return [elementStyles, MonacoStyles];
  }

  static get properties() {
    return {
      /**
       * A HTTP body.
       */
      value: { type: String },
      /**
       * When set the editor is in read only mode.
       */
      readOnly: { type: Boolean },
      /** 
       * Uses the current content type to detect language support.
       */
      contentType: { type: String },
    };
  }

  get value() {
    return this[valueValue];
  }

  set value(value) {
    const old = this[valueValue];
    if (old === value) {
      return;
    }
    this[valueValue] = value;
    const { editor } = this;
    if (editor) {
      editor.setValue(value || '');
    }
  }

  get contentType() {
    return this[contentTypeValue];
  }

  set contentType(value) {
    const old = this[contentTypeValue];
    if (old === value) {
      return;
    }
    this[contentTypeValue] = value;
    const oldLang = this[languageValue];
    const lang = MonacoHelper.detectLanguage(value);
    if (oldLang === lang) {
      return;
    }
    this[languageValue] = lang;
    this[setLanguage](lang);
  }

  get readOnly() {
    return this[readOnlyValue];
  }

  set readOnly(value) {
    const old = this[readOnlyValue];
    if (old === value) {
      return;
    }
    this[readOnlyValue] = value;
    this[setEditorConfigProperty]('readOnly', value);
  }

  /**
   * @returns {IStandaloneCodeEditor}
   */
  get editor() {
    return this[monacoInstance];
  }

  /**
   * @returns {MonacoSchema[]}
   */
  get schemas() {
    return this[validationSchemas];
  }

  /**
   * @param {MonacoSchema[]} value
   */
  set schemas(value) {
    const old = this[validationSchemas];
    if (old === value) {
      return;
    }
    this[validationSchemas] = value;
    this[updateEditorSchemas](value);
  }

  constructor() {
    super();
    this[valueValue] = '';
    this[readOnlyValue] = false;

    this[valueChanged] = this[valueChanged].bind(this);
    this[resizeHandler] = this[resizeHandler].bind(this);
  }

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener('resize', this[resizeHandler]);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('resize', this[resizeHandler]);
  }

  firstUpdated() {
    const config = this[generateEditorConfig]();
    const instance = monaco.editor.create(this.shadowRoot.querySelector('#container'), config);
    instance.onDidChangeModelContent(this[valueChanged]);
    this[monacoInstance] = instance;
    this[setupActions](instance);
  }

  /**
   * Handler for the `resize` event provided by the resizable mixin.
   */
  [resizeHandler]() {
    if (this[refreshDebouncer]) {
      clearTimeout(this[refreshDebouncer]);
    }
    this[refreshDebouncer] = setTimeout(this[refreshEditor].bind(this));
  }
  
  /**
   * A function that is called from the `[resizeHandler]` in a timeout to reduce the number
   * of computations during the application initialization, where it can receive hundreds of
   * the `resize` events.
   */
  [refreshEditor]() {
    this[refreshDebouncer] = undefined;
    if (!this[monacoInstance]) {
      return;
    }
    this[monacoInstance].layout();
  }

  /**
   * @param {string} lang New language to set
   */
  [setLanguage](lang) {
    const { editor } = this;
    if (!editor) {
      return;
    }
    const model = editor.getModel();
    monaco.editor.setModelLanguage(model, lang);
  }

  /**
   * Sets up editor actions
   * @param {IStandaloneCodeEditor} editor
   */
  [setupActions](editor) {
    editor.addAction({
      id: 'send-http-request',
      label: 'Send request',
      keybindings: [
        monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter,
      ],
      precondition: null,
      keybindingContext: null,
      contextMenuGroupId: 'navigation',
      contextMenuOrder: 1.5,
      run: () => {
        RequestEvents.send(this);
        return null;
      }
    });
  }

  [valueChanged]() {
    this[valueValue] = this.editor.getValue();
    if (this[changeTimeout]) {
      // window.clearTimeout(this[changeTimeout]);
      window.cancelAnimationFrame(this[changeTimeout]);
    }
    this[changeTimeout] = window.requestAnimationFrame(() => {
      this[notifyChange]();
    });
  }

  [notifyChange]() {
    this.dispatchEvent(new CustomEvent('change'));
  }

  /**
   * Generates Monaco configuration
   * @returns {IStandaloneEditorConstructionOptions}
   */
  [generateEditorConfig]() {
    const { value='', readOnly } = this;
    const language = this[languageValue];
    this[modelUri] = monaco.Uri.parse(`http://raw-editor/model${++modelId}.json`);
    const model = monaco.editor.createModel(value, language || 'json', this[modelUri]);

    const schemas = this[getCurrentSchemas]();
    this[updateEditorSchemas](schemas);
    
    let config = /** @type IStandaloneEditorConstructionOptions */ ({
      minimap: {
        enabled: false,
      },
      readOnly,
      formatOnType: true,
      folding: true,
      tabSize: 2,
      detectIndentation: true,
      // value,
      automaticLayout: true,
      model,
    });
    config = MonacoTheme.assignTheme(monaco, config);
    if (language) {
      config.language = language;
    }
    return config;
  }

  [getCurrentSchemas]() {
    const { schemas } = this;
    if (Array.isArray(schemas) && schemas.length) {
      schemas[0].fileMatch = [this[modelUri].toString()];
      return schemas;
    }
    return [this[createDefaultSchema]()];
  }

  [createDefaultSchema]() {
    const schema = {
      uri: "http://raw-editor/default-schema.json",
      fileMatch: [this[modelUri].toString()],
      schema: {},
    };
    return schema;
  }

  [updateEditorSchemas](schemas) {
    if (!this[modelUri]) {
      // the editor is not yet ready. This will be called again when it is ready.
      return;
    }
    let value = schemas;
    if (!Array.isArray(value) || !value.length) {
      value = this[createDefaultSchema]();
    } else {
      value[0] = { ...value[0], fileMatch: [this[modelUri].toString()] };
    }
    monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
      validate: true,
      schemas: value,
    });
  }

  /**
   * @param {keyof IEditorOptions} prop The property to set
   * @param {any} value
   */
  [setEditorConfigProperty](prop, value) {
    const { editor } = this;
    if (!editor) {
      return;
    }
    const opts = {
      [prop]: value,
    };
    editor.updateOptions(opts);
  }
  
  render() {
    return html`<div id="container"></div>`;
  }
}
