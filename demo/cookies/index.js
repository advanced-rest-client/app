import { html } from 'lit-html';
import { DemoPage } from '@advanced-rest-client/arc-demo-helper';
import * as EncodingHelpers from '@advanced-rest-client/arc-demo-helper/src/EncodingHelpers.js';
import { ExportHandlerMixin } from '@advanced-rest-client/arc-demo-helper/src/ExportHandlerMixin.js';
import '@anypoint-web-components/awc/anypoint-button.js';
import '@advanced-rest-client/arc-demo-helper/arc-interactive-demo.js';
import '@anypoint-web-components/awc/anypoint-radio-button.js';
import '@anypoint-web-components/awc/anypoint-radio-group.js';
import { SessionCookieEventTypes, SessionCookieEvents } from '@advanced-rest-client/events';
import { ArcMock } from '@advanced-rest-client/arc-mock';
import '../../define/cookie-manager.js';
import { compareCookies } from '../../src/lib/CookieUtils.js';

/** @typedef {import('@advanced-rest-client/events').SessionCookiesRemoveEvent} SessionCookiesRemoveEvent */
/** @typedef {import('@advanced-rest-client/events').SessionCookieUpdateEvent} SessionCookieUpdateEvent */
/** @typedef {import('@advanced-rest-client/events').Cookies.ARCCookie} ARCCookie */

class ComponentDemoPage extends ExportHandlerMixin(DemoPage) {
  constructor() {
    super();
    this.initObservableProperties([
      'outlined',
      'listType',
    ]);
    this.componentName = 'cookie-manager';
    this.demoStates = ['Filled', 'Outlined', 'Anypoint'];
    this.listType = 'default';

    this.generator = new ArcMock();

    this._demoStateHandler = this._demoStateHandler.bind(this);
    this._toggleMainOption = this._toggleMainOption.bind(this);
    this._listTypeHandler = this._listTypeHandler.bind(this);
    this._removeHandler = this._removeHandler.bind(this);
    this._exportOpenedChanged = this._exportOpenedChanged.bind(this);
    this._listHandler = this._listHandler.bind(this);
    this._updateHandler = this._updateHandler.bind(this);
    this.generateData = this.generateData.bind(this);
    this.deleteData = this.deleteData.bind(this);
    this.firstChanged = this.firstChanged.bind(this);
    this._enterFullScreenHandler = this._enterFullScreenHandler.bind(this);

    window.addEventListener(SessionCookieEventTypes.listAll, this._listHandler);
    window.addEventListener(SessionCookieEventTypes.delete, this._removeHandler);
    window.addEventListener(SessionCookieEventTypes.update, this._updateHandler);

    EncodingHelpers.default();
  }

  _demoStateHandler(e) {
    const state = e.detail.value;
    this.outlined = state === 1;
    this.anypoint = state === 2;
    this._updateAnypoint();
  }

  _listTypeHandler(e) {
    const { name, checked } = e.target;
    if (!checked) {
      return;
    }
    this.listType = name;
  }

  _listHandler(e) {
    e.preventDefault();
    e.detail.result = this.restoreCookies();
  }

  /**
   * @return {Promise<ARCCookie[]>}
   */
  async restoreCookies() {
    const raw = localStorage.getItem('arc.demo.cookies');
    if (!raw) {
      return [];
    }
    try {
      const result =  JSON.parse(raw);
      if (Array.isArray(result)) {
        return result;
      }
      return [];
    } catch (e) {
      return [];
    }
  }

  /**
   * @param {ARCCookie[]} value
   * @return {Promise<void>}
   */
  async storeCookies(value) {
    const data = JSON.stringify(value);
    localStorage.setItem('arc.demo.cookies', data);
  }

  async generateData() {
    let cookies = await this.restoreCookies();
    const newCookies = this.generator.cookies.cookies(100);
    cookies = cookies.concat(newCookies);
    await this.storeCookies(cookies);
  }

