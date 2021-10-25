import { html } from 'lit-element';
import { classMap } from 'lit-html/directives/class-map.js';
import { helpOutline } from '@advanced-rest-client/icons/ArcIcons.js';
import '@anypoint-web-components/awc/anypoint-dropdown-menu.js';
import '@anypoint-web-components/awc/anypoint-input.js';
import '@anypoint-web-components/awc/anypoint-checkbox.js';

/** @typedef {import('lit-html').TemplateResult} TemplateResult */
/** @typedef {import('@advanced-rest-client/events').Actions.DataSourceConfiguration} DataSourceConfiguration */
/** @typedef {import('@advanced-rest-client/events').Actions.SetCookieConfig} SetCookieConfig */
/** @typedef {import('@advanced-rest-client/events').Actions.SetVariableConfig} SetVariableConfig */
/** @typedef {import('@advanced-rest-client/events').Actions.IteratorConfiguration} IteratorConfiguration */
/** @typedef {import('./../../types').DataSourceTypeSelectorOptions} DataSourceTypeSelectorOptions */
/** @typedef {import('./../../types').OperatorTemplateOptions} OperatorTemplateOptions */
/** @typedef {import('./../../types').IteratorTemplateOptions} IteratorTemplateOptions */
/** @typedef {import('./../../types').CheckboxConfiguration} CheckboxConfiguration */

/**
 * @param {boolean} [anypoint=false] Anypoint mode flag.
 * @return {TemplateResult} Template for the condition's operator drop down options.
 */
export const operatorOptionsTemplate = (anypoint = false) => html`
    <anypoint-item data-value="equal" ?anypoint="${anypoint}">Equal</anypoint-item>
    <anypoint-item data-value="not-equal" ?anypoint="${anypoint}">Not equal</anypoint-item>
    <anypoint-item data-value="greater-than" ?anypoint="${anypoint}">Greater than</anypoint-item>
    <anypoint-item data-value="greater-than-equal" ?anypoint="${anypoint}">Greater than or equal</anypoint-item>
    <anypoint-item data-value="less-than" ?anypoint="${anypoint}">Less than</anypoint-item>
    <anypoint-item data-value="less-than-equal" ?anypoint="${anypoint}">Less than or equal</anypoint-item>
    <anypoint-item data-value="contains" ?anypoint="${anypoint}">Contains</anypoint-item>
    <anypoint-item data-value="regex" ?anypoint="${anypoint}">Regular expression</anypoint-item>
  `;

/**
 * @typedef {Object} OperatorConfiguration
 * @property {boolean=} outlined
 * @property {boolean=} anypoint
 * @property {boolean=} readOnly
 * @property {boolean=} disabled
 * @property {string=} [name='config.source.iterator.operator']
 */

/**
 * @param {OperatorTemplateOptions} options
 * @return {TemplateResult} Template for the iterator operator drop down.
 */
export const operatorTemplate = (options) => {
  const {
    handler,
    operator,
    name = 'iterator.operator',
    outlined,
    anypoint,
    disabled,
  } = options;
  return html`
    <anypoint-dropdown-menu
      aria-label="Select the condition type"
      name="${name}"
      ?outlined="${outlined}"
      ?anypoint="${anypoint}"
      ?disabled="${disabled}"
    >
      <label slot="label">Condition</label>
      <anypoint-listbox
        slot="dropdown-content"
        tabindex="-1"
        attrforselected="data-value"
        .selected="${operator}"
        ?anypoint="${anypoint}"
        @selected="${handler}"
        data-notify="config"
      >
        ${operatorOptionsTemplate(anypoint)}
      </anypoint-listbox>
    </anypoint-dropdown-menu>
  `;
};

