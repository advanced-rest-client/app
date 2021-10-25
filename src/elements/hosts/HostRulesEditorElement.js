/* eslint-disable no-param-reassign */
/* eslint-disable class-methods-use-this */
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
import { TelemetryEvents, DataImportEventTypes, ExportEvents, ArcNavigationEvents, ArcModelEvents, ArcModelEventTypes } from '@advanced-rest-client/events';
import { v4 } from '@advanced-rest-client/uuid';
import '@advanced-rest-client/icons/arc-icon.js';
import '@anypoint-web-components/awc/anypoint-button.js';
import '@anypoint-web-components/awc/anypoint-icon-button.js';
import '@anypoint-web-components/awc/anypoint-menu-button.js';
import '@anypoint-web-components/awc/anypoint-listbox.js';
import '@anypoint-web-components/awc/anypoint-icon-item.js';
import '@anypoint-web-components/awc/anypoint-dialog.js';
import '@anypoint-web-components/awc/anypoint-input.js';
import '@anypoint-web-components/awc/anypoint-collapse.js';
import '@anypoint-web-components/awc/bottom-sheet.js';
import '@anypoint-web-components/awc/anypoint-switch.js'
import '../../../define/export-options.js';
import '../../../define/host-rules-tester.js';
import styles from './styles/EditorStyles.js';

/** @typedef {import('lit-element').TemplateResult} TemplateResult */
/** @typedef {import('@advanced-rest-client/events').HostRule.ARCHostRule} ARCHostRule */
/** @typedef {import('@advanced-rest-client/events').ARCHostRuleUpdatedEvent} ARCHostRuleUpdatedEvent */
/** @typedef {import('@advanced-rest-client/events').ARCHostRuleDeletedEvent} ARCHostRuleDeletedEvent */
/** @typedef {import('@advanced-rest-client/events').ARCModelStateDeleteEvent} ARCModelStateDeleteEvent */
/** @typedef {import('@advanced-rest-client/events').ArcImportDataEvent} ArcImportDataEvent */
/** @typedef {import('@advanced-rest-client/events').DataExport.ProviderOptions} ProviderOptions */
/** @typedef {import('@advanced-rest-client/events').DataExport.ExportOptions} ExportOptions */
/** @typedef {import('@advanced-rest-client/events').DataExport.ArcNativeDataExport} ArcNativeDataExport */
/** @typedef {import('@anypoint-web-components/awc').AnypointInputElement} AnypointInput */
/** @typedef {import('@anypoint-web-components/awc').AnypointDialogElement} AnypointDialog */
/** @typedef {import('@anypoint-web-components/awc').AnypointListboxElement} AnypointListbox */
/** @typedef {import('@anypoint-web-components/awc').AnypointCheckboxElement} AnypointCheckboxElement */

export const sheetClosedHandler = Symbol('sheetClosedHandler');
export const acceptExportOptions = Symbol('acceptExportOptions');
export const cancelExportOptions = Symbol('cancelExportOptions');
export const listTemplate = Symbol('listTemplate');
export const listItemTemplate = Symbol('listItemTemplate');
export const itemToggleTemplate = Symbol('itemToggleTemplate');
export const itemNameInput = Symbol('itemNameInput');
export const itemValueInput = Symbol('itemValueInput');
export const itemRemoveTemplate = Symbol('itemRemoveTemplate');
export const removeItemHandler = Symbol('removeItemHandler');
export const enabledHandler = Symbol('enabledHandler');
export const propertyInputHandler = Symbol('propertyInputHandler');
export const ruleUpdatedHandler = Symbol('ruleUpdatedHandler');
export const ruleDeletedHandler = Symbol('ruleDeletedHandler');
export const addTemplate = Symbol('addTemplate');
export const addItemHandler = Symbol('addItemHandler');
export const clearDialogResultHandler = Symbol('clearDialogResultHandler');
export const exportAllFile = Symbol('exportAllFile');
export const exportRules = Symbol('exportRules');
export const clearDialogTemplate = Symbol('clearDialogTemplate');
export const exportOptionsTemplate = Symbol('exportOptionsTemplate');
export const unavailableTemplate = Symbol('unavailableTemplate');
export const testerTemplate = Symbol('testerTemplate');
export const busyTemplate = Symbol('busyTemplate');
export const headerTemplate = Symbol('headerTemplate');
export const deselectMainMenu = Symbol('deselectMainMenu');
export const deleteAllClick = Symbol('deleteAllClick');
export const onLearnMoreHandler = Symbol('onLearnMoreHandler');
export const handleException = Symbol('handleException');
export const dataImportHandler = Symbol('dataImportHandler');
export const dataDestroyHandler = Symbol('dataDestroyHandler');

