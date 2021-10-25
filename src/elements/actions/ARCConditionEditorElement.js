import { html, LitElement } from 'lit-element';
import '@advanced-rest-client/icons/arc-icon.js';
import '@anypoint-web-components/awc/anypoint-switch.js';
import '@anypoint-web-components/awc/anypoint-item.js';
import '@anypoint-web-components/awc/anypoint-listbox.js';
import '@anypoint-web-components/awc/anypoint-input.js';
import '@anypoint-web-components/awc/anypoint-dropdown-menu.js';
import '@anypoint-web-components/awc/anypoint-button.js';
import elementStyles from './styles/ArcConditionEditor.styles.js';
import cardStyles from './styles/Card.styles.js';
import tooltipStyles from './styles/Tooltip.styles.js';
import {
  dataSourceSelector,
  operatorTemplate,
  inputTemplate,
  dataSourceTypeSelector,
} from './CommonTemplates.js';

/** @typedef {import('@advanced-rest-client/events').Actions.RequestDataSourceEnum} RequestDataSourceEnum */
/** @typedef {import('@advanced-rest-client/events').Actions.ResponseDataSourceEnum} ResponseDataSourceEnum */
/** @typedef {import('@advanced-rest-client/events').Actions.Condition} Condition */
/** @typedef {import('lit-html').TemplateResult} TemplateResult */

export const conditionValue = Symbol('conditionValue');
export const notifyChange = Symbol('notifyChange');
export const enabledHandler = Symbol('enabledHandler');
export const alwaysPassHandler = Symbol('alwaysPassHandler');
export const deleteHandler = Symbol('deleteHandler');
export const closeHandler = Symbol('closeHandler');
export const openedHandler = Symbol('openedHandler');
export const dataSourceTypeHandler = Symbol('dataSourceTypeHandler');
export const dataSourceHandler = Symbol('dataSourceHandler');
export const operatorHandler = Symbol('operatorHandler');
export const valueHandler = Symbol('valueHandler');
export const pathHandler = Symbol('pathHandler');
export const editorTemplate = Symbol('editorTemplate');
export const summaryTemplate = Symbol('summaryTemplate');
export const conditionExplainedTemplate = Symbol('conditionExplainedTemplate');
export const openButtonTemplate = Symbol('openButtonTemplate');
export const closeButtonTemplate = Symbol('closeButtonTemplate');
export const deleteButtonTemplate = Symbol('deleteButtonTemplate');
export const alwaysPassSwitchTemplate = Symbol('alwaysPassSwitchTemplate');
export const enableSwitchTemplate = Symbol('enableSwitchTemplate');
export const dataPathTemplate = Symbol('dataPathTemplate');
export const valueTemplate = Symbol('valueTemplate');
export const dataSourceTypeSelectorTemplate = Symbol('dataSourceTypeSelectorTemplate');
export const dataSourceSelectorTemplate = Symbol('dataSourceSelectorTemplate');
export const operatorTemplateTemplate = Symbol('operatorTemplateTemplate');

export default class ARCConditionEditorElement extends LitElement {
  static get styles() {
    return [elementStyles, cardStyles, tooltipStyles];
  }

  static get properties() {
    return {
      /**
       * A list of response actions
       */
      condition: { type: Object },
      /**
       * Enables Anypoint theme
       */
      anypoint: { type: Boolean, reflect: true },
      /**
       * Enables outlined MD theme
       */
      outlined: { type: Boolean, reflect: true },

      /**
       * Whether or not the condition is enabled
       */
      enabled: { type: Boolean, reflect: true },
      /** 
       * The type of the condition that is being rendered.
       * Either `request` or `response`.
       * This is not the same as condition's model source type as in response action
       * can be executed with conditions for both request and response.
       */
      type: { type: String, reflect: true },
    };
  }

  /**
   * @return {Condition} A condition to render.
   */
  get condition() {
    return this[conditionValue];
  }

  /**
   * @param {Condition} value A condition to render.
   */
  set condition(value) {
    const old = this[conditionValue];
    if (old === value) {
      return;
    }
    this[conditionValue] = value;
    this.requestUpdate('condition', old);
  }

  get opened() {
    const { condition } = this;
    if (!condition) {
      return false;
    }
    const { view = {} } = condition;
    const { opened } = view;
    return !!opened;
  }

  constructor() {
    super();
    this.anypoint = false;
    this.outlined = false;
    /** 
     * @type {string}
     */
    this.type = undefined;
  }

