/* eslint-disable no-script-url */
import { assert } from '@open-wc/testing';
import * as Utils  from '../../src/elements/authorization/Utils.js';

describe('Utils', () => {
  describe('normalizeType()', () => {
    it('returns when no argument', () => {
      const result = Utils.normalizeType(undefined);
      assert.isUndefined(result);
    });

    it('lowercase the input', () => {
      const result = Utils.normalizeType('BAsic');
      assert.equal(result, 'basic');
    });
  });

  describe('checkUrl()', () => {
    it('throws when no argument', () => {
      assert.throws(() => {
        Utils.checkUrl(undefined);
      }, 'the value is missing');
    });

    it('throws when argument is not a string', () => {
      assert.throws(() => {
        // @ts-ignore
        Utils.checkUrl(100);
      }, 'the value is not a string');
    });

    it('throws when argument does not start with http or https', () => {
      assert.throws(() => {
        Utils.checkUrl('javascript:http://%0Aalert(document.domain);//');
      }, 'the value has invalid scheme');
    });

    it('passes for valid http: scheme', () => {
      Utils.checkUrl('http://api.domain.com');
    });

    it('passes for valid https: scheme', () => {
      Utils.checkUrl('https://api.domain.com');
    });
  });

  describe('sanityCheck()', () => {
    it('throws when accessTokenUri is invalid', () => {
      assert.throws(() => {
        Utils.sanityCheck({
          accessTokenUri: 'javascript://'
        });
      });
    });

    it('implicit: throws when accessTokenUri is invalid', () => {
      assert.throws(() => {
        Utils.sanityCheck({
          authorizationUri: 'https://domain.com',
          accessTokenUri: 'javascript://',
          grantType: 'implicit'
        });
      });
    });

    it('implicit: throws when authorizationUri is invalid', () => {
      assert.throws(() => {
        Utils.sanityCheck({
          authorizationUri: 'javascript://',
          grantType: 'implicit'
        });
      });
    });

    it('implicit: throws when redirectUri is invalid', () => {
      assert.throws(() => {
        Utils.sanityCheck({
          authorizationUri: 'javascript://',
          grantType: 'implicit'
        });
      });
    });

    it('authorization_code: throws when accessTokenUri is invalid', () => {
      assert.throws(() => {
        Utils.sanityCheck({
          authorizationUri: 'https://domain.com',
          accessTokenUri: 'javascript://',
          grantType: 'authorization_code'
        });
      });
    });

    it('authorization_code: throws when authorizationUri is invalid', () => {
      assert.throws(() => {
        Utils.sanityCheck({
          authorizationUri: 'javascript://',
          grantType: 'authorization_code'
        });
      });
    });

    it('authorization_code: throws when redirectUri is invalid', () => {
      assert.throws(() => {
        Utils.sanityCheck({
          authorizationUri: 'javascript://',
          grantType: 'authorization_code'
        });
      });
    });
  });

  describe('randomString()', () => {
    it('generates a random string', () => {
      const result = Utils.randomString();
      assert.typeOf(result, 'string');
    });
  });

  describe('camel()', () => {
    it('returns undefined if not changed', () => {
      const result = Utils.camel('noop');
      assert.isUndefined(result);
    });

    it('returns camel cased with "-"', () => {
      const result = Utils.camel('property-name-item');
      assert.equal(result, 'propertyNameItem');
    });

    it('returns camel cased with "_"', () => {
      const result = Utils.camel('property_name_item');
      assert.equal(result, 'propertyNameItem');
    });
  });
});
