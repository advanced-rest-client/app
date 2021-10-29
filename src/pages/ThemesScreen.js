/* eslint-disable class-methods-use-this */
/* eslint-disable no-param-reassign */
import { html } from 'lit-html';
import '@anypoint-web-components/awc/anypoint-dropdown-menu.js';
import '@anypoint-web-components/awc/anypoint-listbox.js';
import '@anypoint-web-components/awc/anypoint-item.js';
import '@anypoint-web-components/awc/anypoint-icon-item.js';
import '@anypoint-web-components/awc/anypoint-input.js';
import '@anypoint-web-components/awc/anypoint-switch.js';
import '@advanced-rest-client/icons/arc-icon.js';
import { Events } from '@advanced-rest-client/events';
import { ApplicationScreen } from './ApplicationScreen.js';
import { defaultTheme, anypointTheme } from '../Constants.js';

/** @typedef {import('lit-html').TemplateResult} TemplateResult */
/** @typedef {import('@advanced-rest-client/events').Theme.InstalledTheme} InstalledTheme */
/** @typedef {import('@anypoint-web-components/awc').AnypointListboxElement} AnypointListbox */

export class ThemesScreen extends ApplicationScreen {
  /**
   * @return {Boolean} `true` if selected theme is one of default themes.
   */
   get isDefaultTheme() {
    const { themes, activeTheme } = this;
    if (!themes || !activeTheme || !themes.length) {
      return true;
    }
    const item = themes.find((info) => info.name === activeTheme);
    if (!item) {
      return false;
    }
    if (typeof item.isDefault !== 'boolean') {
      return false;
    }
    return item.isDefault;
  }

  constructor() {
    super();

    this.initObservableProperties(
      'themes', 'activeTheme', 'installPending', 'systemPreferred',
    );
    this.installPending = false;
    this.systemPreferred = true;
    /**
     * @type {string}
     */
    this.activeTheme = undefined;
    /**
     * @type {InstalledTheme[]}
     */
    this.themes = undefined;

    this.installThemeName = '';
  }

  async initialize() {
    await this.refresh();
    await Events.Theme.loadApplicationTheme(this.eventTarget);
    this.render();
  }

  async refresh() {
    const info = await Events.Theme.readSate(this.eventTarget);
    if (!info) {
      this.reportCriticalError('Unable to read application themes list.');
      return;
    }
    const { kind, themes, active, systemPreferred } = info;
    if (kind !== 'ARC#ThemeInfo') {
      this.reportCriticalError('Unknown themes settings format.');
      return;
    }
    this.themes = themes;
    this.activeTheme = active || defaultTheme;
    this.anypoint = this.activeTheme === anypointTheme;
    this.systemPreferred = systemPreferred || false;
  }

  /**
   * Handler for the dropdown selection event. Activates the selected theme.
   * @param {Event} e
   */
  async _selectionHandler(e) {
    const list = /** @type AnypointListbox */ (e.target);
    const { selected } = list;
    if (selected === this.activeTheme) {
      return;
    }
    const index = this.themes.findIndex((i) => i.name === selected);
    if (index === -1) {
      return;
    }
    this.activeTheme = String(selected);
    await Events.Theme.activate(this.eventTarget, this.activeTheme);
    await Events.Theme.loadTheme(this.eventTarget, this.activeTheme);
    this.anypoint = this.activeTheme === anypointTheme;
  }

  _themeNameHandler(e) {
    this.installThemeName = e.target.value;
  }

  async _installHandler() {
    const { installThemeName } = this;
    if (!installThemeName) {
      return;
    }
    this.installPending = true;
    try {
      await Events.Theme.install(this.eventTarget, installThemeName);
      await this.refresh();
      await Events.Theme.loadTheme(this.eventTarget, this.activeTheme);
    } catch (e) {
      this.reportCriticalError(e.message);
    }
    this.installPending = false;
  }

  async _uninstallHandler() {
    if (this.isDefaultTheme) {
      this.reportCriticalError('Refusing to delete a default theme');
      return;
    }
    this.installPending = true;
    try {
      await Events.Theme.uninstall(this.eventTarget, this.activeTheme);
      await Events.Theme.activate(this.eventTarget, defaultTheme);
      await this.refresh();
      await Events.Theme.loadTheme(this.eventTarget, this.activeTheme);
    } catch (e) {
      this.reportCriticalError(e.message);
    }
    this.installPending = false;
  }

