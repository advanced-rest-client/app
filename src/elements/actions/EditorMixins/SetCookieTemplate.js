import { html } from 'lit-element';

import {
  dataSourceSelector,
  dataSourcePathTemplate,
  inputTemplate,
  dataIteratorTemplate,
  iteratorTemplate,
  failTemplate,
  configCheckbox,
  defaultSourceConfig,
  dataSourceTypeSelector,
} from '../CommonTemplates.js';

/** @typedef {import('lit-html').TemplateResult} TemplateResult */
/** @typedef {import('@advanced-rest-client/events').Actions.SetCookieConfig} SetCookieConfig */
/** @typedef {import('@advanced-rest-client/events').Actions.DataSourceConfiguration} DataSourceConfiguration */
/** @typedef {import('@advanced-rest-client/events').Actions.ActionType} ActionType */
/** @typedef {import('../CommonTemplates').InputConfiguration} InputConfiguration */
/** @typedef {import('../CommonTemplates').CheckboxConfiguration} CheckboxConfiguration */
/** @typedef {import('../../../types').InputOptions} InputOptions */

/**
 * Renders a template for the `useRequestUrl` config property.
 *
 * @param {Function} changeHandler
 * @param {string} type
 * @param {boolean} [useRequestUrl=false]
 * @param {CheckboxConfiguration} inputConfig
 * @return {TemplateResult}
 */
function useRequestUrlTemplate(changeHandler, type, useRequestUrl = false, inputConfig={}) {
  const label = type === 'request' ? 'Use the request URL' : 'Use the final response URL';
  const cnf = {
    notify: 'config',
    render: 'true',
    name: 'config.useRequestUrl',
    ...inputConfig,
  };
  return configCheckbox(changeHandler, label, useRequestUrl, cnf);
}

/**
 * Renders a template for the cookie's name input.
 *
 * @param {Function} inputHandler
 * @param {string} [name='']
 * @param {InputOptions=} inputConfig
 * @return {TemplateResult}
 */
function cookieNameTemplate(inputHandler, name = '', inputConfig={}) {
  const cnf = {
    ...inputConfig,
    required: true,
    autoValidate: true,
    notify: 'config',
  };
  return inputTemplate(
    'config.name',
    name,
    'Cookie name (required)',
    inputHandler,
    cnf
  );
}

/**
 * Renders a template for the cookie's URL input.
 *
 * @param {Function} inputHandler
 * @param {SetCookieConfig=} config
 * @param {InputConfiguration=} inputConfig
 * @return {TemplateResult|string} Empty string when `useRequestUrl` is set on the config.
 */
function cookieUrlTemplate(inputHandler, { useRequestUrl = false, url = '' }, inputConfig={}) {
  if (useRequestUrl) {
    return '';
  }
  const cnf = {
    ...inputConfig,
    required: true,
    autoValidate: true,
    notify: 'config',
  };
  return inputTemplate(
    'config.url',
    url,
    'Cookie URL (required)',
    inputHandler,
    cnf
  );
}

/**
 * Renders a template for the "expires" input
 * @param {Function} inputHandler
 * @param {string} expires
 * @param {InputConfiguration} inputConfig
 * @return {TemplateResult}
 */
function cookieExpiresTemplate(inputHandler, expires = '', inputConfig={}) {
  const cnf = {
    ...inputConfig,
    type: 'datetime-local',
    notify: 'config',
  };
  return inputTemplate('config.expires', expires, 'Expires', inputHandler, cnf);
}

/**
 * Renders a template for the "hostOnly" checkbox
 * @param {Function} changeHandler
 * @param {boolean=} [hostOnly=false]
 * @param {CheckboxConfiguration=} inputConfig
 * @return {TemplateResult}
 */
function hostOnlyTemplate(changeHandler, hostOnly = false, inputConfig={}) {
  const cnf = {
    name: 'config.hostOnly',
    notify: 'config',
    ...inputConfig,
  };
  return configCheckbox(changeHandler, 'Host only', hostOnly, cnf);
}

/**
 * Renders a template for the "httpOnly" checkbox
 * @param {Function} changeHandler 
 * @param {boolean} [httpOnly=false]
 * @param {CheckboxConfiguration} inputConfig
 * @return {TemplateResult}
 */
function httpOnlyTemplate(changeHandler, httpOnly = false, inputConfig={}) {
  const cnf = {
    notify: 'config',
    name: 'config.httpOnly',
    ...inputConfig,
  };
  return configCheckbox(changeHandler, 'HTTP only', httpOnly, cnf);
}

/**
 * Renders a template for the "secure" checkbox
 * @param {Function} changeHandler
 * @param {boolean} [secure=false]
 * @param {CheckboxConfiguration=} inputConfig
 * @return {TemplateResult}
 */
