/* eslint-disable no-param-reassign */
/** @typedef {import('../AuthorizationMethodElement').default} AuthorizationMethodElement */
/** @typedef {import('../CcAuthorizationMethodElement').default} CcAuthorizationMethodElement */
/** @typedef {import('../types').AuthUiInit} AuthUiInit */

import Digest from './Digest.js';
import HttpBasic from './HttpBasic.js';
import HttpBearer from './HttpBearer.js';
import Ntlm from './Ntlm.js';
import OAuth1 from './OAuth1.js';
import OAuth2 from './OAuth2.js';
import OpenID from './OpenID.js';
import ClientCertificate from './ClientCertificate.js';

export class UiDataHelper {
  /**
   * @param {AuthorizationMethodElement} element
   * @param {AuthUiInit} init
   */
  static setupBasic(element, init) {
    const i = new HttpBasic(init);
    i.username = element.username;
    i.password = element.password;
    return i;
  }

  /**
   * @param {AuthorizationMethodElement} element
   * @param {AuthUiInit} init
   */
  static setupBearer(element, init) {
    const i = new HttpBearer(init);
    i.token = element.token;
    return i;
  }

  /**
   * @param {AuthorizationMethodElement} element
   * @param {AuthUiInit} init
   */
  static setupNtlm(element, init) {
    const i = new Ntlm(init);
    i.username = element.username;
    i.password = element.password;
    i.domain = element.domain;
    return i;
  }

  /**
   * @param {AuthorizationMethodElement} element
   * @param {AuthUiInit} init
   */
  static setupDigest(element, init) {
    const i = new Digest(init);
    this.setDigestValues(i, element);
    return i;
  }

  /**
   * @param {Digest} i
   * @param {AuthorizationMethodElement} element
   */
  static setDigestValues(i, element) {
    i.username = element.username;
    i.password = element.password;
    i.realm = element.realm;
    i.nonce = element.nonce;
    i.algorithm = element.algorithm;
    i.qop = element.qop;
    i.nc = element.nc;
    i.cnonce = element.cnonce;
    i.opaque = element.opaque;
    i.response = element.response;
    i.httpMethod = element.httpMethod;
    i.requestUrl = element.requestUrl;
    i.requestBody = element.requestBody;
  }

  /**
   * @param {AuthorizationMethodElement} element
   * @param {AuthUiInit} init
   */
  static setupOauth1(element, init) {
    const i = new OAuth1(init);
    i.consumerKey = element.consumerKey;
    i.consumerSecret = element.consumerSecret;
    i.token = element.token;
    i.tokenSecret = element.tokenSecret;
    i.timestamp = element.timestamp;
    i.nonce = element.nonce;
    i.realm = element.realm;
    i.signatureMethod = element.signatureMethod;
    i.requestTokenUri = element.requestTokenUri;
    i.authTokenMethod = element.authTokenMethod;
    i.authParamsLocation = element.authParamsLocation;
    i.signatureMethods = element.signatureMethods;
    i.redirectUri = element.redirectUri;
    i.authorizationUri = element.authorizationUri;
    i.accessTokenUri = element.accessTokenUri;
    return i;
  }

  /**
   * @param {AuthorizationMethodElement} element
   * @param {AuthUiInit} init
   */
  static setupOauth2(element, init) {
    const i = new OAuth2(init);
    this.setOAuth2Values(i, element);
    return i;
  }

  /**
   * @param {OAuth2} i
   * @param {AuthorizationMethodElement} element
   */
  static setOAuth2Values(i, element) {
    i.username = element.username;
    i.password = element.password;
    i.grantType = element.grantType;
    i.clientId = element.clientId;
    i.clientSecret = element.clientSecret;
    i.scopes = element.scopes;
    i.authorizationUri = element.authorizationUri;
    i.accessTokenUri = element.accessTokenUri;
    i.redirectUri = element.redirectUri;
    i.allowedScopes = element.allowedScopes;
    i.preventCustomScopes = element.preventCustomScopes;
    i.accessToken = element.accessToken;
    i.tokenType = element.tokenType;
    i.grantTypes = element.grantTypes;
    i.advanced = element.advanced;
    i.advancedOpened = element.advancedOpened;
    i.noGrantType = element.noGrantType;
    i.oauthDeliveryMethod = element.oauthDeliveryMethod;
    i.ccDeliveryMethod = element.ccDeliveryMethod;
    i.oauthDeliveryName = element.oauthDeliveryName;
    i.baseUri = element.baseUri;
    i.lastErrorMessage = element.lastErrorMessage;
    i.noPkce = element.noPkce;
    i.pkce = element.pkce;
    i.credentialSource = element.credentialSource;
    i.allowRedirectUriChange = element.allowRedirectUriChange;
    i.assertion = element.assertion;
    i.deviceCode = element.deviceCode;
  }

