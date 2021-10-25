import { LitElement, html } from 'lit-element';
import { ArcNavigationEvents } from '@advanced-rest-client/events';
import { classMap } from 'lit-html/directives/class-map.js';
import '@anypoint-web-components/awc/anypoint-dropdown-menu.js';
import '@anypoint-web-components/awc/anypoint-listbox.js';
import '@anypoint-web-components/awc/anypoint-item.js';
import '@anypoint-web-components/awc/anypoint-switch.js';
import elementStyles from './styles/ActionEditor.styles.js';
import cardStyles from './styles/Card.styles.js';
import tooltipStyles from './styles/Tooltip.styles.js';
import { actionNamesMap } from './Utils.js';
import setCookieTemplate from './EditorMixins/SetCookieTemplate.js';
import setVariableTemplate from './EditorMixins/SetVariableTemplate.js';
import deleteCookieTemplate from './EditorMixins/DeleteCookieTemplate.js';
import {
  notifyChange,
  inputHandler,
  configChangeHandler,
  dataSourceHandler,
  actionHelpTpl,
  updateDeepProperty,
  enabledHandler,
  deleteHandler,
  duplicateHandler,
  closeHandler,
  openedHandler,
  helpHandler,
  openedCardTemplate,
  closedCardTemplate,
  openedCardTitle,
  openedCardFooter,
  openButtonTemplate,
  enableSwitchTemplate,
  deleteButtonTemplate,
  duplicateButtonTemplate,
  closeButtonTemplate,
} from './internals.js';

const helpBase = 'https://docs.advancedrestclient.com/arc-actions/';
const helpMap = {
  'set-cookie': `${helpBase}introduction/set-cookie-action`,
  'set-variable': `${helpBase}introduction/set-variable-action`,
  'delete-cookie': `${helpBase}introduction/remove-cookie-s-action`,
};

/** @typedef {import('lit-html').TemplateResult} TemplateResult */
/** @typedef {import('@advanced-rest-client/events').Actions.DataSourceConfiguration} DataSourceConfiguration */
/** @typedef {import('@advanced-rest-client/events').Actions.IteratorConfiguration} IteratorConfiguration */
/** @typedef {import('@advanced-rest-client/events').Actions.SetCookieConfig} SetCookieConfig */
/** @typedef {import('@advanced-rest-client/events').Actions.DeleteCookieConfig} DeleteCookieConfig */
/** @typedef {import('@advanced-rest-client/events').Actions.SetVariableConfig} SetVariableConfig */
/** @typedef {import('@advanced-rest-client/events').Actions.ActionConfiguration} ActionConfiguration */

/**
 * @param {string} name
 * @return {TemplateResult|string} Template for the title when the action is closed.
 */
const closedCardTitleTemplate = (name) => {
  const label = actionNamesMap(name);
  return html` <div class="action-title">${label}</div> `;
};

export default class ARCActionEditorElement extends LitElement {
  static get styles() {
    return [elementStyles, cardStyles, tooltipStyles];
  }

  static get properties() {
    return {
      /**
       * Action name that determines which editor to load.
       * The name mast be one of the supported action types or otherwise the
       * component won't render any editor.
       */
      name: { type: String, reflect: true },
      /**
       * Either `request` or `response`. Actions without a type are not
       * executed.
       */
      type: { type: String, reflect: true },
      /**
       * Whether the action is enabled. An action is considered enabled when
       * this value equals `true`.
       */
      enabled: { type: Boolean, reflect: true },
      /**
       * Whether the action should be called synchronously to the request or
       * the response.
       * This value is optional and default to `true`.
       *
       * @default true
       */
      sync: { type: Boolean, reflect: true },
      /**
       * Whether the action should fail when
       * the request / response if it results in error.
       */
      failOnError: { type: Boolean, reflect: true },
      /**
       * Action's priority on a scale of 1 to 10. The default value is 5 and
       * this property is optional.
       *
       * @default 5
       */
      priority: { type: Number, reflect: true },
      /**
       * The configuration of an action. The type depends on the `name` property.
       */
      config: { type: Object },

      /**
       * Whether or not the action is rendered in full view.
       */
      opened: { type: Boolean, reflect: true },
      /**
       * Enables Anypoint theme
       */
      anypoint: { type: Boolean, reflect: true },
      /**
       * Enables outlined MD theme
       */
      outlined: { type: Boolean, reflect: true },
      readOnly: { type: Boolean, reflect: true },
      disabled: { type: Boolean, reflect: true },
    };
  }

