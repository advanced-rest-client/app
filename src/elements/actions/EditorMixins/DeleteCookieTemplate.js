import { inputTemplate, configCheckbox } from '../CommonTemplates.js';

/** @typedef {import('lit-html').TemplateResult} TemplateResult */
/** @typedef {import('@advanced-rest-client/events').Actions.DeleteCookieConfig} DeleteCookieConfig */
/** @typedef {import('../CommonTemplates').InputConfiguration} InputConfiguration */
/** @typedef {import('../CommonTemplates').CheckboxConfiguration} CheckboxConfiguration */

/**
 * @param {boolean} useRequestUrl Current value.
 * @param {Function} changeHandler (this[configChangeHandlerSymbol])
 * @param {CheckboxConfiguration} inputConfig
 * @return {TemplateResult} The template for the name input.
 */
function useRequestUrlTemplate(useRequestUrl = false, changeHandler, inputConfig) {
  const cnf = {
    notify: 'config',
    render: 'true',
    name: 'config.useRequestUrl',
    ...inputConfig,
  };
  return configCheckbox(
    changeHandler,
    'Use request URL',
    useRequestUrl,
    cnf
  );
}

/**
 * Template for `url` configuration property.
 * @param {DeleteCookieConfig} config
 * @param {Function} inputHandler
 * @param {InputConfiguration} inputConfig
 * @return {TemplateResult|string} Template result for the URL input
 */
function urlTemplate(config, inputHandler, inputConfig) {
  const { useRequestUrl = false, url = '' } = config;
  if (useRequestUrl) {
    return '';
  }
  const cnf = {
    ...inputConfig,
    required: true,
    autoValidate: true,
    type: 'url',
    infoMessage: 'The URL associated with the cookie.',
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
 * Template for `removeAll` configuration property.
 * @param {boolean} removeAll
 * @param {Function} changeHandler (this[configChangeHandlerSymbol])
 * @param {CheckboxConfiguration} inputConfig
 * @return {TemplateResult}
 */
function removeAllTemplate(removeAll = false, changeHandler, inputConfig) {
  const cnf = {
    notify: 'config',
    render: 'true',
    name: 'config.removeAll',
    ...inputConfig,
  };
  return configCheckbox(
    changeHandler,
    'Remove all cookies',
    removeAll,
    cnf,
  );
}

/**
 * Template for `name` configuration property.
 * @param {DeleteCookieConfig} config
 * @param {Function} inputHandler
 * @param {InputConfiguration} inputConfig
 * @return {TemplateResult|string}
 */
function nameTemplate(config, inputHandler, inputConfig) {
  const { removeAll = false, name = '' } = config;
  if (removeAll) {
    return '';
  }
  const cnf = {
    ...inputConfig,
    required: true,
    autoValidate: true,
    invalidMessage: 'Cookie name is required.',
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
 * @param {DeleteCookieConfig} config
 * @param {Function} inputHandler (this[inputHandlerSymbol])
 * @param {Function} changeHandler (this[configChangeHandlerSymbol])
 * @param {InputConfiguration=} inputConfig
 * @return {Array<TemplateResult|string>} A template for the set variables editor.
 */
export default function render(
  config,
  inputHandler,
  changeHandler,
  inputConfig
) {
  const { useRequestUrl, removeAll } = config;

  return [
    useRequestUrlTemplate(useRequestUrl, changeHandler, inputConfig),
    urlTemplate(config, inputHandler, inputConfig),
    removeAllTemplate(removeAll, changeHandler, inputConfig),
    nameTemplate(config, inputHandler, inputConfig),
  ];
}
