import { html } from 'lit-element';

import {
  dataSourceSelector,
  dataSourcePathTemplate,
  inputTemplate,
  dataIteratorTemplate,
  iteratorPathTemplate,
  operatorTemplate,
  iteratorConditionTemplate,
  failTemplate,
  dataSourceTypeSelector,
  defaultItConfig,
} from '../CommonTemplates.js';

/** @typedef {import('lit-html').TemplateResult} TemplateResult */
/** @typedef {import('@advanced-rest-client/events').Actions.SetVariableConfig} SetVariableConfig */
/** @typedef {import('@advanced-rest-client/events').Actions.DataSourceConfiguration} DataSourceConfiguration */
/** @typedef {import('@advanced-rest-client/events').Actions.ActionType} ActionType */
/** @typedef {import('../CommonTemplates').InputConfiguration} InputConfiguration */
/** @typedef {import('../../../types').IteratorTemplateOptions} IteratorTemplateOptions */

/**
 * @param {string} name Current name value.
 * @param {Function} inputHandler
 * @param {InputConfiguration} inputConfig
 * @return {TemplateResult} The template for the name input.
 */
function nameTemplate(name, inputHandler, inputConfig) {
  const cnf = {
    ...inputConfig,
    required: true,
    autoValidate: true,
    notify: 'config',
  };
  return inputTemplate(
    'config.name',
    name,
    'Variable name (required)',
    inputHandler,
    cnf,
  );
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
function sourceTpl(type, configSource, dataSourceHandler) {
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
 * @param {IteratorTemplateOptions} init
 * @return {TemplateResult|string} Template for the array search configuration view.
 */
function iteratorTemplate(init) {
  const { config = defaultItConfig(), inputHandler, operatorHandler, outlined, anypoint, disabled } = init;
  const { path, operator, condition } = config;
  return html`
    <div class="iterator-block">
      ${iteratorPathTemplate(inputHandler, path, { outlined, anypoint, disabled })}
      ${operatorTemplate({
        handler: operatorHandler,
        name: 'config.source.iterator.operator',
        operator,
        outlined, 
        anypoint, 
        disabled,
      })}
      ${iteratorConditionTemplate(inputHandler, condition, { outlined, anypoint, disabled })}
    </div>
  `;
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
 * @param {Boolean} failOnError
 * @param {SetVariableConfig} config
 * @param {ActionType} type Editor type (request or response)
 * @param {Function} inputHandler (this[inputHandlerSymbol])
 * @param {Function} changeHandler (this[configChangeHandlerSymbol])
 * @param {Function} dataSourceHandler (this[dataSourceHandlerSymbol])
 * @param {InputConfiguration=} inputConfig
 * @return {Array<TemplateResult|string>} A template for the set variables editor.
 */
export default function render(
  failOnError,
  config,
  type,
  inputHandler,
  changeHandler,
  dataSourceHandler,
  inputConfig
) {
  const { name, source = { source: undefined} } = config;
  return [
    nameTemplate(name, inputHandler, inputConfig),
    html`<div class="action-title">Value setting</div>`,
    dataSourceTypeSelectorTemplate(dataSourceHandler, type, inputConfig),
    sourceTpl(type, source, dataSourceHandler),
    arraySearchTpl(
      source,
      inputHandler,
      changeHandler,
      dataSourceHandler,
      inputConfig
    ),
    source.source === 'status' ? '' : dataSourcePathTemplate(config, inputHandler, inputConfig),
    failTemplate(changeHandler, failOnError, inputConfig),
  ];
}
