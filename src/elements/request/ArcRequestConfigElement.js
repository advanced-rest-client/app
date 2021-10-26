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
import '@anypoint-web-components/awc/anypoint-input.js';
import '@anypoint-web-components/awc/anypoint-switch.js';
import styles from './styles/ConfigStyles.js';

/** @typedef {import('@advanced-rest-client/events').ArcRequest.RequestConfig} RequestConfig */

/**
 * A per-request configuration options.
 */
export default class ArcRequestConfigElement extends LitElement {
  static get styles() {
    return styles;
  }

  static get properties() {
    return {
      /**
       * Request configuration object
       */
      config: { type: Object },
      /**
       * Enables Anypoint theme
       */
      anypoint: { type: Boolean },
      /**
       * Enables material's outlined theme for inputs.
       */
      outlined: { type: Boolean },
      /**
       * When set the editor is in read only mode.
       */
      readOnly: { type: Boolean }
    };
  }

  constructor() {
    super();
    this.ensureConfig();
    this.anypoint = false;
    this.outlined = false;
    this.readOnly = false;
  }

  ensureConfig() {
    if (this.config) {
      return;
    }
    /** 
     * @type {RequestConfig}
     */
    this.config = {
      enabled: false,
      timeout: 90,
      followRedirects: false,
      ignoreSessionCookies: false,
    };
  }

  _inputHandler(e) {
    this.ensureConfig();
    const { name, value } = e.target;
    this.config[name] = value;
    this.notify();
  }

  _checkedHandler(e) {
    this.ensureConfig();
    const { name, checked } = e.target;
    this.config[name] = checked;
    this.notify();
    this.requestUpdate();
  }

  notify() {
    this.dispatchEvent(new CustomEvent('change'));
  }

  render() {
    this.ensureConfig();
    return html`
      ${this._headerTemplate()}
      ${this._redirectsTemplate()}
      ${this._timeoutTemplate()}
      ${this._validateSslTemplate()}
      ${this._nodeClientTemplate()}
      ${this._defaultHeadersTemplate()}
      ${this._disableCookiesTemplate()}
    `;
  }

  _headerTemplate() {
    const { anypoint, config, readOnly } = this;
    return html`
    <div class="header">
      Request configuration
    </div>
    <p>
      Per-request configuration overrides values in a workspace the global configuration.
    </p>
    <p>
      <anypoint-switch
        name="enabled"
        .checked="${config.enabled}"
        @checkedchange="${this._checkedHandler}"
        ?anypoint="${anypoint}"
        ?disabled="${readOnly}"
      >Request configuration enabled</anypoint-switch>
    </p>
    `;
  }

  _redirectsTemplate() {
    const { anypoint, readOnly, config } = this;
    const { enabled, followRedirects } = config;
    return html`
    <anypoint-switch
      name="followRedirects"
      .checked="${followRedirects}"
      @checkedchange="${this._checkedHandler}"
      ?anypoint="${anypoint}"
      ?disabled="${!enabled || readOnly}"
      tabindex="0"
    >Follow redirects</anypoint-switch>
    `;
  }

  _timeoutTemplate() {
    const { anypoint, outlined, readOnly, config } = this;
    const { enabled, timeout } = config;
    return html`
    <anypoint-input
      name="timeout"
      min="0"
      step="1"
      type="number"
      pattern="[0-9]*"
      invalidMessage="Enter time as a number"
      autoValidate
      .value="${timeout}"
      @valuechange="${this._inputHandler}"
      ?anypoint="${anypoint}"
      ?outlined="${outlined}"
      ?disabled="${!enabled}"
      ?readOnly="${readOnly}"
    >
      <label slot="label">Request timeout</label>
      <div slot="suffix">seconds</div>
    </anypoint-input>
    `;
  }

  _validateSslTemplate() {
    const { anypoint, readOnly, config } = this;
    const { enabled, validateCertificates } = config;
    return html`
    <div>
      <anypoint-switch
        name="validateCertificates"
        .checked="${validateCertificates}"
        @checkedchange="${this._checkedHandler}"
        ?anypoint="${anypoint}"
        ?disabled="${!enabled||readOnly}"
        tabindex="0"
      >Validate SSL certificates (experiment)</anypoint-switch>
    </div>
    `;
  }

  _nodeClientTemplate() {
    const { anypoint, readOnly, config } = this;
    const { enabled, nativeTransport } = config;
    return html`
    <div>
      <anypoint-switch
        name="nativeTransport"
        .checked="${nativeTransport}"
        @checkedchange="${this._checkedHandler}"
        ?anypoint="${anypoint}"
        ?disabled="${!enabled||readOnly}"
        tabindex="0"
      >Node native request (experiment)</anypoint-switch>
    </div>
    `;
  }

  _defaultHeadersTemplate() {
    const { anypoint, readOnly, config } = this;
    const { enabled, defaultHeaders } = config;
    return html`
    <div>
      <anypoint-switch
        name="defaultHeaders"
        .checked="${defaultHeaders}"
        @checkedchange="${this._checkedHandler}"
        ?anypoint="${anypoint}"
        ?disabled="${!enabled||readOnly}"
        tabindex="0"
      >Add default headers (accept and user-agent)</anypoint-switch>
    </div>
    `;
  }

  _disableCookiesTemplate() {
    const { anypoint, readOnly, config } = this;
    const { enabled, ignoreSessionCookies } = config;
    return html`
    <div>
      <anypoint-switch
        name="ignoreSessionCookies"
        .checked="${ignoreSessionCookies}"
        @checkedchange="${this._checkedHandler}"
        ?anypoint="${anypoint}"
        ?disabled="${!enabled||readOnly}"
        tabindex="0"
        title="When checked it does not add cookies to this request automatically"
      >Disable auto cookies processing</anypoint-switch>
    </div>
    `;
  }
}
