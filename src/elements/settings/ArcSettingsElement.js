/* eslint-disable class-methods-use-this */
import { LitElement, html } from 'lit-element';
import { ArcNavigationEvents, ConfigEvents } from '@advanced-rest-client/events';
import { ScrollTargetMixin } from '@anypoint-web-components/awc';
import '@anypoint-web-components/awc/anypoint-item.js';
import '@anypoint-web-components/awc/anypoint-item-body.js';
import '@anypoint-web-components/awc/anypoint-input.js';
import '@anypoint-web-components/awc/anypoint-masked-input.js';
import '@anypoint-web-components/awc/anypoint-switch.js';
import '@anypoint-web-components/awc/anypoint-icon-button.js';
import '@anypoint-web-components/awc/anypoint-dropdown-menu.js';
import '@anypoint-web-components/awc/anypoint-listbox.js';
import '@advanced-rest-client/icons/arc-icon.js';
import elementStyles from './settings.css.js';
import schema from './schema.js';

/** @typedef {import('@advanced-rest-client/events').Config.ARCConfig} ARCConfig */
/** @typedef {import('@anypoint-web-components/awc').AnypointSwitchElement} AnypointSwitch */
/** @typedef {import('@anypoint-web-components/awc').AnypointListboxElement} AnypointListbox */
/** @typedef {import('lit-html').TemplateResult} TemplateResult */
/** @typedef {import('../../types').ArcConfigItem} ArcConfigItem */
/** @typedef {import('../../types').ArcConfigGroup} ArcConfigGroup */
/** @typedef {import('../../types').ArcLinkItem} ArcLinkItem */
/** @typedef {import('../../types').SettingsPage} SettingsPage */

export const subPageLinkHandler = Symbol('subPageLinkHandler');
export const subPageLinkItem = Symbol('subPageLinkItem');
export const listChangeHandler = Symbol('listChangeHandler');
export const dropdownOptions = Symbol('dropdownOptions');
export const booleanItemTemplate = Symbol('booleanItemTemplate');
export const redirectToggleFocus = Symbol('redirectToggleFocus');
export const toggleItemHandler = Symbol('toggleItemHandler');
export const toggleBooleanValue = Symbol('toggleBooleanValue');
export const linkItemHandler = Symbol('linkItemHandler');
export const configLinkItem = Symbol('configLinkItem');
export const inputItemTemplate = Symbol('inputItemTemplate');
export const settingsItemTemplate = Symbol('settingsItemTemplate');
export const groupTemplate = Symbol('groupTemplate');
export const inputChangeHandler = Symbol('inputChangeHandler');
export const backSubPage = Symbol('backSubPage');
export const subPageTemplate = Symbol('subPageTemplate');
export const schemaTemplate = Symbol('schemaTemplate');
export const configGroupItem = Symbol('configGroupItem');
export const subPageInputTemplate = Symbol('subPageItemTemplate');
export const subPageMaskedInputTemplate = Symbol('subPageMaskedInputTemplate');
export const subPageGroupTemplate = Symbol('subPageGroupTemplate');
export const pageSectionItem = Symbol('pageSectionItem');
export const inputSectionTemplate = Symbol('inputSectionTemplate');
export const booleanSectionTemplate = Symbol('booleanSectionTemplate');
export const subPageClickHandler = Symbol('subPageClickHandler');

const SupportedConfigItems = ['ARC#LinkItem', 'ARC#ConfigItem', 'ARC#ConfigGroup'];

export default class ArcSettingsElement extends ScrollTargetMixin(LitElement) {
  static get styles() {
    return elementStyles;
  }

  static get properties() {
    return { 
      /** 
       * Set internally when the data has been read from the preferences store.
       */
      settingsReady: { type: Boolean },
      /** 
       * The current application settings
       */
      appSettings: { type: Object },
      /** 
       * Enables Anypoint theme
       */
      anypoint: { type: Boolean },
      /** 
       * Enables Material Design's outlined theme.
       */
      outlined: { type: Boolean },
    };
  }

  /**
   * @returns {SettingsPage|null} The currently rendered sub page's schema or null when rendering the top view.
   */
  get currentPage() {
    const { pages } = this;
    if (!Array.isArray(pages) || !pages.length) {
      return null;
    }
    return pages[pages.length - 1];
  }

