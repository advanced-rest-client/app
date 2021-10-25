/* eslint-disable lit-a11y/click-events-have-key-events */
/* eslint-disable no-plusplus */
/* eslint-disable class-methods-use-this */
import { html, LitElement } from 'lit-element';
import { MultiSelectableMixin } from '@anypoint-web-components/awc';
import '@anypoint-web-components/awc/anypoint-dropdown-menu.js';
import '@anypoint-web-components/awc/anypoint-listbox.js';
import '@anypoint-web-components/awc/anypoint-item.js';
import '@anypoint-web-components/awc/anypoint-icon-item.js';
import '@anypoint-web-components/awc/anypoint-switch.js';
import styles from '../styles/SelectorStyles.js';

const selectable = '[type]';

export const dropdownSelected = Symbol('dropdownSelected');
export const updateSelectionState = Symbol('updateSelectionState');
export const activateDropdownHandler = Symbol('activateDropdownHandler');
export const selectedDropdownHandler = Symbol('selectedDropdownHandler');
export const dropdownItemTemplate = Symbol('dropdownItemTemplate');
export const methodSelectorTemplate = Symbol('methodSelectorTemplate');
export const notifyChange = Symbol('notifyChange');
export const methodChange = Symbol('methodChange');
export const dropdownValue = Symbol('dropdownValue');
export const testRemovedSelected = Symbol('testRemovedSelected');
export const removeItemsListeners = Symbol('removeItemsListeners');
export const addItemsListeners = Symbol('addItemsListeners');
export const ensureSingleSelection = Symbol('ensureSingleSelection');
export const selectionHandler = Symbol('selectionHandler');
export const itemsHandler = Symbol('itemsHandler');
export const processDocs = Symbol('processDocs');
export const multiEnabledHandler = Symbol('multiEnabledHandler');
export const multiEnabledClickHandler = Symbol('multiEnabledClickHandler');
export const readAuthType = Symbol('readAuthType');

/** @typedef {import('./AuthorizationMethodElement').default} AuthorizationMethod */
/** @typedef {import('@anypoint-web-components/awc').AnypointDropdownMenuElement} AnypointDropdownMenu */
/** @typedef {import('@anypoint-web-components/awc').AnypointListboxElement} AnypointListbox */
/** @typedef {import('@anypoint-web-components/awc').AnypointSwitchElement} AnypointSwitch */
/** @typedef {import('lit-element').TemplateResult} TemplateResult */

/**
 * A function that maps a value of the `type` attribute of an authorization method
 * to a label to be presented in the dropdown.
 *
 * The `attrForLabel` has higher priority of defining a custom name for the method.
 *
 * @param {AuthorizationMethod} node A node to read type from.
 * @param {string=} attrForLabel In case when the type is not recognized it uses
 * this attribute to look for the label.
 * @return {string} Label for the type.
 */
export const nodeToLabel = (node, attrForLabel) => {
  if (!node) {
    return '';
  }
  if (attrForLabel && node.hasAttribute(attrForLabel)) {
    return node.getAttribute(attrForLabel);
  }
  let { type } = node;
  if (!type && node.hasAttribute('type')) {
    type = node.getAttribute('type');
  }
  type = String(type).toLowerCase();
  switch (type) {
    case 'none': return 'None';
    case 'basic': return 'Basic';
    case 'ntlm': return 'NTLM';
    case 'digest': return 'Digest';
    case 'oauth 1': return 'OAuth 1';
    case 'oauth 2': return 'OAuth 2';
    case 'bearer': return 'Bearer';
    case 'client certificate': return 'Client certificate';
    default:
  }
  return type;
};

/**
 * 
 * @param {Event} e 
 */
function stopPropagation(e) {
  e.stopPropagation();
}

export default class AuthorizationSelectorElement extends MultiSelectableMixin(LitElement) {
  get styles() {
    return [
      styles,
    ];
  }

  get [dropdownValue]() {
    return this.shadowRoot.querySelector('anypoint-dropdown-menu');
  }

  /**
   * @return {any} Previously registered function or undefined.
   */
  get onchange() {
    return this._onChange;
  }

