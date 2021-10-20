import { fixture, assert } from '@open-wc/testing';
import '../../define/response-error.js';
import { 
  messageChanged,
} from '../../src/elements/http/internals.js';

/** @typedef {import('../../index').ResponseErrorElement} ResponseErrorElement */

describe('ResponseErrorElement', () => {
  /**
   * @returns {Promise<ResponseErrorElement>}
   */
  async function basicFixture() {
    return fixture(`<response-error></response-error>`);
  }

  describe('Basic', () => {
    let element = /** @type ResponseErrorElement */(null);
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('Set predefined template', () => {
      element.message = 'net::ERR_CERT_AUTHORITY_INVALID';
      assert.equal(element.detailsPage, 1);
    });

    it('Sets default template when no message', () => {
      assert.equal(element.detailsPage, 0);
    });

    it('Set default template when custom message', () => {
      element.message = 'test';
      assert.equal(element.detailsPage, 0);
    });
  });

  describe('[messageChanged]()', () => {
    let element = /** @type ResponseErrorElement */(null);
    beforeEach(async () => {
      element = await basicFixture();
    });

    [
      ['net::ERR_CERT_AUTHORITY_INVALID', 1],
      ['net::ERR_CONNECTION_REFUSED', 2],
      ['net::ERR_CERT_COMMON_NAME_INVALID', 3],
      ['Request aborted', 4],
      ['net::ERR_ADDRESS_UNREACHABLE', 5],
      ['net::ERR_BAD_SSL_CLIENT_AUTH_CERT', 6],
      ['net::ERR_BLOCKED_BY_ADMINISTRATOR', 7],
      ['net::ERR_BLOCKED_BY_CLIENT', 8],
      ['net::ERR_BLOCKED_ENROLLMENT_CHECK_PENDING', 9],
      ['net::ERR_CERT_CONTAINS_ERRORS', 10],
      ['net::ERR_CERT_DATE_INVALID', 10],
      ['net::ERR_CERT_END', 10],
      ['net::ERR_CERT_ERROR_IN_SSL_RENEGOTIATION', 10],
      ['net::ERR_CERT_INVALID', 10],
      ['net::ERR_CERT_NAME_CONSTRAINT_VIOLATION', 10],
      ['net::ERR_CERT_NON_UNIQUE_NAME', 10],
      ['net::ERR_CERT_NO_REVOCATION_MECHANISM', 10],
      ['net::ERR_CERT_REVOKED', 10],
      ['net::ERR_CERT_UNABLE_TO_CHECK_REVOCATION', 10],
      ['net::ERR_CERT_VALIDITY_TOO_LONG', 10],
      ['net::ERR_CERT_WEAK_KEY', 10],
      ['net::ERR_CERT_WEAK_SIGNATURE_ALGORITHM', 10],
      ['net::ERR_CONNECTION_CLOSED', 11],
      ['net::ERR_CONNECTION_RESET', 11],
      ['net::ERR_CONNECTION_FAILED', 12],
      ['net::ERR_CONNECTION_TIMED_OUT', 13],
      ['net::ERR_CONTENT_LENGTH_MISMATCH', 14],
      ['net::ERR_INCOMPLETE_CHUNKED_ENCODING', 14],
      ['net::ERR_FILE_NOT_FOUND', 15],
      ['net::ERR_ICANN_NAME_COLLISION', 16],
      ['net::ERR_INTERNET_DISCONNECTED', 17],
      ['net::ERR_NAME_NOT_RESOLVED', 18],
      ['net::ERR_NAME_RESOLUTION_FAILED', 19],
      ['net::ERR_NETWORK_ACCESS_DENIED', 20],
      ['net::ERR_NETWORK_CHANGED', 21],
      ['net::ERR_NETWORK_IO_SUSPENDED', 22],
      ['net::ERR_PROXY_CONNECTION_FAILED', 23],
      ['net::ERR_RESPONSE_HEADERS_MULTIPLE_CONTENT_DISPOSITION', 24],
      ['net::ERR_RESPONSE_HEADERS_MULTIPLE_CONTENT_LENGTH', 24],
      ['net::ERR_RESPONSE_HEADERS_MULTIPLE_LOCATION', 24],
      ['net::ERR_SSL_FALLBACK_BEYOND_MINIMUM_VERSION', 25],
      ['net::ERR_SSL_PROTOCOL_ERROR', 25],
      ['net::ERR_SSL_PINNED_KEY_NOT_IN_CERT_CHAIN', 26],
      ['net::ERR_SSL_SERVER_CERT_BAD_FORMAT', 27],
      ['net::ERR_SSL_VERSION_OR_CIPHER_MISMATCH', 28],
      ['net::ERR_SSL_WEAK_SERVER_EPHEMERAL_DH_KEY', 29],
      ['net::ERR_TEMPORARY_BACKOFF', 30],
      ['net::ERR_TIMED_OUT', 31],
      ['net::ERR_TOO_MANY_REDIRECTS', 32],
      ['other', 0]
    ].forEach((item) => {
      it(`Opens page for ${item[0]}`, () => {
        element[messageChanged](String(item[0]));
        assert.equal(element.detailsPage, Number(item[1]));
      });
    });
  });
});