  constructor() {
    super();
    this.settingsReady = false;
    this.anypoint = false;
    this.outlined = false;
    /**
     * @type {ARCConfig}
     */
    this.appSettings = undefined;
    /** 
     * The list of currently opened setting pages.
     * The last item in the array is the rendered item.
     * @type {SettingsPage[]}
     */
    this.pages = [];
  }

  connectedCallback() {
    super.connectedCallback();
    this.loadConfig();
  }

  /**
   * Loads the current config through the ARC events system and sets the `appSettings` property.
   */
  async loadConfig() {
    this.appSettings = await ConfigEvents.readAll(this);
    this.settingsReady = true;
  }

  /**
   * Searches the settings schema for a definition of an item identified by the path.
   * @param {string} path 
   * @returns {ArcConfigItem}
   */
  readConfigItemSchema(path) {
    const [groupName, ...parts] = path.split('.');
    const group = schema.groups.find((item) => item.key === groupName);
    if (!group) {
      return undefined;
    }
    // this is a simplified version of the search since setting items are not nested, yet.
    const [id] = parts;
    return /** @type ArcConfigItem */ (group.items.find((item) => /** @type ArcConfigItem */ (item).key === `${groupName}.${id}`));
  }

  /**
   * Reads current settings value or the default value from the current setting.
   * @param {string} path 
   * @param {any} defaultValue 
   * @returns {any} The read value or the default value.
   */
  readValue(path, defaultValue) {
    const { appSettings } = this;
    if (!appSettings) {
      return defaultValue;
    }
    const reducer = (accumulator, currentValue) => {
      if (typeof accumulator === 'undefined' || accumulator === null) {
        return undefined;
      }
      return accumulator[currentValue];
    };
    const result = path.split('.').reduce(reducer, appSettings);
    return typeof result === 'undefined' ? defaultValue : result;
  }

  /**
   * @param {string} path The path to the data
   * @param {any} value The value to set.
   */
  updateValue(path, value) {
    const parts = path.split('.');
    const last = parts.pop();
    if (!this.appSettings) {
      this.appSettings = {};
    }
    let current = this.appSettings;
    parts.forEach((part) => {
      if (!current[part]) {
        current[part] = {};
      }
      current = current[part];
    });
    current[last] = value;
    ConfigEvents.update(this, path, value);
  }

  /**
   * Handler for the taggable (switch) item.
   * @param {PointerEvent} e 
   */
  [toggleItemHandler](e) {
    const node = /** @type HTMLElement */ (e.currentTarget);
    const button = /** @type AnypointSwitch */ (node.querySelector('anypoint-switch'));
    if (e.target === button) {
      return;
    }
    button.checked = !button.checked;
    button.dispatchEvent(new Event('change'));
  }

  /**
   * Toggles a boolean value when the switch event id dispatched
   * @param {Event} e
   */
  [toggleBooleanValue](e) {
    const button = /** @type AnypointSwitch */ (e.target);
    const { checked, dataset } = button;
    const { path } = dataset;
    this.updateValue(path, checked);
  }

  /**
   * Redirects focus to the toggle element
   * @param {Event} e
   */
  [redirectToggleFocus](e) {
    const node = /** @type HTMLElement */ (e.currentTarget);
    const button = /** @type AnypointSwitch */ (node.querySelector('anypoint-switch'));
    if (e.target === button) {
      return;
    }
    button.focus();
  }

  /**
   * @param {Event} e 
   */
  [listChangeHandler](e) {
    const node = /** @type AnypointListbox */ (e.target);
    const { selected, dataset } = node;
    const { path } = dataset;
    this.updateValue(path, selected);
  }

  /**
   * @param {Event} e 
   */
  [subPageLinkHandler](e) {
    e.stopPropagation();
    e.preventDefault();
    const node = /** @type HTMLElement */ (e.currentTarget);
    const { dataset } = node;
    const { path } = dataset;
    const page = this.readConfigItemSchema(path);
    const { scrollTarget } = this;
    const scrollPosition = /** @type HTMLElement */ (scrollTarget).scrollTop;
    if (!Array.isArray(this.pages)) {
      this.pages = [];
    }
    this.pages.push({
      page,
      scrollPosition,
    });
    this.requestUpdate();
  }

