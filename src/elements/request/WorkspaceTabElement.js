import { LitElement, html } from 'lit-element';
import elementStyles from './styles/Tab.js';

export const pointerDownHandler = Symbol('pointerDownHandler');
export const touchStartHandler = Symbol('touchStartHandler');

export default class WorkspaceTabElement extends LitElement {
  static get styles() {
    return elementStyles;
  }

  constructor() {
    super();
    this[pointerDownHandler] = this[pointerDownHandler].bind(this);
    this[touchStartHandler] = this[touchStartHandler].bind(this);
  }

  connectedCallback() {
    super.connectedCallback();
    /* istanbul ignore else */
    if (!this.hasAttribute('role')) {
      this.setAttribute('role', 'tab');
    }
    this.addEventListener('pointerdown', this[pointerDownHandler], { passive: true });
    this.addEventListener('touchstart', this[touchStartHandler], { passive: true });
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('pointerdown', this[pointerDownHandler]);
    this.removeEventListener('touchstart', this[touchStartHandler]);
  }

  /**
   * A handler for the pointer down event.
   * It dispatches the `close` event when middle button is clicked.
   * 
   * @param {PointerEvent} e
   */
  [pointerDownHandler](e) {
    // the configuration of a middle button click which is 
    // equal to 3 fingers click on a track pad.
    if (e.button === 1 && e.buttons === 4) {
      this.dispatchEvent(new Event('close'));
    }
  }

  /**
   * A handler for the touch start event.
   * It handles actions depending on the touch configuration.
   * @param {TouchEvent} e
   */
  [touchStartHandler](e) {
    if (e.targetTouches.length === 3) {
      this.dispatchEvent(new Event('close'));
    }
  }

  render() {
    return html`
      <div class="left-decorator"></div>
      <div class="left-decorator-clip"></div>
      <slot></slot>
      <div class="right-decorator"></div>
      <div class="right-decorator-clip"></div>
    `;
  }
}
