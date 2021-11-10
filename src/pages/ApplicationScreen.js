/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable class-methods-use-this */
import { html } from 'lit-html';
import { Events, EventTypes } from '@advanced-rest-client/events';
import { ProjectModel, RequestModel, RestApiModel, AuthDataModel, HostRulesModel, VariablesModel, UrlHistoryModel, HistoryDataModel, ClientCertificateModel, WebsocketUrlHistoryModel, UrlIndexer } from '@advanced-rest-client/idb-store';
import * as Constants from '@advanced-rest-client/base/src/Constants.js';
import { ReactiveMixin } from '../mixins/ReactiveMixin.js';
import { RenderableMixin } from '../mixins/RenderableMixin.js';
import '@advanced-rest-client/base/define/alert-dialog.js';
import '@advanced-rest-client/base/resizable-elements.js';

/** @typedef {import('lit-html').TemplateResult} TemplateResult */
/** @typedef {import('@advanced-rest-client/events').Application.AppVersionInfo} AppVersionInfo */

/**
 * A base class for pages build outside the LitElement. It uses `lit-html` 
 * as the template renderer.
 * 
 * The implementation (extending this class) should override the `appTemplate()`
 * function that returns the `TemplateResult` from the `lit-html` library.
 * 
 * To reflect the changed state call the `render()` function. The function schedules
 * a micro task (through `requestAnimationFrame`) to call the render function on the template.
 * 
 * More useful option is to use the `initObservableProperties()` function that accepts a list 
 * of properties set on the base class that once set triggers the render function. The setter checks
 * whether the a value actually changed. It works well for primitives but it won't work as expected
 * for complex types.
 */
export class ApplicationScreen extends RenderableMixin(ReactiveMixin(EventTarget)) {
  constructor() {
    super();
    window.onunhandledrejection = this.unhandledRejectionHandler.bind(this);
    this.initObservableProperties('anypoint', 'loadingStatus');
    /** @type boolean */
    this.anypoint = undefined;
    this.eventTarget = window;
    /** 
     * True when the app should render mobile friendly view.
     */
    this.isMobile = false;
    /** 
     * @type {string} The loading state information.
     */
    this.loadingStatus = 'Initializing the application...';
    window.addEventListener(EventTypes.Theme.State.activated, this.themeActivateHandler.bind(this));
    this.initMediaQueries();
  }

  /**
   * Initializes media queries and observers.
   */
  initMediaQueries() {
    const mql = window.matchMedia('(max-width: 600px)');
    this.isMobile = mql.matches;
    mql.addEventListener('change', (e) => {
      this.isMobile = e.matches;
    });
  }

  /**
   * Creates a modal dialog with the error details.
   * @param {string} message The message to render
   */
  reportCriticalError(message) {
    const dialog = document.createElement('alert-dialog');
    dialog.message = message;
    dialog.modal = true;
    dialog.open();
    document.body.appendChild(dialog);
  }

  /**
   * @param {PromiseRejectionEvent} e
   */
  unhandledRejectionHandler(e) {
    /* eslint-disable-next-line no-console */
    console.error(e);
    this.reportCriticalError(e.reason);
  }

  /**
   * @param {CustomEvent} e
   */
  themeActivateHandler(e) {
    this.anypoint = e.detail === Constants.anypointTheme;
  }

  /**
   * Loads the current application theme and sets the value of `anypoint`.
   */
  async loadTheme() {
    try {
      const id = await Events.Theme.loadApplicationTheme(this.eventTarget);
      this.anypoint = id === Constants.anypointTheme;
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
    }
  }

  /**
   * Loads and returns the versions information (chrome + electron).
   * This is a safe function. In case of error it returns a default values.
   * 
   * @returns {Promise<AppVersionInfo>}
   */
  async loadVersionInfo() {
    try {
      const info = await Events.App.versionInfo(this.eventTarget);
      if (!info) {
        throw new Error(`Unhandled version request event`);
      }
      return info;
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      return {
        appVersion: 'unknown',
        chrome: 'unknown'
      };
    }
  }
  
  /**
   * @returns {TemplateResult} A template for the loader
   */
  loaderTemplate() {
    return html`
    <div class="app-loader">
      <p class="message">Preparing something spectacular</p>
      <p class="sub-message">${this.loadingStatus}</p>
    </div>
    `;
  }

  /**
   * Initializes all ARCs models.
   */
  initModels() {
    this.requestModel = new RequestModel();
    this.projectModel = new ProjectModel();
    this.restApiModel = new RestApiModel();
    this.authDataModel = new AuthDataModel();
    this.hostRulesModel = new HostRulesModel();
    this.variablesModel = new VariablesModel();
    this.urlHistoryModel = new UrlHistoryModel();
    this.historyDataModel = new HistoryDataModel();
    this.clientCertificateModel = new ClientCertificateModel();
    this.websocketUrlHistoryModel = new WebsocketUrlHistoryModel();
    this.urlIndexer = new UrlIndexer(this.eventTarget);
    this.requestModel.listen(this.eventTarget);
    this.projectModel.listen(this.eventTarget);
    this.restApiModel.listen(this.eventTarget);
    this.authDataModel.listen(this.eventTarget);
    this.hostRulesModel.listen(this.eventTarget);
    this.variablesModel.listen(this.eventTarget);
    this.urlHistoryModel.listen(this.eventTarget);
    this.historyDataModel.listen(this.eventTarget);
    this.clientCertificateModel.listen(this.eventTarget);
    this.websocketUrlHistoryModel.listen(this.eventTarget);
    this.urlIndexer.listen();
  }
}
