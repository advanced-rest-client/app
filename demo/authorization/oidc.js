import { html } from 'lit-html';
import { DemoPage } from '@advanced-rest-client/arc-demo-helper';
import '@advanced-rest-client/arc-demo-helper/arc-interactive-demo.js';
import '@anypoint-web-components/awc/anypoint-radio-button.js';
import '@anypoint-web-components/awc/anypoint-radio-group.js';
import '@anypoint-web-components/awc/anypoint-checkbox.js';
import '../../define/oidc-authorization.js';
import '../../define/authorization-method.js';
import env from './env.js';

const storeKey = 'authorization.openId.configuration';

class ComponentDemo extends DemoPage {
  constructor() {
    super();
    this.initObservableProperties([
      'demoState',
      'outlined',
      'openIdChangesCounter',
      'oauth2BaseUriEnabled',
      'credentialsSource',
      'allowRedirectUriChange',
      'issuerUri',
    ]);
    this.componentName = 'authorization-method';
    this.darkThemeActive = false;
    this.oauth2BaseUriEnabled = false;
    this.allowRedirectUriChange = false;
    this.demoStates = ['Filled', 'Outlined', 'Anypoint'];
    this.demoState = 0;
    this.openIdChangesCounter = 0;
    // this.oauth2redirect = 'http://auth.advancedrestclient.com/arc.html';
    this.oauth2redirect = `${window.location.origin}/oauth-popup.html`;
    this.credentialsSource = [{grantType: 'client_credentials', credentials: [{name: 'My social Network', clientId: '123', clientSecret: 'xyz'}, {name: 'My social Network 2', clientId: '1234', clientSecret: 'wxyz'}]}];
    this.issuerUri = 'https://accounts.google.com/';
    // this.issuerUri = env.oauth2.issuer;
    this.issuers = [
      env.oauth2.issuer,
      'https://accounts.google.com/',
      'https://login.salesforce.com/',
      'https://phantauth.net/',
      'https://www.paypalobjects.com/',
      'https://api.login.yahoo.com/',
      'https://login.microsoftonline.com/fabrikamb2c.onmicrosoft.com/v2.0/'
    ];
  }

  _demoStateHandler(e) {
    const state = e.detail.value;
    this.demoState = state;
    this.outlined = state === 1;
    this.anypoint = state === 2;
    this._updateAnypoint();
  }

  _openIdChangeHandler(e) {
    this.openIdChangesCounter++;
    const result = e.target.serialize();
    console.log(result);
    localStorage.setItem(storeKey, JSON.stringify(result));
  }

  restoreHandler() {
    const str = localStorage.getItem(storeKey);
    if (!str) {
      return;
    }
    const info = JSON.parse(str);
    console.log('Restoring', info);
    const method = document.querySelector('authorization-method');
    Object.keys(info).forEach(k => {
      method[k] = info[k];
    });
  }

  /**
   * @param {Event} e
   */
  _issuerHandler(e) {
    const input = /** @type HTMLInputElement */ (e.target);
    this.issuerUri = input.value;
  }

  _demoTemplate() {
    const {
      demoStates,
      darkThemeActive,
      anypoint,
      outlined,
      demoState,
      openIdChangesCounter,
      oauth2redirect,
      oauth2BaseUriEnabled,
      credentialsSource,
      allowRedirectUriChange,
      issuerUri,
      issuers,
    } = this;
    // these cid and cs are only allowed for localhost testing.
    // Other origins are banned.
    const cid = '1076318174169-5i48tqquddrk0lv0shbtsaj6kc8c9j5g.apps.googleusercontent.com';
    const cs = 'SF3kI7tqI_BUdc5ACkJ4vjII';
    const baseUri = oauth2BaseUriEnabled ? 'https://api.domain.com/auth/' : undefined;
    return html`
    <section class="documentation-section">
      <h3>OpenID connect authentication</h3>
      <arc-interactive-demo
        .states="${demoStates}"
        .selectedState="${demoState}"
        @state-changed="${this._demoStateHandler}"
        ?dark="${darkThemeActive}"
      >
        <authorization-method
          ?anypoint="${anypoint}"
          ?outlined="${outlined}"
          type="open id"
          slot="content"
          redirectUri="${oauth2redirect}"
          clientId="${cid}"
          clientSecret="${cs}"
          grantType="authorization_code"
          issuerUri="${issuerUri}"
          ?allowRedirectUriChange="${allowRedirectUriChange}"
          .credentialsSource="${credentialsSource}"
          .baseUri="${baseUri}"
          @change="${this._openIdChangeHandler}"
        ></authorization-method>

        <label slot="options" id="mainOptionsLabel">Options</label>
        <anypoint-checkbox
          aria-describedby="mainOptionsLabel"
          slot="options"
          name="oauth2BaseUriEnabled"
          @change="${this._toggleMainOption}">Add base URI</anypoint-checkbox>
        <anypoint-checkbox
          aria-describedby="mainOptionsLabel"
          slot="options"
          name="allowRedirectUriChange"
          @change="${this._toggleMainOption}">Allow redirect URI change</anypoint-checkbox>
      </arc-interactive-demo>

      <div>
        <label for="issuer-uri">Issuer URI:</label>
        <select id="issuer-uri" name="issuer-uri" @change="${this._issuerHandler}" @blur="${this._issuerHandler}">
          ${issuers.map(uri => html`<option ?selected="${uri === issuerUri}" value="${uri}">${uri}</option>`)}
        </select>
      </div>
      
      <p>Change events counter: ${openIdChangesCounter}</p>

      <div>
        <anypoint-button @click="${this.restoreHandler}">Restore from local storage</anypoint-button>
      </div>
    </section>
    `;
  }

  contentTemplate() {
    return html`
      <oidc-authorization tokenProxy="${env.oauth2.tokenProxy}" tokenProxyEncode=''></oidc-authorization>
      <h2>Authorization method</h2>
      ${this._demoTemplate()}
    `;
  }
}

const instance = new ComponentDemo();
instance.render();
