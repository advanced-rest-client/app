/* eslint-disable class-methods-use-this */
/* eslint-disable no-param-reassign */
import { LitElement, html } from 'lit-element';
import { unsafeSVG } from 'lit-html/directives/unsafe-svg.js';
import '../../../define/response-highlight.js';
import { readContentType, readBodyString } from './Utils.js';
import elementStyles from '../styles/ResponseBody.styles.js';
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
  rawTemplate,
  svgTemplate,
  binaryTemplate,
  emptyBodyTemplate,
  stylesTemplate,
} from './internals.js';

export const defaultBinaryTypes = [
  'application/zip', 'application/gzip', 'application/octet-stream', 'application/pkcs8',
  'application/x-bzip', 'application/x-bzip2', 'application/msword', 'application/x-7z-compressed',
  'application/epub+zip', 'application/java-archive', 'application/ogg', 'audio/opus', 'application/x-tar'
];

/** @typedef {import('lit-element').TemplateResult} TemplateResult */

export default class ResponseBodyElement extends LitElement {
  get styles() {
    return elementStyles;
  }

  static get properties() {
    return {
      /** 
       * The body to render.
       * It can be String, Buffer, or ArrayBuffer.
       */
      body: { type: String },
      /** 
       * A list of response headers
       */    
      headers: { type: String },
      /** 
       * Whether the view is currently being rendered or not.
       */
      active: { type: Boolean },
      /** 
       * When set it renders the "raw" view instead of parsed view.
       */
      rawOnly: { type: Boolean },
    };
  }

  /**
   * @returns {string|Buffer|ArrayBuffer}
   */
  get body() {
    return this[bodyValue];
  }

  /**
   * @param {string|Buffer|ArrayBuffer} value
   */
  set body(value) {
    if (this[bodyValue] === value) {
      return;
    }
    this[bodyValue] = value;
    this[bodyChanged]();
  }

  /**
   * @returns {string}
   */
  get headers() {
    return this[headersValue];
  }

  /**
   * @param {string} value
   */
  set headers(value) {
    if (this[headersValue] === value) {
      return;
    }
    this[headersValue] = value;
    this[bodyChanged]();
  }

  constructor() {
    super();
    this.active = false;
    this.rawOnly = false;
  }

  [bodyChanged]() {
    if (this[processingTimeout]) {
      clearTimeout(this[processingTimeout]);
    }
    this[processingTimeout] = setTimeout(() => {
      this[processingTimeout] = undefined;
      this[processBody]();
    });
  }

  /**
   * A function to discover the type of rendered response and collection
   * information about views that can open this response type.
   */
  [processBody]() {
    if (!this[bodyValue]) {
      this[availableTypes] = ['empty'];
      this[selectedType] = 'empty';
      this.requestUpdate();
      return;
    }
    const body = this[bodyValue];
    let [contentType, charset] = readContentType(this[headersValue]);
    if (!contentType) {
      contentType = 'text/plain';
    }
    if (!charset) {
      charset = 'utf-8';
    }
    this[charsetValue] = charset;
    this[contentTypeValue] = contentType;
    const types = []; // image, pdf, binary, parsed, svg
    let selected;
    let imageDataUrl;
    if (contentType) {
      if (contentType.indexOf('image/') === 0) {
        types.push('image');
        if (contentType === 'image/svg+xml') {
          types.push('svg');
          types.push('parsed');
          selected = 'svg';
        } else {
          imageDataUrl = this[computeImageUrl](contentType, body);
          if (imageDataUrl) {
            selected = 'image';
          } else {
            types.push('parsed');
            selected = 'parsed';
          }
        }
      } else if (contentType === 'application/pdf') {
        types.push('pdf');
        selected = 'pdf'
      } else if (
        defaultBinaryTypes.includes(contentType) || 
        contentType.startsWith('audio/') ||
        contentType.startsWith('video/') ||
        contentType.startsWith('font/') ||
        contentType.startsWith('application/vnd') ||
        contentType.startsWith('model/')
      ) {
        types.push('binary');
        selected = 'binary'
      } else {
        types.push('parsed');
        selected = 'parsed';
      }
    }
    this[availableTypes] = types;
    this[selectedType] = selected;
    this[imageDataUrlValue] = imageDataUrl;
    if (types.includes('parsed') || types.includes('binary')) {
      this[rawValue] = readBodyString(body, charset);
    } else {
      this[rawValue] = body;
    }
    this.requestUpdate();
  }