/**
 * @typedef {Object} InputConfiguration
 * @property {any=} type Type of the control
 * @property {any=} autocomplete Whether `autocomplete` is on. Default to `on`.
 * @property {boolean=} outlined
 * @property {boolean=} anypoint
 * @property {boolean=} readOnly
 * @property {boolean=} disabled
 * @property {boolean=} required
 * @property {boolean=} autoValidate
 * @property {string=} notify When set it notifies given path.
 * @property {string=} invalidLabel Invalid message
 * @property {string=} infoLabel Info message
 * @property {object=} classes CSS class names
 */

/**
 * Renders an input element for the action configuration.
 *
 * @param {String} name Input name
 * @param {String} value Current input value
 * @param {String} label The label to render
 * @param {Function} inputHandler Handler for the input event.
 * @param {InputConfiguration=} [opts={}] Optional configuration options
 * @return {TemplateResult}
 */
export const inputTemplate = (name, value, label, inputHandler, opts = {}) => {
  const config = { ...opts };
  config.type = config.type || 'text';
  if (config.autocomplete === undefined) {
    config.autocomplete = 'on';
  }
  const { outlined, anypoint, readOnly, disabled } = config;
  return html`
    <anypoint-input
      .value="${value}"
      @input="${inputHandler}"
      name="${name}"
      type="${config.type}"
      ?required="${config.required}"
      ?autoValidate="${config.autoValidate}"
      .autocomplete="${config.autocomplete}"
      .outlined="${outlined}"
      .anypoint="${anypoint}"
      ?readOnly="${readOnly}"
      ?disabled="${disabled}"
      .invalidMessage="${config.invalidLabel}"
      .infoMessage="${config.infoLabel}"
      class="${classMap(config.classes)}"
      data-notify="${config.notify}"
    >
      <label slot="label">${label}</label>
    </anypoint-input>
  `;
};

/**
 * @param {Boolean} [anypoint=false] Anypoint mode flag.
 * @return {TemplateResult} Template for the request action's source options
 */
export const requestSourceOptions = (anypoint = false) => html`
    <anypoint-item data-value="url" ?anypoint="${anypoint}">URL</anypoint-item>
    <anypoint-item data-value="method" ?anypoint="${anypoint}">Method</anypoint-item>
    <anypoint-item data-value="headers" ?anypoint="${anypoint}">Headers</anypoint-item>
    <anypoint-item data-value="body" ?anypoint="${anypoint}">Body</anypoint-item>
  `;

/**
 * @param {Boolean} [anypoint=false] Anypoint mode flag.
 * @return {TemplateResult} Template for the response action's source options
 */
export const responseSourceOptions = (anypoint = false) => html`
    <anypoint-item data-value="url" ?anypoint="${anypoint}">URL</anypoint-item>
    <anypoint-item data-value="status" ?anypoint="${anypoint}">Status code</anypoint-item>
    <anypoint-item data-value="headers" ?anypoint="${anypoint}">Headers</anypoint-item>
    <anypoint-item data-value="body" ?anypoint="${anypoint}">Body</anypoint-item>
  `;

/**
 * @typedef {Object} SourceSelectorConfiguration
 * @property {string=} [name='config.source.source'] The name of the control
 * @property {boolean=} [requestOptions=false] Whether to render request source options
 * @property {boolean=} [responseOptions=false] Whether to render response source options
 * @property {boolean=} outlined
 * @property {boolean=} anypoint
 * @property {boolean=} readOnly
 * @property {boolean=} disabled
 */

/**
 * @param {string} selected Selected option
 * @param {Function} selectHandler Handler for the select event.
 * @param {SourceSelectorConfiguration=} opts Configuration options
 * @return {TemplateResult} Template for the data source selector
 */
