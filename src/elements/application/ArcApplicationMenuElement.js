/* eslint-disable class-methods-use-this */
/* eslint-disable lit-a11y/click-events-have-key-events */
import { LitElement, html, css } from 'lit-element';
import { Events } from '@advanced-rest-client/events';
import { MenubarMixin } from '@anypoint-web-components/awc';
import fileCommands from '../../menu/web/FileMenu.js';
import viewCommands from '../../menu/web/ViewMenu.js';
import requestCommands from '../../menu/web/RequestMenu.js';
import workspaceCommands from '../../menu/web/WorkspaceMenu.js';
import helpCommands from '../../menu/web/HelpMenu.js';

/** @typedef {import('@api-client/context-menu').ContextMenuCommand} ContextMenuCommand */
/** @typedef {import('@api-client/context-menu').MenuItem} MenuItem */

export default class ArcApplicationMenuElement extends MenubarMixin(LitElement) {
  static get styles() {
    return css`
    :host {
      display: block;
    }

    #tabsContent {
      margin: 12px 20px;
    }

    ::slotted(.arc-app-menu-item) {
      display: inline-block;
      border-radius: 4px;
      font-size: 14px;
      letter-spacing: .2px;
      padding: 4px 6px;
      box-sizing: border-box;
      border: 1px solid transparent;
    }

    ::slotted(.arc-app-menu-item:hover) {
      background-color: rgb(224, 224, 224);
    }

    ::slotted(.arc-app-menu-item.active) {
      background-color: #ceead6;
    }
    `;
  }

  constructor() {
    super();
    this.menuTriggerHandler = this.menuTriggerHandler.bind(this);
    this.menuClosedHandler = this.menuClosedHandler.bind(this);
  }

  /**
   * @param {Event} e
   */
  clickHandler(e) {
    const node = /** @type HTMLElement */ (e.target);
    if (!node.classList || !node.classList.contains('arc-app-menu-item')) {
      return;
    }
    this.trigger(node);
  }

  /**
   * Triggers a menu
   * @param {HTMLElement} node
   */
  trigger(node) {
    const { trigger } = node.dataset;
    if (!trigger) {
      return;
    }
    this.destroy();
    const commands = this.getCommands(trigger);
    const menu = document.createElement('context-menu');
    menu.classList.add('app-floating-menu');
    menu.dynamicAlign = true;
    menu.verticalAlign = 'top';
    menu.verticalOffset = 26;
    menu.horizontalAlign = 'left';
    menu.positionTarget = node;
    menu.commands = commands;
    document.body.appendChild(menu);
    menu.opened = true;
    this.currentMenu = menu;
    menu.focus();
    menu.addEventListener('trigger', this.menuTriggerHandler);
    menu.addEventListener('closed', this.menuClosedHandler);
  }

  /**
   * Removes the currently rendered menu.
   */
  destroy() {
    if (!this.currentMenu) {
      return;
    }
    document.body.removeChild(this.currentMenu);
    this.currentMenu.removeEventListener('trigger', this.menuTriggerHandler);
    this.currentMenu.removeEventListener('closed', this.menuClosedHandler);
    this.currentMenu = undefined;
  }

  menuClosedHandler() {
    this.destroy();
  }

  /**
   * Handler for the `trigger` event dispatched by the menu
   * @param {CustomEvent} e
   */
  menuTriggerHandler(e) {
    const { command } = e.detail;
    const cmd = /** @type MenuItem */ (command);
    if (cmd.id.startsWith('application:')) {
      Events.App.command(document.body, cmd.id.replace('application:', ''));
    } else if (cmd.id.startsWith('request:')) {
      Events.App.requestAction(document.body, cmd.id.replace('request:', ''));
    }
    this.destroy();
  }

  /**
   * @param {string} trigger
   * @returns {MenuItem[]} 
   */
  getCommands(trigger) {
    switch(trigger) {
      case 'file': return fileCommands;
      case 'view': return viewCommands;
      case 'request': return requestCommands;
      case 'workspace': return workspaceCommands;
      case 'help': return helpCommands;
      default: throw new Error(`Unknown menu type: ${trigger}`);
    }
  }

  render() {
    return html`
    <div id="tabsContent"><slot @click="${this.clickHandler}"></slot></div>
    `;
  }
}