  /**
   * Registers listener for the `change` event
   * @param {any} value A function to be called when `change` event is
   * dispatched
   */
  set onchange(value) {
    if (this._onChange) {
      this.removeEventListener('change', this._onChange);
    }
    if (typeof value !== 'function') {
      this._onChange = null;
      return;
    }
    this._onChange = value;
    this.addEventListener('change', value);
  }

  /**
   * @return {string|string[]|null} A type attribute value of selected authorization method.
   */
  get type() {
    if (this.multi) {
      const items = /** @type AuthorizationMethod[] */ (this.selectedItems);
      return items.map((item) => this[readAuthType](item)).filter((item) => !!item);
    }
    const selected = /** @type AuthorizationMethod */ (this.selectedItem);
    return this[readAuthType](selected);
  }

  get selectable() {
    return selectable;
  }

  set selectable(value) {
    // simply ignore it.
  }

  get selected() {
    return this._selected;
  }

  set selected(value) {
    const old = this._selected;
    /* istanbul ignore if */
    if (old === value) {
      return;
    }
    this._selected = value;
    if (!this.multi) {
      this._updateSelected();
    }
    this.requestUpdate();
    this[selectionHandler]();
  }

  static get properties() {
    return {
      /**
       * Enables outlined theme.
       */
      outlined: { type: Boolean, reflect: true },
      /**
       * Enables Anypoint theme
       */
      anypoint: { type: Boolean, reflect: true },
      /**
       * An attribute to use to read value for the label to be rendered in the
       * drop down when `type` property cannot be translated to a common name.
       *
       * This attribute should be set on the child element.
       */
      attrForLabel: { type: String },
      /** 
       * When set it renders the authorization form next to the drop down.
       * Use this when there's enough screen to render the form.
       */
      horizontal: { type: Boolean, reflect: true },
    };
  }

  constructor() {
    super();
    this[itemsHandler] = this[itemsHandler].bind(this);
    this[methodChange] = this[methodChange].bind(this);

    /**
     * A value to set on a dropdown select attribute.
     *
     * Note, do not use it as a getter. It may not have the actual value.
     * This is used to force the dropdown to change a selection. However,
     * change in the UI is not handled here so the value may be different.
     * 
     * @type {number}
     */
    this[dropdownSelected] = undefined;
    this.anypoint = false;
    this.outlined = false;
    this.horizontal = false;
    this.multi = false;
    /**
     * @type {string}
     */
    this.attrForLabel = undefined;
  }

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener('itemschange', this[itemsHandler]);
    this[updateSelectionState]();
    if (this.attrForSelected) {
      this[selectionHandler]();
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('itemschange', this[itemsHandler]);
  }

  firstUpdated() {
    const { items } = this;
    if (items && items.length) {
      this[addItemsListeners](items);
      this[itemsHandler]();
    }
    this[dropdownSelected] = this._valueToIndex(this.selected);
    this[processDocs]();
    this.requestUpdate();
  }
  
  /**
   * Calls `validate()` function on currently selected authorization method.
   * @return {Boolean|null} Result of calling `validate()` function on selected
   * method or `null` if no selection or selected method does not implement this
   * function.
   */
  validate() {
    let items = /** @type AuthorizationMethod[] */ ([]);
    if (this.multi) {
      items = this.selectedItems;
    } else {
      items.push(/** @type AuthorizationMethod */ (this.selectedItem));
    }
    return !items.some((auth) => auth && auth.validate ? !auth.validate() : false);
  }

  /**
   * A handler for `itemschange` event dispatched by the selectable mixin.
   * It manages selection state when items changed.
   */
  [itemsHandler]() {
    this[ensureSingleSelection]();
    this[updateSelectionState]();
    this.requestUpdate();
  }

  /**
   * Handler for `selectedchange` event dispatched by the selectable mixin.
   *
   * Updates selection state and sets/removed `hidden` attribute on the children.
   */
  [selectionHandler]() {
    this[updateSelectionState]();
    this[processDocs]();
    this[dropdownSelected] = this._valueToIndex(this.selected);
  }

  /**
   * A handler for the `selectedchange` event dispatched on the dropdown
   * element.
   * It maps selected index on the dropdown to currently `selected` value.
   * Note, when `attrForSelected` is used then it won't be the index of selected
   * item.
   *
   * @param {CustomEvent} e
   */
  [selectedDropdownHandler](e) {
    const node = /** @type AnypointListbox */ (e.target);
    this.selected = this._indexToValue(/** @type number */ (node.selected));
    this[notifyChange]();
    this.requestUpdate();
  }

