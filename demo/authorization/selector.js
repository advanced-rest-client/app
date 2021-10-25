import { html } from 'lit-element';
import { DemoPage } from '@advanced-rest-client/arc-demo-helper';
import '@advanced-rest-client/arc-demo-helper/arc-interactive-demo.js';
import '@anypoint-web-components/awc/anypoint-button.js';
import '@anypoint-web-components/awc/anypoint-checkbox.js'
import '../../define/authorization-selector.js';
import '../../define/authorization-method.js';
import '../../define/oauth2-authorization.js';
import './custom-method.js';

/** @typedef {import('@advanced-rest-client/events').ArcRequest.RequestAuthorization} RequestAuthorization */
/** @typedef {import('../../').AuthorizationSelectorElement} AuthorizationSelectorElement */
/** @typedef {import('../../').AuthorizationMethodElement} AuthorizationMethodElement */


const STORE_KEY = 'demo.auth-selector.config';
const SELECTED_KEY = 'demo.auth-selector.selected';

class ComponentDemoPage extends DemoPage {
  constructor() {
    super();
    this.initObservableProperties([
      'demoState',
      'outlined',
      'changeCounter',
      'allowNone',
      'horizontal',
      'multi',
      'selected',
    ]);
    this._componentName = 'authorization-selector';
    this.demoStates = ['Filled', 'Outlined', 'Anypoint'];
    this.demoState = 0;
    this.changeCounter = 0;
    this.selected = 0;
    this.allowNone = false;
    this.horizontal = true;
    this.multi = true;
    /**
     * @type {number[]}
     */
    this.enabled = [];

    const base = `${window.location.protocol}//${window.location.host}`;
    this.authorizationUri = `${base}${window.location.pathname}oauth-authorize.html`;
    this.oauth2redirect = 'http://auth.advancedrestclient.com/arc.html';
    this.oauth2scopes = [
      'profile',
      'email'
    ];
    this.oauth1redirect = `${base}/oauth-popup.html`;

    this._demoStateHandler = this._demoStateHandler.bind(this);
    this._toggleMainOption = this._toggleMainOption.bind(this);
    this._mainChangeHandler = this._mainChangeHandler.bind(this);
    this._customChangeHandler = this._customChangeHandler.bind(this);

    this._restoreConfig();
  }

  _restoreConfig() {
    const selectedRaw = localStorage[SELECTED_KEY];
    const selected = Number(selectedRaw);
    if (!Number.isNaN(selected)) {
      this.selected = selected;
    }
    const data = localStorage[STORE_KEY];
    if (!data) {
      return;
    }
    if (data[0] !== '[') {
      return;
    }
    try {
      this.authConfiguration = JSON.parse(data);
      this.enabled = [];
      (this.authConfiguration || []).forEach((item, index) => {
        if (item.enabled) {
          this.enabled.push(index);
        }
      });
      console.log(this.authConfiguration);
      console.log(this.enabled);
    } catch (_) {
      // ..
    }
  }

  _toggleMainOption(e) {
    const { name, checked } = e.target;
    this[name] = checked;
  }

  _demoStateHandler(e) {
    const state = e.detail.value;
    this.demoState = state;
    this.outlined = state === 1;
    this.anypoint = state === 2;
    this._updateAnypoint();
  }

  /**
   * @param {Event} e 
   */
  _mainChangeHandler(e) {
    this.changeCounter++;
    const selector = /** @type AuthorizationSelectorElement */ (e.target);
    const { selected, type, multi } = selector;
    const methods = /** @type AuthorizationMethodElement[] */ (selector.items);
    const result = /** @type RequestAuthorization[] */ ([]);
    this.enabled = [];
    methods.forEach((authMethod, index) => {
      const { type: mType } = authMethod;
      const config = (authMethod && authMethod.serialize) ? authMethod.serialize() : undefined;
      const enabled = multi ? type.includes(mType) : type === mType;
      if (enabled) {
        this.enabled.push(index);
      }
      result.push({
        config,
        type: mType,
        enabled,
        valid: true,
      });
    });
    // console.log(result);
    this.authConfiguration = result;
    const storeValue = JSON.stringify(this.authConfiguration);
    localStorage[STORE_KEY] = storeValue;
    localStorage[SELECTED_KEY] = selected;

    this._printEventChangeValues(e);
  }