  /**
   * Converts body data to an image data URL string.
   * 
   * @param {string} contentType Response content type
   * @param {string|Buffer|ArrayBuffer} body
   * @return {string|undefined} Processed image data or undefined when error.
   */
  [computeImageUrl](contentType, body) {
    if (typeof body === 'string') {
      return undefined;
    }
    // don't remember. I think it's either Node's or ARC's property.
    // @ts-ignore
    if (body && body.type === 'Buffer') {
      // @ts-ignore
      body = body.data;
    }
    const typed = /** @type ArrayBuffer */ (body);
    try {
      const arr = new Uint8Array(typed);
      const str = arr.reduce((data, byte) => data + String.fromCharCode(byte), '');
      const enc = btoa(str);
      return `data:${contentType};base64, ${enc}`;
    } catch (_) {
      return undefined;
    }
  }

  render() {
    const selected = this[selectedType]
    if (selected === 'image') {
      return this[imageTemplate]();
    }
    if (selected === 'pdf') {
      return this[pdfTemplate]();
    }
    if (selected === 'parsed') {
      if (this.rawOnly) {
        return this[rawTemplate]();
      }
      return this[parsedTemplate]();
    }
    if (selected === 'binary') {
      if (this.rawOnly) {
        return this[rawTemplate]();
      }
      return this[binaryTemplate]();
    }
    if (selected === 'svg') {
      return this[svgTemplate]();
    }
    if (selected === 'empty') {
      return this[emptyBodyTemplate]();
    }
    return html`<p>Invalid state</p>`;
  }

  /**
   * @returns {TemplateResult} A template for the image data
   */
  [imageTemplate]() {
    const src = this[imageDataUrlValue];
    return html`
    ${this[stylesTemplate]()}
    <div class="image-container">
    <img class="img-preview" src="${src}" alt="">
    </div>
    `;
  }

  /**
   * @returns {TemplateResult} A template for a PDF file
   */
  [pdfTemplate]() {
    return html`
    ${this[stylesTemplate]()}
    <div class="content-info pdf">
      <p>The response is a <b>PDF</b> data.</p>
      <p>Save the file to preview its contents.</p>
    </div>`;
  }

  /**
   * @returns {TemplateResult} A template for a binary data
   */
  [binaryTemplate]() {
    return html`
    ${this[stylesTemplate]()}
    <div class="content-info binary">
      <p>The response is a <b>binary</b> data.</p>
      <p>Save the file to preview its contents.</p>
    </div>`;
  }

  /**
   * @returns {TemplateResult} A template for the custom response highlighter
   */
  [parsedTemplate]() {
    const body = this[rawValue];
    const contentType = this[contentTypeValue];
    return html`
    ${this[stylesTemplate]()}
    <response-highlight .code="${body}" .lang="${contentType}" lines ?active="${this.active}"></response-highlight>
    `;
  }

  /**
   * @returns {TemplateResult} The template for the "raw" response view
   */
  [rawTemplate]() {
    const body = this[rawValue];
    return html`
    ${this[stylesTemplate]()}
    <pre class="raw-view"><code>${body}</code></pre>
    `;
  }

  /**
   * @returns {TemplateResult} A template for an SVG image
   */
  [svgTemplate]() {
    const svgValue = /** @type string */ (this[rawValue]);
    const div = window.document.createElement('div');
    div.innerHTML = svgValue;
    const svgEl = div.firstElementChild;
    if (!svgEl) {
      return html`<p class="error">Invalid SVG response.</p>`;
    }
    const all = Array.from(svgEl.querySelectorAll('*'));
    all.forEach((node) => {
      if (!node.attributes) {
        return;
      }
      const remove = Array.from(node.attributes).filter((attr) =>  attr.name.startsWith('on') || ['xlink:href'].includes(attr.name));
      remove.forEach(({ name }) => node.removeAttribute(name));
    });
    const scripts = Array.from(svgEl.getElementsByTagName('script'));
    scripts.forEach((node) => node.parentNode.removeChild(node));
    return html`
    ${this[stylesTemplate]()}
    <div class="image-container">
      ${unsafeSVG(svgEl.outerHTML)}
    </div>
    `;
  }

  /**
   * @returns {TemplateResult} A template for a no-payload message
   */
  [emptyBodyTemplate]() {
    return html`
    ${this[stylesTemplate]()}
    <div class="content-info empty">
      <p>The response has no body object or the response is an empty string.</p>
    </div>`;
  }

  /**
   * @returns {TemplateResult} The template for the element's styles declaration.
   */
  [stylesTemplate]() {
    return html`<style>${this.styles}</style>`;
  }
}
