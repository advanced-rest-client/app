import { html } from 'lit-html';
import { DemoPage } from '@advanced-rest-client/arc-demo-helper';
import '@advanced-rest-client/arc-demo-helper/arc-interactive-demo.js';
import '../../define/har-viewer.js';

class ComponentPage extends DemoPage {
  constructor() {
    super();
    this.initObservableProperties([
      'har'
    ]);
    this.componentName = 'har-viewer';
    this.demoStates = ['Regular', 'Mulesoft'];
    this.renderViewControls = true;
    this.har = undefined;
    // this.darkThemeActive = true;

    this.startupHar = new URL('har1.har', window.location.href).toString();
    // this.startupHar = new URL('har2.json', window.location.href).toString();

    this.fetchHarFile(this.startupHar);

    this.fileChanged = this.fileChanged.bind(this);
  }

  /**
   * @param {string} url
   */
  async fetchHarFile(url) {
    const response = await fetch(url);
    this.har = await response.json();
  }

  /**
   * @param {Event} e
   */
  fileChanged(e) {
    const node = /** @type HTMLInputElement */ (e.target);
    this.processFile(node.files[0]);
  };

  /**
   * @param {File} file
   */
  async processFile(file) {
    this.har = undefined;
    if (!file) {
      return;
    }
    const text = await this.readFile(file);
    const har = JSON.parse(text);
    this.har = har;
  }

  /**
   * @param {File} file
   */
  readFile(file) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result);
      };
      reader.readAsText(file);
    });
  }

  contentTemplate() {
    return html`
      <h2>ARC HAR viewer</h2>
      ${this._demoTemplate()}
      ${this.fileTemplate()}
    `;
  }

  _demoTemplate() {
    const { har } = this;
    return html`
    <section class="documentation-section">
      <h3>Interactive demo</h3>
      <har-viewer
        slot="content"
        .har="${har}"
      ></har-viewer>
    </section>
    `;
  }

  fileTemplate() {
    return html`
    <section class="documentation-section">
      <h3>HAR data</h3>
      <input 
        type="file" 
        aria-label="Select the file"
        @change="${this.fileChanged}"
      />
    </section>
    `;
  }
}

const instance = new ComponentPage();
instance.render();
