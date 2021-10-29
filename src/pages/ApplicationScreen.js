/* eslint-disable class-methods-use-this */
import { Events } from '@advanced-rest-client/events';
import { ReactiveMixin } from '../mixins/ReactiveMixin.js';
import { RenderableMixin } from '../mixins/RenderableMixin.js';
import { anypointTheme } from '../Constants.js';
import '../../define/alert-dialog.js';

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
    this.initObservableProperties('anypoint');
    /** @type boolean */
    this.anypoint = undefined;
    this.eventTarget = document.body;
    /** 
     * True when the app should render mobile friendly view.
     */
    this.isMobile = false;
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
   * Loads the current application theme and sets the value of `anypoint`.
   */
  async loadTheme() {
    try {
      const id = await Events.Theme.loadApplicationTheme(this.eventTarget);
      this.anypoint = id === anypointTheme;
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
}
