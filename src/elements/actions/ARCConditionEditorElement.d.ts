import { LitElement, TemplateResult } from 'lit-element';
import { Condition } from '@advanced-rest-client/events/src/actions/Actions';

export declare const conditionValue: unique symbol;
export declare const notifyChange: unique symbol;
export declare const enabledHandler: unique symbol;
export declare const alwaysPassHandler: unique symbol;
export declare const deleteHandler: unique symbol;
export declare const closeHandler: unique symbol;
export declare const openedHandler: unique symbol;
export declare const dataSourceTypeHandler: unique symbol;
export declare const dataSourceHandler: unique symbol;
export declare const operatorHandler: unique symbol;
export declare const valueHandler: unique symbol;
export declare const pathHandler: unique symbol;
export declare const editorTemplate: unique symbol;
export declare const summaryTemplate: unique symbol;
export declare const conditionExplainedTemplate: unique symbol;
export declare const openButtonTemplate: unique symbol;
export declare const closeButtonTemplate: unique symbol;
export declare const deleteButtonTemplate: unique symbol;
export declare const alwaysPassSwitchTemplate: unique symbol;
export declare const enableSwitchTemplate: unique symbol;
export declare const dataPathTemplate: unique symbol;
export declare const valueTemplate: unique symbol;
export declare const dataSourceTypeSelectorTemplate: unique symbol;
export declare const dataSourceSelectorTemplate: unique symbol;
export declare const operatorTemplateTemplate: unique symbol;

export default class ARCConditionEditorElement extends LitElement {
  /**
   * A list of response actions
   * @attribute
   */
  condition: Condition;
  /**
   * Enables Anypoint theme
   * @attribute
   */
  anypoint: boolean;
  /**
   * Enables outlined MD theme
   * @attribute
   */
  outlined: boolean;

  /**
   * Whether or not the condition is enabled
   * @attribute
   */
  enabled: boolean;
  /** 
   * The type of the condition that is being rendered.
   * Either `request` or `response`.
   * This is not the same as condition's model source type as in response action
   * can be executed with conditions for both request and response.
   * @attribute
   */
  type: string;

  get opened(): boolean;

  constructor();

  /**
   * Dispatches the `change` event with the name of the property that changed.
   * @param prop Name of changed property.
   */
  [notifyChange](prop: string): void;

  /**
   * A handler for the action enable switch.
   */
  [enabledHandler](e: Event): void;

  /**
   * The handler for the action always pass switch.
   */
  [alwaysPassHandler](e: Event): void;

  /**
   * A handler for the delete action button click. Dispatches the `remove`
   * custom event.
   */
  [deleteHandler](): void;

  /**
   * A handler for the close action button click. Updates the `opened` value
   * on the `view` property.
   */
  [closeHandler](): void;

  /**
   * A handler for the open action button click. Updates the `opened` value
   * on the `view` property.
   */
  [openedHandler](): void;

  [dataSourceTypeHandler](e: Event): void;

  [dataSourceHandler](e: Event): void;

  [operatorHandler](e: Event): void;

  [valueHandler](e: Event): void;

  [pathHandler](e: Event): void;

  render(): TemplateResult;

  [editorTemplate](): TemplateResult;

  [summaryTemplate](): TemplateResult;

  [conditionExplainedTemplate](): TemplateResult[];

  [dataSourceTypeSelectorTemplate](): TemplateResult|string;

  [dataSourceSelectorTemplate](): TemplateResult;

  [operatorTemplateTemplate](): TemplateResult;

  [valueTemplate](): TemplateResult;

  [dataPathTemplate](): TemplateResult|string;

  /**
   * @returns The template for the enabled switch.
   */
  [enableSwitchTemplate](): TemplateResult;

  /**
   * @returns Template for the "always pass" which.
   */
  [alwaysPassSwitchTemplate](): TemplateResult|string;

  /**
   * @returns Template for the delete button.
   */
  [deleteButtonTemplate](): TemplateResult;

  /**
   * @returns Template for the close action button.
   */
  [closeButtonTemplate](): TemplateResult;

  /**
   * @returns Template for the open action button.
   */
  [openButtonTemplate](): TemplateResult;
}
