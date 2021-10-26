import { html } from 'lit-element';
import '../../../../define/authorization-selector.js';
import '../../../../define/authorization-method.js';
import '../../../../define/cc-authorization-method.js'

/** @typedef {import('lit-element').TemplateResult} TemplateResult */
/** @typedef {import('../../../types').AuthorizationTemplateOptions} AuthorizationTemplateOptions */
/** @typedef {import('@advanced-rest-client/events').ArcRequest.RequestAuthorization} RequestAuthorization */
/** @typedef {import('@advanced-rest-client/events').Authorization.OidcAuthorization} OidcAuthorization */

/**
 * @param {boolean} anypoint
 * @param {boolean} outlined
 * @param {any} [config={}]
 * @returns {TemplateResult} The template for the basic auth type.
 */
function basicTemplate(anypoint, outlined, config={}) {
  const { username, password } = (config.config || {});
  return html`
  <authorization-method
    ?anypoint="${anypoint}"
    ?outlined="${outlined}"
    type="basic"
    .username="${username}"
    .password="${password}"
    aria-describedby="basicAuthDesc"
  ></authorization-method>
  <p id="basicAuthDesc" slot="aria">
    Basic authorization allows to send a username and a password in a request header.
  </p>`;
}


/**
 * @param {boolean} anypoint
 * @param {boolean} outlined
 * @param {any} [config={}]
 * @returns {TemplateResult} The template for the bearer auth type.
 */
function bearerTemplate(anypoint, outlined, config={}) {
  const { token } = (config.config || {});
  return html`
  <authorization-method
    ?anypoint="${anypoint}"
    ?outlined="${outlined}"
    type="bearer"
    .token="${token}"
    aria-describedby="tokenAuthDesc"
  ></authorization-method>
  <p id="tokenAuthDesc" slot="aria">
    Bearer authorization allows to send an authentication token in the authorization header using the "bearer" method.
  </p>`;
}

/**
 * @param {boolean} anypoint
 * @param {boolean} outlined
 * @param {any} [config={}]
 * @returns {TemplateResult} The template for the NTLM auth type.
 */
function ntlmTemplate(anypoint, outlined, config={}) {
  const { username, password, domain } = (config.config || {});
  return html`
  <authorization-method
    ?anypoint="${anypoint}"
    ?outlined="${outlined}"
    type="ntlm"
    .username="${username}"
    .password="${password}"
    .domain="${domain}"
    aria-describedby="ntlmAuthDesc"
  ></authorization-method>
  <p id="ntlmAuthDesc" slot="aria">
    NTLM authorization is used with Microsoft NT domains.
  </p>`;
}

/**
 * @param {boolean} anypoint
 * @param {boolean} outlined
 * @param {string} oauth2RedirectUri
 * @param {any} [config={}]
 * @returns {TemplateResult} The template for the NTLM auth type.
 */
function oa2AuthTemplate(anypoint, outlined, oauth2RedirectUri, config={}) {
  const {
    accessToken, tokenType, scopes, clientId, grantType, deliveryMethod,
    deliveryName, clientSecret, accessTokenUri, authorizationUri,
    username, password, redirectUri, assertion, deviceCode, pkce,
  } = (config.config || {});
  return html`<authorization-method
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
    .redirectUri="${redirectUri || oauth2RedirectUri}"
    .assertion="${assertion}"
    .deviceCode="${deviceCode}"
    .pkce="${pkce}"
    allowRedirectUriChange
  ></authorization-method>`;
}

/**
 * @param {boolean} anypoint
 * @param {boolean} outlined
 * @param {string} oauth2RedirectUri
 * @param {any} [config={}]
 * @returns {TemplateResult} The template for the NTLM auth type.
 */
function oidcAuthTemplate(anypoint, outlined, oauth2RedirectUri, config={}) {
  const state = /** @type OidcAuthorization */ (config.config || {});
  const {
    scopes, clientId, grantType, deliveryMethod,
    deliveryName, clientSecret, accessTokenUri, authorizationUri,
    username, password, redirectUri, assertion, grantTypes, deviceCode,
    issuerUri, pkce, responseType, serverScopes, supportedResponses, tokenInUse,
    tokenType, tokens,
  } = state;
  return html`<authorization-method
    ?anypoint="${anypoint}"
    ?outlined="${outlined}"
    type="open id"
    .scopes="${scopes}"
    .clientId="${clientId}"
    .clientSecret="${clientSecret}"
    .grantType="${grantType}"
    .oauthDeliveryMethod="${deliveryMethod}"
    .oauthDeliveryName="${deliveryName}"
    .authorizationUri="${authorizationUri}"
    .accessTokenUri="${accessTokenUri}"
    .username="${username}"
    .password="${password}"
    .redirectUri="${redirectUri || oauth2RedirectUri}"
    .issuerUri="${issuerUri}"
    .assertion="${assertion}"
    .grantTypes="${grantTypes}"
    .deviceCode="${deviceCode}"
    .pkce="${pkce}"
    .responseType="${responseType}"
    .serverScopes="${serverScopes}"
    .supportedResponses="${supportedResponses}"
    .tokenInUse="${tokenInUse}"
    .tokenType="${tokenType}"
    .tokens="${tokens}"
    allowRedirectUriChange
  ></authorization-method>`;
}

/**
 * @param {boolean} anypoint
 * @param {boolean} outlined
 * @param {any} [config={}]
 * @returns {TemplateResult} The template for the Client Certificate auth type.
 */
function ccTemplate(anypoint, outlined, config={}) {
  const { id } = (config.config || {});
  return html`
  <cc-authorization-method
    ?anypoint="${anypoint}"
    ?outlined="${outlined}"
    .selected="${id}"
    type="client certificate"
    importButton
  >
  </cc-authorization-method>
  `;
}

/**
 * @param {RequestAuthorization[]} config
 * @param {string} type
 * @returns {RequestAuthorization|undefined}
 */
function readConfiguration(config, type) {
  if (!Array.isArray(config) || !config.length) {
    return undefined;
  }
  return config.find((cnf) => cnf.type === type);
}

/**
 * @param {Function} changeHandler
 * @param {AuthorizationTemplateOptions} config
 * @param {RequestAuthorization[]=} auth
 * @returns {TemplateResult}
 */
export default function authorizationTemplate(changeHandler, config, auth=[]) {
  const { anypoint, outlined, ui={}, oauth2RedirectUri, hidden } = config;
  const { selected=0 } = ui;
  const enabled = [];
  auth.forEach((method, index) => {
    if (method.enabled) {
      enabled.push(index);
    }
  });
  return html`
  <authorization-selector
    ?hidden="${hidden}"
    ?anypoint="${anypoint}"
    ?outlined="${outlined}"
    slot="content"
    @change="${changeHandler}"
    .selected="${selected}"
    horizontal
    multi
    .selectedValues="${enabled}"
  >
    ${basicTemplate(anypoint, outlined, readConfiguration(auth, 'basic'))}
    ${bearerTemplate(anypoint, outlined, readConfiguration(auth, 'bearer'))}
    ${ntlmTemplate(anypoint, outlined, readConfiguration(auth, 'ntlm'))}
    ${oa2AuthTemplate(anypoint, outlined, oauth2RedirectUri, readConfiguration(auth, 'oauth 2'))}
    ${oidcAuthTemplate(anypoint, outlined, oauth2RedirectUri, readConfiguration(auth, 'open id'))}
    ${ccTemplate(anypoint, outlined, readConfiguration(auth, 'client certificate'))}
  </authorization-selector>
  `;
}
