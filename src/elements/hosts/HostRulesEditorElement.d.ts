import { LitElement, TemplateResult } from 'lit-element';
import { HostRule, DataExport, ARCHostRuleDeletedEvent, ARCHostRuleUpdatedEvent, ARCModelStateDeleteEvent } from '@advanced-rest-client/events';

export declare const sheetClosedHandler: unique symbol;
export declare const acceptExportOptions: unique symbol;
export declare const cancelExportOptions: unique symbol;
export declare const listTemplate: unique symbol;
export declare const listItemTemplate: unique symbol;
export declare const itemToggleTemplate: unique symbol;
export declare const itemNameInput: unique symbol;
export declare const itemValueInput: unique symbol;
export declare const itemRemoveTemplate: unique symbol;
export declare const removeItemHandler: unique symbol;
export declare const enabledHandler: unique symbol;
export declare const propertyInputHandler: unique symbol;
export declare const ruleUpdatedHandler: unique symbol;
export declare const ruleDeletedHandler: unique symbol;
export declare const addTemplate: unique symbol;
export declare const addItemHandler: unique symbol;
export declare const clearDialogResultHandler: unique symbol;
export declare const exportAllFile: unique symbol;
export declare const exportRules: unique symbol;
export declare const clearDialogTemplate: unique symbol;
export declare const exportOptionsTemplate: unique symbol;
export declare const unavailableTemplate: unique symbol;
export declare const testerTemplate: unique symbol;
export declare const busyTemplate: unique symbol;
export declare const headerTemplate: unique symbol;
export declare const deselectMainMenu: unique symbol;
export declare const deleteAllClick: unique symbol;
export declare const onLearnMoreHandler: unique symbol;
export declare const handleException: unique symbol;
export declare const dataImportHandler: unique symbol;
export declare const dataDestroyHandler: unique symbol;

/**
 * An element to render host rules mapping editor.
 *
 * Host rules mapping allow ARC to redirect connection from one URI to another
 * without changing the `host` header value. This element allows to enter mapping
 * rules and to test them against arbitrary URL.
 *
 * ### Data model
 *
 * The `items` property accepts an array of the following objects:
 *
 * ```javascript
 * {
 *    from: String, // The from rule (may contain asterisks)
 *    to: String, // replacement value
 *    enabled: Boolean, // if false the rule is ignored
 *    comment: String // optional rule description
 * }
 * ```
 */
export default class HostRulesEditorElement extends LitElement {
  /**
   * List of saved items restored from the datastore.
   */
  items?: HostRule.ARCHostRule[];
  /** 
   * True when loading data from the datastore.
   * @attribute
   */
  loading: boolean;
  /**
   * If true the rules tester is visible.
   * @attribute
   */
  rulesTesterOpened: boolean;
  /**
   * When set it won't ask the model for data when connected to the DOM.
   * @attribute
   */
  noAuto: boolean;
  /**
   * Enables Anypoint theme
   * @attribute
   */
  anypoint: boolean;
  /**
   * Enables material design outlined theme
   * @attribute
   */
  outlined: boolean;
  /**
   * Indicates that the export options panel is currently rendered.
   * @attribute
   */
  exportOptionsOpened: boolean;
  /**
   * When set it renders the editor in read only mode.
   * @attribute
   */
  readOnly: boolean;

  /**
   * @return {boolean} `true` if `items` is set.
   */
  get hasItems(): boolean;

  /**
   * Computed flag that determines that the query to the data store
   * has been performed and empty result was returned.
   *
   * @return {boolean}
   */
  get dataUnavailable(): boolean;

  constructor();

  connectedCallback(): void;

  disconnectedCallback(): void;

  firstUpdated(args: Map<string | number | symbol, unknown>): void;

  /**
   * Handles an exception by sending exception details to GA.
   * @param message A message to send.
   */
  [handleException](message: string): void;

  [dataImportHandler](): void;

  [dataDestroyHandler](e: ARCModelStateDeleteEvent): void;

  /**
   * Refreshes the list of rules from the model.
   *
   * Calling this function will replace current `items` value with the one
   * received from the model.
   */
  refresh(): Promise<void>;

  [deselectMainMenu](): void;

  /**
   * Menu item handler to export all data to file
   */
  openExportAll(): void;

  /**
   * Adds an empty rule to the rules list
   */
  appendRule(): void;

  /**
   * Updates a rule from the `host-rules-changed` custom event.
   * The event should contain `rule` property on the event's detail object
   * containing the rule object.
   */
  [ruleUpdatedHandler](e: ARCHostRuleUpdatedEvent): void;

  /**
   * Deletes the rule from the `host-rules-deleted` custom event.
   * The event should contain `rule` property on the event's detail object
   * containing the rule object.
   */
  [ruleDeletedHandler](e: ARCHostRuleDeletedEvent): void;

  /**
   * Toggles the rule tester view.
   * Use `rulesTesterOpened` property to control the view instead of calling
   * this function.
   */
  toggleRulesTester(): void;

  [onLearnMoreHandler](): void;

  [deleteAllClick](): void;

  /**
   * Called when the delete warning dialog closes.
   *
   * The function dispatches custom event handled by the model to remove all
   * data.
   */
  [clearDialogResultHandler](e: CustomEvent): Promise<void>;
  
  [sheetClosedHandler](e: Event): void;

  /**
   * Handler for `accept` event dispatched by export options element.
   */
  [acceptExportOptions](e: CustomEvent): void;

  /**
   * Exports all hot rules data with predefined options.
   */
  [exportAllFile](): void;

  [exportRules](provider: DataExport.ProviderOptions, options: DataExport.ExportOptions): Promise<void>;

  [cancelExportOptions](): void;

  /**
   * Handler to the remove a header
   */
  [removeItemHandler](e: PointerEvent): void;

  [enabledHandler](e: CustomEvent): void;

  [propertyInputHandler](e: CustomEvent): void;

  [addItemHandler](): void;

  render(): TemplateResult;

  [headerTemplate](): TemplateResult;

  [busyTemplate](): TemplateResult|string;

  /**
   * @return The template for the rules tester element.
   */
  [testerTemplate](): TemplateResult;

  [unavailableTemplate](): TemplateResult;

  /**
   * @returns The template for the list items.
   */
  [listTemplate](): TemplateResult;

  /**
   * @returns The template for a single list item
   */
  [listItemTemplate](item: HostRule.ARCHostRule, index: number): TemplateResult;

  /**
   * @return Template for the remove item template
   */
  [itemRemoveTemplate](index: number): TemplateResult;

  /**
   * @return Template for the rule toggle button
   */
  [itemToggleTemplate](item: HostRule.ARCHostRule, index: number): TemplateResult;

  /**
   * @return The template for the rule "from" input
   */
  [itemNameInput](item: HostRule.ARCHostRule, index: number): TemplateResult;

  /**
   * @return The template for the rule "to" input
   */
  [itemValueInput](item: HostRule.ARCHostRule, index: number): TemplateResult;

  /**
   * @returns The template for the add new rule button
   */
  [addTemplate](): TemplateResult;

  /**
   * @returns The template for the export options dialog
   */
  [exportOptionsTemplate](): TemplateResult;

  /**
   * @returns The template for the clear data dialog
   */
  [clearDialogTemplate](): TemplateResult;
}