  /**
   * @param {AuthorizationMethodElement} element
   * @param {AuthUiInit} init
   */
  static setupOidc(element, init) {
    const i = new OpenID(init);
    this.setOAuth2Values(i, element);
    i.issuerUri = element.issuerUri;
    i.tokens = element.tokens;
    i.tokenInUse = element.tokenInUse;
    i.supportedResponses = element.supportedResponses;
    i.serverScopes = element.serverScopes;
    i.responseType = element.responseType;
    return i;
  }

  /**
   * @param {AuthorizationMethodElement} element
   * @param {HttpBasic} ui
   */
  static populateBasic(element, ui) {
    element.username = ui.username;
    element.password = ui.password;
  }

  /**
   * @param {AuthorizationMethodElement} element
   * @param {HttpBearer} ui
   */
  static populateBearer(element, ui) {
    element.token = ui.token;
  }

  /**
   * @param {AuthorizationMethodElement} element
   * @param {Ntlm} ui
   */
  static populateNtlm(element, ui) {
    element.username = ui.username;
    element.password = ui.password;
    element.domain = ui.domain;
  }

  /**
   * @param {AuthorizationMethodElement} element
   * @param {Digest} ui
   */
  static populateDigest(element, ui) {
    element.username = ui.username;
    element.password = ui.password;
    element.realm = ui.realm;
    element.nonce = ui.nonce;
    element.algorithm = ui.algorithm;
    element.qop = ui.qop;
    element.nc = ui.nc;
    element.cnonce = ui.cnonce;
    element.opaque = ui.opaque;
    element.response = ui.response;
    element.httpMethod = ui.httpMethod;
  }

  /**
   * @param {AuthorizationMethodElement} element
   * @param {OAuth1} ui
   */
  static populateOAuth1(element, ui) {
    element.consumerKey = ui.consumerKey;
    element.consumerSecret = ui.consumerSecret;
    element.token = ui.token;
    element.tokenSecret = ui.tokenSecret;
    element.timestamp = ui.timestamp;
    element.nonce = ui.nonce;
    element.realm = ui.realm;
    element.signatureMethod = ui.signatureMethod;
    element.requestTokenUri = ui.requestTokenUri;
    element.authTokenMethod = ui.authTokenMethod;
    element.authParamsLocation = ui.authParamsLocation;
    element.signatureMethods = ui.signatureMethods;
    element.redirectUri = ui.redirectUri;
    element.authorizationUri = ui.authorizationUri;
    element.accessTokenUri = ui.accessTokenUri;
    element._authorizing = ui.authorizing;
  }

  /**
   * @param {AuthorizationMethodElement} element
   * @param {OAuth2} ui
   */
  static populateOAuth2(element, ui) {
    element.username = ui.username;
    element.password = ui.password;
    element.grantType = ui.grantType;
    element.clientId = ui.clientId;
    element.clientSecret = ui.clientSecret;
    element.scopes = ui.scopes;
    element.authorizationUri = ui.authorizationUri;
    element.accessTokenUri = ui.accessTokenUri;
    element.redirectUri = ui.redirectUri;
    element.allowedScopes = ui.allowedScopes;
    element.preventCustomScopes = ui.preventCustomScopes;
    element.accessToken = ui.accessToken;
    element.tokenType = ui.tokenType;
    element.grantTypes = ui.grantTypes;
    element.advanced = ui.advanced;
    element.advancedOpened = ui.advancedOpened;
    element.noGrantType = ui.noGrantType;
    element.oauthDeliveryMethod = ui.oauthDeliveryMethod;
    element.ccDeliveryMethod = ui.ccDeliveryMethod;
    element.oauthDeliveryName = ui.oauthDeliveryName;
    element.lastErrorMessage = ui.lastErrorMessage;
    element.pkce = ui.pkce;
    element.credentialSource = ui.credentialSource;
    element._authorizing = ui.authorizing;
    element.assertion = ui.assertion;
    element.deviceCode = ui.deviceCode;
  }

  /**
   * @param {AuthorizationMethodElement} element
   * @param {OpenID} ui
   */
  static populateOpenId(element, ui) {
    this.populateOAuth2(element, ui);
    element.issuerUri = ui.issuerUri;
    element.tokens = ui.tokens;
    element.tokenInUse = ui.tokenInUse;
    element.supportedResponses = ui.supportedResponses;
    element.serverScopes = ui.serverScopes;
    element.responseType = ui.responseType;
  }

  /**
   * @param {CcAuthorizationMethodElement} element
   * @param {AuthUiInit} init
   */
  static setupClientCertificate(element, init) {
    const i = new ClientCertificate(init);
    i.selected = element.selected;
    i.none = element.none;
    i.importButton = element.importButton;
    i.items = element.items;
    return i;
  }

  /**
   * @param {CcAuthorizationMethodElement} element
   * @param {ClientCertificate} ui
   */
  static populateClientCertificate(element, ui) {
    element.selected = ui.selected;
    element.none = ui.none;
    element.importButton = ui.importButton;
  }
}
