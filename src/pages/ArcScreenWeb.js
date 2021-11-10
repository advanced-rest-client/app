/* eslint-disable class-methods-use-this */
import { html } from "lit-html";
import { Events } from '@advanced-rest-client/events';
import '@api-client/context-menu/context-menu.js';
import { ArcScreen } from './ArcScreen.js';
import { navigatePage } from '../lib/route.js';
import '../../define/arc-application-menu.js';

export class ArcScreenWeb extends ArcScreen {
  /**
   * Handler for application command.
   *
   * @param {CustomEvent} e 
   */
  commandHandler(e) {
    const { action } = e.detail;
    switch (action) {
      case 'open-themes': this.openThemes(); break;
      case 'open-drive': this.openDrivePicker(); break;
      default: super.commandHandler(e);
    }
  }

  openThemes() {
    const url = new URL('themes.html', window.location.href);
    const ref = window.open(url, 'themes', 'width=900,height=700,resizable');
    if (!ref) {
      this.reportCriticalError('Popups are blocked for this application.');
      return;
    }
    ref.addEventListener('message', this.themeWindowMessageHandler.bind(this));
  }

  openDrivePicker() {
    navigatePage('drive-picker.html');
  }

  /**
   * @param {MessageEvent} e
   */
  themeWindowMessageHandler(e) {
    const { data } = e;
    if (data.action === 'theme-selection') {
      Events.Theme.themeActivated(this.eventTarget, data.id);
      Events.Theme.loadTheme(this.eventTarget, data.id);
    } else if (data.action === 'theme-system-preferred-change') {
      Events.Theme.loadApplicationTheme(this.eventTarget);
    }
  }

  applicationMenuTemplate() {
    return html`
    <div class="app-menu">
      <arc-application-menu>
        <div class="arc-app-menu-item" role="menuitem" data-trigger="file">File</div>
        <div class="arc-app-menu-item" role="menuitem" data-trigger="view">View</div>
        <div class="arc-app-menu-item" role="menuitem" data-trigger="request">Request</div>
        <div class="arc-app-menu-item" role="menuitem" data-trigger="workspace">Workspace</div>
        <div class="arc-app-menu-item" role="menuitem" data-trigger="help">Help</div>
      </arc-application-menu>
    </div>
    `;
  }
}
