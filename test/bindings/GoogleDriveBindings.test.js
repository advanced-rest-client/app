import { assert } from '@open-wc/testing'
import { GoogleDriveBindings } from '../../index.js';

describe('Bindings', () => {
  describe('GoogleDriveBindings', () => {
    /** @type GoogleDriveBindings */
    let instance;
    before(async () => {
      instance = new GoogleDriveBindings();
      await instance.initialize();
    });

    describe('#oauthConfig', () => {
      it('has the clientId', () => {
        assert.equal(instance.oauthConfig.clientId, '1076318174169-u4a5d3j2v0tbie1jnjgsluqk1ti7ged3.apps.googleusercontent.com');
      });

      it('has the authorizationUri', () => {
        assert.equal(instance.oauthConfig.authorizationUri, 'https://accounts.google.com/o/oauth2/v2/auth');
      });

      it('has the redirectUri', () => {
        assert.equal(instance.oauthConfig.redirectUri, 'https://auth.advancedrestclient.com/oauth2');
      });

      it('has the scopes', () => {
        assert.deepEqual(instance.oauthConfig.scopes, [
          'https://www.googleapis.com/auth/drive.file',
          'https://www.googleapis.com/auth/drive.install',
        ]);
      });
    });

    describe('read()', () => {
      it('throws error when called', async () => {
        let thrown = false;
        try {
          await instance.read('test');
        } catch (e) {
          thrown = true;
        }
        assert.isTrue(thrown);
      });
    });

    describe('write()', () => {
      it('throws error when called', async () => {
        let thrown = false;
        try {
          await instance.write('test', {});
        } catch (e) {
          thrown = true;
        }
        assert.isTrue(thrown);
      });
    });

    describe('listFolders()', () => {
      it('throws error when called', async () => {
        let thrown = false;
        try {
          await instance.listFolders();
        } catch (e) {
          thrown = true;
        }
        assert.isTrue(thrown);
      });
    });

    describe('notifyFilePicked()', () => {
      it('throws error when called', async () => {
        let thrown = false;
        try {
          await instance.notifyFilePicked('test');
        } catch (e) {
          thrown = true;
        }
        assert.isTrue(thrown);
      });
    });
  });
});
