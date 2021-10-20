import { html } from 'lit-html';
import { ifDefined } from 'lit-html/directives/if-defined.js';
import { DemoPage } from '@advanced-rest-client/arc-demo-helper';
import { RequestEventTypes } from '@advanced-rest-client/events';
import '@anypoint-web-components/awc/anypoint-switch.js';
import { BodyProcessor } from '@advanced-rest-client/libs';
import { MonacoLoader } from '@advanced-rest-client/monaco-support';
import '../../define/body-editor.js';

/** @typedef {import('../../').BodyEditorElement} BodyEditorElement */

const valueKey = 'demo.bodyEditor.value';
const modelKey = 'demo.bodyEditor.model';

class ComponentPage extends DemoPage {
  constructor() {
    super();
    this.initObservableProperties([
      'autoEncode', 'value', 'contentType', 'initializing'
    ]);
    this.componentName = 'body-editor';
    this.renderViewControls = true;
    this.autoEncode = false;
    this.initializing = true;
    this.value = undefined;
    this.meta = undefined;
    // this.generator = new DataGenerator();
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      this.darkThemeActive = true;
    }

    this.valueChange = this.valueChange.bind(this);
    this.selectHandler = this.selectHandler.bind(this);
    this.contentTypeChanged = this.contentTypeChanged.bind(this);
    this.restoreLocalValues();
    window.addEventListener(RequestEventTypes.State.contentTypeChange, this.editorMimeHandler.bind(this))
  }

  async restoreLocalValues() {
    await this.restoreValue();
    await this.loadMonaco();
    const modelRaw = window.localStorage.getItem(modelKey);
    if (modelRaw) {
      try {
        const model = JSON.parse(modelRaw);
        if (model) {
          this.meta = model;
        }
      } catch (e) {
        // ....
      }
    }
    this.initializing = false;
  }

  async restoreValue() {
    const valueRaw = window.localStorage.getItem(valueKey);
    if (!valueRaw) {
      return;
    }
    let data;
    try {
      data = JSON.parse(valueRaw);
    } catch (e) {
      this.value = valueRaw;
      return;
    }
    if (data.type === 'File') {
      this.value = BodyProcessor.dataURLtoBlob(data.value);
      return;
    }
    if (data.type === 'FormData') {
      this.value = BodyProcessor.restoreMultipart(data.value);
      return;
    }
    this.value = valueRaw;
  }

  /**
   * @param {string} url The script URL
   * @param {boolean} [isModule=false] Whether the script is ESM
   * @returns {Promise<void>}
   */
  loadScript(url, isModule=false) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = url;
      if (isModule) {
        script.type = 'module';
      }
      // script.defer = false;
      script.async = false;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`Unable to load ${url}`));
      const s = document.getElementsByTagName('script')[0];
      s.parentNode.insertBefore(script, s);
    });
  }

  async loadMonaco() {
    const base = `../../node_modules/monaco-editor/`;
    MonacoLoader.createEnvironment(base);
    await MonacoLoader.loadMonaco(base);
    await MonacoLoader.monacoReady();
  }

  /**
   * @param {Event} e
   */
  valueChange(e) {
    const editor = /** @type BodyEditorElement */ (e.target);
    const { value, model, selected } = editor;
    this.value = value;
    this.render();
    this.storeValue(value);
    const meta = {
      selected,
      model,
    };
    this.meta = meta;
    window.localStorage.setItem(modelKey, JSON.stringify(meta));
  }

  /**
   * @param {Event} e
   */
  selectHandler(e) {
    const editor = /** @type BodyEditorElement */ (e.target);
    const { selected } = editor;
    if (!this.meta) {
      this.meta = {};
    }
    this.meta.selected = selected;
    window.localStorage.setItem(modelKey, JSON.stringify(this.meta));
  }

  /**
   * Stores value data in the local store
   * @param {string|File|Blob|FormData} value
   */
  async storeValue(value) {
    if (!value) {
      window.localStorage.removeItem(valueKey);
      return;
    }
    if (typeof value === 'string') {
      window.localStorage.setItem(valueKey, value);
      return;
    }
    if (value instanceof FormData) {
      const entries = await BodyProcessor.createMultipartEntry(value);
      const data = {
        type: 'FormData',
        value: entries,
      };
      window.localStorage.setItem(valueKey, JSON.stringify(data));
      return;
    }
    const fileData = await BodyProcessor.blobToString(value);
    const data = {
      type: 'File',
      value: fileData,
    };
    window.localStorage.setItem(valueKey, JSON.stringify(data));
  }

  /**
   * @param {Event} e
   */
  contentTypeChanged(e) {
    const select = /** @type HTMLSelectElement */ (e.target);
    this.contentType = select.value;
  }

  editorMimeHandler(e) {
    this.contentType = e.changedValue;
  }

  _demoTemplate() {
    if (this.initializing) {
      return html`<progress></progress>`;
    }
    const { value, meta={}, autoEncode, contentType } = this;
    const { selected, model } = meta;
    console.log(meta, value);
    return html`
    <section class="documentation-section">
      <h3>Interactive demo</h3>
      <body-editor 
        selected="${ifDefined(selected)}" 
        .value="${value}" 
        .model="${model}"
        ?autoEncode="${autoEncode}"
        .contentType="${contentType}"
        @change="${this.valueChange}"
        @select="${this.selectHandler}"
      ></body-editor>
    </section>

    <section class="documentation-section">
    ${value ? this.printValue(value) : ''}
    </section>
    `;
  }

  /**
   * @param {string|Blob|FormData} value
   */
  printValue(value) {
    const parts = [];
    if (typeof value === 'string') {
      parts.push(String(value));
    } else if (value instanceof Blob) {
      // @ts-ignore
      parts.push(`[File ${value.name}]`);
    } else if (value instanceof FormData) {
      // @ts-ignore
      for(const pair of value.entries()) {
        const [name, partValue] = pair;
        parts.push(html`${name}: ${this.partValueDetailsTemplate(partValue)}\n`);
      }
    }
    return html`<pre><code>${parts}</code></pre>`;
  }

  /**
   * @param {string|File} value
   */
  partValueDetailsTemplate(value) {
    if (typeof value === 'string') {
      return html`${value}`;
    }
    const { size, type, name } = value;
    return html`${name} (${type}), ${size} bytes`;
  }

  controlsTemplate() {
    return html`
    <section class="documentation-section">
      <h3>State control</h3>
      <anypoint-switch name="autoEncode" @change="${this._toggleMainOption}">Auto encode</anypoint-switch>
      <div>
        <label id="ctLabel">Request content type</label>
        <select @blur="${this.contentTypeChanged}" aria-labelledby="ctLabel">
          <option value="">auto</option>
          <option value="application/json">application/json</option>
          <option value="application/xml">application/xml</option>
          <option value="text/html">text/html</option>
          <option value="text/css">text/css</option>
        </select>
      </div>
    </section>
    `;
  }

  contentTemplate() {
    return html`
      <h2>Body editor</h2>
      ${this._demoTemplate()}
      ${this.controlsTemplate()}
    `;
  }
}

const instance = new ComponentPage();
instance.render();
