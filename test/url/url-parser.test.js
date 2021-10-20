/* eslint-disable func-names */
/* eslint-disable prefer-template */
/* eslint-disable no-template-curly-in-string */
/* eslint-disable max-len */
import { assert } from '@open-wc/testing';
import { UrlParser } from '../../src/lib/UrlParser.js';

describe('parser', () => {
  describe('properties parser', () => {
    const basics = [
      {
        url: 'http://domain.com',
        protocol: 'http:',
        host: 'domain.com',
        path: '/',
        search: undefined,
        anchor: undefined
      },
      {
        url: 'http://domain.com/path',
        protocol: 'http:',
        host: 'domain.com',
        path: '/path',
        search: undefined,
        anchor: undefined
      },
      {
        url: 'http://domain.com/path/endpoint',
        protocol: 'http:',
        host: 'domain.com',
        path: '/path/endpoint',
        search: undefined,
        anchor: undefined
      },
      {
        url: 'http://domain.com/path/endpoint?param',
        protocol: 'http:',
        host: 'domain.com',
        path: '/path/endpoint',
        search: 'param',
        anchor: undefined
      },
      {
        url: 'http://domain.com/path/endpoint?param=value',
        protocol: 'http:',
        host: 'domain.com',
        path: '/path/endpoint',
        search: 'param=value',
        anchor: undefined
      },
      {
        url: 'http://domain.com/path/endpoint?param=value&other',
        protocol: 'http:',
        host: 'domain.com',
        path: '/path/endpoint',
        search: 'param=value&other',
        anchor: undefined
      },
      {
        url: 'http://domain.com/path/endpoint?param=value&other=value#123',
        protocol: 'http:',
        host: 'domain.com',
        path: '/path/endpoint',
        search: 'param=value&other=value',
        anchor: '123'
      },
      {
        url: 'http://domain.com/path/endpoint?${variable}=value&other=value',
        protocol: 'http:',
        host: 'domain.com',
        path: '/path/endpoint',
        search: '${variable}=value&other=value',
        anchor: undefined
      },
      {
        url: 'http://domain.com/path/endpoint?param=${variable}&other=value',
        protocol: 'http:',
        host: 'domain.com',
        path: '/path/endpoint',
        search: 'param=${variable}&other=value',
        anchor: undefined
      },
      {
        url: '${variable}',
        protocol: undefined,
        host: '${variable}',
        path: '/',
        search: undefined,
        anchor: undefined
      },
      {
        url: 'http://domain.com/${variable}',
        protocol: 'http:',
        host: 'domain.com',
        path: '/${variable}',
        search: undefined,
        anchor: undefined
      },
      {
        url: 'http://domain${variable}',
        protocol: 'http:',
        host: 'domain${variable}',
        path: '/',
        search: undefined,
        anchor: undefined
      },
      {
        url: 'http://domain${variable}/',
        protocol: 'http:',
        host: 'domain${variable}',
        path: '/',
        search: undefined,
        anchor: undefined
      },
      {
        url: '${variable}://',
        protocol: '${variable}:',
        host: undefined,
        path: '/',
        search: undefined,
        anchor: undefined
      },
      {
        url: '${variable}://host',
        protocol: '${variable}:',
        host: 'host',
        path: '/',
        search: undefined,
        anchor: undefined
      },
      {
        url: '',
        protocol: undefined,
        host: undefined,
        path: '/',
        search: undefined,
        anchor: undefined
      },
      {
        url: '${variable}://${variable}:${variable}/${var}',
        protocol: '${variable}:',
        host: '${variable}:${variable}',
        path: '/${var}',
        search: undefined,
        anchor: undefined
      },
      {
        url: '/path/api?query=true#access_token=abc',
        protocol: undefined,
        host: '',
        path: '/path/api',
        search: 'query=true',
        anchor: 'access_token=abc'
      },
    ];

    basics.forEach((item) => {
      it('Parsing properties for: ' + item.url, () => {
        const parser = new UrlParser(item.url);

        assert.equal(parser.protocol, item.protocol, 'Protocol equals ' + item.protocol);
        assert.equal(parser.host, item.host, 'Host equals ' + item.host);
        assert.equal(parser.path, item.path, 'Path equals ' + item.path);
        assert.equal(parser.search, item.search, 'Search equals ' + item.search);
        assert.equal(parser.anchor, item.anchor, 'Anchor equals ' + item.anchor);
      });
    });
  });

  describe('search params parser', () => {
    const basics = [
      {
        url: 'http://domain.com',
        params: []
      },
      {
        url: 'http://domain.com/path/endpoint?param',
        params: [['param', '']]
      },
      {
        url: 'http://domain.com/path/endpoint?param=value',
        params: [['param', 'value']]
      },
      {
        url: 'http://domain.com/path/endpoint?param=value&other',
        params: [['param', 'value'], ['other', '']]
      },
      {
        url: 'http://domain.com/path/endpoint?param=value&other=value#123',
        params: [['param', 'value'], ['other', 'value']]
      },
      {
        url: 'http://domain.com/path/endpoint?${variable}=value&other=value',
        params: [['${variable}', 'value'], ['other', 'value']]
      },
      {
        url: 'http://domain.com/path/endpoint?param=${variable}&other=value',
        params: [['param', '${variable}'], ['other', 'value']]
      },
      {
        url: '${variable}://${variable}:${variable}/${var}?${param}',
        params: [['${param}', '']]
      }
    ];

    basics.forEach((item) => {
      it('Parsing search params for: ' + item.url, () => {
        const parser = new UrlParser(item.url);
        assert.deepEqual(parser.searchParams, item.params);
      });
    });
  });

  describe('search params setter', () => {
    const basics = [
      {
        url: 'http://domain.com',
        result: 'http://domain.com/?test-param=param-value'
      },
      {
        url: 'http://domain.com/path/endpoint?param',
        result: 'http://domain.com/path/endpoint?param=&test-param=param-value'
      },
      {
        url: 'http://domain.com/path/endpoint?param=value',
        result: 'http://domain.com/path/endpoint?param=value&test-param=param-value'
      },
      {
        url: 'http://domain.com/path/endpoint?param=value&other',
        result: 'http://domain.com/path/endpoint?param=value&other=&test-param=param-value'
      },
      {
        url: 'http://domain.com/path/endpoint?param=value&other=value#123',
        result: 'http://domain.com/path/endpoint?param=value&other=value&test-param=param-value#123'
      },
      {
        url: 'http://domain.com/path/endpoint?${variable}=value&other=value',
        result: 'http://domain.com/path/endpoint?${variable}=value&other=value&test-param=param-value'
      },
      {
        url: 'http://domain.com/path/endpoint?param=${variable}=&other=value',
        result: 'http://domain.com/path/endpoint?param=${variable}=&other=value&test-param=param-value'
      },
      {
        url: '${variable}://${variable}:${variable}/${var}?${param}',
        result: '${variable}://${variable}:${variable}/${var}?${param}=&test-param=param-value'
      },
      {
        url:
          'https://domain.com/rest/action/?SessionKey=KjNsfHeNoC2seiep9T|HOcjRbsxtDlt9ZcyZ9z1g==|Ox7v3IUnMPJgBtDO3szndTGi/5zBY=&ContactCode=40024560',
        result:
          'https://domain.com/rest/action/?SessionKey=KjNsfHeNoC2seiep9T|HOcjRbsxtDlt9ZcyZ9z1g==|Ox7v3IUnMPJgBtDO3szndTGi/5zBY=&ContactCode=40024560&test-param=param-value'
      }
    ];

    basics.forEach((item) => {
      it('Parsing search params for: ' + item.url, () => {
        const parser = new UrlParser(item.url);
        const params = parser.searchParams;
        params.push(['test-param', 'param-value']);
        parser.searchParams = params;
        assert.equal(parser.value, item.result);
      });
    });
  });

  describe('toString()', () => {
    const basics = [
      {
        url: 'http://domain.com',
        result: 'http://domain.com/'
      },
      {
        url: 'http://domain.com/path/endpoint?param',
        result: 'http://domain.com/path/endpoint?param='
      },
      {
        url: 'http://domain.com/path/endpoint?param=value',
        result: 'http://domain.com/path/endpoint?param=value'
      },
      {
        url: 'http://domain.com/path/endpoint?param=value&other',
        result: 'http://domain.com/path/endpoint?param=value&other='
      },
      {
        url: 'http://domain.com/path/endpoint?param=value&other=value#123',
        result: 'http://domain.com/path/endpoint?param=value&other=value#123'
      },
      {
        url: 'domain.com',
        result: 'domain.com/'
      },
      {
        url: 'http://',
        result: 'http://'
      },
      {
        url: '${variable}://',
        result: '${variable}://'
      },
      {
        url: '/path/api?query=true',
        result: '/path/api?query=true'
      }
    ];

    basics.forEach((item) => {
      it('Parsing url: ' + item.url, () => {
        const parser = new UrlParser(item.url);
        assert.equal(parser.value, item.result);
      });
    });
  });
});
