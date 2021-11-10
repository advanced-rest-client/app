import { assert } from '@open-wc/testing'
import { HttpRequestBindings } from '../../index.js';

describe('Bindings', () => {
  describe('HttpRequestBindings', () => {
    /** @type HttpRequestBindings */
    let instance;
    before(async () => {
      // @ts-ignore
      instance = new HttpRequestBindings(window.Jexl);
      await instance.initialize();
    });

    describe('#variablesEnabled', () => {
      afterEach(() => {
        instance.config = {};
      });

      it('returns the default value', () => {
        assert.isTrue(instance.variablesEnabled);
      });

      it('returns the config value', () => {
        instance.config.request = {
          useAppVariables: false,
        };
        assert.isFalse(instance.variablesEnabled);
      });
    });

    describe('#systemVariablesEnabled', () => {
      afterEach(() => {
        instance.config = {};
      });

      it('returns the default value', () => {
        assert.isTrue(instance.systemVariablesEnabled);
      });

      it('returns the config value', () => {
        instance.config.request = {
          useSystemVariables: false,
        };
        assert.isFalse(instance.systemVariablesEnabled);
      });
    });

    describe('#validateCertificates', () => {
      afterEach(() => {
        instance.config = {};
      });

      it('returns the default value', () => {
        assert.isFalse(instance.validateCertificates);
      });

      it('returns the config value', () => {
        instance.config.request = {
          validateCertificates: true,
        };
        assert.isTrue(instance.validateCertificates);
      });
    });

    describe('#followRedirects', () => {
      afterEach(() => {
        instance.config = {};
      });

      it('returns the default value', () => {
        assert.isTrue(instance.followRedirects);
      });

      it('returns the config value', () => {
        instance.config.request = {
          followRedirects: false,
        };
        assert.isFalse(instance.followRedirects);
      });
    });

    describe('#nativeTransport', () => {
      afterEach(() => {
        instance.config = {};
      });

      it('returns the default value', () => {
        assert.isFalse(instance.nativeTransport);
      });

      it('returns the config value', () => {
        instance.config.request = {
          nativeTransport: true,
        };
        assert.isTrue(instance.nativeTransport);
      });
    });

    describe('#readOsHosts', () => {
      afterEach(() => {
        instance.config = {};
      });

      it('returns the default value', () => {
        assert.isFalse(instance.readOsHosts);
      });

      it('returns the config value', () => {
        instance.config.request = {
          readOsHosts: true,
        };
        assert.isTrue(instance.readOsHosts);
      });
    });

    describe('#defaultHeaders', () => {
      afterEach(() => {
        instance.config = {};
      });

      it('returns the default value', () => {
        assert.isFalse(instance.defaultHeaders);
      });

      it('returns the config value', () => {
        instance.config.request = {
          defaultHeaders: true,
        };
        assert.isTrue(instance.defaultHeaders);
      });
    });

    describe('#requestTimeout', () => {
      afterEach(() => {
        instance.config = {};
      });

      it('returns the default value', () => {
        assert.equal(instance.requestTimeout, 0);
      });

      it('returns the config value', () => {
        instance.config.request = {
          timeout: 10,
        };
        assert.equal(instance.requestTimeout, 10);
      });

      it('accepts a string value', () => {
        instance.config.request = {
          // @ts-ignore
          timeout: '10',
        };
        assert.equal(instance.requestTimeout, 10);
      });
    });
    
    describe('#proxyEnabled', () => {
      afterEach(() => {
        instance.config = {};
      });

      it('returns the default value', () => {
        assert.isFalse(instance.proxyEnabled);
      });

      it('returns the config value', () => {
        instance.config.proxy = {
          enabled: true,
        };
        assert.isTrue(instance.proxyEnabled);
      });
    });

    describe('#proxyUsername', () => {
      afterEach(() => {
        instance.config = {};
      });

      it('returns the default value', () => {
        assert.isUndefined(instance.proxyUsername);
      });

      it('returns the config value', () => {
        instance.config.proxy = {
          username: 'uname',
        };
        assert.equal(instance.proxyUsername, 'uname');
      });
    });

    describe('#proxyPassword', () => {
      afterEach(() => {
        instance.config = {};
      });

      it('returns the default value', () => {
        assert.isUndefined(instance.proxyPassword);
      });

      it('returns the config value', () => {
        instance.config.proxy = {
          password: 'passwd',
        };
        assert.equal(instance.proxyPassword, 'passwd');
      });
    });

    describe('#proxy', () => {
      afterEach(() => {
        instance.config = {};
      });

      it('returns the default value', () => {
        assert.isUndefined(instance.proxy);
      });

      it('returns the config value', () => {
        instance.config.proxy = {
          url: 'http://proxy.com',
        };
        assert.equal(instance.proxy, 'http://proxy.com');
      });
    });

    describe('transport()', () => {
      it('throws error when called', async () => {
        let thrown = false;
        try {
          await instance.transport(undefined, 'test');
        } catch (e) {
          thrown = true;
        }
        assert.isTrue(thrown);
      });
    });
  });
});
