import { assert } from '@open-wc/testing'
import { Events } from '@advanced-rest-client/events';
import { EncryptionBindings } from '../../index.js';

describe('Bindings', () => {
  describe('EncryptionBindings', () => {
    /** @type EncryptionBindings */
    let instance;
    before(async () => {
      instance = new EncryptionBindings();
      await instance.initialize();
    });

    describe('encrypt()', () => {
      it('throws error when unknown method', async () => {
        let thrown = false;
        try {
          await instance.encrypt('some', 'pwd', 'unknown');
        } catch (e) {
          thrown = true;
        }
        assert.isTrue(thrown);
      });

      it('encrypts AES', async () => {
        const result = await instance.encrypt('some', 'pwd', 'aes');
        assert.typeOf(result, 'string');
      });

      it('encrypts via the event', async () => {
        const result = await Events.Encryption.encrypt(document.body, 'some', 'pwd', 'aes');
        assert.typeOf(result, 'string');
      });
    });

    describe('decrypt()', () => {
      it('throws error when unknown method', async () => {
        let thrown = false;
        try {
          await instance.decrypt('some', 'pwd', 'unknown');
        } catch (e) {
          thrown = true;
        }
        assert.isTrue(thrown);
      });

      it('decrypts AES', async () => {
        const encrypted = await instance.encrypt('my secret', 'pwd', 'aes');
        const result = await instance.decrypt(encrypted, 'pwd', 'aes');
        assert.equal(result, 'my secret');
      });

      it('decrypts via the event', async () => {
        const encrypted = await instance.encrypt('my secret', 'pwd', 'aes');
        const result = await Events.Encryption.decrypt(document.body, encrypted, 'pwd', 'aes');
        assert.equal(result, 'my secret');
      });
    });
  });
});
