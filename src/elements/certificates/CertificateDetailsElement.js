/* eslint-disable class-methods-use-this */
/**
@license
Copyright 2020 The Advanced REST client authors <arc@mulesoft.com>
Licensed under the Apache License, Version 2.0 (the "License"); you may not
use this file except in compliance with the License. You may obtain a copy of
the License at
http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
License for the specific language governing permissions and limitations under
the License.
*/
import { LitElement, html } from 'lit-element';
import { TelemetryEvents, ArcModelEvents } from '@advanced-rest-client/events';
import '@anypoint-web-components/awc/anypoint-button.js';
import '@anypoint-web-components/awc/date-time.js';
import '@advanced-rest-client/icons/arc-icon.js';
import elementStyles from './styles/CertificateDetails.js';

/** @typedef {import('@advanced-rest-client/events').ClientCertificate.ClientCertificate} ClientCertificate */
/** @typedef {import('lit-element').TemplateResult} TemplateResult */

export const certIdValue = Symbol('certIdValue');
export const deleteHandler = Symbol('deleteHandler');
export const headerTemplate = Symbol('headerTemplate');
export const timeTemplate = Symbol('timeTemplate');
export const actionsTemplate = Symbol('actionsTemplate');
export const detailsTemplate = Symbol('detailsTemplate');
export const busyTemplate = Symbol('busyTemplate');

/**
 * A view that render a certificate details.
 *
 * Set `certId` property to certificate's identifier and the element
 * queries for the details and populates the view.
 */
export default class CertificateDetailsElement extends LitElement {
  static get styles() {
    return elementStyles;
  }

  static get properties() {
    return {
      /**
       * Enables Anypoint theme.
       */
      anypoint: { type: Boolean },
      /**
       * True when currently querying for the certificate
       */
      querying: { type: Boolean },
      /**
       * The ID of the certificate to render.
       * It should not be set when setting `certificate` object.
       */
      certId: { type: String },
      /**
       * A certificate
       */
      certificate: { type: Object }
    };
  }

  get certId() {
    return this[certIdValue];
  }

  set certId(value) {
    const old = this[certIdValue];
    /* istanbul ignore if */
    if (old === value) {
      return;
    }
    this[certIdValue] = value;
    this.requestUpdate();
    if (value) {
      this.queryCertInfo(value);
    }
  }

  constructor() {
    super();
    /**
     * @type {ClientCertificate}
     */
    this.certificate = undefined;
    this.anypoint = false;
    this.querying = false;
  }

  /**
   * Queries the data store for the certificate information.
   * @param {string} id The ID of the certificate to query for
   * @returns {Promise<void>}
   */
  async queryCertInfo(id) {
    this.querying = true;
    try {
      this.certificate = await ArcModelEvents.ClientCertificate.read(this, id);
    } catch (e) {
      this.certificate = undefined;
      TelemetryEvents.exception(this, e.message, false);
    }
    this.querying = false;
  }

  /**
   * Dispatches the certificate delete event.
   */
  [deleteHandler]() {
    const { certId } = this;
    if (!certId) {
      return;
    }
    ArcModelEvents.ClientCertificate.delete(this, certId);
    TelemetryEvents.event(this, {
      category: 'Certificates',
      action: 'delete-certificate',
    });
  }

  render() {
    const { certificate } = this;
    return html`
    ${this[busyTemplate]()}
    ${this[headerTemplate](certificate)}
    ${this[detailsTemplate](certificate)}
    <div class="actions">
      ${this[actionsTemplate](certificate)}
    </div>
    `;
  }

  /**
   * @param {ClientCertificate} certificate 
   * @returns {TemplateResult|string} The template for the dialog title
   */
  [headerTemplate](certificate) {
    if (!certificate) {
      return '';
    }
    return html`<h2>${certificate.name}</h2>`;
  }

  /**
   * 
   * @param {string} label The label to render
   * @param {number} value The certificate time value
   * @returns {TemplateResult|string} The template for the time element
   */
  [timeTemplate](label, value) {
    if (!value) {
      return '';
    }
    return html`
    <div class="meta-row">
      <div class="label">
        ${label}
      </div>
      <div class="value">
        <date-time
          .date="${value}"
          year="numeric"
          month="numeric"
          day="numeric"
          hour="numeric"
          minute="numeric"></date-time>
      </div>
    </div>`;
  }

  /**
   * @param {ClientCertificate} certificate 
   * @returns {TemplateResult|string} The template for the dialog actions
   */
  [actionsTemplate](certificate) {
    if (!certificate) {
      return '';
    }
    const { anypoint } = this;
    return html`
    <anypoint-button
      @click="${this[deleteHandler]}"
      data-action="delete-certificate"
      title="Removes certificate from the data store"
      aria-label="Activate to remove the certificate"
      ?anypoint="${anypoint}"
    >
      <arc-icon icon="deleteIcon"></arc-icon>
      Delete
    </anypoint-button>`;
  }

   /**
   * @param {ClientCertificate} certificate 
   * @returns {TemplateResult|string} The template for the certificate details
   */
  [detailsTemplate](certificate) {
    if (!certificate) {
      return '';
    }
    let filesValue = 'Certificate';
    if (certificate.key) {
      filesValue += ', Key';
    }
    return html`
    ${this[timeTemplate]('Created', certificate.created)}
    <div class="meta-row" data-type="type">
      <div class="label">
        Type
      </div>
      <div class="value">
        ${certificate.type}
      </div>
    </div>

    <div class="meta-row" data-type="files">
      <div class="label">
        Files
      </div>
      <div class="value">
        ${filesValue}
      </div>
    </div>
    `;
  }

  [busyTemplate]() {
    if (!this.querying) {
      return '';
    }
    return html`<progress></progress>`;
  }
}
