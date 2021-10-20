import { LitElement, TemplateResult, CSSResult } from 'lit-element';
import { RequestBody } from '@advanced-rest-client/events';
import {
  valueValue,
  modelValue,
  valueChanged,
  notifyChange,
  modelToValue,
  modelChanged,
  addFile,
  addText,
  formTemplate,
  addParamTemplate,
  filePartTemplate,
  textPartTemplate,
  paramItemTemplate,
  paramToggleTemplate,
  paramRemoveTemplate,
  removeParamHandler,
  enabledHandler,
  filePartNameHandler,
  filePartValueHandler,
  pickFileHandler,
  textPartNameHandler,
  textPartValueHandler,
  internalModel,
  internalFromModel,
  setFormValue,
} from './internals.js';

export const hasFormDataSupport: boolean;

/**
 * Multipart payload editor for ARC/API Console body editor.
 *
 * On supported browsers (full support for FormData, Iterator and ArrayBuffer) it will render a
 * UI controls to generate payload message preview.
 *
 * It produces a FormData object that can be used in XHR / Fetch or transformed to ArrayBuffer to be
 * used in socket connection.
 */
export default class BodyMultipartEditorElement extends LitElement {
  static readonly styles: CSSResult;

  /**
   * Value of this form
   */
  value: FormData;
  [valueValue]: FormData;
  /**
   * Computed data model for the view.
   * Don't set both `value` and `model`. If the model exists then
   * set only it or otherwise the `value` setter override the model.
   */
  model: RequestBody.MultipartBody[];
  [modelValue]: RequestBody.MultipartBody[];
  /**
   * Enables Anypoint theme
   * @attribute
   */
  anypoint: boolean;
  /**
   * Enables Material Design outlined style
   * @attribute
   */
  outlined: boolean;
  /**
   * When set the editor is in read only mode.
   * @attribute
   */
  readOnly: boolean;
  /**
   * When set all controls are disabled in the form
   * @attribute
   */
  disabled: boolean;
  /** 
   * When set it ignores the content type processing.
   * This disables option "current header value", in raw editor, and disabled information about 
   * content-type header update.
   * 
   * @attribute
   */
  ignoreContentType: boolean;

  constructor();

  /**
   * Adds an instance of a file to the form data
   * @param file 
   */
  addFile(file: File): Promise<void>;

  [notifyChange](): void;

  /**
   * Updates properties when the model change externally
   */
  [modelChanged](model: RequestBody.MultipartBody[]): Promise<void>;

  /**
   * Transforms view model into the FormData object.
   *
   * @param model The view model
   */
  [modelToValue](model: RequestBody.MultipartBody[]): FormData|undefined;

  /**
   * Called when the `value` property change. It generates the view model
   * for the editor.
   */
  [valueChanged](value: FormData): Promise<void>;

  /**
   * Creates the internal model from the passed model
   */
  [internalFromModel](model: RequestBody.MultipartBody[]): Promise<RequestBody.MultipartBody[]>;

  /**
   * Adds a new text part to the list.
   * It does not update the FormData as there's no value just yet.
   */
  [addText](): void;

  /**
   * Adds a new text part to the list.
   * It does not update the FormData as there's no value just yet.
   */
  [addFile](): void;

  /**
   * Handler to the remove a parameter
   */
  [removeParamHandler](e: PointerEvent): void;

  [enabledHandler](e: CustomEvent): void;

  /**
   * @param item Item definition
   * @param value The value to set. Value in the item is ignored
   */
  [setFormValue](item: RequestBody.MultipartBody, value: File|Blob|string): void;

  [filePartNameHandler](e: Event): void;

  [pickFileHandler](e: Event): void;

  [filePartValueHandler](e: Event): Promise<void>;

  [textPartNameHandler](e: Event): void;

  [textPartValueHandler](e: Event): Promise<void>;

  render(): TemplateResult;

  [addParamTemplate](): TemplateResult;

  [formTemplate](): TemplateResult;

  /**
   * @param part The form part
   * @param index The index on the list
   */
  [paramItemTemplate](part: RequestBody.MultipartBody, index: number): TemplateResult;

  /**
   * @param part The form part
   * @param index The index on the list
   * @return A template for the file part
   */
  [filePartTemplate](part: RequestBody.MultipartBody, index: number): TemplateResult;

  /**
   * @param part The form part
   * @param index The index on the list
   * @return A template for the text part
   */
  [textPartTemplate](part: RequestBody.MultipartBody[], index: number): TemplateResult;

  /**
   * @param index
   * @return Template for the parameter name input
   */
  [paramRemoveTemplate](index: number): TemplateResult;

  /**
   * @param item
   * @param index
   * @return Template for the parameter name input
   */
  [paramToggleTemplate](item: RequestBody.MultipartBody[], index: number): TemplateResult;
}