  async _ignoreSysPrefChange(e) {
    const {checked} = e.target;
    if (checked === this.systemPreferred) {
      return;
    }
    this.systemPreferred = checked;
    try {
      await Events.Theme.setSystemPreferred(this.eventTarget, checked);
      await Events.Theme.loadApplicationTheme(this.eventTarget);
    } catch (error) {
      this.reportCriticalError(error.message);
      this.systemPreferred = !checked;
    }
  }

  appTemplate() {
    return html`
    ${this.headerTemplate()}
    <section class="themes-content">
      ${this.selectorTemplate()}
      ${this.systemPrefsTemplate()}
      ${this.addTemplate()}
    </section>
    `;
  }

  headerTemplate() {
    return html`<header><h2 class="title">Themes</h2></header>`;
  }

   /**
   * @returns {TemplateResult} The template for the drop down selector with the remove option.
   */
  selectorTemplate() {
    return html`
    <section class="theme-selector">
      <div class="selection-actions">
        ${this.selectionDropdownTemplate()}
        ${this.removeThemeTemplate()}
      </div>
    </section>`;
  }

  /**
   * @returns {TemplateResult} The template for the drop down selector.
   */
  selectionDropdownTemplate() {
    const { anypoint, activeTheme, themes=[] } = this;
    return html`
    <anypoint-dropdown-menu
      ?anypoint="${anypoint}"
      horizontalAlign="left"
      fitPositionTarget
    >
      <label slot="label">Active theme</label>
      <anypoint-listbox
        slot="dropdown-content"
        ?anypoint="${anypoint}"
        attrForSelected="data-id"
        attrForItemTitle="data-label"
        .selected="${activeTheme}"
        @selected="${this._selectionHandler}"
      >
        ${themes.map((item) => this.selectionItemTemplate(item))}
      </anypoint-listbox>
    </anypoint-dropdown-menu>`;
  }

  /**
   * @param {InstalledTheme} item
   * @returns {TemplateResult} The template for the drop down item.
   */
  selectionItemTemplate(item) {
    const title = item.title || item.name;
    return html`
    <anypoint-item
      data-id="${item.name}"
      data-label="${title}"
      ?anypoint="${this.anypoint}"
    >
      <anypoint-item-body ?twoLine="${!!item.description}">
        <div>${title}</div>
        ${item.description ? html`<div data-secondary>${item.description}</div>` : ''}
      </anypoint-item-body>
    </anypoint-item>
    `;
  }

  /**
   * @returns {TemplateResult|string} The template for the uninstall icon
   */
  removeThemeTemplate() {
    if (this.isDefaultTheme) {
      return '';
    }
    const { anypoint } = this;
    return html`
    <anypoint-icon-button
      class="action-icon"
      data-action="delete"
      title="Remove theme from ARC"
      aria-label="Activate to remove the theme"
      ?anypoint="${anypoint}"
      @click="${this._uninstallHandler}"
    >
      <arc-icon icon="deleteIcon"></arc-icon>
    </anypoint-icon-button>`;
  }

  systemPrefsTemplate() { 
    const { systemPreferred } = this;
    return html`
    <div class="ignore-system-prefs">
      <anypoint-switch .checked="${systemPreferred}" @change="${this._ignoreSysPrefChange}">
        System preferred theme
      </anypoint-switch>
    </div>
    `;
  }

  /**
   * @returns {TemplateResult|string} The template for the install section
   */
  addTemplate() {
    const { anypoint, installPending } = this;
    return html`
    <section class="add-theme">
      <h3>Install theme</h3>
      <p>
        Install new theme by providing its NPM name, GitHub repository as
        <code>owner/name#branch</code>,
        or absolute path to the theme on your local filesystem.
      </p>
      <div class="add-form">
        <anypoint-input
          ?anypoint="${anypoint}"
          ?disabled="${installPending}"
          .value="${this.installThemeName}"
          @change="${this._themeNameHandler}"
        >
          <label slot="label">Theme to install</label>
        </anypoint-input>
        <anypoint-button
          ?anypoint="${anypoint}"
          ?disabled="${installPending}"
          @click="${this._installHandler}"
        >Install</anypoint-button>
      </div>
      <progress ?hidden="${!installPending}"></progress>
    </section>
    `;
  }
}