  _customChangeHandler(e) {
    this._printEventChangeValues(e);
  }

  _printEventChangeValues(e) {
    const { selected, type } = e.target;
    // const config = e.target.serialize();
    const valid = e.target.validate();
    console.log('selected:', selected, 'type:', type, 'valid:', valid);
    // console.log(config);
  }

  _basicTemplate(config={}) {
    const {
      anypoint,
      outlined,
    } = this;
    const defaults = {
      username: "basic-username",
      password: "basic-password",
    };
    const { type } = config;
    const { username, password } = (type === 'basic' ? config.config : defaults);
    return html`<authorization-method
      ?anypoint="${anypoint}"
      ?outlined="${outlined}"
      type="basic"
      .username="${username}"
      .password="${password}"
      aria-describedby="basicDesc"
    ></authorization-method>
    <p id="basicDesc" slot="aria">
      Basic authorization allows to send a username and a password in a request header.
    </p>`;
  }

  _ntlmTemplate(config={}) {
    const {
      anypoint,
      outlined,
    } = this;
    const defaults = {
      username: "ntlm-username",
      password: "ntlm-password",
      domain: 'ntlm-domain',
    };
    const { type } = config;
    const { username, password, domain } = (type === 'ntlm' ? config.config : defaults);
    return html`<authorization-method
      ?anypoint="${anypoint}"
      ?outlined="${outlined}"
      type="ntlm"
      .username="${username}"
      .password="${password}"
      .domain="${domain}"
      aria-describedby="ntlmDesc"
    ></authorization-method>
    <p id="ntlmDesc" slot="aria">
      NTLM authorization is used with Microsoft NT domains.
    </p>`;
  }

  _digestTemplate(config={}) {
    const {
      anypoint,
      outlined,
    } = this;
    const defaults = {
      username: "digest-username",
      password: "digest-password",
      realm: "digest-realm",
      nonce: "digest-nonce",
      opaque: "digest-opaque",
      algorithm: "MD5-sess",
      requestUrl: "https://api.domain.com/v0/endpoint",
    };
    const { type } = config;
    const {
      username, password, realm, nonce, opaque, algorithm,
      requestUrl, qop, nc, cnonce,
    } = (type === 'digest' ? config.config : defaults);
    return html`<authorization-method
      ?anypoint="${anypoint}"
      ?outlined="${outlined}"
      type="digest"
      .username="${username}"
      .password="${password}"
      .realm="${realm}"
      .nonce="${nonce}"
      .opaque="${opaque}"
      .algorithm="${algorithm}"
      .requestUrl="${requestUrl}"
      .qop="${qop}"
      .cnonce="${cnonce}"
      .nc="${nc}"
    ></authorization-method>`;
  }

  _oa1Template(config={}) {
    const {
      anypoint,
      outlined,
      oauth1redirect,
    } = this;
    const defaults = {
      consumerKey: 'key',
      consumerSecret: 'secret',
      token: 'oauth 1 token',
      tokenSecret: 'oauth 1 token secret',
    };
    const { type } = config;
    const {
      consumerKey, consumerSecret, token, tokenSecret, timestamp,
      nonce, realm, signatureMethod, authTokenMethod, authParamsLocation,
    } = (type === 'oauth 1' ? config.config : defaults);
    return html`
    <authorization-method
      ?anypoint="${anypoint}"
      ?outlined="${outlined}"
      type="oauth 1"
      .consumerKey="${consumerKey}"
      .consumerSecret="${consumerSecret}"
      .redirectUri="${oauth1redirect}"
      .token="${token}"
      .tokenSecret="${tokenSecret}"
      .timestamp="${timestamp}"
      .nonce="${nonce}"
      .realm="${realm}"
      .signatureMethod="${signatureMethod}"
      .authTokenMethod="${authTokenMethod}"
      .authParamsLocation="${authParamsLocation}"
      requestTokenUri="http://term.ie/oauth/example/request_token.php"
      accessTokenUri="http://term.ie/oauth/example/access_token.php"
      aria-describedby="oauth1desc"
    ></authorization-method>
    <p id="oauth1desc" slot="aria">
      OAuth 1 is the original OAuth specification for the authorization.
      This method is no longer considered secure.
    </p>
    `;
  }