const TelemetryCategory = 'Host rules view';

/**
 * An element to render host rules mapping editor.
 *
 * Host rules mapping allow ARC to redirect connection from one URI to another
 * without changing the `host` header value. This element allows to enter mapping
 * rules and to test them against arbitrary URL.
 *
 * NOTE: This element does not provide data storing interface. Instead of operating
 * on a data store it sends custom events that should be handled by the hosting
 * application. Example interface is included in `events/host-rules-model` element.
 *
 * NOTE: This element works with `arc-data-export` element to export data to a file.
 * You can use other way to handle `export-user-data` custom event to export host
 * rules data.
 *
 * ### Example
 *
 * ```
 * <arc-data-export></arc-data-export>
 * <host-rules-model></host-rules-model>
 * <host-rules-editor></host-rules-editor>
 * ```
 *
 * ### Data model
 *
 * The `items` property accepts an array of the following objects:
 *
 * ```javascript
 * {
 *    from: String, // The from rule (may contain asterisks)
 *    to: String, // replacement value
 *    enabled: Boolean, // if false the rule is ignored
 *    comment: String // optional rule description
 * }
 * ```
 */
export default class HostRulesEditorElement extends LitElement {
  static get styles() {
    return styles;
  }

  static get properties() {
    return {
      // List of saved items restored from the datastore.
      items: { type: Array },
      /** 
       * True when loading data from the datastore.
       */
      loading: { type: Boolean, reflect: true },
      /**
       * If true the rules tester is visible.
       */
      rulesTesterOpened: { type: Boolean },
      /**
       * When set it won't ask the model for data when connected to the DOM.
       */
      noAuto: { type: Boolean },
      /**
       * Enables Anypoint theme
       */
      anypoint: { type: Boolean },
      /**
       * Enables material design outlined theme
       */
      outlined: { type: Boolean },
      /**
       * Indicates that the export options panel is currently rendered.
       */
      exportOptionsOpened: { type: Boolean },
      /**
       * When set it renders the editor in read only mode.
       */
      readOnly: { type: Boolean },
    };
  }

  /**
   * @return {boolean} `true` if `items` is set.
   */
  get hasItems() {
    const { items } = this;
    return Array.isArray(items) && !!items.length;
  }

  /**
   * Computed flag that determines that the query to the data store
   * has been performed and empty result was returned.
   *
   * @return {boolean}
   */
  get dataUnavailable() {
    const { hasItems, loading } = this;
    return !loading && !hasItems;
  }

  constructor() {
    super();
    this[ruleUpdatedHandler] = this[ruleUpdatedHandler].bind(this);
    this[ruleDeletedHandler] = this[ruleDeletedHandler].bind(this);
    this[dataImportHandler] = this[dataImportHandler].bind(this);
    this[dataDestroyHandler] = this[dataDestroyHandler].bind(this);

    this.anypoint = false;
    this.outlined = false;
    this.noAuto = false;
    this.loading = false;
    this.readOnly = false;

    /**
     * @type {ARCHostRule[]}
     */
    this.items = [];
  }