  /**
   * @param {Event} e 
   */
  [inputChangeHandler](e) {
    const node = /** @type HTMLInputElement */ (e.currentTarget);
    const { dataset, value } = node;
    const { path } = dataset;
    this.updateValue(path, value);
  }

  /**
   * Clears the current sub page and returns to the default view.
   */
  async [backSubPage]() {
    if (!Array.isArray(this.pages)) {
      return;
    }
    const removed = this.pages.pop();
    await this.requestUpdate();
    if (removed.scrollPosition) {
      this._scrollTop = removed.scrollPosition;
    }
  }

  /**
   * @param {Event} e 
   */
  [linkItemHandler](e) {
    const node = /** @type HTMLElement */ (e.currentTarget);
    const { dataset } = node;
    const { href } = dataset;
    ArcNavigationEvents.navigateExternal(this, href);
  }

  /**
   * @param {Event} e
   */
  [subPageClickHandler](e) {
    const button = /** @type HTMLElement */ (/** @type Element */ (e.currentTarget).nextElementSibling);
    if (button) {
      button.click();
    }
  }

  render() {
    const { settingsReady, currentPage } = this;
    if (!settingsReady) {
      return html`<p>Initializing...</p>`;
    }
    return html`
    <div class="content">
      ${currentPage ? this[subPageTemplate]() : this[schemaTemplate]()}
    </div>`;
  }

  /**
   * @returns {TemplateResult} The template for settings sections as defined in the schema.
   */
  [schemaTemplate]() {
    return html`
    <div class="settings-sections">
      ${schema.groups.map((group) => this[groupTemplate](group))}
    </div>
    `;
  }

  /**
   * @returns {TemplateResult} The template for the selected sub page.
   */
  [subPageTemplate]() {
    const { currentPage } = this;
    const { name, description, kind } = currentPage.page;
    const isGroup = kind === 'ARC#ConfigGroup';
    return html`
    <div class="settings-page">
      <div class="title-line">
        <anypoint-icon-button title="Go back to the previous page" @click="${this[backSubPage]}">
          <arc-icon icon="arrowBack"></arc-icon>
        </anypoint-icon-button>
        <h3 class="settings-title">${name}</h3>
      </div>
      <p class="settings-description">${description}</p>
      ${isGroup ? this[subPageGroupTemplate](/** @type ArcConfigGroup */ (currentPage.page)) : this[subPageInputTemplate](/** @type ArcConfigItem */ (currentPage.page))}
    </div>
    `;
  }

  /**
   * @param {ArcConfigItem} item The configuration schema.
   * @return {TemplateResult} The template for the single sub-page config item. 
   */
  [subPageInputTemplate](item) {
    if (item.type === 'password') {
      return this[subPageMaskedInputTemplate](item);
    }
    const { anypoint, outlined } = this;
    const { type, enabled, key, default: defaultValue, suffix, } = item;
    const inputType = type === 'number' ? type : 'text';
    const value = this.readValue(key, defaultValue);
    return html`
    <div class="user-input">
      <anypoint-input type="${inputType}" .disabled="${!enabled}" .value="${value}" data-path="${key}" @change="${this[inputChangeHandler]}" ?anypoint="${anypoint}" ?outlined="${outlined}">
        <label slot="label">Setting value</label>
        ${suffix ? html`<span slot="suffix">${suffix}</span>` : ''}
      </anypoint-input>
    </div>
    `;
  }

  /**
   * @param {ArcConfigItem} item The configuration schema.
   * @return {TemplateResult} The template for the single sub-page config item. 
   */
  [subPageMaskedInputTemplate](item) {
    const { anypoint, outlined } = this;
    const { type, enabled, key, default: defaultValue, suffix, } = item;
    const inputType = type === 'number' ? type : 'text';
    const value = this.readValue(key, defaultValue);
    return html`
    <div class="user-input">
      <anypoint-masked-input type="${inputType}" .disabled="${!enabled}" .value="${value}" data-path="${key}" @change="${this[inputChangeHandler]}" ?anypoint="${anypoint}" ?outlined="${outlined}">
        <label slot="label">Setting value</label>
        ${suffix ? html`<span slot="suffix">${suffix}</span>` : ''}
      </anypoint-masked-input>
    </div>
    `;
  }

