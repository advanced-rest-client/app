import { html } from 'lit-html';
import { DemoPage } from '@advanced-rest-client/arc-demo-helper';
import '@advanced-rest-client/arc-demo-helper/arc-interactive-demo.js';
import '@anypoint-web-components/awc/anypoint-switch.js';
import '../../define/headers-editor.js';

const storeKey = 'headers-editor-model';

class ComponentPage extends DemoPage {
  constructor() {
    super();
    this.initObservableProperties([
      'value',
      'readOnly',
    ]);
    this.componentName = 'headers-editor';
    this.renderViewControls = true;
    this.readOnly = false;
    this.value = '';
    this.model = undefined;
    this._restoreModel();

    this._valueHandler = this._valueHandler.bind(this);
  }

  _restoreModel() {
    const data = window.localStorage.getItem(storeKey);
    if (!data) {
      return;
    }
    try {
      const model = JSON.parse(data);
      if (Array.isArray(model)) {
        this.model = model;
      }
    } catch (e) {
      // ...
    }
  }

  _demoStateHandler(e) {
    const state = e.detail.value;
    this.outlined = state === 1;
    this.anypoint = state === 2;
    this._updateAnypoint();
  }

  _valueHandler(e) {
    this.value = e.target.value;
    const model = e.target.model || [];
    this.model = model;
    window.localStorage.setItem(storeKey, JSON.stringify(model));
  }

  _demoTemplate() {
    const {
      demoStates,
      darkThemeActive,
      anypoint,
      outlined,
      value,
      model,
      readOnly,
    } = this;
    return html`
      <section class="documentation-section">
        <h3>Interactive demo</h3>
        <p>
          This demo lets you preview the URL editor element with various
          configuration options.
        </p>

        <arc-interactive-demo
          .states="${demoStates}"
          @state-changed="${this._demoStateHandler}"
          ?dark="${darkThemeActive}"
        >
          <headers-editor
            ?anypoint="${anypoint}"
            ?outlined="${outlined}"
            .model="${model}"
            ?readOnly="${readOnly}"
            @change="${this._valueHandler}"
            slot="content"
          ></headers-editor>

          <label slot="options" id="mainOptionsLabel">Options</label>
          <anypoint-switch
            aria-describedby="mainOptionsLabel"
            slot="options"
            name="readOnly"
            @change="${this._toggleMainOption}"
          >
            Read only
          </anypoint-switch>
        </arc-interactive-demo>

        <div class="output">
          <h4>Current value</h4>
          <pre>${value}</pre>
        </div>
      </section>
    `;
  }

  contentTemplate() {
    return html`
      <h2>ARC headers editor</h2>
      ${this._demoTemplate()}
    `;
  }
}

const instance = new ComponentPage();
instance.render();
