/* eslint-disable no-continue */
/* eslint-disable no-await-in-loop */
import { ArcHeaders } from '../lib/headers/ArcHeaders.js';
import ExecutionResponse from './ExecutionResponse.js';
import applyCachedBasicAuthData from './BasicAuthCache.js';

/** @typedef {import('@advanced-rest-client/events').ArcRequest.ArcEditorRequest} ArcEditorRequest */
/** @typedef {import('@advanced-rest-client/events').ArcRequest.ArcBaseRequest} ArcBaseRequest */
/** @typedef {import('@advanced-rest-client/events').Authorization.CCAuthorization} CCAuthorization */
/** @typedef {import('@advanced-rest-client/events').Authorization.BasicAuthorization} BasicAuthorization */
/** @typedef {import('@advanced-rest-client/events').Authorization.OAuth2Authorization} OAuth2Authorization */
/** @typedef {import('@advanced-rest-client/events').Authorization.BearerAuthorization} BearerAuthorization */
/** @typedef {import('@advanced-rest-client/events').Authorization.OidcAuthorization} OidcAuthorization */
/** @typedef {import('@advanced-rest-client/events').FormTypes.FormItem} FormItem */
/** @typedef {import('../types').ExecutionContext} ExecutionContext */

/**
 * Injects client certificate object into the request object
 * @param {ArcBaseRequest} request 
 * @param {CCAuthorization} config
 * @param {ExecutionContext} context 
 */
async function processClientCertificate(request, config, context) {
  const { id } = config;
  if (!id) {
    return;
  }
  const result = await context.Store.ClientCertificate.read(context.eventsTarget, id);
  if (!result) {
    return;
  }

  const cert = Array.isArray(result.cert) ? result.cert : [result.cert];
  request.clientCertificate = {
    type: result.type,
    cert,
  };
  if (result.key) {
    // @ts-ignore
    request.clientCertificate.key = [result.key];
  }
}

/**
 * Injects basic auth header into the request headers.
 * @param {ArcBaseRequest} request 
 * @param {BasicAuthorization} config 
 */
function processBasicAuth(request, config) {
  const { username, password } = config;
  if (!username) {
    return;
  }
  const value = btoa(`${username}:${password || ''}`);

  const headers = new ArcHeaders(request.headers || '');
  headers.append('authorization', `Basic ${value}`);
  request.headers = headers.toString();
}

/**
 * Injects oauth 2 auth header into the request headers.
 * @param {ArcBaseRequest} request 
 * @param {OAuth2Authorization} config 
 */
function processOAuth2(request, config) {
  const { accessToken, tokenType='Bearer', deliveryMethod='header', deliveryName='authorization' } = config;
  if (!accessToken) {
    return;
  }
  const value = `${tokenType} ${accessToken}`;
  if (deliveryMethod === 'header') {
    const headers = new ArcHeaders(request.headers || '');
    headers.append(deliveryName, value);
    request.headers = headers.toString();
  } else if (deliveryMethod === 'query') {
    const { url } = request;
    try {
      const parsed = new URL(url);
      parsed.searchParams.append(deliveryName, value);
      request.url = parsed.toString();
    } catch (e) {
      // ...
    }
  }
}

/**
 * Injects OpenID Connect auth header into the request headers.
 * @param {ArcBaseRequest} request 
 * @param {OidcAuthorization} config 
 */
function processOpenId(request, config) {
  const { accessToken } = config;
  if (accessToken) {
    processOAuth2(request, config);
  }
  // todo - if AT is missing find the current token from the tokens list in the passed configuration.
  // Currently the authorization method UI sets the token when the requests is generated so it's not as much important.
}

/**
 * Injects bearer auth header into the request headers.
 * @param {ArcBaseRequest} request 
 * @param {BearerAuthorization} config 
 */
function processBearer(request, config) {
  const { token } = config;
  const value = `Bearer ${token}`;

  const headers = new ArcHeaders(request.headers || '');
  headers.append('authorization', value);
  request.headers = headers.toString();
}

/**
 * Processes authorization data from the authorization configuration and injects data into the request object when necessary.
 * 
 * This work with the authorization-method elements.
 * 
 * @param {ArcEditorRequest} request 
 * @param {ExecutionContext} context 
 * @param {AbortSignal} signal 
 */
export default async function processAuth(request, context, signal) {
  const editorRequest = request.request;
  if (!Array.isArray(editorRequest.authorization) || !editorRequest.authorization.length) {
    return ExecutionResponse.OK;
  }
  for (const auth of editorRequest.authorization) {
    if (signal.aborted || !auth.enabled || !auth.config) {
      continue;
    }
    switch (auth.type) {
      case 'client certificate': await processClientCertificate(request.request, /** @type CCAuthorization */ (auth.config), context); break;
      case 'basic': processBasicAuth(request.request, /** @type BasicAuthorization */ (auth.config)); break;
      case 'oauth 2': processOAuth2(request.request, /** @type OAuth2Authorization */ (auth.config)); break;
      case 'open id': processOpenId(request.request, /** @type OidcAuthorization */ (auth.config)); break;
      case 'bearer': processBearer(request.request, /** @type BearerAuthorization */ (auth.config)); break;
      default:
    }
  }
  if (request.request.url && !/^authorization:\s?.+$/gim.test(request.request.headers || '')) {
    // Try to apply basic auth from the cached during this session values.
    applyCachedBasicAuthData(request.request);
  }
  return ExecutionResponse.OK;
}