  /**
   * @param {ArcConfigGroup} group The group schema.
   * @return {TemplateResult|string} The template for a sub-page that is a group of config items. 
   */
  [subPageGroupTemplate](group) {
    const { layout='list', items=[] } = group;
    if (layout === 'list') {
      return this[groupTemplate](group);
    }
    return html`
    <section class="settings-group">
      ${items.map(item => this[pageSectionItem](item))}
    </section>
    `;
  }

  /**
   * @param {ArcConfigGroup} group 
   * @returns {TemplateResult|string} The template for the settings group.
   */
  [groupTemplate](group) {
    const { name, description, enabled, kind, items=[] } = group;
    if (kind !== 'ARC#ConfigGroup' || !enabled) {
      return '';
    }
    return html`
    <section class="settings-group">
    <h3 class="settings-title">${name}</h3>
      <p class="settings-description">${description}</p>
      <div class="settings-list" role="listbox" aria-label="Configuration options for ${name}">
        ${items.map((item) => this[settingsItemTemplate](item))}
      </div>
    </section>
    `;
  }

  /**
   * @param {ArcConfigItem|ArcLinkItem|ArcConfigGroup} item
   * @returns {TemplateResult|string} The template for a single configuration item.
   */
  [settingsItemTemplate](item) {
    const typed = /** @type ArcConfigItem */ (item);
    const { kind, type } = typed;
    if (!SupportedConfigItems.includes(kind)) {
      return '';
    }
    if (kind === 'ARC#LinkItem') {
      return this[configLinkItem](/** @type ArcLinkItem */ (item));
    }
    if (kind === 'ARC#ConfigGroup') {
      return this[configGroupItem](/** @type ArcConfigGroup */ (item));
    }
    switch (type) {
      case 'boolean': return this[booleanItemTemplate](typed);
      case 'string': 
      case 'number': 
      case 'password': 
        return this[inputItemTemplate](typed);
      default: return `implement list for ${type}`;
    }
  }

  /**
   * @param {ArcLinkItem} item 
   * @returns {TemplateResult} The template for a link list item
   */
  [configLinkItem](item) {
    const { enabled, name, target, description } = item;
    const twoLine = !!description;
    const { anypoint } = this;
    return html`
    <anypoint-item ?disabled="${!enabled}" data-href="${target}" @click="${this[linkItemHandler]}">
      <anypoint-item-body ?twoline="${twoLine}" ?anypoint="${anypoint}">
        ${name}
        ${twoLine? html`<div data-secondary>${description}</div>` : ''}
      </anypoint-item-body>
      <arc-icon class="sub-page-arrow" icon="openInNew" title="Opens in a new window"></arc-icon>  
    </anypoint-item>
    `;
  }

  /**
   * @param {ArcConfigItem} item
   * @returns {TemplateResult} The template for a boolean configuration item
   */
  [booleanItemTemplate](item) {
    const { name, description, enabled, key, default: defaultValue } = item;
    const { anypoint } = this;
    const value = this.readValue(key, defaultValue);
    const twoLine = !!description;
    return html`
    <anypoint-item 
      @click="${this[toggleItemHandler]}" 
      ?disabled="${!enabled}" 
      @focus="${this[redirectToggleFocus]}" 
      data-path="${key}"
    >
      <anypoint-item-body ?twoline="${twoLine}" ?anypoint="${anypoint}">
        <div>${name}</div>
        ${twoLine? html`<div data-secondary>${description}</div>` : ''}
      </anypoint-item-body>
      <anypoint-switch
        tabindex="-1"
        .checked="${value}"
        name="${name}"
        @change="${this[toggleBooleanValue]}"
        ?anypoint="${anypoint}"
        ?disabled="${!enabled}"
        data-path="${key}"
        aria-label="Activate to toggle ${name} option"
      ></anypoint-switch>
    </anypoint-item>
    `;
  }