  constructor() {
    super();
    this.anypoint = false;
    this.outlined = false;
    this.opened = false;
    this.priority = 5;
    this.failOnError = false;
    this.readOnly = false;
    this.disabled = false;
    this.name = undefined;
    this.type = undefined;
    this.config = undefined;
  }

  /**
   * Dispatches the `change` event with the name of the property that changed.
   * @param {string} prop Name of changed property.
   */
  [notifyChange](prop) {
    this.dispatchEvent(
      new CustomEvent('change', {
        detail: {
          prop,
        },
      })
    );
  }

  /**
   * A handler for the
   * @param {Event} e
   */
  [inputHandler](e) {
    const { target } = e;
    const targetElement = /** @type {HTMLInputElement} */ (target);
    const { name, value } = targetElement;
    this[updateDeepProperty](name, value);
    const { notify } = targetElement.dataset;
    if (notify) {
      this[notifyChange](notify);
    }
  }

  /**
   * A handler for checkbox / switch change event for the action configuration.
   * @param {Event} e
   */
  [configChangeHandler](e) {
    const { target } = e;
    const targetElement = /** @type {HTMLInputElement} */ (target);
    const { name, checked } = targetElement;
    this[updateDeepProperty](name, checked);
    const { notify, render } = targetElement.dataset;
    if (notify) {
      this[notifyChange](notify);
    }
    if (render) {
      this.requestUpdate();
    }
  }

  /**
   * A handler for the data source selector for action configuration.
   * @param {Event} e
   */
  [dataSourceHandler](e) {
    const { target } = e;
    const targetElement = /** @type {HTMLInputElement} */ (target);
    const parent = /** @type {HTMLFormElement} */ (targetElement.parentElement);
    const { name } = parent;
    // @ts-ignore
    const value = targetElement.selected;
    this[updateDeepProperty](name, value);
    const { notify, render } = targetElement.dataset;
    if (notify) {
      this[notifyChange](notify);
    }
    if (render) {
      this.requestUpdate();
    }
  }

