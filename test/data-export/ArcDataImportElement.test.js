/* eslint-disable prefer-arrow-callback */
import { assert, fixture } from '@open-wc/testing';
import sinon from 'sinon';
import { 
  RestApiEventTypes, 
  ProcessEventTypes, 
  WorkspaceEventTypes, 
  DataImportEventTypes, 
  ImportEvents,
  EncryptionEventTypes,
  ArcModelEventTypes,
} from '@advanced-rest-client/arc-events';
import { DataGenerator } from '@advanced-rest-client/arc-data-generator';
import { DataHelper } from './DataHelper.js';
import { notifyIndexer, notifyApiParser, decryptIfNeeded } from '../../src/ArcDataImportElement.js';
import '../../define/arc-data-import.js';

/** @typedef {import('../../').ArcDataImportElement} ArcDataImportElement */

describe('ArcDataImportElement', () => {
  /**
   * @return {Promise<ArcDataImportElement>}
   */
  async function basicFixture() {
    return fixture(`<arc-data-import></arc-data-import>`);
  }

  const generator = new DataGenerator();

  describe('handleNormalizedFileData()', () => {
    let element = /** @type ArcDataImportElement */ (null);
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('throws when no data', () => {
      assert.throws(() => {
        // @ts-ignore
        element.handleNormalizedFileData();
      });
    });

    it(`dispatches ${WorkspaceEventTypes.appendRequest} event`, () => {
      const spy = sinon.spy();
      element.addEventListener(WorkspaceEventTypes.appendRequest, spy);
      const request = DataHelper.generateSingleRequestImport();
      element.handleNormalizedFileData(request);
      assert.isTrue(spy.called);
    });

    it('dispatches workspace append for project with forced open', () => {
      const spy = sinon.spy();
      element.addEventListener(WorkspaceEventTypes.appendExport, spy);
      const data = DataHelper.generateProjectImportOpen();
      element.handleNormalizedFileData(data);
      assert.isTrue(spy.called, 'the event is called');
      assert.deepEqual(spy.args[0][0].detail.data, data);
    });

    it('removes key and kind properties', () => {
      const spy = sinon.spy();
      element.addEventListener(WorkspaceEventTypes.appendRequest, spy);
      const request = DataHelper.generateSingleRequestImport();
      element.handleNormalizedFileData(request);
      assert.isUndefined(spy.args[0][0].detail.request.key);
      assert.isUndefined(spy.args[0][0].detail.request.kind);
    });

    it('Sets request _id', () => {
      const spy = sinon.spy();
      element.addEventListener(WorkspaceEventTypes.appendRequest, spy);
      const request = DataHelper.generateSingleRequestImport();
      element.handleNormalizedFileData(request);
      assert.equal(spy.args[0][0].detail.request._id, '11013905-9b5a-49d9-adc8-f76ec3ead2f1');
    });

    it('Adds driveId', () => {
      const spy = sinon.spy();
      element.addEventListener(WorkspaceEventTypes.appendRequest, spy);
      const request = DataHelper.generateSingleRequestImport();
      element.handleNormalizedFileData(request, { driveId: 'test' });
      assert.equal(spy.args[0][0].detail.request.driveId, 'test');
    });

    it('Dispatches import data inspect event', () => {
      const spy = sinon.spy();
      element.addEventListener(DataImportEventTypes.inspect, spy);
      const request = DataHelper.generateMultiRequestImport();
      element.handleNormalizedFileData(request);
      assert.isTrue(spy.called);
      assert.deepEqual(spy.args[0][0].detail.data, request);
    });
  });

  describe('[normalizeHandler]', () => {
    let element = /** @type ArcDataImportElement */ (null);
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('calls normalizeImportData() with arguments', async () => {
      const spy = sinon.spy(element, 'normalizeImportData');
      const data = DataHelper.generateArcImportFile();
      await ImportEvents.normalize(document.body, data);
      assert.isTrue(spy.calledOnce);
      const [expData] = spy.args[0];
      assert.deepEqual(expData, data, 'data argument is set');
    });

    it('throws when no data argument', async () => {
      let thrown = false;
      try {
        await ImportEvents.normalize(document.body, undefined);
      } catch (e) {
        thrown = true;
      }
      assert.isTrue(thrown);
    });

    it('does nothing when the event is cancelled', async () => {
      const spy = sinon.spy(element, 'normalizeImportData');
      const data = DataHelper.generateArcImportFile();
      const target = document.createElement('span');
      document.body.appendChild(target);
      target.addEventListener(DataImportEventTypes.normalize, function f(e) {
        e.preventDefault();
      });
      await ImportEvents.normalize(target, data);
      document.body.removeChild(target);
      assert.isFalse(spy.called);
    });
  });

  describe('[importHandler]', () => {
    let element = /** @type ArcDataImportElement */ (null);
    beforeEach(async () => {
      element = await basicFixture();
    });

    after(async () => {
      await generator.destroyAll();
    });

    it('calls storeData() with arguments', async () => {
      const spy = sinon.spy(element, 'storeData');
      const data = DataHelper.generateMultiRequestImport();
      await ImportEvents.dataImport(document.body, data);
      assert.isTrue(spy.calledOnce);
      const [expData] = spy.args[0];
      assert.deepEqual(expData, data, 'data argument is set');
    });

    it('throws when no data argument', async () => {
      let thrown = false;
      try {
        await ImportEvents.dataImport(document.body, undefined);
      } catch (e) {
        thrown = true;
      }
      assert.isTrue(thrown);
    });

    it('does nothing when the event is cancelled', async () => {
      const spy = sinon.spy(element, 'storeData');
      const data = DataHelper.generateMultiRequestImport();
      const target = document.createElement('span');
      document.body.appendChild(target);
      target.addEventListener(DataImportEventTypes.dataImport, function f(e) {
        e.preventDefault();
      });
      await ImportEvents.dataImport(target, data);
      document.body.removeChild(target);
      assert.isFalse(spy.called);
    });
  });

  describe('[processFileHandler]', () => {
    let element = /** @type ArcDataImportElement */ (null);
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('calls processFileData() with arguments', async () => {
      const spy = sinon.spy(element, 'processFileData');
      const data = DataHelper.generateArcImportFile();
      await ImportEvents.processFile(document.body, data);
      assert.isTrue(spy.calledOnce);
      const [expData] = spy.args[0];
      assert.deepEqual(expData, data, 'data argument is set');
    });

    it('throws when no data argument', async () => {
      let thrown = false;
      try {
        await ImportEvents.processFile(document.body, undefined);
      } catch (e) {
        thrown = true;
      }
      assert.isTrue(thrown);
    });

    it('does nothing when the event is cancelled', async () => {
      const spy = sinon.spy(element, 'processFileData');
      const data = DataHelper.generateArcImportFile();
      const target = document.createElement('span');
      document.body.appendChild(target);
      target.addEventListener(DataImportEventTypes.processFile, function f(e) {
        e.preventDefault();
      });
      await ImportEvents.processFile(target, data);
      document.body.removeChild(target);
      assert.isFalse(spy.called);
    });
  });

  describe('[processDataHandler]', () => {
    let element = /** @type ArcDataImportElement */ (null);
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('calls processFileData() with arguments', async () => {
      const spy = sinon.spy(element, 'processData');
      const data = DataHelper.generateMultiRequestImport();
      await ImportEvents.processData(document.body, data);
      assert.isTrue(spy.calledOnce);
      const [expData] = spy.args[0];
      assert.deepEqual(expData, data, 'data argument is set');
    });

    it('throws when no data argument', async () => {
      let thrown = false;
      try {
        await ImportEvents.processData(document.body, undefined);
      } catch (e) {
        thrown = true;
      }
      assert.isTrue(thrown);
    });

    it('does nothing when the event is cancelled', async () => {
      const spy = sinon.spy(element, 'processData');
      const data = DataHelper.generateMultiRequestImport();
      const target = document.createElement('span');
      document.body.appendChild(target);
      target.addEventListener(DataImportEventTypes.processData, function f(e) {
        e.preventDefault();
      });
      await ImportEvents.processData(target, data);
      document.body.removeChild(target);
      assert.isFalse(spy.called);
    });
  });

  describe('processData()', () => {
    let element = /** @type ArcDataImportElement */ (null);
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('calls normalizeImportData() with the argument', async () => {
      const spy = sinon.spy(element, 'normalizeImportData');
      const data = DataHelper.generateArcImportFile();
      await element.processData(data);
      assert.isTrue(spy.calledOnce);
      const [expData] = spy.args[0];
      assert.deepEqual(expData, data, 'data argument is set');
    });

    it('calls handleNormalizedFileData() with normalized data', async () => {
      const spy = sinon.spy(element, 'handleNormalizedFileData');
      const data = DataHelper.generateArcImportFile();
      await element.processData(data);
      assert.isTrue(spy.calledOnce);
      const [argData] = spy.args[0];
      assert.equal(argData.kind, 'ARC#Import');
    });
  });

  describe('storeData()', () => {
    let element = /** @type ArcDataImportElement */ (null);
    beforeEach(async () => {
      element = await basicFixture();
    });

    after(async () => {
      await generator.destroyAll();
    });

    it('throws when no argument', async () => {
      let thrown = false;
      try {
        await element.storeData(undefined);
      } catch (e) {
        thrown = true;
      }
      assert.isTrue(thrown);
    });

    it('throws when not a normalized import', async () => {
      let thrown = false;
      try {
        // @ts-ignore
        await element.storeData({});
      } catch (e) {
        thrown = true;
      }
      assert.isTrue(thrown);
    });

    it('imports data into the store', async () => {
      const object = DataHelper.generateMultiRequestImport();
      await element.storeData(object);
      const imported = await generator.getDatastoreRequestData();
      const r1 = imported.find((i) => i._id === '11013905-9b5a-49d9-adc8-f76ec3ead2f1');
      const r2 = imported.find((i) => i._id === '20013905-9b5a-49d9-adc8-f76ec3ead2f1');
      
      assert.ok(r1);
      assert.ok(r2);
    });

    it('calls [notifyIndexer]', async () => {
      const spy = sinon.spy(element, notifyIndexer);
      const object = DataHelper.generateMultiRequestImport();
      await element.storeData(object);
      assert.isTrue(spy.calledOnce);
    });

    it(`dispatches ${DataImportEventTypes.dataImported} event`, async () => {
      const spy = sinon.spy();
      element.addEventListener(DataImportEventTypes.dataImported, spy);
      const object = DataHelper.generateMultiRequestImport();
      await element.storeData(object);
      assert.isTrue(spy.calledOnce);
    });
  });

  describe('[notifyIndexer]()', () => {
    let element = /** @type ArcDataImportElement */ (null);
    let saved;
    let history;
    beforeEach(async () => {
      element = await basicFixture();
      saved = [{ id: 1, type: 'saved', url: 'https://domain.com' }];
      history = [{ id: 2, type: 'history', url: 'https://api.com' }];
    });

    it('Dispatches the event', () => {
      const spy = sinon.spy();
      element.addEventListener(ArcModelEventTypes.UrlIndexer.update, spy);
      element[notifyIndexer](saved, history);
      assert.isTrue(spy.called);
    });

    it('passes "saved" indexes only', () => {
      const spy = sinon.spy();
      element.addEventListener(ArcModelEventTypes.UrlIndexer.update, spy);
      element[notifyIndexer](saved, []);
      const data = spy.args[0][0].requests;
      assert.typeOf(data, 'array');
      assert.lengthOf(data, 1);
    });

    it('Passes "history" indexes only', () => {
      const spy = sinon.spy();
      element.addEventListener(ArcModelEventTypes.UrlIndexer.update, spy);
      element[notifyIndexer](undefined, history);
      const data = spy.args[0][0].requests;
      assert.typeOf(data, 'array');
      assert.lengthOf(data, 1);
    });

    it('Event is not dispatched when no indexes', () => {
      const spy = sinon.spy();
      element.addEventListener(ArcModelEventTypes.UrlIndexer.update, spy);
      element[notifyIndexer]([], []);
      assert.isFalse(spy.called);
    });
  });

  describe('normalizeImportData()', () => {
    let element = /** @type ArcDataImportElement */ (null);
    beforeEach(async () => {
      element = await basicFixture();
    });

    after(async () => {
      await generator.destroyAll();
    });

    it('normalizes import object', async () => {
      const postmanData = await DataHelper.getFile('postman/postman-data.json');
      const result = await element.normalizeImportData(postmanData);
      assert.equal(result.version, 'postman-backup');
      assert.equal(result.kind, 'ARC#Import');
    });

    it('handles file object', async () => {
      const data = DataHelper.generateArcImportFile();
      const result = await element.normalizeImportData(data);
      assert.equal(result.version, 'unknown');
      assert.equal(result.kind, 'ARC#Import');
    });

    it('calls [decryptIfNeeded] on text content', async () => {
      const spy = sinon.spy(element, decryptIfNeeded);
      const data = DataHelper.generateArcImportFile();
      await element.normalizeImportData(data);
      assert.isTrue(spy.calledOnce);
    });

    it('does not call [decryptIfNeeded] on object content', async () => {
      const spy = sinon.spy(element, decryptIfNeeded);
      const data = DataHelper.generateMultiRequestImport();
      await element.normalizeImportData(data);
      assert.isFalse(spy.called);
    });
  });

  describe('processFileData()', () => {
    let element = /** @type ArcDataImportElement */ (null);
    beforeEach(async () => {
      element = await basicFixture();
    });

    function apiParserHandler(e) {
      e.preventDefault();
      e.detail.result = Promise.resolve({ api: true });
    }

    function apiParserErrorHandler(e) {
      e.preventDefault();
      e.detail.result = Promise.reject(new Error('test-error'));
    }

    afterEach(() => {
      window.removeEventListener(RestApiEventTypes.processFile, apiParserHandler);
      window.removeEventListener(RestApiEventTypes.processFile, apiParserErrorHandler);
    });

    [
      'application/zip', 'application/yaml', 'application/x-yaml',
      'application/raml', 'application/x-raml', 'application/x-zip-compressed'
    ].forEach((type) => {
      it(`Calls [notifyApiParser]() for file type ${type}`, () => {
        const file = /** @type File */ ({ type });
        window.addEventListener(RestApiEventTypes.processFile, apiParserHandler);
        const spy = sinon.spy(element, notifyApiParser);
        element.processFileData(file);
        assert.isTrue(spy.called);
        assert.deepEqual(spy.args[0][0], file);
      });
    });

    [
      'api.raml', 'api.yaml', 'project.zip'
    ].forEach((name) => {
      it(`Calls [notifyApiParser]() for file with extension ${name}`, () => {
        const file = /** @type File */ ({ type: '', name });
        window.addEventListener(RestApiEventTypes.processFile, apiParserHandler);
        const spy = sinon.spy(element, notifyApiParser);
        element.processFileData(file);
        assert.isTrue(spy.called);
        assert.deepEqual(spy.args[0][0], file);
      });
    });

    it('returns a promise', () => {
      const file = DataHelper.generateArcImportFile();
      const result = element.processFileData(file);
      assert.typeOf(result.then, 'function');
      return result;
    });

    it(`dispatches ${ProcessEventTypes.loadingstart} event`, async () => {
      const file = DataHelper.generateArcImportFile();
      const spy = sinon.spy();
      element.addEventListener(ProcessEventTypes.loadingstart, spy);
      await element.processFileData(file);
      assert.isTrue(spy.called);
      assert.equal(spy.args[0][0].detail.message, 'Processing file data');
    });

    it('calls toString() on Electron buffer', async () => {
      const file = DataHelper.generateElectronBuffer();
      const spy = sinon.spy(file, 'toString');
      await element.processFileData(file);
      assert.isTrue(spy.called);
    });

    it('calls [notifyApiParser]() for unknown file with RAML spec', async () => {
      const file = DataHelper.generateRamlUnknownFile();
      window.addEventListener(RestApiEventTypes.processFile, apiParserHandler);
      const spy = sinon.spy(element, notifyApiParser);
      await element.processFileData(file);
      assert.isTrue(spy.called);
      assert.deepEqual(spy.args[0][0].size, file.size);
    });

    it('Calls [notifyApiParser]() for unknown file with OAS 2 JSON spec', async () => {
      const file = DataHelper.generateOas2JsonUnknownFile();
      window.addEventListener(RestApiEventTypes.processFile, apiParserHandler);
      const spy = sinon.spy(element, notifyApiParser);
      await element.processFileData(file);
      assert.isTrue(spy.called);
      assert.deepEqual(spy.args[0][0].size, file.size);
    });

    it('rejects when JSON file is not valid', async () => {
      const file = DataHelper.generateJsonErrorFile();
      let message;
      try {
        await element.processFileData(file);
      } catch (e) {
        message = e.message;
      }
      assert.equal(message, 'Unknown file format');
    });

    it('rejects when api processor not in the DOM', async () => {
      const file = DataHelper.generateRamlUnknownFile();
      let message;
      try {
        await element.processFileData(file);
      } catch (e) {
        message = e.message;
      }
      assert.equal(message, 'API processor not available');
    });

    it('rejects when api processor error', async () => {
      window.addEventListener(RestApiEventTypes.processFile, apiParserErrorHandler);
      const file = DataHelper.generateRamlUnknownFile();
      let message;
      try {
        await element.processFileData(file);
      } catch (e) {
        message = e.message;
      }
      assert.equal(message, 'test-error');
    });

    it(`dispatches ${ProcessEventTypes.loadingstart} event on error`, async () => {
      let id;
      element.addEventListener(ProcessEventTypes.loadingstart, function f(e) {
        element.removeEventListener(ProcessEventTypes.loadingstart, f);
        // @ts-ignore
        id = e.detail.id;
      });
      const spy = sinon.spy();
      element.addEventListener(ProcessEventTypes.loadingstop, spy);
      window.addEventListener(RestApiEventTypes.processFile, apiParserHandler);
      const file = DataHelper.generateOas2JsonUnknownFile();
      try {
        await element.processFileData(file);
      } catch (e) {
        // ...
      }
      assert.isTrue(spy.called);
      assert.equal(spy.args[0][0].detail.id, id);
    });

    it('calls normalizeImportData()', async () => {
      const file = DataHelper.generateArcImportFile();
      const spy = sinon.spy(element, 'normalizeImportData');
      await element.processFileData(file);
      assert.isTrue(spy.called);
      assert.deepEqual(spy.args[0][0], {
        createdAt: '2019-02-02T21:58:25.467Z',
        kind: 'ARC#Import',
        requests: [],
        version: '13.0.0-alpha.3'
      });
    });

    it(`dispatches ${ProcessEventTypes.loadingstart} event when ready`, async () => {
      let id;
      element.addEventListener(ProcessEventTypes.loadingstart, function f(e) {
        element.removeEventListener(ProcessEventTypes.loadingstart, f);
        // @ts-ignore
        id = e.detail.id;
      });
      const spy = sinon.spy();
      element.addEventListener(ProcessEventTypes.loadingstop, spy);
      const file = DataHelper.generateArcImportFile();
      try {
        await element.processFileData(file);
      } catch (e) {
        // ...
      }

      assert.isTrue(spy.called);
      assert.equal(spy.args[0][0].detail.id, id);
    });

    it('Calls handleNormalizedFileData() with processed data', async () => {
      const spy = sinon.spy(element, 'handleNormalizedFileData');
      const file = DataHelper.generateArcImportFile();
      try {
        await element.processFileData(file);
      } catch (e) {
        // ...
      }

      assert.isTrue(spy.called);
    });

    it('passes options to handleNormalizedFileData()', async () => {
      const opts = { driveId: 'test' };
      const spy = sinon.spy(element, 'handleNormalizedFileData');
      const file = DataHelper.generateArcImportFile();
      try {
        await element.processFileData(file, opts);
      } catch (e) {
        // ...
      }
      assert.isTrue(spy.called);
      assert.deepEqual(spy.args[0][1], opts);
    });
  });

  describe('[decryptIfNeeded]()', () => {
    let element = /** @type ArcDataImportElement */ (null);
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('ignores when content has no encryption header', async () => {
      const spy = sinon.spy();
      element.addEventListener(EncryptionEventTypes.decrypt, spy);
      await element[decryptIfNeeded]('test data');
      assert.isFalse(spy.called)
    });

    it('dispatches decrypt event', async () => {
      const spy = sinon.spy();
      element.addEventListener(EncryptionEventTypes.decrypt, spy);
      await element[decryptIfNeeded]('aes\ntest data');
      assert.isTrue(spy.called)
      assert.equal(spy.args[0][0].data, 'test data');
    });
  });
});