  connectedCallback() {
    super.connectedCallback();
    window.addEventListener(ArcModelEventTypes.HostRules.State.update, this[ruleUpdatedHandler]);
    window.addEventListener(ArcModelEventTypes.HostRules.State.delete, this[ruleDeletedHandler]);
    window.addEventListener(DataImportEventTypes.dataImported, this[dataImportHandler]);
    window.addEventListener(ArcModelEventTypes.destroyed, this[dataDestroyHandler]);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener(ArcModelEventTypes.HostRules.State.update, this[ruleUpdatedHandler]);
    window.removeEventListener(ArcModelEventTypes.HostRules.State.delete, this[ruleDeletedHandler]);
    window.removeEventListener(DataImportEventTypes.dataImported, this[dataImportHandler]);
    window.removeEventListener(ArcModelEventTypes.destroyed, this[dataDestroyHandler]);
  }

  firstUpdated(args) {
    super.firstUpdated(args);
    if ((!Array.isArray(this.items) || !this.items.length) && !this.noAuto) {
      this.refresh();
    }
  }

  /**
   * Handles an exception by sending exception details to GA.
   * @param {String} message A message to send.
   */
  [handleException](message) {
    TelemetryEvents.exception(this, message, false);
  }

  [dataImportHandler]() {
    this.refresh();
  }

  /**
   * @param {ARCModelStateDeleteEvent} e 
   */
  [dataDestroyHandler](e) {
    const { store } = e;
    if (['host-rules', 'all'].includes(store)) {
      this.items = [];
    }
  }

  /**
   * Refreshes the list of rules from the model.
   * This element is designed to work with `events/host-rules-model`
   * element but can work with any model that handles `host-rules-list`
   * custom event.
   *
   * Calling this function will replace current `items` value with the one
   * received from the model.
   *
   * @return {Promise}
   */
  async refresh() {
    if (this.loading) {
      return;
    }
    this.loading = true;
    try {
      const list = await ArcModelEvents.HostRules.list(this, {
        limit: 250,
      });
      if (!list) {
        throw new Error(`HostRules list event not handled`);
      }
      this.items = list.items;
    } catch (e) {
      this.items = undefined;
      this[handleException](e.message);
    }
    this.loading = false;
  }

  [deselectMainMenu]() {
    setTimeout(() => {
      const menuOptions = /** @type AnypointListbox */ (this.shadowRoot.querySelector('#mainMenuOptions'));
      menuOptions.selected = null;
    });
  }

  /**
   * Menu item handler to export all data to file
   */
  openExportAll() {
    this[deselectMainMenu]();
    this.exportOptionsOpened = true;
  }

  /**
   * Adds an empty rule to the rules list
   */
  appendRule() {
    const rule = {
      from: '',
      to: '',
      enabled: true,
      _id: v4(),
    };
    ArcModelEvents.HostRules.update(this, rule);
  }

  /**
   * Updates a rule from the `host-rules-changed` custom event.
   * The event should contain `rule` property on the event's detail object
   * containing the rule object.
   *
   * @param {ARCHostRuleUpdatedEvent} e
   */
  [ruleUpdatedHandler](e) {
    const { changeRecord } = e;
    if (!this.items) {
      this.items = [];
    }
    const { items } = this;
    const { item, id } = changeRecord;
    const index = items.findIndex((entry) => entry._id === id);
    if (index === -1) {
      items.push(item);
    } else {
      items[index] = item;
    }
    this.requestUpdate();
  }

  /**
   * Deletes the rule from the `host-rules-deleted` custom event.
   * The event should contain `rule` property on the event's detail object
   * containing the rule object.
   *
   * @param {ARCHostRuleDeletedEvent} e
   */
  [ruleDeletedHandler](e) {
    const { items } = this;
    if (!Array.isArray(items) || !items.length) {
      return;
    }
    const { id } = e;
    const index = items.findIndex((item) => item._id === id);
    if (index === -1) {
      return;
    }
    items.splice(index, 1);
    this.requestUpdate();
  }

  /**
   * Toggles the rule tester view.
   * Use `rulesTesterOpened` property to control the view instead of calling
   * this function.
   */
  toggleRulesTester() {
    this.rulesTesterOpened = !this.rulesTesterOpened;
  }

  [onLearnMoreHandler]() {
    this[deselectMainMenu]();
    ArcNavigationEvents.helpTopic(this, 'host-rules');
  }

