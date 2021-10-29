/* eslint-disable class-methods-use-this */
import { html } from 'lit-html';
import { Events } from '@advanced-rest-client/events';
import '@anypoint-web-components/awc/anypoint-dropdown-menu.js';
import '@anypoint-web-components/awc/anypoint-listbox.js';
import '@anypoint-web-components/awc/anypoint-item.js';
import '@anypoint-web-components/awc/anypoint-item-body.js';
import '@anypoint-web-components/awc/anypoint-button.js';
import { ApplicationScreen } from './ApplicationScreen.js';

/** @typedef {import('lit-html').TemplateResult} TemplateResult */
/** @typedef {import('@anypoint-web-components/awc').AnypointListboxElement} AnypointListboxElement */

export class AnalyticsConsentScreen extends ApplicationScreen {
  constructor() {
    super();

    this.selected = 0;
  }

  async initialize() {
    await this.loadTheme();
    this.render();
  }

  /**
   * @param {Event} e 
   */
  selectionHandler(e) {
    const list = /** @type AnypointListboxElement */ (e.target);
    this.selected = /** @type number */ (list.selected);
  }

  async saveState() {
    const cnf = await Events.Config.readAll(this.eventTarget);
    cnf.privacy = cnf.privacy || {};
    cnf.privacy.telemetry = false;
    if (this.selected === 1) {
      cnf.privacy.exceptionsOnly = true;
    } else {
      cnf.privacy.exceptionsOnly = false;
    }
    if (this.selected === 0) {
      cnf.privacy.telemetry = true;
    }
    await Events.Config.update(this.eventTarget, 'privacy.telemetry', cnf.privacy.telemetry);
    await Events.Config.update(this.eventTarget, 'privacy.exceptionsOnly', cnf.privacy.exceptionsOnly);
    Events.Telemetry.State.set(this.eventTarget);
  }

  appTemplate() {
    return html`
    ${this.headerTemplate()}
    <div class="content">
      <main>
        <h2>Welcome to Advanced REST Client!</h2>
        <p class="intro">Your privacy is important to us. You can limit or completely disable anonymous usage statistics for the application.</p>
        <p>The analytics data are processed for usage analysis which helps us make design and development decisions. <b>We do not share this data with anyone.</b></p>
        <p>You can read our privacy statement in the <a target="_blank" href="https://docs.google.com/document/d/1BzrKQ0NxFXuDIe2zMA-0SZBNU0P46MHr4GftZmoLUQU/edit">Privacy policy</a> document.</p>

        <div class="selector">
          <anypoint-dropdown-menu fitPositionTarget class="options">
            <label slot="label">Select anonymous data collection level</label>
            <anypoint-listbox slot="dropdown-content" selected="${this.selected}" @selected="${this.selectionHandler}">
              <anypoint-item> 
                <anypoint-item-body twoline=""> 
                  <div>Limited usage statistics</div> 
                  <div data-secondary="">Opened screen names, few actions triggered, exceptions.</div> 
                </anypoint-item-body> 
              </anypoint-item>
              <anypoint-item> 
                <anypoint-item-body twoline=""> 
                  <div>Exceptions only</div> 
                  <div data-secondary="">Only collected when an exception occurs. No user data is included.</div> 
                </anypoint-item-body> 
              </anypoint-item>
              <anypoint-item> 
                <anypoint-item-body twoline=""> 
                  <div>No consent</div> 
                  <div data-secondary="">It makes us sad but we respect your decision.</div> 
                </anypoint-item-body> 
              </anypoint-item>
            </anypoint-listbox>
          </anypoint-dropdown-menu>
          <p class="secondary-info">You can always change it later in the application settings.</p>
        </div>

        <div class="action-button">
          <anypoint-button emphasis="high" @click="${this.saveState}">Save and open the application</anypoint-button>
        </div>
      </main>
    </div>
    `;
  }

  /**
   * @returns {TemplateResult|string} The template for the header
   */
  headerTemplate() {
    return html`
    <header>
      Advanced REST Client by MuleSoft.
    </header>`;
  }
}