  /**
   * @param {ArcConfigItem} item
   * @returns {TemplateResult} The template for a configuration item with a text input
   */
  [inputItemTemplate](item) {
    const { name, description, enabled, key, default: defaultValue, enum: enumValue } = item;
    const { anypoint } = this;
    const value = this.readValue(key, defaultValue);
    const twoLine = !!description;
    return html`
    <anypoint-item 
      ?disabled="${!enabled}" 
      data-path="${key}"
    >
      <anypoint-item-body ?twoline="${twoLine}" ?anypoint="${anypoint}" @click="${this[subPageClickHandler]}">
        <div>${name}</div>
        ${twoLine? html`<div data-secondary>${description}</div>` : ''}
      </anypoint-item-body>
      ${enumValue ? this[dropdownOptions](value, enumValue, key) : this[subPageLinkItem](key)}
    </anypoint-item>
    `;
  }

  /**
   * @param {any} selected 
   * @param {any[]} values  
   * @param {string} path The settings path
   * @returns {TemplateResult} The template for the dropdown with enum values
   */
  [dropdownOptions](selected, values, path) {
    const { anypoint, outlined } = this;
    return html`
    <anypoint-dropdown-menu
      ?anypoint="${anypoint}"
      ?outlined="${outlined}"
      name="${path}"
      noLabelFloat
    >
      <label slot="label">Select option</label>
      <anypoint-listbox
        slot="dropdown-content"
        attrforselected="data-value"
        .selected="${selected}"
        ?anypoint="${anypoint}"
        data-path="${path}"
        @selected="${this[listChangeHandler]}"
      >
        ${values.map((item) => html`<anypoint-item data-value="${item}">${item}</anypoint-item>`)}
      </anypoint-listbox>
    </anypoint-dropdown-menu>
    `;
  }

  /**
   * @param {string} path The path to the setting definition
   * @returns {TemplateResult} The template for the "open sub-page" button
   */
  [subPageLinkItem](path) {
    return html`
    <anypoint-icon-button title="Open settings detail" data-path="${path}" @click="${this[subPageLinkHandler]}">
      <arc-icon class="sub-page-arrow" icon="arrowDropDown"></arc-icon>  
    </anypoint-icon-button>
    `;
  }

  /**
   * @param {ArcConfigGroup} group The configuration group to render.
   * @returns {TemplateResult}
   */
  [configGroupItem](group) {
    const { enabled, name, description, key } = group;
    const twoLine = !!description;
    const { anypoint } = this;
    return html`
    <anypoint-item ?disabled="${!enabled}">
      <anypoint-item-body ?twoline="${twoLine}" ?anypoint="${anypoint}" @click="${this[subPageClickHandler]}">
        ${name}
        ${twoLine? html`<div data-secondary>${description}</div>` : ''}
      </anypoint-item-body>
      ${this[subPageLinkItem](key)}
    </anypoint-item>
    `;
  }

  /**
   * @param {ArcConfigGroup | ArcConfigItem | ArcLinkItem} item
   * @return {TemplateResult|string} The template for an input that is rendered as a section and not a list item.
   */
  [pageSectionItem](item) {
    const { kind } = item;
    if (kind === 'ARC#LinkItem') {
      return this[configLinkItem](/** @type ArcLinkItem */ (item));
    }
    if (kind === 'ARC#ConfigGroup') {
      return this[configGroupItem](/** @type ArcConfigGroup */ (item));
    }
    const typed = /** @type ArcConfigItem */ (item);
    switch (typed.type) {
      case 'string': 
      case 'number': 
      case 'password': 
        return this[inputSectionTemplate](typed);
      case 'boolean': return this[booleanSectionTemplate](typed);
      default: return `implement section input ${typed.type}`;
    }
  }

  /**
   * @param {ArcConfigItem} item
   * @return {TemplateResult}
   */
  [inputSectionTemplate](item) {
    const { name, description } = item;
    return html`
    <div class="setting-section">
      <div class="setting-section-title">${name}</div>
      <div class="setting-section-description">${description}</div>
      ${this[subPageInputTemplate](item)}
    </div>
    `;
  }

  /**
   * @param {ArcConfigItem} item
   * @return {TemplateResult}
   */
  [booleanSectionTemplate](item) {
    return this[booleanItemTemplate](item);
    // const { name, description } = item;
    // return html`
    // <div class="setting-section">
    //   <div class="setting-section-title">${name}</div>
    //   <div class="setting-section-description">${description}</div>
    //   ${this[booleanItemTemplate](item)}
    // </div>
    // `;
  }
}
