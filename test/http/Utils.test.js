import { ArcMock } from '@advanced-rest-client/arc-mock';
import { assert } from '@open-wc/testing';
import { bytesToSize, readBodyString, computeCharset, readContentType } from '../../src/elements/http/Utils.js';

const hasTextEncoder = typeof TextEncoder !== 'undefined';

describe('Utils', () => {
  const generator = new ArcMock();

  describe('bytesToSize()', () => {
    it('returns value for 0', () => {
      const result = bytesToSize(0);
      assert.equal(result, '0 Bytes');
    });

    it('returns value in bytes', () => {
      const result = bytesToSize(10);
      assert.equal(result, '10 Bytes');
    });

    it('returns value in kilobytes', () => {
      const result = bytesToSize(10240);
      assert.equal(result, '10 KB');
    });

    it('returns value in megabytes', () => {
      const result = bytesToSize(10*1024*1024);
      assert.equal(result, '10 MB');
    });

    it('returns value in gigabytes', () => {
      const result = bytesToSize(10*1024*1024*1024);
      assert.equal(result, '10 GB');
    });

    it('returns value in terabytes', () => {
      const result = bytesToSize(10*1024*1024*1024*1024);
      assert.equal(result, '10 TB');
    });

    it('returns value in petabytes', () => {
      const result = bytesToSize(10*1024*1024*1024*1024*1024);
      assert.equal(result, '10 PB');
    });

    it('returns value in exabyte', () => {
      const result = bytesToSize(10*1024*1024*1024*1024*1024*1024);
      assert.equal(result, '10 EB');
    });

    it('returns value in zettabyte', () => {
      const result = bytesToSize(10*1024*1024*1024*1024*1024*1024*1024);
      assert.equal(result, '10 ZB');
    });
  });

  describe('readBodyString()', () => {
    it('returns the same value for string', () => {
      const input = 'test';
      const output = readBodyString(input);
      assert.isTrue(input === output);
    });

    it('returns the same value for undefined', () => {
      const input = undefined;
      const output = readBodyString(input);
      assert.isTrue(input === output);
    });


    (hasTextEncoder ? it : it.skip)('returns string for Uint8Array', () => {
      const string = 'test encoded value';
      const textEncoder = new TextEncoder();
      const result = readBodyString(textEncoder.encode(string));
      assert.equal(result, string);
    });

    (hasTextEncoder ? it : it.skip)('Returns string for meta data (ArrayBuffer)', () => {
      const string = 'test encoded value';
      const textEncoder = new TextEncoder();
      const input = {
        data: textEncoder.encode(string).buffer,
        type: 'Buffer'
      };
      // @ts-ignore
      const result = readBodyString(input);
      assert.equal(result, string);
    });
  });

  describe('computeCharset()', () => {
    it('returns undefined when no input', () => {
      const output = computeCharset(undefined);
      assert.isUndefined(output);
    });

    it('returns undefined when empty input', () => {
      const output = computeCharset('');
      assert.isUndefined(output);
    });

    it('returns undefined when "charset" word', () => {
      const output = computeCharset('text/html');
      assert.isUndefined(output);
    });

    it('returns the charset value', () => {
      const output = computeCharset('text/html; charset=utf-8');
      assert.equal(output, 'utf-8');
    });

    it('strips new line characters', () => {
      const output = computeCharset('text/html; charset=utf-8\n\n');
      assert.equal(output, 'utf-8');
    });

    it('accounts for spaces', () => {
      const output = computeCharset('text/html;charset=utf-8');
      assert.equal(output, 'utf-8');
    });

    it('accounts for other properties', () => {
      const output = computeCharset('text/html; other=x; charset=utf-8');
      assert.equal(output, 'utf-8');
    });
  });

  describe('readContentType()', () => {
    it('returns the content type only', () => {
      const headers = generator.http.headers.headers('response', { mime: 'application/json' });
      const [ct, mime] = readContentType(headers);
      assert.equal(ct, 'application/json');
      assert.isUndefined(mime);
    });

    it('returns the content type and the charset', () => {
      const headers = generator.http.headers.headers('response', { mime: 'application/json; charset=utf-8' });
      const [ct, mime] = readContentType(headers);
      assert.equal(ct, 'application/json');
      assert.equal(mime, 'utf-8');
    });

    it('returns empty array when empty header', () => {
      const [ct, mime] = readContentType('');
      assert.isUndefined(ct);
      assert.isUndefined(mime);
    });

    it('returns empty array when wrong input', () => {
      const [ct, mime] = readContentType(null);
      assert.isUndefined(ct);
      assert.isUndefined(mime);
    });

    it('returns empty array when no content type', () => {
      const [ct, mime] = readContentType('accept: */*');
      assert.isUndefined(ct);
      assert.isUndefined(mime);
    });
  });
});