function secureTemplate(changeHandler, secure = false, inputConfig={}) {
  const cnf = {
    notify: 'config',
    name: 'config.secure',
    ...inputConfig,
  };
  return configCheckbox(changeHandler, 'Secure', secure, cnf);
}
/**
 * Renders a template for the "secure" checkbox
 * @param {Function} changeHandler
 * @param {boolean} [session=false]
 * @param {CheckboxConfiguration=} inputConfig
 * @return {TemplateResult}
 */
function sessionTemplate(changeHandler, session = false, inputConfig={}) {
  const cnf = {
    notify: 'config',
    name: 'config.session',
    ...inputConfig,
  };
  return configCheckbox(changeHandler, 'Session', session, cnf);
}

/**
 * Renders a template for the data source selector.
 * @param {Function} changeHandler
 * @param {ActionType} type
 * @param {InputConfiguration=} inputConfig
 * @return {TemplateResult|string}
 */
function dataSourceTypeSelectorTemplate(changeHandler, type, inputConfig={}) {
  if (type === 'request') {
    // this can oly have the `request` as the source type.
    return '';
  }
  const { outlined, anypoint } = inputConfig;
  return dataSourceTypeSelector({
    selected: type,
    handler: changeHandler,
    outlined, 
    anypoint,
    name: 'config.source.type',
  });
}

/**
 * Renders a template for the data source selector.
 * @param {string} type
 * @param {DataSourceConfiguration} configSource
 * @param {Function} dataSourceHandler
 * @return {TemplateResult}
 */
function sourceTemplate(type, configSource, dataSourceHandler) {
  const { type: cType, source } = configSource;
  const requestOptions = type === 'request' ? true : cType === 'request';
  const responseOptions = !requestOptions && (type === 'response' ? true : cType === 'response');
  
  return dataSourceSelector(source, dataSourceHandler, {
    requestOptions,
    responseOptions,
    name: 'config.source.source',
  });
}

/**
 * Renders a template for the array search editor
 * @param {DataSourceConfiguration} configSource
 * @param {Function} inputHandler Handler for the input event.
 * @param {Function} changeHandler Handler for the change event (this[configChangeHandlerSymbol])
 * @param {Function} dataSourceHandler Handler for the data source change event (this[dataSourceHandlerSymbol]).
 * @param {InputConfiguration=} inputConfig
 * @return {TemplateResult|string}
 */
function arraySearchTpl(configSource, inputHandler, changeHandler, dataSourceHandler, inputConfig) {
  const { iteratorEnabled = false, iterator, source = '' } = configSource;
  if (source !== 'body') {
    return '';
  }
  const itTpl = iteratorEnabled ? iteratorTemplate({
    inputHandler, 
    operatorHandler: dataSourceHandler, 
    config: iterator, 
    ...inputConfig,
  }) : '';
  return html`
    ${dataIteratorTemplate(iteratorEnabled, changeHandler, inputConfig)}
    ${itTpl}
  `;
}

/**
 * @param {boolean} failOnError
 * @param {SetCookieConfig} config
 * @param {ActionType} type Editor type (request or response)
 * @param {Function} inputHandler (this[inputHandlerSymbol])
 * @param {Function} changeHandler (this[configChangeHandlerSymbol])
 * @param {Function} dataSourceHandler (this[dataSourceHandlerSymbol])
 * @param {InputOptions=} inputConfig
 * @return {Array<TemplateResult|string>} A template for the set variables editor.
 */
export default function render(failOnError, config, type, inputHandler, changeHandler, dataSourceHandler, inputConfig) {
  const {
    name,
    useRequestUrl,
    expires,
    hostOnly,
    httpOnly,
    secure,
    session,
    source = defaultSourceConfig(),
  } = config;
  return [
    cookieNameTemplate(inputHandler, name, inputConfig),
    useRequestUrlTemplate(changeHandler, type, useRequestUrl, inputConfig),
    cookieUrlTemplate(inputHandler, config, inputConfig),
    cookieExpiresTemplate(inputHandler, expires, inputConfig),
    hostOnlyTemplate(changeHandler, hostOnly, inputConfig),
    httpOnlyTemplate(changeHandler, httpOnly, inputConfig),
    secureTemplate(changeHandler, secure, inputConfig),
    sessionTemplate(changeHandler, session, inputConfig),
    html`<div class="action-title">Value setting</div>`,
    dataSourceTypeSelectorTemplate(dataSourceHandler, type, inputConfig),
    sourceTemplate(type, source, dataSourceHandler),
    arraySearchTpl(
      source,
      inputHandler,
      changeHandler,
      dataSourceHandler,
      inputConfig
    ),
    dataSourcePathTemplate(config, inputHandler, inputConfig),
    failTemplate(changeHandler, failOnError, inputConfig),
  ];
}