  /**
   * Dispatches the `change` event with the name of the property that changed.
   * @param {string} prop Name of changed property.
   */
  [notifyChange](prop) {
    this.dispatchEvent(
      new CustomEvent('change', {
        detail: {
          prop
        }
      })
    );
  }

  /**
   * A handler for the action enable switch.
   * @param {Event} e
   */
  [enabledHandler](e) {
    this.enabled = /** @type {HTMLInputElement} */ (e.target).checked;
    this[notifyChange]('enabled');
  }

  /**
   * The handler for the action always pass switch.
   * @param {Event} e
   */
  [alwaysPassHandler](e) {
    const enabled = /** @type {HTMLInputElement} */ (e.target).checked;
    const { condition  } = this;
    condition.alwaysPass = enabled;
    this[notifyChange]('condition');
    this.requestUpdate();
  }

  /**
   * A handler for the delete action button click. Dispatches the `remove`
   * custom event.
   */
  [deleteHandler]() {
    this.dispatchEvent(new CustomEvent('remove'));
  }

  /**
   * A handler for the close action button click. Updates the `opened` value
   * on the `view` property.
   */
  [closeHandler]() {
    const { condition } = this;
    if (!condition.view) {
      condition.view = {};
    }
    condition.view.opened = false;
    this[notifyChange]('condition');
    this.requestUpdate();
  }

  /**
   * A handler for the open action button click. Updates the `opened` value
   * on the `view` property.
   */
  [openedHandler]() {
    const { condition } = this;
    if (!condition.view) {
      condition.view = {};
    }
    condition.view.opened = true;
    this[notifyChange]('condition');
    this.requestUpdate();
  }

  [dataSourceTypeHandler](e) {
    const { condition  } = this;
    condition.type = e.target.selected;
    this[notifyChange]('condition');
    this.requestUpdate();
  }

  [dataSourceHandler](e) {
    const { condition  } = this;
    condition.source = e.target.selected;
    this[notifyChange]('condition');
    this.requestUpdate();
  }

  [operatorHandler](e) {
    const { condition  } = this;
    condition.operator = e.target.selected;
    this[notifyChange]('condition');
  }

  [valueHandler](e) {
    const { condition  } = this;
    condition.predictedValue = e.target.value;
    this[notifyChange]('condition');
  }

  [pathHandler](e) {
    const { condition  } = this;
    condition.path = e.target.value;
    this[notifyChange]('condition');
  }

  render() {
    const { opened, condition } = this;
    if (!condition) {
      return '';
    }
    if (opened) {
      return this[editorTemplate]();
    }
    return this[summaryTemplate]();
  }

  [editorTemplate]() {
    return html`
    <section class="action-card opened">
      <div class="opened-title">
        <div class="action-title">
          Condition editor
        </div>
        ${this[closeButtonTemplate]()}
      </div>
      <div class="editor-contents">
        ${this[dataSourceTypeSelectorTemplate]()}
        ${this[dataSourceSelectorTemplate]()}
        ${this[dataPathTemplate]()}
        ${this[operatorTemplateTemplate]()}
        ${this[valueTemplate]()}
      </div>
      <div class="action-footer">
        ${this[enableSwitchTemplate]()}
        ${this[alwaysPassSwitchTemplate]()}
        ${this[deleteButtonTemplate]()}
        ${this[closeButtonTemplate]()}
      </div>
    </section>`;
  }

  [summaryTemplate]() {
    const { condition } = this;
    const { alwaysPass } = condition;
    return html`
    <section class="action-card closed">
      ${alwaysPass ? `Always execute the following:` : this[conditionExplainedTemplate]()}
      ${this[openButtonTemplate]()}
    </section>`;
  }

  [conditionExplainedTemplate]() {
    const { condition } = this;
    const { type, source, path, predictedValue, operator } = condition;
    const parts = [];
    if (path && !['method', 'status'].includes(source)) {
      parts.push(html`When <strong>${type}.${source}.${path}</strong>`);
    } else {
      parts.push(html`When <strong>${type}.${source}</strong>`);
    }
    if (!['contains'].includes(operator)) {
      parts.push(html` is`);
    }
    parts.push(html` <strong>${operator}</strong>`);
    parts.push(html` <strong>${predictedValue}</strong> then:`);
    return parts;
  }

