import { LitElement, CSSResult, TemplateResult } from 'lit-element';
import {
  bodyValue,
  contentTypeValue,
  rawValue,
  charsetValue,
  processBody,
  processingTimeout,
  bodyChanged,
  headersValue,
  computeImageUrl,
  availableTypes,
  selectedType,
  imageDataUrlValue,
  imageTemplate,
  pdfTemplate,
  parsedTemplate,
  svgTemplate,
  binaryTemplate,
  emptyBodyTemplate,
  stylesTemplate,
} from './internals.js';

/** @typedef {import('lit-element').TemplateResult} TemplateResult */

export default class ResponseBodyElement extends LitElement {
  get styles(): CSSResult;

  /** 
   * The body to render.
   * It can be String, Buffer, or ArrayBuffer.
   * @attribute
   */
  body: string|Buffer|ArrayBuffer;
  /** 
   * A list of response headers
   * @attribute
   */    
  headers: string;
  /** 
   * Whether the view is currently being rendered or not.
   * @attribute
   */
  active: boolean;
  /** 
   * When set it renders the "raw" view instead of parsed view.
   * @attribute
   */
  rawOnly?: boolean;

  [processingTimeout]?: boolean;
  [imageDataUrlValue]?: string;
  [selectedType]?: string;
  [availableTypes]?: string[];
  [headersValue]?: string;
  [charsetValue]?: string;
  [rawValue]?: string|Buffer|ArrayBuffer;
  [bodyValue]?: string|Buffer|ArrayBuffer;
  [contentTypeValue]?: string;

  [bodyChanged](): void;

  /**
   * A function to discover the type of rendered response and collection
   * information about views that can open this response type.
   */
  [processBody](): void;

  /**
   * Converts body data to an image data URL string.
   * 
   * @param contentType Response content type
   * @param body
   * @returns Processed image data or undefined when error.
   */
  [computeImageUrl](contentType: string, body: string|Buffer|ArrayBuffer): string|undefined;

  render(): TemplateResult;

  /**
   * @returns A template for the image data
   */
  [imageTemplate](): TemplateResult;

  /**
   * @returns A template for a PDF file
   */
  [pdfTemplate](): TemplateResult;

  /**
   * @returns A template for a binary data
   */
  [binaryTemplate](): TemplateResult;

  /**
   * @returns A template for the custom response highlighter
   */
  [parsedTemplate](): TemplateResult;

  /**
   * @returns A template for an SVG image
   */
  [svgTemplate](): TemplateResult;

  /**
   * @returns A template for a no-payload message
   */
  [emptyBodyTemplate](): TemplateResult;

  /**
   * @returns The template for the element's styles declaration.
   */
  [stylesTemplate](): TemplateResult;
}
