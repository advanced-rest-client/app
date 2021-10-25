import { LitElement, TemplateResult } from 'lit-element';
import {
  notifyChange,
  inputHandler,
  configChangeHandler,
  dataSourceHandler,
  actionHelpTpl,
  updateDeepProperty,
  enabledHandler,
  deleteHandler,
  duplicateHandler,
  closeHandler,
  openedHandler,
  helpHandler,
  openedCardTemplate,
  closedCardTemplate,
  openedCardTitle,
  openedCardFooter,
  openButtonTemplate,
  enableSwitchTemplate,
  deleteButtonTemplate,
  duplicateButtonTemplate,
  closeButtonTemplate,
} from './internals.js';
import { DeleteCookieConfig, SetCookieConfig, SetVariableConfig } from '@advanced-rest-client/events/src/actions/Actions';
import { SupportedActions } from '../../types';

/** @typedef {import('lit-html').TemplateResult} TemplateResult */
/** @typedef {import('@advanced-rest-client/events').Actions.DataSourceConfiguration} DataSourceConfiguration */
/** @typedef {import('@advanced-rest-client/events').Actions.IteratorConfiguration} IteratorConfiguration */
/** @typedef {import('@advanced-rest-client/events').Actions.ActionConfiguration} ActionConfiguration */

/**
 * @fires change When any configuration property change
 * @fires duplicate When the user requests to duplicate this action
 * @fires remove When the user requests to remove this action
 */
export default class ARCActionEditorElement extends LitElement {

  /**
   * Action name that determines which editor to load.
   * The name mast be one of the supported action types or otherwise the
   * component won't render any editor.
   * @attribute
   */
  name: SupportedActions;
  /**
   * Either `request` or `response`. Actions without a type are not
   * executed.
   * @attribute
   */
  type: string;
  /**
   * Whether the action is enabled. An action is considered enabled when
   * this value equals `true`.
   * @attribute
   */
  enabled: boolean;
  /**
   * Whether the action should be called synchronously to the request or
   * the response.
   * This value is optional and default to `true`.
   *
   * @default true
   * @attribute
   */
  sync: boolean;
  /**
   * Whether the action should fail when
   * the request / response if it results in error.
   * @attribute
   */
  failOnError: boolean;
  /**
   * Action's priority on a scale of 1 to 10. The default value is 5 and
   * this property is optional.
   *
   * @attribute
   */
  priority: number;
  /**
   * The configuration of an action. The type depends on the `name` property.
   */
  config: SetCookieConfig | DeleteCookieConfig | SetVariableConfig;

  /**
   * Whether or not the action is rendered in full view.
   * @attribute
   */
  opened: boolean;
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
   * @attribute
   */
  readOnly: boolean;
  /**
   * @attribute
   */
  disabled: boolean;

  constructor();

  /**
   * Dispatches the `change` event with the name of the property that changed.
   * @param prop Name of changed property.
   */
  [notifyChange](prop: string): void;

  /**
   * A handler for the
   */
  [inputHandler](e: Event): void;

  /**
   * A handler for checkbox / switch change event for the action configuration.
   */
  [configChangeHandler](e: Event): void;

  /**
   * A handler for the data source selector for action configuration.
   */
  [dataSourceHandler](e: Event): void;

  /**
   * Updates a property value for given path. The path may contain `.` to
   * enter sub properties.
   *
   * For example, to set a top level property use the property name.
   *
   * ```
   * this[updateDeepProperty]('priority', 10);
   * ```
   *
   * To change an object property separate names with a dot:
   *
   * ```
   * this[updateDeepProperty]('config.enabled', true);
   * ```
   *
   * This function builds the path if it doesn't exist.
   */
  [updateDeepProperty](name: string, value: string|boolean): void;

  /**
   * A handler for the action enable switch.
   */
  [enabledHandler](e: Event): void;

  /**
   * A handler for the delete action button click. Dispatches the `remove`
   * custom event.
   */
  [deleteHandler](): void;

  /**
   * A handler for the duplicate action button click. Dispatches the `duplicate`
   * custom event.
   */
  [duplicateHandler](): void;

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

  /**
   * A handler for the help button click.
   * It dispatches used by ARC `open-external-url` to use platform's APIs to
   * open a popup. As a fallback it uses `window.open`.
   */
  [helpHandler](e: Event): void;

  /**
   * Main render function
   */
  render(): TemplateResult;

  /**
   * @return Template for opened action view.
   */
  [openedCardTemplate](): TemplateResult;

  /**
   * @return Template for closed action view.
   */
  [closedCardTemplate](): TemplateResult;

  /**
   * @param name Action's name
   * @return Template for opened action's title.
   */
  [openedCardTitle](name: string): TemplateResult;

  /**
   * @return Template for opened action's footer line.
   */
  [openedCardFooter](): TemplateResult;

  /**
   * @param url The URL to use to render the action.
   * @return Template for the help button.
   */
  [actionHelpTpl](url: string): TemplateResult|string;

  /**
   * @return Template for the help button.
   */
  [enableSwitchTemplate](): TemplateResult;

  /**
   * @return Template for the delete button.
   */
  [deleteButtonTemplate](): TemplateResult;

  /**
   * @return Template for the duplicate button.
   */
  [duplicateButtonTemplate](): TemplateResult;

  /**
   * @return Template for the close action button.
   */
  [closeButtonTemplate](): TemplateResult;

  /**
   * @return Template for the open action button.
   */
  [openButtonTemplate](): TemplateResult;
}