  _oa2Template(config={}) {
    const {
      anypoint,
      outlined,
      oauth2redirect,
      oauth2scopes,
    } = this;

    const defaults = {
      clientId: 'test-client-id',
      grantType: 'implicit',
      scopes: oauth2scopes,
      accessTokenUri: 'https://api.domain.com/token',
      authorizationUri: this.authorizationUri,
      username: "oauth2-username",
      password: "oauth2-password",
    };
    const { type } = config;
    const {
      accessToken, tokenType, scopes, clientId, grantType, deliveryMethod,
      deliveryName, clientSecret, accessTokenUri, authorizationUri = this.authorizationUri,
      username, password,
    } = (type === 'oauth 2' ? config.config : defaults);
    return html`
    <authorization-method
      ?anypoint="${anypoint}"
      ?outlined="${outlined}"
      type="oauth 2"
      .scopes="${scopes}"
      .accessToken="${accessToken}"
      .tokenType="${tokenType}"
      .clientId="${clientId}"
      .clientSecret="${clientSecret}"
      .grantType="${grantType}"
      .oauthDeliveryMethod="${deliveryMethod}"
      .oauthDeliveryName="${deliveryName}"
      .authorizationUri="${authorizationUri}"
      .accessTokenUri="${accessTokenUri}"
      .username="${username}"
      .password="${password}"
      redirectUri="${oauth2redirect}"
      aria-describedby="oauth2desc"
    ></authorization-method>
    <div id="oauth2desc" slot="aria">OAuth 2 is the most popular authentication method for web services.</div>
    `;
  }

  _noneTemplate() {
    const { allowNone } = this;
    if (!allowNone) {
      return '';
    }
    return html`
    <div type="none" aria-describedby="noneDesc">Authorization configuration is disabled</div>
    <p id="noneDesc" slot="aria">Select authorization method required by the API.</p>
    `;
  }

  _bearerTemplate(config={}) {
    const {
      anypoint,
      outlined,
    } = this;
    const { token } = config.config || {};
    return html`<authorization-method
      ?anypoint="${anypoint}"
      ?outlined="${outlined}"
      type="bearer"
      .token="${token}"
      aria-describedby="tokenDesc"
    ></authorization-method>
    <p id="tokenDesc" slot="aria">
      Bearer authorization allows to send an authentication token in the authorization header using the "bearer" method.
    </p>`;
  }

  /**
   * @param {RequestAuthorization[]} config
   * @param {string} type
   * @returns {RequestAuthorization|undefined}
   */
  readConfiguration(config, type) {
    if (!Array.isArray(config) || !config.length) {
      return undefined;
    }
    return config.find((cnf) => cnf.type === type);
  }

  _demoTemplate() {
    const {
      demoStates,
      darkThemeActive,
      anypoint,
      outlined,
      demoState,
      changeCounter,
      authConfiguration,
      horizontal,
      multi,
      selected,
    } = this;
    return html`
      <section class="documentation-section">
        <h3>Interactive demo</h3>
        <p>
          This demo lets you preview the Authorization Selector element with various
          configuration options.
        </p>
        <arc-interactive-demo
          .states="${demoStates}"
          .selectedState="${demoState}"
          @state-changed="${this._demoStateHandler}"
          ?dark="${darkThemeActive}"
        >
          <authorization-selector
            ?anypoint="${anypoint}"
            ?outlined="${outlined}"
            slot="content"
            @change="${this._mainChangeHandler}"
            .selected="${selected}"
            ?horizontal="${horizontal}"
            ?multi="${multi}"
            .selectedValues="${multi ? this.enabled : undefined}"
          >
            ${this._noneTemplate()}
            ${this._basicTemplate(this.readConfiguration(authConfiguration, 'basic'))}
            ${this._bearerTemplate(this.readConfiguration(authConfiguration, 'bearer'))}
            ${this._ntlmTemplate(this.readConfiguration(authConfiguration, 'ntlm'))}
            ${this._digestTemplate(this.readConfiguration(authConfiguration, 'digest'))}
            ${this._oa1Template(this.readConfiguration(authConfiguration, 'oauth 1'))}
            ${this._oa2Template(this.readConfiguration(authConfiguration, 'oauth 2'))}
          </authorization-selector>

          <label slot="options" id="mainOptionsLabel">Options</label>
          <anypoint-checkbox
            aria-describedby="mainOptionsLabel"
            slot="options"
            name="allowNone"
            @change="${this._toggleMainOption}"
          >Alow "None"</anypoint-checkbox>
          <anypoint-checkbox
            aria-describedby="mainOptionsLabel"
            slot="options"
            name="horizontal"
            .checked="${horizontal}"
            @change="${this._toggleMainOption}"
          >Horizontal</anypoint-checkbox>
          <anypoint-checkbox
            aria-describedby="mainOptionsLabel"
            slot="options"
            name="multi"
            .checked="${multi}"
            @change="${this._toggleMainOption}"
          >Multi</anypoint-checkbox>
        </arc-interactive-demo>
        <p>Change event dispatched ${changeCounter} time(s)</p>
      </section>
    `;
  }