  /**
   * Updates a property value for given path. The path may contain `.` to
   * enter sub properties.
   *
   * For example, to set a top level property use the property name.
   *
   * ```
   * this[updateDeepProperty]('priority', 10);
   * ```
   *
   * To change an object property separate names with a dot:
   *
   * ```
   * this[updateDeepProperty]('config.enabled', true);
   * ```
   *
   * This function builds the path if it doesn't exist.
   *
   * @param {string} name
   * @param {string|boolean} value
   */
  [updateDeepProperty](name, value) {
    let tmp = this;
    let last = '';
    String(name)
      .split('.')
      .forEach((item, index, arr) => {
        if (arr.length === index + 1) {
          last = item;
          return;
        }
        if (!tmp[item]) {
          tmp[item] = {};
        }
        tmp = tmp[item];
      });
    tmp[last] = value;
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
   * A handler for the delete action button click. Dispatches the `remove`
   * custom event.
   */
  [deleteHandler]() {
    this.dispatchEvent(new CustomEvent('remove'));
  }

  /**
   * A handler for the duplicate action button click. Dispatches the `duplicate`
   * custom event.
   */
  [duplicateHandler]() {
    this.dispatchEvent(new CustomEvent('duplicate'));
  }

  /**
   * A handler for the close action button click. Updates the `opened` value
   * on the `view` property.
   */
  [closeHandler]() {
    this.opened = false;
    this[notifyChange]('view.opened');
  }

  /**
   * A handler for the open action button click. Updates the `opened` value
   * on the `view` property.
   */
  [openedHandler]() {
    this.opened = true;
    this[notifyChange]('view.opened');
  }

  /**
   * A handler for the help button click.
   * It dispatches used by ARC `open-external-url` to use platform's APIs to
   * open a popup. As a fallback it uses `window.open`.
   *
   * @param {Event} e
   */
  [helpHandler](e) {
    const { url } = /** @type {HTMLInputElement} */ (e.target).dataset;
    ArcNavigationEvents.navigateExternal(this, url);
  }

  /**
   * Main render function
   * @return {TemplateResult}
   */
  render() {
    const { opened = false } = this;
    const classes = {
      'action-card': true, 
      opened,
    };
    return html`
    <section class="${classMap(classes)}">
      ${opened ? this[openedCardTemplate]() : this[closedCardTemplate]()}
    </section>
    `;
  }

  /**
   * @return {TemplateResult} Template for opened action view.
   */
  [openedCardTemplate]() {
    const {
      name = '',
      type,
      failOnError,
      config={},
      outlined,
      anypoint,
      readOnly,
      disabled,
    } = this;
    const lowerName = String(name).toLowerCase();
    const changeHandler = this[configChangeHandler];
    const inputConfig = {
      outlined,
      anypoint,
      readOnly,
      disabled,
    };
    let content;
    switch (lowerName) {
      case 'set-cookie':
        content = setCookieTemplate(
          failOnError,
          config,
          type,
          this[inputHandler],
          changeHandler,
          this[dataSourceHandler],
          inputConfig
        );
        break;
      case 'set-variable':
        content = setVariableTemplate(
          failOnError,
          config,
          type,
          this[inputHandler],
          changeHandler,
          this[dataSourceHandler],
          inputConfig
        );
        break;
      case 'delete-cookie':
        content = deleteCookieTemplate(
          config,
          this[inputHandler],
          changeHandler,
          inputConfig
        );
        break;
      default:
        content = html``;
    }
    return html`
      ${this[openedCardTitle](name)} 
      <div class="action-content">
        ${content} 
      </div>
      ${this[openedCardFooter]()}
    `;
  }

  /**
   * @return {TemplateResult} Template for closed action view.
   */
  [closedCardTemplate]() {
    const { name = '' } = this;
    const lowerName = String(name).toLowerCase();
    return html`
      <div class="closed-title">
        ${closedCardTitleTemplate(lowerName)} ${this[openButtonTemplate]()}
      </div>
    `;
  }

  /**
   * @param {string} name Action's name
   * @return {TemplateResult} Template for opened action's title.
   */
  [openedCardTitle](name) {
    const label = actionNamesMap(name);
    const helpUrl = helpMap[name];
    return html`
      <div class="opened-title">
        <div class="action-title">${label}</div>
        ${this[actionHelpTpl](helpUrl)}
        ${this[closeButtonTemplate]()}
      </div>
    `;
  }

  /**
   * @return {TemplateResult} Template for opened action's footer line.
   */
  [openedCardFooter]() {
    return html`
      <div class="action-footer">
        ${this[enableSwitchTemplate]()} 
        ${this[deleteButtonTemplate]()}
        ${this[duplicateButtonTemplate]()} 
        ${this[closeButtonTemplate]()}
      </div>
    `;
  }

  /**
   * @param {string} url The URL to use to render the action.
   * @return {TemplateResult|string} Template for the help button.
   */
  [actionHelpTpl](url) {
    if (!url) {
      return '';
    }
    return html`
    <anypoint-button
      class="action-help"
      data-url="${url}"
      @click="${this[helpHandler]}"
    >Help</anypoint-button>
    `;
  }

  /**
   * @return {TemplateResult|string} Template for the help button.
   */
  [enableSwitchTemplate]() {
    const { anypoint, enabled } = this;
    return html`
    <anypoint-switch
      ?anypoint="${anypoint}"
      .checked="${enabled}"
      @change="${this[enabledHandler]}"
      name="enabled"
    >Enabled</anypoint-switch>
    `;
  }

  /**
   * @return {TemplateResult|string} Template for the delete button.
   */
  [deleteButtonTemplate]() {
    const { anypoint } = this;
    return html`
    <anypoint-button
      title="Removes this action"
      class="action-delete"
      ?anypoint="${anypoint}"
      @click="${this[deleteHandler]}"
      data-action="delete"
    >Delete</anypoint-button>
    `;
  }

  /**
   * @return {TemplateResult|string} Template for the duplicate button.
   */
  [duplicateButtonTemplate]() {
    const { anypoint } = this;
    return html`
    <anypoint-button
      title="Duplicates this action"
      ?anypoint="${anypoint}"
      @click="${this[duplicateHandler]}"
      data-action="duplicate"
    >Duplicate</anypoint-button>
    `;
  }

  /**
   * @return {TemplateResult|string} Template for the close action button.
   */
  [closeButtonTemplate]() {
    const { anypoint } = this;
    return html`
    <anypoint-button
      title="Close the editor"
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
    >Open</anypoint-button>
    `;
  }
}