  /**
   * Handler for the `activate` event dispatched by the dropdown.
   * It ensures that the dropdown is closed when clicked on already selected item.
   * @param {CustomEvent} e
   */
  [activateDropdownHandler](e) {
    const node = /** @type HTMLElement */ (e.target);
    const parent = /** @type AnypointDropdownMenu */ (node.parentElement);
    parent.close();
  }

  /**
   * Updates children to add or remove the `hidden` attribute depending on current selection.
   */
  [updateSelectionState]() {
    const { items, selected } = this;
    if (!items) {
      return;
    }
    for (let i = 0, len = items.length; i < len; i++) {
      const node = items[i];
      if (this._valueForItem(node) === selected) {
        if (node.hasAttribute('hidden')) {
          node.removeAttribute('hidden');
        }
      } else if (!node.hasAttribute('hidden')) {
        node.setAttribute('hidden', '');
      }
    }
  }

  /**
   * Ensures that authorization method is selected if only one item is
   * recognized.
   */
  [ensureSingleSelection]() {
    const { items } = this;
    if (!items) {
      return;
    }
    if (items.length === 0 || items.length > 1) {
      return;
    }
    const selected = this._indexToValue(0);
    this.select(selected);
    this.selected = selected;
    this[dropdownSelected] = 0;
    this[selectionHandler]();
  }

  /**
   * Overrides `_mutationHandler()` from the selectable mixin to add/remove
   * `change` event on authorization methods being added / removed.
   * @param {Array<MutationRecord>} mutationsList
   */
  _mutationHandler(mutationsList) {
    super._mutationHandler(mutationsList);
    for(const mutation of mutationsList) {
      if (mutation.type === 'childList') {
        if (mutation.removedNodes.length) {
          this[testRemovedSelected](mutation.removedNodes);
          this[removeItemsListeners](mutation.removedNodes);
          this.requestUpdate();
        } else if (mutation.addedNodes.length) {
          this[addItemsListeners](mutation.addedNodes);
        }
      }
    }
  }

  /**
   * Tests whether a node in a list of removed nodes represents currently selected
   * authorization method. If so then it removes current selection.
   * This is to ensure the label in the dropdown is updated when the current selection change.
   *
   * @param {NodeList} nodesList A list of removed nodes.
   */
  [testRemovedSelected](nodesList) {
    const dropdown = this[dropdownValue];
    if (!dropdown) {
      return;
    }
    const { value } = dropdown;
    const { attrForLabel } = this;
    for (let i = 0, len = nodesList.length; i < len; i++) {
      const candidate = /** @type AuthorizationMethod */ (nodesList[i]);
      const { type } = candidate;
      if (type && nodeToLabel(candidate, attrForLabel) === value) {
        this.select(undefined);
        this.selected = undefined;
        dropdown._selectedItem = undefined;
        this[dropdownSelected] = undefined;
        return;
      }
    }
  }

  /**
   * Removes `change` observer from passed nodes.
   *
   * @param {Array<Node>|NodeList} nodes List of nodes to remove event listener from.
   */
  [removeItemsListeners](nodes) {
    for (let i = 0; i < nodes.length; i++) {
      nodes[i].removeEventListener('change', this[methodChange]);
    }
  }

  /**
   * Adds `change` observer to passed nodes.
   * It is safe to call it more than once on the same nodes list as it removes
   * the event listener if it previously was registered.
   *
   * @param {Array<Node>|NodeList} nodes List of nodes to add event listener to.
   */
  [addItemsListeners](nodes) {
    Array.from(nodes).forEach((node) => {
      node.removeEventListener('change', this[methodChange]);
      node.addEventListener('change', this[methodChange]);
    });
  }

  /**
   * Handler for authorization method `change` event that re-targets
   * the event to be dispatched from this element.
   */
  [methodChange]() {
    this[notifyChange]();
  }

  /**
   * Dispatches non-bubbling `change` event.
   */
  [notifyChange]() {
    this.dispatchEvent(new CustomEvent('change'));
  }
  
