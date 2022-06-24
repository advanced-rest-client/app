import { html } from 'lit-html';
import { DemoPage } from '@advanced-rest-client/arc-demo-helper';
import '@anypoint-web-components/awc/anypoint-checkbox.js';
import '@anypoint-web-components/awc/anypoint-radio-button.js';
import '@anypoint-web-components/awc/anypoint-radio-group.js';
import '@advanced-rest-client/arc-demo-helper/arc-interactive-demo.js';
import '../../define/exchange-search.js';
import env from '../env.js';

class ComponentDemoPage extends DemoPage {
  constructor() {
    super();
    this.initObservableProperties([
      'compatibility',
      'outlined',
      'columns',
      'type',
      'mockApi',
    ]);
    this.componentName = 'exchange-search';

    this.redirectUrl = 'https://auth.advancedrestclient.com/oauth-popup.html';
    this.clientId = '2e38d46b60c5476584cdecba8b516711';
    this.columns = 'auto';
    this.type = 'rest-api'
    this.renderViewControls = true;
    this.mockApi = true;

    window.addEventListener('anypoint-signin-aware-error', this._signInError.bind(this));
    window.addEventListener('oauth2-code-response', this._signInCode.bind(this));
  }

  _columnsHandler(e) {
    const { name, checked, value } = e.target;
    if (!checked) {
      return;
    }
    this[name] = value;
  }

  _signInError(e) {
    console.log('Log in error', e.detail);
  }

  _signInCode(e) {
    console.log('Access token code request', e.detail);
  }

  _selectionHandler(e) {
    console.log(e.detail);
  }

  get mockedBaseUri() {
    return `http://localhost:${env.exchangeApiPort}/`;
  }

  _demoTemplate() {
    const {
      redirectUrl,
      clientId,
      columns,
      type
    } = this;
    return html`
      <section class="documentation-section">
        <h3>Interactive demo</h3>
        <p>
          This demo lets you preview the REST APIs menu element with various
          configuration options.
        </p>
        <exchange-search
          .columns="${columns}"
          .type="${type}"
          anypointAuth
          exchangeRedirectUri="${redirectUrl}"
          exchangeClientId="${clientId}"
          .apiBase="${this.mockApi ? this.mockedBaseUri : undefined}"
          @selected="${this._selectionHandler}"
        ></exchange-search>

      </section>
    `;
  }

  optionsTemplate() {
    return html`
    <section class="documentation-section">
      <h3>Options</h3>
      <div>
        <label id="columnsLabel">Columns</label>
        <anypoint-radio-group
          selectable="anypoint-radio-button"
          aria-labelledby="columnsLabel"
        >
          <anypoint-radio-button
            @change="${this._columnsHandler}"
            name="columns"
            value="1"
          >1</anypoint-radio-button>
          <anypoint-radio-button
            @change="${this._columnsHandler}"
            name="columns"
            value="2"
          >2</anypoint-radio-button>
          <anypoint-radio-button
            @change="${this._columnsHandler}"
            name="columns"
            value="3"
          >3</anypoint-radio-button>
          <anypoint-radio-button
            @change="${this._columnsHandler}"
            name="columns"
            value="4"
          >4</anypoint-radio-button>
          <anypoint-radio-button
            @change="${this._columnsHandler}"
            name="columns"
            value="5"
          >5</anypoint-radio-button>
          <anypoint-radio-button
            @change="${this._columnsHandler}"
            name="columns"
            value="6"
          >6</anypoint-radio-button>
          <anypoint-radio-button
            @change="${this._columnsHandler}"
            name="columns"
            checked
            value="auto"
          >Auto</anypoint-radio-button>
        </anypoint-radio-group>
      </div>

      <div>
        <label slot="options" id="typeLabel">Asset type</label>
        <anypoint-radio-group
          slot="options"
          selectable="anypoint-radio-button"
          aria-labelledby="typeLabel"
        >
          <anypoint-radio-button
            @change="${this._columnsHandler}"
            name="type"
            value="rest-api"
            checked
          >REST API</anypoint-radio-button>
          <anypoint-radio-button
            @change="${this._columnsHandler}"
            name="type"
            value="connector"
          >Connector</anypoint-radio-button>
          <anypoint-radio-button
            @change="${this._columnsHandler}"
            name="type"
            value="template"
          >Template</anypoint-radio-button>
          <anypoint-radio-button
            @change="${this._columnsHandler}"
            name="type"
            value="example"
          >Example</anypoint-radio-button>
          <anypoint-radio-button
            @change="${this._columnsHandler}"
            name="type"
            value="soap-api"
          >SOAP API</anypoint-radio-button>
          <anypoint-radio-button
            @change="${this._columnsHandler}"
            name="type"
            value="raml-fragment"
          >API fragment</anypoint-radio-button>
          <anypoint-radio-button
            @change="${this._columnsHandler}"
            name="type"
            value="custom"
          >Custom asset</anypoint-radio-button>
          <anypoint-radio-button
            @change="${this._columnsHandler}"
            name="type"
            value=""
          >Any asset</anypoint-radio-button>
        </anypoint-radio-group>
      </div>

      <div>
        <anypoint-checkbox ?checked="${this.mockApi}" name="mockApi" @change="${this._toggleMainOption}">Use mocked API</anypoint-checkbox>
      </div>
    </section>
    `;
  }

  contentTemplate() {
    return html`
      <h2>Exchange search panel</h2>
      ${this._demoTemplate()}
      ${this.optionsTemplate()}
    `;
  }
}

const instance = new ComponentDemoPage();
instance.render();
