/* eslint-disable class-methods-use-this */

/** @typedef {import('../types').AuthUiInit} AuthUiInit */
/** @typedef {import('../AuthorizationMethodElement').default} AuthorizationMethodElement */

export const changeCallback = Symbol('changeCallback');
export const renderCallback = Symbol('renderCallback');

export default class AuthUiBase {
  /**
   * @param {AuthUiInit} init
   */
  constructor(init) {
    this[renderCallback] = init.renderCallback;
    this[changeCallback] = init.changeCallback;
    /** @type AuthorizationMethodElement */
    this.target = init.target;
    /** @type boolean */
    this.readOnly = init.readOnly;
    /** @type boolean */
    this.disabled = init.disabled;
    /** @type boolean */
    this.anypoint = init.anypoint;
    /** @type boolean */
    this.outlined = init.outlined;
    /** @type boolean */
    this.authorizing = init.authorizing;

    this.changeHandler = this.changeHandler.bind(this);
    this.selectHandler = this.selectHandler.bind(this);
    this.authorize = this.authorize.bind(this);
  }

  /**
   * @param {any} state The serialized state of the UI.
   */
  // eslint-disable-next-line no-unused-vars
  restore(state) {
    // to be implemented by the child class.
    // You should NOT call `notifyChange()` here.
  }

  /**
   * @returns {any} The serialized state of the UI.
   */
  serialize() {
    return null;
  }

  /**
   * Resets the current state of the UI.
   */
  reset() {
    // to be implemented by the child class.
    // You should call `notifyChange()` when ready.
  }

  /**
   * The main function used to generate a template for the UI.
   */
  render() {
    // to be implemented by the child class.
  }

  /**
   * Sets default values for the authorization method.
   * This is called by the authorization-method element after 
   * the type is initialized.
   */
  defaults() {
    // to be implemented by the child class.
    // You should call `notifyChange()` when ready.
  }

  /**
   * A handler for the `input` event on an input element
   * @param {Event} e Original event dispatched by the input.
   */
  changeHandler(e) {
    const { name, value } = /** @type HTMLInputElement */ (e.target);
    this[name] = value;
    this.notifyChange();
  }

  /**
   * A handler for the `select` event on a dropdown element
   * @param {Event} e Original event dispatched by the input.
   */
  selectHandler(e) {
    const {
      parentElement,
      selected,
    } = /** @type HTMLOptionElement */ (e.target);
    const { name } = /** @type HTMLInputElement */ (parentElement);
    this[name] = selected;
    this.notifyChange();
  }

  /**
   * Notifies the application that the UI state has change
   */
  notifyChange() {
    this[changeCallback]();
  }

  /**
   * Notifies the application that the UI should be rendered.
   */
  async requestUpdate() {
    await this[renderCallback]();
  }

  /**
   * Performs the authorization.
   * This only applies to methods that have any authorization to perform
   * like Oauth 2.
   * @returns {Promise<any>} 
   */
  async authorize() {
    return null;
  }
}