  /**
   * It checks whether the current selection has an element that describes it via 
   * the ARIA attribute, and if so then it renders it in the slot.
   */
  [processDocs]() {
    const slot = /** @type HTMLSlotElement */ (this.shadowRoot.querySelector('slot[name="aria"]'));
    if (!slot) {
      return;
    }
    const slotted = slot.assignedElements();
    if (slotted.length === 0) {
      return;
    }
    const { selected } = this;
    const selectedItem = /** @type AuthorizationMethod */ (this.items[selected]);
    if (!selectedItem) {
      slotted.forEach((node) => node.setAttribute('hidden', ''));
      return;
    }
    const id = selectedItem.getAttribute('aria-describedby');
    slotted.forEach((node) => {
      const ariaId = node.getAttribute('id');
      node.toggleAttribute('hidden', ariaId !== id);
    });
  }

  /**
   * @param {Event} e 
   */
  [multiEnabledClickHandler](e) {
    e.preventDefault();
    e.stopPropagation();
  }

  /**
   * @param {Event} e 
   */
  [multiEnabledHandler](e) {
    e.preventDefault();
    e.stopPropagation();
    const node = /** @type AnypointSwitch */ (e.target);
    const selected = Number(this._indexToValue(Number(node.dataset.index)));
    if (Number.isNaN(selected)) {
      return;
    }
    const { selectedValues } = this;
    const isSelected = selectedValues.includes(selected);
    if (isSelected && !node.checked) {
      const index = selectedValues.indexOf(selected);
      selectedValues.splice(index, 1);
    } else if (!isSelected && node.checked) {
      selectedValues.push(selected);
    } else {
      return;
    }
    this.selectedValues = [...selectedValues];
    this[notifyChange]();
  }

  /**
   * @param {AuthorizationMethod} item The element to read the value from
   * @returns {string|null}
   */
  [readAuthType](item) {
    if (!item) {
      return null;
    }
    if (item.type) {
      return item.type;
    }
    // because [type] is the only selectable children this has to have
    // `type` attribute
    return item.getAttribute('type');
  }

  render() {
    return html`
    <style>${this.styles}</style>
    <div class="container">
      <div class="selector">
        ${this[methodSelectorTemplate]()}
        <slot name="aria"></slot>
      </div>
      <div class="auth" @click="${stopPropagation}">
        <slot></slot>
      </div>
    </div>
    `;
  }

  /**
   * @returns {TemplateResult|string} The template for the drop down selector.
   */
  [methodSelectorTemplate]() {
    const { anypoint, outlined } = this;
    const children = /** @type AuthorizationMethod[] */ (this.items);
    if (!children || !children.length) {
      return '';
    }
    const selected = this[dropdownSelected];
    return html`
    <anypoint-dropdown-menu
      aria-label="Activate to select authorization method"
      role="listbox"
      ?anypoint="${anypoint}"
      ?outlined="${outlined}"
      fitPositionTarget
    >
      <label slot="label">Select authorization</label>
      <anypoint-listbox
        slot="dropdown-content"
        tabindex="-1"
        .selected="${selected}"
        @selected="${this[selectedDropdownHandler]}"
        @activate="${this[activateDropdownHandler]}"
        ?anypoint="${anypoint}"
        class="auth-listbox"
        role="group"
      >
        ${children.map((item, index) => this[dropdownItemTemplate](item, index))}
      </anypoint-listbox>
    </anypoint-dropdown-menu>
    `;
  }

  /**
   * @param {AuthorizationMethod} item The child element
   * @param {number} index The index of the item in the `items` array.
   * @returns {TemplateResult} The template for the drop down item.
   */
  [dropdownItemTemplate](item, index) {
    const { anypoint, attrForLabel, multi, selectedValues } = this;
    const label = nodeToLabel(item, attrForLabel)
    if (multi) {
      const checked = selectedValues.includes(index);
      return html`
      <anypoint-icon-item ?anypoint="${anypoint}" role="option" aria-selected="${checked ? 'true' : 'false'}">
        <anypoint-switch 
          slot="item-icon" 
          .checked="${checked}"
          @click="${this[multiEnabledClickHandler]}" 
          @change="${this[multiEnabledHandler]}" 
          data-index="${index}"
        ></anypoint-switch> 
        ${label}
      </anypoint-icon-item>`;
    }
    return html`
    <anypoint-item
      data-label="${label}"
      ?anypoint="${anypoint}"
    >${label}</anypoint-item>`;
  }
}