  [deleteAllClick]() {
    this[deselectMainMenu]();
    const dialog = /** @type AnypointDialog */ (this.shadowRoot.querySelector('#dataClearDialog'));
    dialog.opened = true;
  }

  /**
   * Called when the delete warning dialog closes.
   *
   * The function dispatches custom event handled by the model to remove all
   * data.
   *
   * @param {CustomEvent} e
   * @return {Promise}
   */
  async [clearDialogResultHandler](e) {
    if (!e.detail.confirmed) {
      return;
    }
    await ArcModelEvents.destroy(document.body, ['host-rules']);
  }
  
  [sheetClosedHandler](e) {
    const prop = e.target.dataset.openProperty;
    this[prop] = e.detail.value;
  }

  /**
   * Handler for `accept` event dispatched by export options element.
   * @param {CustomEvent} e
   */
  [acceptExportOptions](e) {
    this.exportOptionsOpened = false;
    const { detail } = e;
    const provider = /** @type ProviderOptions */ (detail.providerOptions);
    const options = /** @type ExportOptions */ (detail.exportOptions);
    this[exportRules](provider, options);
  }

  /**
   * Exports all hot rules data with predefined options.
   */
  [exportAllFile]() {
    const provider = /** @type ProviderOptions */ ({
      file: 'arc-host-rules.json',
    });
    const options = /** @type ExportOptions */ ({
      provider: 'file',
    });
    this[exportRules](provider, options);
  }

  /**
   * @param {ProviderOptions} provider
   * @param {ExportOptions} options
   * @returns {Promise<void>}
   */
  async [exportRules](provider, options) {
    options.kind = 'ARC#AllDataExport';
    const data = /** @type ArcNativeDataExport */ ({
      hostrules: true,
    });
    try {
      const result = await ExportEvents.nativeData(this, data, options, provider);
      if (!result) {
        throw new Error('Request panel: Export module not found');
      }
      // if (detail.options.provider === 'drive') {
      //   // TODO: Render link to the folder
      //   this.shadowRoot.querySelector('#driveSaved').opened = true;
      // }
    } catch (err) {
      // this[handleException](e.message);
      TelemetryEvents.exception(this, err.message, false);
    }
    TelemetryEvents.event(this, {
      category: TelemetryCategory,
      action: 'export',
      label: options.provider,
    });
  }

  [cancelExportOptions]() {
    this.exportOptionsOpened = false;
    TelemetryEvents.event(this, {
      category: TelemetryCategory,
      action: 'cancel-export',
    });
  }

  /**
   * Handler to the remove a header
   * @param {PointerEvent} e
   */
  [removeItemHandler](e) {
    const node = /** @type HTMLElement */ (e.currentTarget);
    const index = Number(node.dataset.index);
    const item = this.items[index];
    ArcModelEvents.HostRules.delete(this, item._id);
  }

  /**
   * @param {CustomEvent} e
   */
  [enabledHandler](e) {
    const node = /** @type AnypointCheckboxElement */ (e.target);
    const index = Number(node.dataset.index);
    const item = this.items[index];
    item.enabled = node.checked;
    ArcModelEvents.HostRules.update(this, item);
  }

  /**
   * @param {CustomEvent} e
   */
  [propertyInputHandler](e) {
    const node = /** @type AnypointInput */ (e.target);
    const { value } = node;
    const { property } = node.dataset;
    const index = Number(node.dataset.index);
    const item = this.items[index];
    const old = item[property];
    if (old === value) {
      return;
    }
    item[property] = value;
    ArcModelEvents.HostRules.update(this, item);
  }

  [addItemHandler]() {
    this.appendRule();
  }

  render() {
    const { dataUnavailable } = this;
    return html`
    ${this[headerTemplate]()}
    ${this[busyTemplate]()}
    ${this[testerTemplate]()}
    ${dataUnavailable ? this[unavailableTemplate]() : this[listTemplate]()}
    ${this[exportOptionsTemplate]()}
    ${this[clearDialogTemplate]()}`;
  }

