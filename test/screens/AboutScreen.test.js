import { assert, aTimeout, nextFrame } from '@open-wc/testing';
import { del, set } from 'idb-keyval';
import sinon from 'sinon';
import { Events, EventTypes } from '@advanced-rest-client/events';
import { AboutScreen } from '../../index.js';
import { DemoBindings } from '../../demo/lib/DemoBindings.js';
import { settingsKey } from '../../src/bindings/web/ConfigurationBindingsWeb.js';

/** @typedef {import('@advanced-rest-client/events').Config.ARCConfig} ARCConfig */
/** @typedef {import('electron-updater').UpdateInfo} UpdateInfo */

describe('AboutScreen', () => {
  /** @type HTMLElement */
  let root;
  /** @type AboutScreen */
  let screen;
  before(async () => {
    await del(settingsKey);
    root = document.createElement('div');
    root.id = 'app';
    document.body.append(root);

    const bindings = new DemoBindings();
    await bindings.initialize();

    screen = new AboutScreen();
    await screen.initialize();
    await screen.updateComplete;
  });

  after(async () => {
    document.body.removeChild(root);
    await del(settingsKey);
  });

  describe('Initializing', () => {
    it('loads the application theme', () => {
      const node = /** @type HTMLLinkElement */ (document.head.querySelector('link[rel="stylesheet"][arc-theme="true"]'));
      assert.ok(node);
    });

    it('sets the default #allowPreRelease', () => {
      assert.isFalse(screen.allowPreRelease);
    });

    it('sets the default #autoUpdate', () => {
      assert.isFalse(screen.autoUpdate);
    });

    it('sets the #versionInfo', () => {
      assert.typeOf(screen.versionInfo, 'object');
    });

    it('sets the settings based #allowPreRelease', async () => {
      const cnf = /** @type ARCConfig */ ({
        updater: {
          allowPreRelease: true,
        },
      });
      await set(settingsKey, cnf);
      await screen.setupConfig();
      assert.isTrue(screen.allowPreRelease);
    });

    it('sets the settings based #autoUpdate', async () => {
      const cnf = /** @type ARCConfig */ ({
        updater: {
          auto: true,
        },
      });
      await set(settingsKey, cnf);
      await screen.setupConfig();
      assert.isTrue(screen.autoUpdate);
    });
  });

  describe('View rendering', () => {
    it('renders the version info', () => {
      const node = document.querySelector('.version-meta .version');
      assert.equal(node.textContent.trim(), 'Version: 0.0.0-demo');
    });

    it('renders the version release notes link', async () => {
      const node = /** @type HTMLAnchorElement */ (document.querySelector('.version-meta a'));
      assert.equal(node.href, 'https://github.com/advanced-rest-client/arc-electron/releases/tag/v0.0.0-demo');
    });

    it('renders the check for updates button', () => {
      const node = document.querySelector('.update-status [data-button="update-check"]');
      assert.ok(node);
    });

    it('does not render the install updates button', () => {
      const node = document.querySelector('.update-status [data-button="update-install"]');
      assert.notOk(node);
    });

    it('renders the auto install button', () => {
      const node = document.querySelector('anypoint-switch[data-button="auto-update"]');
      assert.ok(node);
    });

    it('renders the pre-release button', () => {
      const node = document.querySelector('anypoint-switch[data-button="allow-pre-release"]');
      assert.ok(node);
    });
  });

  describe('Settings changing', () => {
    before(async () => {
      const cnf = /** @type ARCConfig */ ({
        updater: {
          allowPreRelease: false,
          auto: false,
        },
      });
      await set(settingsKey, cnf);
      await screen.setupConfig();
      screen.render();
      await screen.updateComplete;
    });

    it('toggles the auto-install option', async () => {
      const node = /** @type HTMLElement */ (document.querySelector('anypoint-switch[data-button="auto-update"]'));
      const spy = sinon.spy();
      window.addEventListener(EventTypes.Config.update, spy);
      node.click();
      await aTimeout(1);
      window.removeEventListener(EventTypes.Config.update, spy);
      const { key, value, result } = spy.args[0][0].detail;
      assert.equal(key, 'updater.auto', 'the change event has the key');
      assert.equal(value, true, 'the change event has the value');
      await result;
    });

    it('toggles the pre-release option', async () => {
      const node = /** @type HTMLElement */ (document.querySelector('anypoint-switch[data-button="allow-pre-release"]'));
      const spy = sinon.spy();
      window.addEventListener(EventTypes.Config.update, spy);
      node.click();
      await aTimeout(1);
      window.removeEventListener(EventTypes.Config.update, spy);
      const { key, value, result } = spy.args[0][0].detail;
      assert.equal(key, 'updater.allowPreRelease', 'the change event has the key');
      assert.equal(value, true, 'the change event has the value');
      await result;
    });
  });

  describe('Updater events', () => {
    after(async () => {
      screen.updateStatePage = 0;
      await screen.updateComplete;
    });

    it('shows checking for update state', async () => {
      Events.Updater.State.checkingForUpdate(document.body);
      await nextFrame();
      assert.equal(screen.updateStatePage, 1, 'sets the updateStatePage');
      const node = document.querySelector('.update-message');
      assert.equal(node.textContent.trim(), 'Checking for update...', 'renders the status message');
    });

    it('shows checking for update state', async () => {
      Events.Updater.State.downloadProgress(document.body, {});
      await nextFrame();
      assert.equal(screen.updateStatePage, 2, 'sets the updateStatePage');
      const node = document.querySelector('.update-message');
      assert.equal(node.textContent.trim(), 'Downloading update...', 'renders the status message');
    });

    it('re-sets the view when an update is not available', async () => {
      Events.Updater.State.checkingForUpdate(document.body);
      await nextFrame();
      Events.Updater.State.updateNotAvailable(document.body);
      await nextFrame();
      assert.equal(screen.updateStatePage, 0, 'sets the updateStatePage');
      const node = document.querySelector('.update-message');
      assert.equal(node.textContent.trim(), 'ARC is up to date ❤', 'renders the status message');
    });

    it('sets the update available status', async () => {
      const info = /** @type UpdateInfo */ ({
        version: '1', 
        files: [], 
        path: '', 
        sha512: '', 
        releaseDate: '',
      });
      Events.Updater.State.checkingForUpdate(document.body);
      await nextFrame();
      Events.Updater.State.updateAvailable(document.body, info);
      await nextFrame();
      assert.equal(screen.updateStatePage, 5, 'sets the updateStatePage');
      assert.deepEqual(screen.upgradeInfo, info, 'sets the upgradeInfo');
      const node = document.querySelector('.update-message');
      assert.equal(node.textContent.trim(), 'Update available', 'renders the status message');
    });

    it('sets the update downloaded status', async () => {
      const info = /** @type UpdateInfo */ ({
        version: '1', 
        files: [], 
        path: '', 
        sha512: '', 
        releaseDate: '',
      });
      Events.Updater.State.checkingForUpdate(document.body);
      await nextFrame();
      Events.Updater.State.updateDownloaded(document.body, info);
      await nextFrame();
      assert.equal(screen.updateStatePage, 3, 'sets the updateStatePage');
      const node = document.querySelector('.update-message');
      assert.equal(node.textContent.trim(), 'Ready to install', 'renders the status message');
    });

    it('sets the update error status (without the code)', async () => {
      Events.Updater.State.checkingForUpdate(document.body);
      await nextFrame();
      Events.Updater.State.autoUpdateError(document.body, { message: 'test' });
      await nextFrame();
      assert.equal(screen.updateStatePage, 4, 'sets the updateStatePage');
      assert.isUndefined(screen.errorCode, 'does not set the errorCode');
      const node = document.querySelector('.error-message');
      assert.equal(node.textContent.trim(), 'test', 'renders the error message');
    });

    it('sets the update error status (with the code)', async () => {
      Events.Updater.State.checkingForUpdate(document.body);
      await nextFrame();
      Events.Updater.State.autoUpdateError(document.body, { message: 'test', code: 'ERR_UPDATER_INVALID_RELEASE_FEED' });
      await nextFrame();
      assert.equal(screen.updateStatePage, 4, 'sets the updateStatePage');
      assert.equal(screen.errorCode, 'ERR_UPDATER_INVALID_RELEASE_FEED', 'sets the errorCode');
      const node = document.querySelector('.error-message');
      assert.equal(node.textContent.trim(), 'Unable to parse releases feed.', 'renders the pre-configured error message');
    });
  });

  describe('Update buttons', () => {
    it('dispatches the check for an update event', () => {
      const node = /** @type HTMLElement */ (document.querySelector('.update-status [data-button="update-check"]'));
      const spy = sinon.spy();
      window.addEventListener(EventTypes.Updater.checkForUpdate, spy);
      node.click();
      window.removeEventListener(EventTypes.Updater.checkForUpdate, spy);
      assert.isTrue(spy.called);
    });

    it('dispatches the install update event', async () => {
      screen.updateStatePage = 3;
      await screen.updateComplete;
      const node = /** @type HTMLElement */ (document.querySelector('.update-status [data-button="update-install"]'));
      const spy = sinon.spy();
      window.addEventListener(EventTypes.Updater.installUpdate, spy);
      node.click();
      window.removeEventListener(EventTypes.Updater.installUpdate, spy);
      assert.isTrue(spy.called);
    });
  });
});
