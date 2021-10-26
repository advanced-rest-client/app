import { ARCClientCertificateDeletedEvent, ARCClientCertificateUpdatedEvent, ARCModelStateDeleteEvent, ClientCertificate } from '@advanced-rest-client/events';

export declare const dbDestroyHandler: unique symbol;
export declare const dataImportHandler: unique symbol;
export declare const certDeleteHandler: unique symbol;
export declare const certInsertHandler: unique symbol;
export declare const handleException: unique symbol;

declare function ClientCertificatesConsumerMixin<T extends new (...args: any[]) => {}>(base: T): T & ClientCertificatesConsumerMixinConstructor;
interface ClientCertificatesConsumerMixinConstructor {
  new(...args: any[]): ClientCertificatesConsumerMixin;
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
 */
interface ClientCertificatesConsumerMixin {
  /**
   * The list of certificates to render.
   */
  items: ClientCertificate.ARCCertificateIndex[];
  /**
   * True when loading data from the datastore.
   */
  loading: boolean;
  /**
   * `true` if `items` is set and has cookies
   */
  get hasItems(): boolean;

  /**
   * A computed flag that determines that the query to the data store
   * has been performed and empty result was returned.
   * This can be true only if not in search.
   */
  get dataUnavailable(): boolean;

  /**
   * The latest page token received from the store.
   */
  pageToken: string;
  /**
   * The page limit to use when querying for the data
   */
  pageLimit: string;
  /**
   * Set to false when the query to the data store resulted in incomplete size of the results.
   */
  hasMoreResults: boolean;

  connectedCallback(): void;

  disconnectedCallback(): void;

  firstUpdated(): void;

  [dbDestroyHandler](e: ARCModelStateDeleteEvent): void;

  [dataImportHandler](): void;

  [certDeleteHandler](e: ARCClientCertificateDeletedEvent): void;
  
  [certInsertHandler](e: ARCClientCertificateUpdatedEvent): void;

  /**
   * Resets current view and requests for certificates.
   */
  reset(): void;

  /**
   * Handles an exception by sending exception details to GA.
   * @param message A message to send.
   */
  [handleException](message: string): void;

  /**
   * Queries application for list of cookies.
   * 
   * @returns Resolved when cookies are available.
   */
  queryCertificates(): Promise<void>;
}
