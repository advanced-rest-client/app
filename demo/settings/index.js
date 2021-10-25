
import { html } from 'lit-html';
import { DemoPage } from '@advanced-rest-client/arc-demo-helper';
import listenEncoding from '@advanced-rest-client/arc-demo-helper/src/EncodingHelpers.js';
import { ArcNavigationEventTypes, ConfigEvents, ConfigEventTypes } from '@advanced-rest-client/events';
import '../../define/arc-settings.js';

/** @typedef {import('@advanced-rest-client/events').ConfigReadEvent} ConfigReadEvent */
/** @typedef {import('@advanced-rest-client/events').ConfigUpdateEvent} ConfigUpdateEvent */
/** @typedef {import('@advanced-rest-client/events').ARCExternalNavigationEvent} ARCExternalNavigationEvent */

const STORE_CONFIG_KEY = 'arc.demo.settings';

class ComponentDemo extends DemoPage {
  constructor() {
    super();
    this.initObservableProperties([
      'outlined',
      'systemVariablesDisabled',
    ]);
    this.componentName = 'arc-settings';
    this.outlined = false;
    this.restApis = true;
    this.renderViewControls = true;
    
    listenEncoding();

    window.addEventListener(ConfigEventTypes.readAll, this.readConfigHandler.bind(this));
    window.addEventListener(ConfigEventTypes.update, this.updateConfigHandler.bind(this));
    window.addEventListener(ArcNavigationEventTypes.navigateExternal, this.navigateExternalHandler.bind(this));
  }

  async readConfig() {
    const raw = localStorage.getItem(STORE_CONFIG_KEY);
    let data = {};
    try {
      if (raw) {
        data = JSON.parse(raw);
      }
    } catch (ex) {
      // ....
    }
    return data;
  }

  async setConfig(path, value) {
    let config = await this.readConfig();
    const parts = path.split('.');
    const last = parts.pop();
    if (!config) {
      config = {};
    }
    let current = config;
    parts.forEach((part) => {
      if (!current[part]) {
        current[part] = {};
      }
      current = current[part];
    });
    current[last] = value;
    localStorage.setItem(STORE_CONFIG_KEY, JSON.stringify(config));
    ConfigEvents.State.update(document.body, path, value);
  }

  /**
   * @param {ConfigReadEvent} e 
   */
  readConfigHandler(e) {
    e.detail.result = this.readConfig();
  }
  

  /**
   * @param {ConfigUpdateEvent} e 
   */
  async updateConfigHandler(e) {
    const { key, value } = e.detail;
    e.detail.result = this.setConfig(key, value);
  }

  /**
   * @param {ARCExternalNavigationEvent} e
   */
  navigateExternalHandler(e) {
    window.open(e.url);
  }

  _demoTemplate() {
    const {
      anypoint,
      outlined,
    } = this;
    return html`
      <section class="documentation-section">
        <arc-settings
          ?anypoint="${anypoint}"
          ?outlined="${outlined}"
        ></arc-settings>
      </section>
    `;
  }

  contentTemplate() {
    return html`
      ${this._demoTemplate()}
    `;
  }
}

const instance = new ComponentDemo();
instance.render();