  [dataSourceTypeSelectorTemplate]() {
    const { type } = this;
    if (type === 'request') {
      // this can oly have the `request` as the source type.
      return '';
    }
    const { condition, outlined, anypoint } = this;
    return dataSourceTypeSelector({
      selected: condition.type,
      handler: this[dataSourceTypeHandler],
      outlined, 
      anypoint,
      disabled: !!condition.alwaysPass,
    });
  }

  [dataSourceSelectorTemplate]() {
    const { condition, outlined, anypoint, type } = this;
    const { type: cType, source } = condition;

    const requestOptions = type === 'request' ? true : cType === 'request';
    const responseOptions = !requestOptions && (type === 'response' ? true : cType === 'response');

    const input = dataSourceSelector(source, this[dataSourceHandler], {
      outlined, 
      anypoint,
      requestOptions,
      responseOptions,
      name: 'source',
      disabled: !!condition.alwaysPass,
    });
    return html`
    <div class="form-row">${input}</div>
    `;
  }

  [operatorTemplateTemplate]() {
    const { condition, outlined, anypoint } = this;
    const { operator, alwaysPass } = condition;
    const input = operatorTemplate({
      handler: this[operatorHandler], 
      operator,
      outlined, anypoint,
      name: 'operator',
      disabled: !!alwaysPass,
    });
    return html`
    <div class="form-row">${input}</div>
    `;
  }

  [valueTemplate]() {
    const { condition, outlined, anypoint } = this;
    const { predictedValue='', source, alwaysPass } = condition;
    const type = source === 'status' ? 'number' : 'text';
    const input = inputTemplate('predictedValue', String(predictedValue), 'Condition value', this[valueHandler], {
      outlined,
      anypoint,
      type,
      disabled: !!alwaysPass,
    });
    return html`
    <div class="form-row">${input}</div>
    `;
  }

  [dataPathTemplate]() {
    const { condition, outlined, anypoint } = this;
    const { path, source, alwaysPass } = condition;
    if (['method', 'status'].indexOf(source) !== -1) {
      // these sources do not have path value.
      return '';
    }

    const help = 'Path to the property that contains the data to extract.';
    // @ts-ignore
    const input = inputTemplate('path', path, 'Path to the value', this[pathHandler], {
      outlined,
      anypoint,
      disabled: !!alwaysPass,
    });
    return html`
    <div class="form-row">
      ${input}
      <div class="tooltip">
        <arc-icon icon="helpOutline"></arc-icon>
        <span class="tooltiptext">
          ${help} Example: "data.property.subproperty".
        </span>
      </div>
    </div>
    `;
  }

  /**
   * @return {TemplateResult} The template for the enabled switch.
   */
  [enableSwitchTemplate]() {
    const { anypoint, enabled } = this;
    return html`
    <anypoint-switch
      ?anypoint="${anypoint}"
      .checked="${enabled}"
      @change="${this[enabledHandler]}"
      data-action="enabled"
      name="enabled"
    >Enabled</anypoint-switch>
    `;
  }

  /**
   * @return {TemplateResult|string} Template for the "always pass" which.
   */
  [alwaysPassSwitchTemplate]() {
    const { anypoint, condition } = this;
    if (!condition) {
      return '';
    }
    return html`
    <anypoint-switch
      ?anypoint="${anypoint}"
      .checked="${condition.alwaysPass}"
      @change="${this[alwaysPassHandler]}"
      data-action="always-pass"
      title="When selected it ignores the configured condition and always passes the check"
      name="alwaysPass"
    >Always pass</anypoint-switch>
    `;
  }

  /**
   * @return {TemplateResult} Template for the delete button.
   */
  [deleteButtonTemplate]() {
    const { anypoint } = this;
    return html`
    <anypoint-button
      title="Removes this action"
      class="action-delete"
      ?anypoint="${anypoint}"
      @click="${this[deleteHandler]}"
      data-action="remove"
    >Delete</anypoint-button>
    `;
  }

  /**
   * @return {TemplateResult} Template for the close action button.
   */
  [closeButtonTemplate]() {
    const { anypoint } = this;
    return html`
    <anypoint-button
      title="Closes the editor"
      ?anypoint="${anypoint}"
      @click="${this[closeHandler]}"
      data-action="close"
    >Close</anypoint-button>
    `;
  }

  /**
   * @return {TemplateResult|string} Template for the open action button.
   */
  [openButtonTemplate]() {
    const { anypoint } = this;
    return html`
    <anypoint-button
      title="Opens the editor"
      class="action-open"
      ?anypoint="${anypoint}"
      @click="${this[openedHandler]}"
      data-action="open"
    >Open</anypoint-button>
    `;
  }
}