  async deleteData() {
    await this.storeCookies([]);
  }

  async firstChanged() {
    const cookies = await this.restoreCookies();
    const item = { ...cookies[0] };
    item.name = 'Updated name';
    SessionCookieEvents.State.update(document.body, item);
  }

  /**
   * @param {ARCCookie[]} cookies
   * @return {Promise<void>}
   */
  async removeCookies(cookies) {
    const list = [...cookies];
    const local = await this.restoreCookies();

    list.forEach((cookie) => {
      const index = local.findIndex((item) => compareCookies(item, cookie));
      if (index === -1) {
        return;
      }
      local.splice(index, 1);
      SessionCookieEvents.State.delete(document.body, cookie);
    });
    await this.storeCookies(local);
  }

  /**
   * @param {ARCCookie} cookie
   * @return {Promise<void>}
   */
  async updateCookie(cookie) {
    const cookies = await this.restoreCookies();
    const index = cookies.findIndex((item) => compareCookies(item, cookie));
    if (index === -1) {
      cookies.push(cookie);
    } else {
      cookies[index] = cookie;
    }
    await this.storeCookies(cookies);
    SessionCookieEvents.State.update(document.body, cookie);
  }

  /**
   *
   * @param {SessionCookiesRemoveEvent} e
   */
  _removeHandler(e) {
    e.preventDefault();
    const { cookies } = e;
    e.detail.result = this.removeCookies(cookies);
  }

  /**
   *
   * @param {SessionCookieUpdateEvent} e
   */
  _updateHandler(e) {
    e.preventDefault();
    const { cookie } = e;
    e.detail.result = this.updateCookie(cookie);
  }

  _enterFullScreenHandler() {
    document.querySelector('cookie-manager').requestFullscreen();
  }

  _demoTemplate() {
    const {
      demoStates,
      darkThemeActive,
      anypoint,
      outlined,
      listType,
    } = this;
    return html`
      <section class="documentation-section">
        <h3>Interactive demo</h3>
        <p>
          This demo lets you preview the cookies manager element with various
          configuration options.
        </p>

        <arc-interactive-demo
          .states="${demoStates}"
          @state-changed="${this._demoStateHandler}"
          ?dark="${darkThemeActive}"
        >
          <cookie-manager
            ?anypoint="${anypoint}"
            ?outlined="${outlined}"
            .listType="${listType}"
            slot="content"></cookie-manager>

          <label slot="options" id="listTypeLabel">List type</label>
          <anypoint-radio-group
            slot="options"
            selectable="anypoint-radio-button"
            aria-labelledby="listTypeLabel"
          >
            <anypoint-radio-button
              @change="${this._listTypeHandler}"
              checked
              name="default"
              >Default</anypoint-radio-button
            >
            <anypoint-radio-button
              @change="${this._listTypeHandler}"
              name="comfortable"
              >Comfortable</anypoint-radio-button
            >
            <anypoint-radio-button
              @change="${this._listTypeHandler}"
              name="compact"
              >Compact</anypoint-radio-button
            >
          </anypoint-radio-group>

          <anypoint-button
            slot="options"
            @click="${this._enterFullScreenHandler}"
          >
            Full screen
          </anypoint-button>
        </arc-interactive-demo>

        <div class="data-options">
          <h3>Data options</h3>

          <anypoint-button @click="${this.generateData}">Generate 100 cookies</anypoint-button>
          <anypoint-button @click="${this.deleteData}">Remove all</anypoint-button>
          <anypoint-button @click="${this.firstChanged}">Inform first item changed</anypoint-button>
        </div>
      </section>
    `;
  }

  contentTemplate() {
    return html`
      <h2>ARC cookies manager screen</h2>
      ${this._demoTemplate()}
      ${this.exportTemplate()}
    `;
  }
}

const instance = new ComponentDemoPage();
instance.render();
