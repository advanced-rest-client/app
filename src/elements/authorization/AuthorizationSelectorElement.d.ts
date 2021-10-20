import { AnypointDropdownMenuElement, MultiSelectableMixin } from "@anypoint-web-components/awc";
import { LitElement, TemplateResult } from "lit-element";
import AuthorizationMethod from "./AuthorizationMethodElement";

export declare const dropdownSelected: unique symbol;
export declare const updateSelectionState: unique symbol;
export declare const activateDropdownHandler: unique symbol;
export declare const selectedDropdownHandler: unique symbol;
export declare const dropdownItemTemplate: unique symbol;
export declare const methodSelectorTemplate: unique symbol;
export declare const notifyChange: unique symbol;
export declare const methodChange: unique symbol;
export declare const dropdownValue: unique symbol;
export declare const testRemovedSelected: unique symbol;
export declare const removeItemsListeners: unique symbol;
export declare const addItemsListeners: unique symbol;
export declare const ensureSingleSelection: unique symbol;
export declare const selectionHandler: unique symbol;
export declare const itemsHandler: unique symbol;
export declare const processDocs: unique symbol;
export declare const multiEnabledHandler: unique symbol;
export declare const multiEnabledClickHandler: unique symbol;
export declare const readAuthType: unique symbol;

/**
 * A function that maps a value of the `type` attribute of an authorization method
 * to a label to be presented in the dropdown.
 *
 * The `attrForLabel` has higher priority of defining a custom name for the method.
 *
 * @param node A node to read type from.
 * @param attrForLabel In case when the type is not recognized it uses this attribute to look for the label.
 * @returns Label for the type.
 */
export declare function nodeToLabel(node: AuthorizationMethod, attrForLabel?: string): string;

/**
 * @fires change When configuration change
 * @slot - Authorization method to be rendered. Must have `type` attribute to be rendered.
 * @slot aria - For description of the selected method. Recognized by `aria-describedby` property of the auth method
 */
export default class AuthorizationSelectorElement extends MultiSelectableMixin(LitElement) {
  get [dropdownValue](): AnypointDropdownMenuElement;
  onchange: EventListener;
  get type(): string|string[]|null;
  selectable: string;

  /**
   * Enables outlined theme.
   * @attribute
   */
  outlined: boolean;
  /**
   * Enables Anypoint theme.
   * @attribute
   */
  anypoint: boolean;
  /**
   * An attribute to use to read value for the label to be rendered in the
   * drop down when `type` property cannot be translated to a common name.
   *
   * This attribute should be set on the child element.
   * 
   * @attribute
   */
  attrForLabel: string;

  /** 
   * When set it renders the authorization form next to the drop down.
   * Use this when there's enough screen to render the form.
   * 
   * @attribute
   */
  horizontal: boolean;

  [dropdownSelected]: number;

  constructor();

  connectedCallback(): void;
  disconnectedCallback(): void;
  firstUpdated(): void;

  /**
   * Calls `validate()` function on currently selected authorization method.
   *
   * @returns Result of calling `validate()` function on selected
   * method or `null` if no selection or selected method does not implement this
   * function.
   */
  validate(): boolean;

  /**
   * A handler for `itemschange` event dispatched by the selectable mixin.
   * It manages selection state when items changed.
   */
  [itemsHandler](): void;

  /**
   * Handler for `selectedchange` event dispatched by the selectable mixin.
   *
   * Updates selection state and sets/removed `hidden` attribute on the children.
   */
  [selectionHandler](): void;

  /**
   * A handler for the `selectedchange` event dispatched on the dropdown
   * element.
   * It maps selected index on the dropdown to currently `selected` value.
   * Note, when `attrForSelected` is used then it won't be the index of selected
   * item.
   */
  [selectedDropdownHandler](e: CustomEvent|null): void;

  /**
   * Handler for the `activate` event dispatched by the dropdown.
   * It ensures that the dropdown is closed when clicked on already selected item.
   */
  [activateDropdownHandler](e: CustomEvent|null): void;

  /**
   * Updates children to add or remove the `hidden` attribute depending on current selection.
   */
  [updateSelectionState](): void;

  /**
   * Ensures that authorization method is selected if only one item is
   * recognized.
   */
  [ensureSingleSelection](): void;

  /**
   * Overrides `_mutationHandler()` from the selectable mixin to add/remove
   * `change` event on authorization methods being added / removed.
   */
  _mutationHandler(mutationsList: Array<MutationRecord>): void;

  /**
   * Tests whether a node in a list of removed nodes represents currently selected
   * authorization method. If so then it removes current selection.
   * This is to ensure the label in the dropdown is updated when current selection change.
   *
   * @param nodesList A list of removed nodes.
   */
  [testRemovedSelected](nodesList: NodeList): void;

  /**
   * Removes `change` observer from passed nodes.
   *
   * @param nodes List of nodes to remove event listener from.
   */
  [removeItemsListeners](nodes: Array<Node>|NodeList): void;

  /**
   * Adds `change` observer to passed nodes.
   * It is safe to call it more than once on the same nodes list as it removes
   * the event listener if it previously was registered.
   *
   * @param nodes List of nodes to add event listener to.
   */
  [addItemsListeners](nodes: Array<Node>|NodeList): void;

  /**
   * Handler for authorization method `change` event that re-targets
   * the event to be dispatched from this element.
   */
  [methodChange](): void;

  /**
   * Dispatches non-bubbling `change` event.
   */
  [notifyChange](): void;
  
  /**
   * It checks whether the current selection has an element that describes it via 
   * the ARIA attribute, and if so then it renders it in the slot.
   */
  [processDocs](): void;

  [multiEnabledClickHandler](e: Event): void;

  [multiEnabledHandler](e: Event): void;

  /**
   * @param item The element to read the value from
   */
  [readAuthType](item: AuthorizationMethod): string|null;

  render(): TemplateResult;
  [methodSelectorTemplate](): TemplateResult|string;
  [dropdownItemTemplate](item: AuthorizationMethod): TemplateResult;
}