export const dataSourceSelector = (selected, selectHandler, opts = {}) => {
  const {
    name = 'source',
    requestOptions = false,
    responseOptions = false,
    outlined,
    anypoint,
    disabled,
  } = opts;
  return html`
    <anypoint-dropdown-menu
      aria-label="Select data source"
      name="${name}"
      ?outlined="${outlined}"
      ?anypoint="${anypoint}"
      ?disabled="${disabled}"
    >
      <label slot="label">Data source</label>
      <anypoint-listbox
        slot="dropdown-content"
        tabindex="-1"
        attrforselected="data-value"
        .selected="${selected}"
        ?anypoint="${anypoint}"
        @selected="${selectHandler}"
        data-notify="config"
        data-render="true"
      >
        ${requestOptions ? requestSourceOptions(anypoint) : ''}
        ${responseOptions ? responseSourceOptions(anypoint) : ''}
      </anypoint-listbox>
    </anypoint-dropdown-menu>
  `;
};

/**
 * @param {DataSourceTypeSelectorOptions} options
 * @return {TemplateResult} Template for the data source type selector.
 */
export const dataSourceTypeSelector = (options) => {
  const {
    selected,
    handler,
    outlined,
    anypoint,
    disabled,
    name='type',
  } = options;
  return html`
    <anypoint-dropdown-menu
      aria-label="Select the data source type"
      name="${name}"
      ?outlined="${outlined}"
      ?anypoint="${anypoint}"
      ?disabled="${disabled}"
    >
      <label slot="label">Data source type</label>
      <anypoint-listbox
        slot="dropdown-content"
        tabindex="-1"
        attrforselected="data-value"
        .selected="${selected}"
        ?anypoint="${anypoint}"
        @selected="${handler}"
        data-notify="config"
        data-render="true"
        fallbackSelection="request"
      >
        <anypoint-item data-value="request" ?anypoint="${anypoint}">Request</anypoint-item>
        <anypoint-item data-value="response" ?anypoint="${anypoint}">Response</anypoint-item>
      </anypoint-listbox>
    </anypoint-dropdown-menu>
  `;
};

/**
 * @param {SetCookieConfig|SetVariableConfig} config
 * @param {Function} inputHandler Handler for the input event.
 * @param {InputConfiguration=} inputConfig
 * @return {TemplateResult|string} Template for the data source's path input.
 */
export function dataSourcePathTemplate(config, inputHandler, inputConfig = {}) {
  const configSource = /** @type {DataSourceConfiguration} */ (config.source ||{});
  const { iteratorEnabled = false, path = '', source = '' } = configSource;
  if (['request.method'].indexOf(source) !== -1) {
    return '';
  }
  const label = iteratorEnabled
    ? "Array item's property for the value"
    : 'Path to the value';
  const help = iteratorEnabled
    ? 'Path to the property relative to the array item found in the search.'
    : 'Path to the property that contains the data to extract.';
  const example = iteratorEnabled ? 'name' : 'person.address.street1';
  const cnf = {
    ...inputConfig,
    notify: 'config',
  };
  const input = inputTemplate(
    'config.source.path',
    path,
    label,
    inputHandler,
    cnf
  );
  return html`
    <div class="form-row">
      ${input}
      <div class="tooltip">
        <span class="icon help">${helpOutline}</span>
        <span class="tooltiptext">
          ${help} Example: "${example}".
        </span>
      </div>
    </div>
  `;
}

/**
 * @param {boolean} enabled Whether the data source iterator is enabled
 * @param {Function} changeHandler Handler for the change event (this[configChangeHandlerSymbol])
 * @param {InputConfiguration=} inputConfig
 * @return {TemplateResult} A template for the data array search switch
 */
export function dataIteratorTemplate(enabled, changeHandler, inputConfig = {}) {
  const { anypoint } = inputConfig;
  return html`
    <div class="help-hint-block">
      <anypoint-switch
        ?anypoint="${anypoint}"
        .checked="${enabled}"
        name="config.source.iteratorEnabled"
        data-notify="config"
        data-render="true"
        @change="${changeHandler}"
      >Array search</anypoint-switch>
      <div class="tooltip">
        <span class="icon help">${helpOutline}</span>
        <span class="tooltiptext">
          Allows to search for an item in an array by checking each value
          against a configured condition.
        </span>
      </div>
    </div>
  `;
}

