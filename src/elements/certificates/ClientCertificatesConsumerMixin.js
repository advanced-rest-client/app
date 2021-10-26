// eslint-disable-next-line no-unused-vars
import { LitElement } from 'lit-element';
import { dedupeMixin } from '@open-wc/dedupe-mixin';
import { DataImportEventTypes, TelemetryEvents, ArcModelEventTypes, ArcModelEvents } from '@advanced-rest-client/events';

export const dbDestroyHandler = Symbol('dbDestroyHandler');
export const dataImportHandler = Symbol('dataImportHandler');
export const certDeleteHandler = Symbol('certDeleteHandler');
export const certInsertHandler = Symbol('certInsertHandler');
export const handleException = Symbol('handleException');

/** @typedef {import('@advanced-rest-client/events').ClientCertificate.ARCCertificateIndex} ARCCertificateIndex */
/** @typedef {import('@advanced-rest-client/events').ARCModelStateDeleteEvent} ARCModelStateDeleteEvent */
/** @typedef {import('@advanced-rest-client/events').ARCClientCertificateDeletedEvent} ARCClientCertificateDeletedEvent */
/** @typedef {import('@advanced-rest-client/events').ARCClientCertificateUpdatedEvent} ARCClientCertificateUpdatedEvent */

/**
 * @param {typeof LitElement} base
 */
const mxFunction = (base) => {
  class ClientCertificatesConsumerMixinImpl extends base {
    static get properties() {
      return {
        /**
         * The list of certificates to render.
         */
        items: { type: Array },
        /**
         * True when loading data from the datastore.
         */
        loading: { type: Boolean },
      };
    }

    /**
     * @return {Boolean} `true` if `items` is set and has cookies
     */
    get hasItems() {
      const { items } = this;
      return !!(items && items.length);
    }

    /**
     * A computed flag that determines that the query to the data store
     * has been performed and empty result was returned.
     * This can be true only if not in search.
     * @return {Boolean}
     */
    get dataUnavailable() {
      const { hasItems, loading } = this;
      return !loading && !hasItems;
    }

    constructor() {
      super();
      this[dbDestroyHandler] = this[dbDestroyHandler].bind(this);
      this[dataImportHandler] = this[dataImportHandler].bind(this);
      this[certDeleteHandler] = this[certDeleteHandler].bind(this);
      this[certInsertHandler] = this[certInsertHandler].bind(this);
      /**
       * @type {ARCCertificateIndex[]}
       */
      this.items = undefined;
      this.loading = false;
      /**
       * The latest page token received from the store.
       * @type {string}
       */
      this.pageToken = undefined;
      /**
       * The page limit to use when querying for the data
       * @type {number}
       */
      this.pageLimit = undefined;
      /**
       * Set to false when the query to the data store resulted in incomplete size of the results.
       */
      this.hasMoreResults = true;
    }

    connectedCallback() {
      super.connectedCallback();
      window.addEventListener(ArcModelEventTypes.destroyed, this[dbDestroyHandler]);
      window.addEventListener(DataImportEventTypes.dataImported, this[dataImportHandler]);
      window.addEventListener(ArcModelEventTypes.ClientCertificate.State.delete, this[certDeleteHandler]);
      window.addEventListener(ArcModelEventTypes.ClientCertificate.State.update, this[certInsertHandler]);
    }

    disconnectedCallback() {
      super.disconnectedCallback();
      window.removeEventListener(ArcModelEventTypes.destroyed, this[dbDestroyHandler]);
      window.removeEventListener(DataImportEventTypes.dataImported, this[dataImportHandler]);
      window.removeEventListener(ArcModelEventTypes.ClientCertificate.State.delete, this[certDeleteHandler]);
      window.removeEventListener(ArcModelEventTypes.ClientCertificate.State.update, this[certInsertHandler]);
    }

    firstUpdated(args) {
      super.firstUpdated(args);
      if (!this.items) {
        this.reset();
      }
    }

    /**
     * @param {ARCModelStateDeleteEvent} e 
     */
    [dbDestroyHandler](e) {
      if (e.store === 'client-certificates') {
        this.items = undefined;
      }
    }

    /**
     * Resets the view
     */
    [dataImportHandler]() {
      this.reset();
    }

    /**
     * @param {ARCClientCertificateDeletedEvent} e 
     */
    [certDeleteHandler](e) {
      const { id } = e;
      const { items } = this;
      if (!Array.isArray(items) || !items.length) {
        return;
      }
      const index = items.findIndex((i) => i._id === id);
      if (index === -1) {
        return;
      }
      items.splice(index, 1);
      this.requestUpdate();
    }
    
    /**
     * @param {ARCClientCertificateUpdatedEvent} e 
     */
    [certInsertHandler](e) {
      const { changeRecord } = e;
      const { item, id } = changeRecord;
      if (!item) {
        return;
      }
      if (!this.items) {
        this.items = [];
      }
      const { items } = this;
      const index = items.findIndex((i) => i._id === id);
      if (index === -1) {
        items.push(item);
      } else {
        items[index] = item;
      }
      this.requestUpdate();
    }

    /**
     * Resets current view and requests for certificates.
     */
    reset() {
      this.loading = false;
      this.hasMoreResults = true;
      this.items = undefined;
      this.pageToken = undefined;
      this.queryCertificates();
    }

    /**
     * Handles an exception by sending exception details to GA.
     * @param {string} message A message to send.
     */
    [handleException](message) {
      TelemetryEvents.exception(this, message, false);
      // // eslint-disable-next-line no-console
      // console.error(message);
    }
  
    /**
     * Queries application for list of cookies.
     * 
     * @return {Promise<void>} Resolved when cookies are available.
     */
    async queryCertificates() {
      if (this.hasMoreResults === false) {
        return;
      }
      this.loading = true;
      try {
        const opts = {};
        if (this.pageLimit) {
          opts.limit = this.pageLimit;
        }
        if (this.pageToken) {
          opts.nextPageToken = this.pageToken;
        }
        const data = await ArcModelEvents.ClientCertificate.list(this, {
          limit: this.pageLimit,
          nextPageToken: this.pageToken,
        });
        if (!data) {
          throw new Error('Client certificates model not in the DOM.');
        }
        const { nextPageToken, items } = data;
        if (nextPageToken) {
          this.pageToken = nextPageToken;
        } else {
          this.hasMoreResults = false;
        }
        if (!this.items) {
          this.items = [];
        }
        if (items.length) {
          this.items = this.items.concat(items);
        }
        this.requestUpdate();
      } catch (e) {
        this.items = undefined;
        this[handleException](e.message);
      }
      this.loading = false;
    }
  }
  return ClientCertificatesConsumerMixinImpl;
}

/**
 * A mixin to be used with elements that consumes lists of client certificates.
 * It implements event listeners related to certificates data change.
 *
 * The mixin does not offer models to work with as the storing implementation
 * may be different for different platforms.
 * Use `@advanced-rest-client/arc-models/client-certificate-model.js` as a
 * default store.
 * Also, see the model definition to learn about events API for certificates.
 *
 * @mixin
 */
export const ClientCertificatesConsumerMixin = dedupeMixin(mxFunction);