  [headerTemplate]() {
    const { anypoint, dataUnavailable } = this;
    return html`
    <div class="header">
      <h2>Hosts rules mapping</h2>

      ${dataUnavailable ? '' : html`<anypoint-button
        emphasis="medium"
        toggles
        @click="${this.toggleRulesTester}"
        aria-label="Activate to open rules test editor"
      >Test rules</anypoint-button>`}

      <anypoint-menu-button
        dynamicAlign
        closeOnActivate
        id="mainMenu"
        ?anypoint="${anypoint}"
      >
        <anypoint-icon-button
          aria-label="Activate to open context menu"
          slot="dropdown-trigger"
          ?anypoint="${anypoint}"
        >
          <arc-icon icon="moreVert"></arc-icon>
        </anypoint-icon-button>
        <anypoint-listbox
          slot="dropdown-content"
          id="mainMenuOptions"
          ?anypoint="${anypoint}"
        >
          <anypoint-icon-item
            class="menu-item"
            data-action="export-all"
            @click="${this.openExportAll}"
          >
            <arc-icon icon="exportVariant" slot="item-icon"></arc-icon>
            Export all
          </anypoint-icon-item>
          <anypoint-icon-item
            class="menu-item"
            data-action="delete-all"
            @click="${this[deleteAllClick]}"
          >
            <arc-icon icon="deleteIcon" slot="item-icon"></arc-icon>
            Delete all
          </anypoint-icon-item>
          <anypoint-icon-item
            class="menu-item"
            data-action="learn-more"
            @click="${this[onLearnMoreHandler]}"
          >
            <arc-icon icon="info" slot="item-icon"></arc-icon>
            Learn more about host rules
          </anypoint-icon-item>
        </anypoint-listbox>
      </anypoint-menu-button>
    </div>`;
  }

  [busyTemplate]() {
    if (!this.loading) {
      return '';
    }
    return html`<progress></progress>`;
  }

  /**
   * @return {TemplateResult} The template for the rules tester element.
   */
  [testerTemplate]() {
    const {
      anypoint,
      outlined,
      rulesTesterOpened,
      items
    } = this;
    return html`
    <anypoint-collapse .opened="${rulesTesterOpened}">
      <host-rules-tester
        .rules="${items}"
        ?anypoint="${anypoint}"
        ?outlined="${outlined}"
      ></host-rules-tester>
    </anypoint-collapse>`;
  }

  [unavailableTemplate]() {
    return html`
    <div class="empty-screen">
      <h3 class="empty-title">No mappings available</h3>
      ${this[addTemplate]()}
    </div>`;
  }

  /**
   * @returns {TemplateResult} The template for the list items.
   */
  [listTemplate]() {
    const { items } = this;
    return html`
    <div class="table-labels">
      <span class="param-name-label">From</span>
      <span class="param-value-label">To</span>
    </div>
    <div class="params-list">
      ${items.map((item, index) => this[listItemTemplate](item, index))}
    </div>
    ${this[addTemplate]()}
    `;
  }

  /**
   * @param {ARCHostRule} item
   * @param {number} index
   * @returns {TemplateResult} The template for a single list item
   */
  [listItemTemplate](item, index) {
    return html`
    <div class="form-row">
      ${this[itemToggleTemplate](item, index)}
      ${this[itemNameInput](item, index)}
      ${this[itemValueInput](item, index)}
      ${this[itemRemoveTemplate](index)}
    </div>`;
  }

  /**
   * @param {number} index
   * @return {TemplateResult} Template for the remove item template
   */
  [itemRemoveTemplate](index) {
    const { anypoint, readOnly } = this;
    return html`
    <anypoint-icon-button
      data-index="${index}"
      @click="${this[removeItemHandler]}"
      title="Remove this rule"
      aria-label="Activate to remove this rule"
      ?disabled="${readOnly}"
      ?anypoint="${anypoint}"
      class="param-remove"
    >
      <arc-icon icon="removeCircleOutline"></arc-icon>
    </anypoint-icon-button>
    `;
  }