/**
 * @param {Function} inputHandler Handler for the input event.
 * @param {string=} path
 * @param {InputConfiguration=} inputConfig
 * @return {TemplateResult} Template for the iterator path input.
 */
export function iteratorPathTemplate(inputHandler, path = '', inputConfig) {
  const cnf = {
    ...inputConfig,
    required: true,
    autoValidate: true,
    notify: 'config',
  };
  const input = inputTemplate(
    'config.source.iterator.path',
    path,
    'Path to the property (required)',
    inputHandler,
    cnf
  );
  return html`
    <div class="form-row">
      ${input}
      <div class="tooltip">
        <span class="icon help">${helpOutline}</span>
        <span class="tooltiptext">
          Path to the property that contains the value to compare. Use star "*"
          to tell where the array items are. Example: data.*.property.
        </span>
      </div>
    </div>
  `;
}

/**
 * @param {Function} inputHandler Handler for the input event.
 * @param {string=} condition
 * @param {InputConfiguration=} inputConfig
 * @return {TemplateResult} Template for the iterator condition input.
 */
export function iteratorConditionTemplate(
  inputHandler,
  condition = '',
  inputConfig
) {
  const cnf = {
    ...inputConfig,
    required: true,
    autoValidate: true,
    notify: 'config',
  };
  return inputTemplate(
    'config.source.iterator.condition',
    condition,
    'Condition value (required)',
    inputHandler,
    cnf
  );
}

/**
 * @return {IteratorConfiguration}
 */
export function defaultItConfig() {
  return {
    path: '',
    condition: '',
    operator: 'equal',
  };
}

/**
 * @return {DataSourceConfiguration}
 */
export function defaultSourceConfig() {
  return {
    type: 'request',
    source: 'body',
    iteratorEnabled: false,
    path: '',
  };
}

/**
 * @param {IteratorTemplateOptions} init
 * @return {TemplateResult|string} Template for the array search configuration view.
 */
export function iteratorTemplate(init) {
  const { config = defaultItConfig(), inputHandler, operatorHandler, outlined, anypoint, disabled } = init;
  const { path, operator, condition } = config;
  return html`
    <div class="iterator-block">
      ${iteratorPathTemplate(inputHandler, path, { outlined, anypoint, disabled })}
      ${operatorTemplate({
        handler: operatorHandler,
        operator,
        outlined, anypoint, disabled
      })}
      ${iteratorConditionTemplate(inputHandler, condition, { outlined, anypoint, disabled })}
    </div>
  `;
}


/**
 * Renders an input element for the action configuration.
 * @param {Function} changeHandler
 * @param {string} label
 * @param {boolean} checked
 * @param {CheckboxConfiguration=} opts
 * @return {TemplateResult}
 */
export function configCheckbox(changeHandler, label, checked, opts = {}) {
  const { disabled, notify, render, name } = opts;
  return html`
    <div class="checkbox-container">
      <anypoint-checkbox
        name="${name}"
        ?disabled="${disabled}"
        ?checked="${checked}"
        @change="${changeHandler}"
        data-notify="${notify}"
        data-render="${render}"
        >${label}</anypoint-checkbox
      >
    </div>
  `;
}

/**
 * Renders a template for "fail" checkbox.
 * @param {Function} changeHandler (this[configChangeHandlerSymbol])
 * @param {boolean=} failOnError
 * @param {CheckboxConfiguration=} checkboxOptions
 * @return {TemplateResult}
 */
export function failTemplate(changeHandler, failOnError = false, checkboxOptions = {}) {
  const cnf = {
    name: 'failOnError',
    notify: 'failOnError',
    ...checkboxOptions,
  };
  return configCheckbox(
    changeHandler,
    'Fail when data cannot be set',
    failOnError,
    cnf,
  );
}