  _singleItemTemplate() {
    const {
      demoStates,
      darkThemeActive,
      anypoint,
      outlined,
      demoState,
    } = this;
    return html`
      <h3>Single authorization method</h3>
      <arc-interactive-demo
        .states="${demoStates}"
        .selectedState="${demoState}"
        @state-changed="${this._demoStateHandler}"
        ?dark="${darkThemeActive}"
      >

        <authorization-selector
          ?anypoint="${anypoint}"
          ?outlined="${outlined}"
          slot="content"
        >
          ${this._basicTemplate()}
        </authorization-selector>
      </arc-interactive-demo>
    `;
  }

  _attrForSelectedTemplate() {
    const {
      demoStates,
      darkThemeActive,
      anypoint,
      outlined,
      demoState,
    } = this;
    return html`
      <h3>With "attrForSelected" set to type</h3>
      <arc-interactive-demo
        .states="${demoStates}"
        .selectedState="${demoState}"
        @state-changed="${this._demoStateHandler}"
        ?dark="${darkThemeActive}"
      >

        <authorization-selector
          ?anypoint="${anypoint}"
          ?outlined="${outlined}"
          slot="content"
          attrForSelected="type"
          selected="ntlm"
        >
          ${this._basicTemplate()}
          ${this._ntlmTemplate()}
          ${this._digestTemplate()}
          ${this._oa1Template()}
          ${this._oa2Template()}
        </authorization-selector>
      </arc-interactive-demo>
    `;
  }

  _customMethodsTemplate() {
    const {
      demoStates,
      darkThemeActive,
      anypoint,
      outlined,
      demoState,
    } = this;
    return html`
      <h3>Custom authorization methods</h3>
      <p>
        Simply add any HTML element with "type" attribute. Optionally add the "attrForLabel"
        to tell which attribute has a value for the drop down selector.
      </p>
      <arc-interactive-demo
        .states="${demoStates}"
        .selectedState="${demoState}"
        @state-changed="${this._demoStateHandler}"
        ?dark="${darkThemeActive}"
      >

        <authorization-selector
          ?anypoint="${anypoint}"
          ?outlined="${outlined}"
          slot="content"
          attrForLabel="data-label"
          @change="${this._customChangeHandler}"
        >
          ${this._ntlmTemplate()}
          <custom-auth-method-demo type="custom1" data-label="Custom demo"></custom-auth-method-demo>
          <authorization-method
            ?anypoint="${anypoint}"
            ?outlined="${outlined}"
            type="basic"
            data-label="Custom Basic"
          ></authorization-method>
        </authorization-selector>
      </arc-interactive-demo>
    `;
  }

  _introductionTemplate() {
    return html `
      <section class="documentation-section">
        <h2>Introduction</h2>
        <p>
          A web component to render a single authorization method from a list of available methods.
        </p>
        <p>
          This component implements Material Design styles.
        </p>
      </section>
    `;
  }

  _usageTemplate() {
    return html `
      <section class="documentation-section">
        <h2>Usage</h2>
        <p>Authorization selector comes with 2 predefined styles:</p>
        <ul>
          <li><b>Filled</b> (default)</li>
          <li>
            <b>Anypoint</b> - Enables Anypoint theme
          </li>
        </ul>

        ${this._singleItemTemplate()}
        ${this._attrForSelectedTemplate()}
        ${this._customMethodsTemplate()}
      </section>`;
  }

  contentTemplate() {
    return html`
      <h2>Authorization selector</h2>
      <oauth2-authorization></oauth2-authorization>
      ${this._demoTemplate()}
      ${this._introductionTemplate()}
      ${this._usageTemplate()}
    `;
  }
}

const instance = new ComponentDemoPage();
instance.render();