  /**
   * @param {ARCHostRule} item
   * @param {number} index
   * @return {TemplateResult} Template for the rule toggle button
   */
  [itemToggleTemplate](item, index) {
    const { anypoint, readOnly } = this;
    return html`
    <anypoint-switch
      data-index="${index}"
      .checked="${item.enabled}"
      @checkedchange="${this[enabledHandler]}"
      title="Enable / disable the rule"
      aria-label="Activate to toggle enabled state of this rule"
      class="param-switch"
      ?disabled="${readOnly}"
      ?anypoint="${anypoint}"
    ></anypoint-switch>
    `;
  }

  /**
   * @param {ARCHostRule} item
   * @param {number} index
   * @return {TemplateResult} The template for the rule "from" input
   */
  [itemNameInput](item, index) {
    const { anypoint, outlined, readOnly } = this;
    return html`
    <anypoint-input
      autoValidate
      .value="${item.from}"
      data-property="from"
      data-index="${index}"
      class="param-name"
      ?anypoint="${anypoint}"
      ?outlined="${outlined}"
      ?readOnly="${readOnly}"
      @change="${this[propertyInputHandler]}"
      noLabelFloat
    >
      <label slot="label">From</label>
    </anypoint-input>
    `;
  }

  /**
   * @param {ARCHostRule} item
   * @param {number} index
   * @return {TemplateResult} The template for the rule "to" input
   */
  [itemValueInput](item, index) {
    const { anypoint, outlined, readOnly } = this;
    return html`
    <anypoint-input
      .value="${item.to}"
      data-property="to"
      data-index="${index}"
      class="param-value"
      ?anypoint="${anypoint}"
      ?outlined="${outlined}"
      ?readOnly="${readOnly}"
      @change="${this[propertyInputHandler]}"
      noLabelFloat
    >
      <label slot="label">To</label>
    </anypoint-input>
    `;
  }

  /**
   * @returns {TemplateResult} The template for the add new rule button
   */
  [addTemplate]() {
    const { anypoint, readOnly } = this;
    return html`
    <div class="form-actions">
      <anypoint-button
        emphasis="low"
        @click="${this[addItemHandler]}"
        class="add-param"
        ?anypoint="${anypoint}"
        ?disabled="${readOnly}"
        title="Add new rule to the list"
      >
        <arc-icon icon="addCircleOutline"></arc-icon> Add
      </anypoint-button>
    </div>
    `;
  }

  /**
   * @returns {TemplateResult} The template for the export options dialog
   */
  [exportOptionsTemplate]() {
    const {
      anypoint,
      outlined,
      exportOptionsOpened,
    } = this;
    return html`<bottom-sheet
      class="bottom-sheet-container"
      .opened="${exportOptionsOpened}"
      data-open-property="exportOptionsOpened"
      @closed="${this[sheetClosedHandler]}"
    >
      <export-options
        id="exportOptions"
        ?anypoint="${anypoint}"
        ?outlined="${outlined}"
        withEncrypt
        file="arc-host-rules.json"
        provider="file"
        @accept="${this[acceptExportOptions]}"
        @cancel="${this[cancelExportOptions]}"
      ></export-options>
    </bottom-sheet>`;
  }

  /**
   * @returns {TemplateResult} The template for the clear data dialog
   */
  [clearDialogTemplate]() {
    const { anypoint } = this;
    return html`<anypoint-dialog
      id="dataClearDialog"
      ?anypoint="${anypoint}"
      @closed="${this[clearDialogResultHandler]}"
    >
      <h2>Remove all rules?</h2>
      <p>Maybe you should create a backup first?</p>
      <div class="buttons">
        <anypoint-button
          ?anypoint="${anypoint}"
          data-action="delete-export-all"
          @click="${this[exportAllFile]}"
        >Create backup file</anypoint-button>
        <anypoint-button
          ?anypoint="${anypoint}"
          data-dialog-dismiss
        >Cancel</anypoint-button>
        <anypoint-button
          ?anypoint="${anypoint}"
          data-dialog-confirm
          class="action-button"
        >Confirm</anypoint-button>
      </div>
    </anypoint-dialog>`;
  }
}
