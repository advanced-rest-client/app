import { assert } from '@open-wc/testing';
import { HeadersParser } from '../../index.js';

describe('HeadersParser', () => {
  describe('unique()', () => {
    it('filters headers', () => {
      const headers = [
        {
          name: 'x-test',
          value: 'value 1',
        },
        {
          name: 'x-test',
          value: 'value 2',
        },
        {
          name: 'Content-Type',
          value: 'application/json',
        },
      ];
      const ref = [
        {
          name: 'x-test',
          value: 'value 1, value 2',
        },
        {
          name: 'Content-Type',
          value: 'application/json',
        },
      ];
      const filtered = HeadersParser.unique(headers);
      assert.deepEqual(filtered, ref);
    });

    it('does not overwrite original inputs when duplicate headers provided', () => {
      const headers = [
        {
          name: 'x-test',
          value: 'value 1',
        },
        {
          name: 'x-test',
          value: 'value 2',
        },
      ];
      const expected = [
        {
          name: 'x-test',
          value: 'value 1',
        },
        {
          name: 'x-test',
          value: 'value 2',
        },
      ];
      HeadersParser.unique(headers);
      assert.deepEqual(headers, expected);
    })
  });

  describe('toJSON()', () => {
    it('Parses string to array', () => {
      const headers = 'x-test: value';
      const result = HeadersParser.toJSON(headers);
      assert.typeOf(result, 'array');
      assert.lengthOf(result, 1);
      assert.equal(result[0].name, 'x-test');
      assert.equal(result[0].value, 'value');
    });

    it('Pareses Headers to array', () => {
      const headers = new Headers();
      headers.append('x-test', 'value');

      const result = HeadersParser.toJSON(headers);
      assert.typeOf(result, 'array');
      assert.lengthOf(result, 1);
      assert.equal(result[0].name, 'x-test');
      assert.equal(result[0].value, 'value');
    });

    it('parses an object to an array', () => {
      const headers = {
        'x-test': 'value',
      };
      const result = HeadersParser.toJSON(headers);
      assert.typeOf(result, 'array');
      assert.lengthOf(result, 1);
      assert.equal(result[0].name, 'x-test');
      assert.equal(result[0].value, 'value');
    });

    it('Should process multiline headers per rfc2616 sec4', () => {
      let headers = 'x-test: value 1, value 2\n';
      headers += 'x-test-2: v1\n\tv2\n';
      headers += 'x-test-2: v3';

      const parsed = HeadersParser.toJSON(headers);
      assert.lengthOf(parsed, 3, 'Result has 3 headers');
      assert.equal(parsed[1].value, 'v1\n\tv2');
    });
  });

  describe('toString()', () => {
    it('Should parse headers array to string', () => {
      const headers = [
        {
          name: 'x-test',
          value: 'value 1',
        },
        {
          name: 'x-test',
          value: 'value 2',
        },
        {
          name: 'Content-Type',
          value: 'application/json',
        },
      ];
      let ref = 'x-test: value 1, value 2\n';
      ref += 'Content-Type: application/json';
      const parsed = HeadersParser.toString(headers);
      assert.equal(parsed, ref);
    });

    it('Should parse Headers object to string', () => {
      const headers = new Headers();
      headers.append('x-test', 'value 1');
      headers.append('x-test', 'value 2');
      headers.append('Content-Type', 'application/json');

      const parsed = HeadersParser.toString(headers);
      assert.ok(
        parsed.match(/content-type:\s?application\/json/gim),
        'Contains content type'
      );
      assert.ok(
        parsed.match(/x-test:\s?value 1,\s?value 2/gim),
        'Contains concatenated headers'
      );
    });

    it('Should parse string to string', () => {
      let headers = 'x-test: value 1, value 2\n';
      headers += 'content-type: application/json';

      let ref = 'x-test: value 1, value 2\n';
      ref += 'content-type: application/json';
      const parsed = HeadersParser.toString(headers);
      assert.equal(parsed, ref);
    });
  });

  describe('contentType()', () => {
    it('Finds the Content-Type header', () => {
      let headers = 'x-test: value 1, value 2\n';
      headers += 'content-type: application/json\n';
      headers += 'x-test-2: v1\n';
      headers += 'x-test-2: v2';

      const ct = HeadersParser.contentType(headers);
      assert.equal(ct, 'application/json');
    });

    it('Returns null when no header', () => {
      let headers = 'x-test: value 1, value 2\n';
      headers += 'x-test-2: v1\n';
      headers += 'x-test-2: v2';

      const ct = HeadersParser.contentType(headers);
      assert.equal(ct, null);
    });

    it('Finds the multipart Content-Type header', () => {
      let headers = 'x-test: value 1, value 2\n';
      headers +=
        'content-type: multipart/mixed; boundary=gc0p4Jq0M2Yt08jU534c0p\n';
      headers += 'x-test-2: v1\n';
      headers += 'x-test-2: v2';

      const ct = HeadersParser.contentType(headers);
      assert.equal(ct, 'multipart/mixed; boundary=gc0p4Jq0M2Yt08jU534c0p');
    });

    it('Finds the Content-Type header with extension', () => {
      let headers = 'x-test: value 1, value 2\n';
      headers += 'content-type: text/html; charset=ISO-8859-4\n';
      headers += 'x-test-2: v1\n';
      headers += 'x-test-2: v2';

      const ct = HeadersParser.contentType(headers);
      assert.equal(ct, 'text/html');
    });

    it('Finds the Content-Type header in an array', () => {
      const headers = [
        {
          name: 'x-test',
          value: 'value 1, value 2',
        },
        {
          name: 'content-type',
          value: 'text/html; charset=ISO-8859-4',
        },
        {
          name: 'x-test-2',
          value: 'v1',
        },
      ];
      const ct = HeadersParser.contentType(headers);
      assert.equal(ct, 'text/html');
    });

    it('Returns null for empty array array', () => {
      const headers = [];
      const ct = HeadersParser.contentType(headers);
      assert.equal(ct, null);
    });
  });

  describe('replace()', () => {
    it('Replaces header value', () => {
      let headers = 'x-test: value 1, value 2\n';
      headers += 'content-type: text/html; charset=ISO-8859-4\n';
      headers += 'x-test-2: v1\n';
      headers += 'x-test-2: v2';

      headers = /** @type string */ (HeadersParser.replace(
        headers,
        'content-type',
        'application/json'
      ));
      const match = headers.match(/^content-type: (.*)$/im);
      assert.notEqual(match, null);
      assert.equal(match[1], 'application/json');
    });

    it('Replaces header value in Headers object', () => {
      const headers = new Headers();
      headers.append('x-test', 'value');
      const result = /** @type Headers */ (HeadersParser.replace(
        headers,
        'x-test',
        'replaced'
      ));
      const newValue = result.get('x-test');
      assert.equal(newValue, 'replaced');
    });

    it('Replaces header value in array', () => {
      const headers = [
        {
          name: 'x-test',
          value: 'value',
        },
      ];
      const result = HeadersParser.replace(headers, 'x-test', 'replaced');
      const newValue = result[0].value;
      assert.equal(newValue, 'replaced');
    });
  });

  describe('getError()', () => {
    it('Should not find error', () => {
      let headers = 'x-test: value 1, value 2\n';
      headers += 'content-type: text/html; charset=ISO-8859-4\n';
      headers += 'x-test-2: v1\n';
      headers += 'x-test-2: v2';

      const valid = HeadersParser.getError(headers);
      assert.equal(valid, null);
    });

    it('Should find empty value error', () => {
      let headers = 'x-test: \n';
      headers += 'content-type: text/html; charset=ISO-8859-4\n';
      headers += 'x-test-2: v1\n';
      headers += 'x-test-2: v2';

      const valid = HeadersParser.getError(headers);
      assert.equal(valid, 'Header value should not be empty');
    });

    it('finds error in an array', () => {
      const headers = [
        {
          name: 'x-test',
          value: '',
        },
        {
          name: 'x-test',
          value: 'value 2',
        },
        {
          name: 'Content-Type',
          value: 'application/json',
        },
      ];

      const valid = HeadersParser.getError(headers);
      assert.equal(valid, 'Header value should not be empty');
    });

    it('Should find no Content-Type error', () => {
      let headers = 'x-test: value 1, value 2\n';
      headers += 'x-test-2: v1\n';
      headers += 'x-test-2: v2';

      const valid = HeadersParser.getError(headers, true);
      assert.equal(valid, 'Content-Type header is not defined');
    });

    it('Should find no Content-Type error when no input', () => {
      const valid = HeadersParser.getError('', true);
      assert.equal(valid, 'Content-Type header is not defined');
    });

    it('finds no header name error', () => {
      const headers = [
        {
          name: '',
          value: 'value',
        },
        {
          name: 'x-test',
          value: 'value 2',
        },
        {
          name: 'Content-Type',
          value: 'application/json',
        },
      ];
      const valid = HeadersParser.getError(headers);
      assert.equal(valid, "Header name can't be empty");
    });

    it('finds white spaces in name error', () => {
      const headers = [
        {
          name: 'my header',
          value: 'value',
        },
        {
          name: 'x-test',
          value: 'value 2',
        },
        {
          name: 'Content-Type',
          value: 'application/json',
        },
      ];
      const valid = HeadersParser.getError(headers);
      assert.equal(valid, 'Header name should not contain white spaces');
    });

    it('returns null when no input', () => {
      const valid = HeadersParser.getError('');
      assert.equal(valid, null);
    });
  });

  describe('itemToString()', () => {
    it('should transform multi-line header value to single-line', () => {
      const header = {
          name: 'test-header',
          value: `line 1
line 2
line 3`,
      };
      const expected = 'test-header: line 1 line 2 line 3';
      const result = HeadersParser.itemToString(header);
      assert.equal(result, expected);
    });
  });
});
