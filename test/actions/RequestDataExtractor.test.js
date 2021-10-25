import { assert } from '@open-wc/testing';
import { ArcMock } from '@advanced-rest-client/arc-mock';
import { RequestDataExtractor } from '../../src/lib/actions/runner/RequestDataExtractor.js';

/** @typedef {import('@advanced-rest-client/events').ArcRequest.ARCHistoryRequest} ARCHistoryRequest */

describe('RequestDataExtractor()', () => {
  const generator = new ArcMock();

  /**
   * @param {string=} mime 
   * @returns string
   */
  function genHeaders(mime) {
    const cond = true;
    while(cond) {
      // this may returns empty string
      const result = generator.http.headers.headers('request', { mime });
      if (result) {
        return result;
      }
    }
    return undefined;
  }

  describe('extract()', () => {
    describe('request URL data', () => {
      /** @type ARCHistoryRequest */
      let request;
      beforeEach(() => {
        request = generator.http.history();
      });

      it('reads the host value', () => {
        request.url = 'https://api.domain.com/path?a=b';
        const instance = new RequestDataExtractor({ request });
        const result = instance.extract({
          source: 'url',
          type: 'request',
          path: 'host',
        });
        assert.equal(result, 'api.domain.com');
      });

      it('reads the protocol value', () => {
        request.url = 'https://api.domain.com/path?a=b';
        const instance = new RequestDataExtractor({ request });
        const result = instance.extract({
          source: 'url',
          type: 'request',
          path: 'protocol',
        });
        assert.equal(result, 'https:');
      });

      it('reads the path value', () => {
        request.url = 'https://api.domain.com/path/deep?a=b';
        const instance = new RequestDataExtractor({ request });
        const result = instance.extract({
          source: 'url',
          type: 'request',
          path: 'path',
        });
        assert.equal(result, '/path/deep');
      });

      it('reads the whole query value', () => {
        request.url = 'https://api.domain.com/path/deep?a=b&c=d';
        const instance = new RequestDataExtractor({ request });
        const result = instance.extract({
          source: 'url',
          type: 'request',
          path: 'query',
        });
        assert.equal(result, 'a=b&c=d');
      });

      it('reads the specific query value', () => {
        request.url = 'https://api.domain.com/path/deep?a=b&c=d';
        const instance = new RequestDataExtractor({ request });
        const result = instance.extract({
          source: 'url',
          type: 'request',
          path: 'query.a',
        });
        assert.equal(result, 'b');
      });

      it('reads the whole hash value', () => {
        request.url = 'https://api.domain.com/path/deep?a=b&c=d#e=f&g=h';
        const instance = new RequestDataExtractor({ request });
        const result = instance.extract({
          source: 'url',
          type: 'request',
          path: 'hash',
        });
        assert.equal(result, 'e=f&g=h');
      });

      it('reads the specific hash value', () => {
        request.url = 'https://api.domain.com/path/deep?a=b&c=d#e=f&g=h';
        const instance = new RequestDataExtractor({ request });
        const result = instance.extract({
          source: 'url',
          type: 'request',
          path: 'hash.e',
        });
        assert.equal(result, 'f');
      });
    });

    describe('response URL data', () => {
      let request;
      let executedRequest;
      beforeEach(() => {
        request = generator.http.history();
        executedRequest = { ...request, sourceMessage: '' };
      });

      it('reads the host value', () => {
        executedRequest.url = 'https://api.domain.com/path?a=b';
        const instance = new RequestDataExtractor({ request, executedRequest });
        const result = instance.extract({
          source: 'url',
          type: 'response',
          path: 'host',
        });
        assert.equal(result, 'api.domain.com');
      });

      it('reads the protocol value', () => {
        executedRequest.url = 'https://api.domain.com/path?a=b';
        const instance = new RequestDataExtractor({ request, executedRequest });
        const result = instance.extract({
          source: 'url',
          type: 'response',
          path: 'protocol',
        });
        assert.equal(result, 'https:');
      });

      it('reads the path value', () => {
        executedRequest.url = 'https://api.domain.com/path/deep?a=b';
        const instance = new RequestDataExtractor({ request, executedRequest });
        const result = instance.extract({
          source: 'url',
          type: 'response',
          path: 'path',
        });
        assert.equal(result, '/path/deep');
      });

      it('reads the whole query value', () => {
        executedRequest.url = 'https://api.domain.com/path/deep?a=b&c=d';
        const instance = new RequestDataExtractor({ request, executedRequest });
        const result = instance.extract({
          source: 'url',
          type: 'response',
          path: 'query',
        });
        assert.equal(result, 'a=b&c=d');
      });

      it('reads the specific query value', () => {
        executedRequest.url = 'https://api.domain.com/path/deep?a=b&c=d';
        const instance = new RequestDataExtractor({ request, executedRequest });
        const result = instance.extract({
          source: 'url',
          type: 'response',
          path: 'query.a',
        });
        assert.equal(result, 'b');
      });

      it('returns empty string when query value not found', () => {
        executedRequest.url = 'https://api.domain.com/path/deep?a=b&c=d#e=f&g=h';
        const instance = new RequestDataExtractor({ request, executedRequest });
        const result = instance.extract({
          source: 'url',
          type: 'response',
          path: 'query.x',
        });
        assert.isUndefined(result);
      });

      it('reads the whole hash value', () => {
        executedRequest.url = 'https://api.domain.com/path/deep?a=b&c=d#e=f&g=h';
        const instance = new RequestDataExtractor({ request, executedRequest });
        const result = instance.extract({
          source: 'url',
          type: 'response',
          path: 'hash',
        });
        assert.equal(result, 'e=f&g=h');
      });

      it('reads the specific hash value', () => {
        executedRequest.url = 'https://api.domain.com/path/deep?a=b&c=d#e=f&g=h';
        const instance = new RequestDataExtractor({ request, executedRequest });
        const result = instance.extract({
          source: 'url',
          type: 'response',
          path: 'hash.e',
        });
        assert.equal(result, 'f');
      });

      it('returns empty string when hash value not found', () => {
        executedRequest.url = 'https://api.domain.com/path/deep?a=b&c=d#e=f&g=h';
        const instance = new RequestDataExtractor({ request, executedRequest });
        const result = instance.extract({
          source: 'url',
          type: 'response',
          path: 'hash.x',
        });
        assert.isUndefined(result);
      });
    });
    
    describe('request headers data', () => {
      /** @type ARCHistoryRequest */
      let request;
      beforeEach(() => {
        request = generator.http.history();
      });

      it('reads the header value', () => {
        const ct = generator.http.headers.contentType();
        request.headers = genHeaders(ct);
        const instance = new RequestDataExtractor({ request });
        const result = instance.extract({
          type: 'request',
          source: 'headers',
          path: 'content-type',
        });
        assert.equal(result, ct);
      });

      it('reads the entire headers value', () => {
        const ct = generator.http.headers.contentType();
        request.headers = genHeaders(ct);
        const instance = new RequestDataExtractor({ request });
        const result = instance.extract({
          type: 'request',
          source: 'headers',
        });
        assert.equal(result, request.headers);
      });

      it('returns undefined when not found', () => {
        request.headers = genHeaders();
        const instance = new RequestDataExtractor({ request });
        const result = instance.extract({
          type: 'request',
          source: 'headers',
          path: 'non-existing',
        });
        assert.isUndefined(result);
      });
    });

    describe('response headers data', () => {
      let request;
      let executedRequest;
      let response;
      beforeEach(() => {
        request = generator.http.history();
        executedRequest = { ...request, sourceMessage: '' };
        response = generator.http.response.arcResponse();
      });

      it('reads the header value', () => {
        const ct = generator.http.headers.contentType();
        response.headers = genHeaders(ct);
        const instance = new RequestDataExtractor({ request, executedRequest, response });
        const result = instance.extract({
          type: 'response',
          source: 'headers',
          path: 'content-type',
        });
        assert.equal(result, ct);
      });

      it('reads the entire headers value', () => {
        response.headers = genHeaders();
        const instance = new RequestDataExtractor({ request, executedRequest, response });
        const result = instance.extract({
          type: 'response',
          source: 'headers',
        });
        assert.equal(result, response.headers);
      });

      it('returns undefined when not found', () => {
        response.headers = genHeaders();
        const instance = new RequestDataExtractor({ request, executedRequest, response });
        const result = instance.extract({
          type: 'response',
          source: 'headers',
          path: 'non-existing',
        });
        assert.isUndefined(result);
      });
    });

    describe('response status code', () => {
      let request;
      let executedRequest;
      let response;
      beforeEach(() => {
        request = generator.http.history();
        executedRequest = { ...request, sourceMessage: '' };
        response = generator.http.response.arcResponse();
      });

      it('reads the status value', () => {
        const instance = new RequestDataExtractor({ request, executedRequest, response });
        const result = instance.extract({
          type: 'response',
          source: 'status',
        });
        assert.equal(result, response.status);
      });
    });

    describe('response body', () => {
      describe('JSON body', () => {
        let request;
        let executedRequest;
        let response;
        beforeEach(() => {
          request = generator.http.history();
          executedRequest = { ...request, sourceMessage: '' };
          response = generator.http.response.arcResponse();
        });
  
        it('reads data in the JSON path', () => {
          response.headers = generator.http.headers.headers('response', {mime: 'application/json'});
          response.payload = JSON.stringify({
            a: {
              path: {
                to: {
                  a: 'value'
                }
              }
            }
          });
          const instance = new RequestDataExtractor({ request, executedRequest, response });
          const result = instance.extract({
            type: 'response',
            source: 'body',
            path: 'a.path.to.a'
          });
          assert.equal(result, 'value');
        });
  
        it('reads data in an array', () => {
          response.headers = generator.http.headers.headers('response', {mime: 'application/json'});
          response.payload = JSON.stringify({
            items: [
              {
                name: 'i1'
              },
              {
                name: 'i2'
              }
            ],
          });
          const instance = new RequestDataExtractor({ request, executedRequest, response });
          const result = instance.extract({
            type: 'response',
            source: 'body',
            path: 'items.1.name'
          });
          assert.equal(result, 'i2');
        });
  
        it('reads data in an array with an iterator', () => {
          response.headers = generator.http.headers.headers('response', {mime: 'application/json'});
          response.payload = JSON.stringify({
            items: [
              {
                name: 'i1',
                value: 'v1',
              },
              {
                name: 'i2',
                value: 'v2',
              }
            ],
          });
          const instance = new RequestDataExtractor({ request, executedRequest, response });
          const result = instance.extract({
            type: 'response',
            source: 'body',
            path: 'items.*.value',
            iterator: {
              path: 'name',
              operator: 'equal',
              condition: "i2",
            },
          });
          assert.equal(result, 'v2');
        });
  
        it('reads data in an array with an iterator (old paths resolver)', () => {
          response.headers = generator.http.headers.headers('response', {mime: 'application/json'});
          response.payload = JSON.stringify({
            items: [
              {
                name: 'i1',
                value: 'v1',
              },
              {
                name: 'i2',
                value: 'v2',
              }
            ],
          });
          const instance = new RequestDataExtractor({ request, executedRequest, response });
          const result = instance.extract({
            type: 'response',
            source: 'body',
            path: 'value',
            iterator: {
              path: 'items.*.name',
              operator: 'equal',
              condition: "i2",
            },
          });
          assert.equal(result, 'v2');
        });
  
        it('reads data in an object with an iterator (old paths resolver)', () => {
          response.headers = generator.http.headers.headers('response', {mime: 'application/json'});
          response.payload = JSON.stringify({
            id: 'id1',
            properties: {
              first: 'Test1',
              last: 'Name',
              id: 'testId1'
            },
            deep: {
              value: {
                properties: {
                  first: 'Test2',
                  last: 'Name',
                  id: 'testId2'
                }
              }
            }
          });
          const instance = new RequestDataExtractor({ request, executedRequest, response });
          const result = instance.extract({
            type: 'response',
            source: 'body',
            path: 'id',
            iterator: {
              path: 'properties.*.first',
              operator: 'equal',
              condition: 'Test1'
            },
          });
          assert.equal(result, 'testId1');
        });
  
        it('reads data in an object with an iterator', () => {
          response.headers = generator.http.headers.headers('response', {mime: 'application/json'});
          response.payload = JSON.stringify({
            id: 'id1',
            properties: {
              first: 'Test1',
              last: 'Name',
              id: 'testId1'
            },
            deep: {
              value: {
                properties: {
                  first: 'Test2',
                  last: 'Name',
                  id: 'testId2'
                }
              }
            }
          });
          const instance = new RequestDataExtractor({ request, executedRequest, response });
          const result = instance.extract({
            type: 'response',
            source: 'body',
            path: 'properties.*.id',
            iterator: {
              path: 'first',
              operator: 'equal',
              condition: 'Test1',
            },
          });
          assert.equal(result, 'testId1');
        });
      });
    
      describe('XML body', () => {
        const xmlStr = `<?xml version="1.0"?>
        <people xmlns:xul="some.xul" boolean-attribute="true">
          <person db-id="test1">
            <name first="george" last="bush" />
            <address street="1600 pennsylvania avenue" city="washington" country="usa"/>
            <phoneNumber>202-456-1111</phoneNumber>
          </person>
          <person db-id="test2">
            <name first="tony" last="blair" />
            <address street="10 downing street" city="london" country="uk"/>
            <phoneNumber>020 7925 0918</phoneNumber>
          </person>
        </people>`;
        let request;
        let executedRequest;
        let response;
        let instance = /** @type RequestDataExtractor */ (null);
        beforeEach(() => {
          request = generator.http.history();
          // @ts-ignore
          executedRequest = { ...request, sourceMessage: '' };
          response = generator.http.response.arcResponse({ noBody: true });
          response.headers = generator.http.headers.headers('response', {mime: 'application/xml'});
          response.payload = xmlStr;
          instance = new RequestDataExtractor({ request, executedRequest, response });
        });
  
        it('reads data in the XML path', () => {
          const result = instance.extract({
            type: 'response',
            source: 'body',
            path: 'person',
          });
          assert.isTrue(result.toString().startsWith('<name first="george"'));
        });

        it('parses array path', () => {
          const result = instance.extract({
            type: 'response',
            source: 'body',
            path: 'people.person',
          });
          assert.isTrue(result.toString().startsWith('<name'));
        });

        it('parses complex path', () => {
          const result = instance.extract({
            type: 'response',
            source: 'body',
            path: 'people.person.1.phoneNumber',
          });
          assert.equal(result, '020 7925 0918');
        });

        it('reads an attribute value', () => {
          const result = instance.extract({
            type: 'response',
            source: 'body',
            path: 'people.person.0.attr(db-id)',
          });
          assert.equal(result, 'test1');
        });

        it('reads an attribute value in array deep path', () => {
          const result = instance.extract({
            type: 'response',
            source: 'body',
            path: 'people.person.1.name.attr(first)',
          });
          assert.equal(result, 'tony');
        });

        it('reads and attribute value with a namespace', () => {
          const result = instance.extract({
            type: 'response',
            source: 'body',
            path: 'people.attr(xmlns:xul)',
          });
          assert.equal(result, 'some.xul');
        });

        it('rets boolean attribute value', () => {
          const result = instance.extract({
            type: 'response',
            source: 'body',
            path: 'people.attr(boolean-attribute)',
          });
          assert.equal(result, 'true');
        });
      });
    });
  });
});
