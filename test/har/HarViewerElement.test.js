import { assert, fixture, nextFrame, html } from '@open-wc/testing';
import sinon from 'sinon';
import '../../define/har-viewer.js';
import {
  pagesValue,
  entriesValue,
  sortEntires,
  processHar,
  computePages,
  computeEntriesOnly,
  openedEntriesValue,
  openedPagesValue,
  computeRenderedEntries,
  computeEntrySizeInfo,
  computeStatusClasses,
  computeTotalTime,
  computeVisualTimes,
} from '../../src/elements/har/HarViewerElement.js';

/** @typedef {import('../../').HarViewerElement} HarViewerElement */
/** @typedef {import('har-format').Har} Har */
/** @typedef {import('@anypoint-web-components/awc').AnypointCollapseElement} AnypointCollapseElement */

describe('HarViewerElement', () => {
  const demo1file = 'har1.har';

  /**
   * @param {*} har
   * @returns {Promise<HarViewerElement>}
   */
  async function basicFixture(har) {
    return fixture(html`<har-viewer .har="${har}"></har-viewer>`);
  }

  async function readHarFile(name) {
    const url = new URL(`./test/har/test-data/${name}`, window.location.href).toString();
    const response = await fetch(url);
    return response.json();
  }

  describe('No model', () => {
    let element = /** @type HarViewerElement */ (null);
    beforeEach(async () => { element = await basicFixture(); });

    it('has no content', () => {
      const nodes = element.querySelectorAll('*');
      assert.lengthOf(nodes, 0);
    });
  });

  describe('Model computations', () => {
    let element = /** @type HarViewerElement */ (null);
    beforeEach(async () => { 
      const model = await readHarFile(demo1file);
      element = await basicFixture(model); 
    });

    it('sets [pagesValue]', () => {
      assert.typeOf(element[pagesValue], 'array', 'has computed pages');
      assert.lengthOf(element[pagesValue], 1, 'has single page');
    });

    it('does not set [entriesValue] when pages', () => {
      assert.isUndefined(element[entriesValue]);
    });

    it('ignores computations when "log" is not set', () => {
      // @ts-ignore
      element.har = {};
      assert.isUndefined(element[pagesValue], 'pages are not set');
      assert.isUndefined(element[entriesValue], 'entires are not set');
    });

    it('ignores computations when "log" has no entries', () => {
      // @ts-ignore
      element.har = { log: { pages: [{ title: 'test', startedDateTime: 'test', id: 'test' }] } };
      assert.isUndefined(element[pagesValue], 'pages are not set');
      assert.isUndefined(element[entriesValue], 'entires are not set');
    });
  });

  describe('[sortEntires]', () => {
    let model = /** @type Har */ (null);

    before(async () => { model = await readHarFile(demo1file); });

    let element = /** @type HarViewerElement */ (null);
    beforeEach(async () => { 
      element = await basicFixture(); 
    });

    it('sorts entries', () => {
      const d = new Date();
      const e1 = {
        ...model.log.entries[0],
        id: '1',
        startedDateTime: d.toISOString(),
      };
      d.setSeconds(d.getSeconds() -10);
      const e2 = {
        ...model.log.entries[1],
        id: '2',
        startedDateTime: d.toISOString(),
      };
      const result = element[sortEntires]([e1, e2]);
      // @ts-ignore
      assert.equal(result[0].id, '2');
    });

    it('sets the timestamp property on the items', () => {
      const entry = { ...model.log.entries[0] };
      const result = element[sortEntires]([entry]);
      assert.typeOf(result[0].timestamp, 'number');
    });
  });

  describe('[processHar]', () => {
    let model = /** @type Har */ (null);

    before(async () => { model = await readHarFile(demo1file); });

    let element = /** @type HarViewerElement */ (null);
    beforeEach(async () => { 
      element = await basicFixture(); 
    });

    it('clears [entriesValue] value', () => {
      element[entriesValue] = [];
      element[processHar]();
      assert.isUndefined(element[entriesValue]);
    });

    it('clears [pagesValue] value', () => {
      element[pagesValue] = [];
      element[processHar]();
      assert.isUndefined(element[pagesValue]);
    });

    it('ignores when no data set', () => {
      const spy = sinon.spy(element, sortEntires);
      element[processHar]();
      assert.isFalse(spy.called);
    });

    it('ignores when no log data', () => {
      const spy = sinon.spy(element, sortEntires);
      // @ts-ignore
      element.har = {};
      assert.isFalse(spy.called);
    });

    it('ignores when no entires data', () => {
      const spy = sinon.spy(element, sortEntires);
      // @ts-ignore
      element.har = { log: {} };
      assert.isFalse(spy.called);
    });

    it('calls the [computePages] for data with pages', () => {
      const spy = sinon.spy(element, computePages);
      element.har = model;
      assert.isTrue(spy.calledOnce);
    });

    it('calls the [computeEntriesOnly] for data with pages and ignorePages', () => {
      element.ignorePages = true;
      const spy = sinon.spy(element, computeEntriesOnly);
      element.har = model;
      assert.isTrue(spy.calledOnce);
    });

    it('calls the [computeEntriesOnly] when no pages', () => {
      const spy = sinon.spy(element, computeEntriesOnly);
      const cp = { ...model };
      delete cp.log.pages;
      element.har = model;
      assert.isTrue(spy.calledOnce);
    });
  });

  describe('[computeEntriesOnly]', () => {
    let model = /** @type Har */ (null);

    before(async () => { 
      model = await readHarFile(demo1file); 
      delete model.log.pages;
    });

    let element = /** @type HarViewerElement */ (null);
    beforeEach(async () => { 
      element = await basicFixture(); 
    });

    it('sets the [entriesValue] value', () => {
      element.har = model;
      assert.typeOf(element[entriesValue], 'array', 'sets the value');
      assert.lengthOf(element[entriesValue], 18, 'has the entries');
    });

    it('sets the [openedEntriesValue] value', () => {
      element[openedEntriesValue] = ['test'];
      element.har = model;
      assert.deepEqual(element[openedEntriesValue], []);
    });
  });

  describe('[computePages]', () => {
    let model = /** @type Har */ (null);

    before(async () => { model = await readHarFile(demo1file) });

    let element = /** @type HarViewerElement */ (null);
    beforeEach(async () => { 
      element = await basicFixture(); 
    });

    it('sets the [pagesValue] value', () => {
      element.har = model;
      assert.typeOf(element[pagesValue], 'array', 'sets the value');
      assert.lengthOf(element[pagesValue], 1, 'has the pages');
    });

    it('sets the [openedPagesValue] value', () => {
      element[openedPagesValue] = ['test'];
      element.har = model;
      assert.deepEqual(element[openedPagesValue], ['page_1']);
    });

    it('sets the [openedEntriesValue] value', () => {
      element[openedEntriesValue] = ['test'];
      element.har = model;
      assert.deepEqual(element[openedEntriesValue], []);
    });

    it('sets the original page', () => {
      element.har = model;
      const [info] = element[pagesValue];
      assert.deepEqual(info.page, model.log.pages[0]);
    });

    it('sets the entires for the page', () => {
      element.har = model;
      const [info] = element[pagesValue];
      assert.equal(info.entries.length, model.log.entries.length);
    });

    it('computes the total time', () => {
      element.har = model;
      const [info] = element[pagesValue];
      assert.typeOf(info.totalTime, 'number');
    });
  });

  describe('[computeRenderedEntries]', () => {
    let model = /** @type Har */ (null);
    let sorted;
    const totalTime = 10000;

    before(async () => { 
      model = await readHarFile(demo1file);
    });

    let element = /** @type HarViewerElement */ (null);
    beforeEach(async () => { 
      element = await basicFixture(); 
      sorted = element[sortEntires](model.log.entries);
    });

    it('returns empty array when no argument', () => {
      const result = element[computeRenderedEntries](undefined, totalTime);
      assert.deepEqual(result, []);
    });

    it('returns transformed entries', () => {
      const result = element[computeRenderedEntries](sorted, totalTime);
      assert.typeOf(result, 'array', 'sets the value');
      assert.lengthOf(result, sorted.length, 'has the pages');
    });

    it('has autogenerated id', () => {
      const result = element[computeRenderedEntries](sorted, totalTime);
      const [first, second] = result;
      assert.typeOf(first.id, 'number', 'has the id');
      assert.isAbove(second.id, first.id, 'has different values');
    });

    it('has computed time labels', () => {
      const result = element[computeRenderedEntries](sorted, totalTime);
      const [entry] = result;
      // webkit may differently compute the values as it ignores user's locale (apple knows better)
      // assert.equal(entry.requestTime, '13:04:59.283', 'has the requestTime');
      // assert.equal(entry.requestFormattedDate, '15 Mar 2021, 13:04:59', 'has the requestFormattedDate');
      assert.typeOf(entry.requestTime, 'string', 'has the requestTime');
      assert.typeOf(entry.requestFormattedDate, 'string', 'has the requestFormattedDate');
    });

    it('has computed requestSizes', () => {
      const result = element[computeRenderedEntries](sorted, totalTime);
      const [entry] = result;
      assert.deepEqual(entry.requestSizes, {
        headersComputed: false,
        bodyComputed: false,
        body: "0 Bytes",
        headers: "735 Bytes",
        sum: "735 Bytes",
        sumComputed: false
      });
    });

    it('has computed responseSizes', () => {
      const result = element[computeRenderedEntries](sorted, totalTime);
      const [entry] = result;
      assert.deepEqual(entry.responseSizes, {
        headersComputed: false,
        bodyComputed: false,
        body: "13.7 KB",
        headers: "567 Bytes",
        sum: "14.25 KB",
        sumComputed: false
      });
    });

    it('has computed visualTimings', () => {
      const result = element[computeRenderedEntries](sorted, totalTime);
      const [entry] = result;
      assert.approximately(entry.visualTimings.blocked, 0.45, 0.01, 'has blocked');
      assert.approximately(entry.visualTimings.receive, 17.24, 0.01, 'has receive');
      assert.approximately(entry.visualTimings.send, 0.01, 0.01, 'has send');
      assert.approximately(entry.visualTimings.total, 10.48, 0.01, 'has total');
      assert.approximately(entry.visualTimings.totalValue, 1048.83, 0.01, 'has totalValue');
      assert.approximately(entry.visualTimings.wait, 82.29, 0.01, 'has wait');
    });

    it('has the rest of the entry', () => {
      const result = element[computeRenderedEntries](sorted, totalTime);
      const [entry] = result;
      assert.equal(entry.pageref, 'page_1');
    });
  });

  describe('[computeEntrySizeInfo]', () => {
    let element = /** @type HarViewerElement */ (null);
    beforeEach(async () => { element = await basicFixture(); });

    it('returns headers size from the headersSize property', () => {
      const info = {
        headersSize: 101,
        bodySize: 102,
      };
      // @ts-ignore
      const result = element[computeEntrySizeInfo](info);
      assert.equal(result.headers, '101 Bytes', 'headers size is set');
      assert.isFalse(result.headersComputed, 'headersComputed is false');
    });

    it('returns body size from the bodySize property', () => {
      const info = {
        headersSize: 101,
        bodySize: 102,
      };
      // @ts-ignore
      const result = element[computeEntrySizeInfo](info);
      assert.equal(result.body, '102 Bytes', 'headers size is set');
      assert.isFalse(result.bodyComputed, 'bodyComputed is false');
    });

    it('returns computed headers size the headers', () => {
      const info = {
        headersSize: -1,
        headers: 'lorem ipsum',
        bodySize: 102,
      };
      // @ts-ignore
      const result = element[computeEntrySizeInfo](info);
      assert.equal(result.headers, '11 Bytes', 'headers size is set');
      assert.isTrue(result.headersComputed, 'headersComputed is true');
    });

    it('returns computed body size of the request.content.size', () => {
      const info = {
        headersSize: 101,
        bodySize: -1,
        content: {
          size: 102,
        },
      };
      // @ts-ignore
      const result = element[computeEntrySizeInfo](info);
      assert.equal(result.body, '102 Bytes', 'body size is set');
      assert.isFalse(result.bodyComputed, 'bodyComputed is false');
    });

    it('returns computed body size of the request.content.text', () => {
      const info = {
        headersSize: 101,
        bodySize: -1,
        content: {
          text: 'lorem ipsum',
        },
      };
      // @ts-ignore
      const result = element[computeEntrySizeInfo](info);
      assert.equal(result.body, '11 Bytes', 'body size is set');
      assert.isTrue(result.bodyComputed, 'bodyComputed is true');
    });

    it('returns computed body size of the response.calculateBytes.text', () => {
      const info = {
        headersSize: 101,
        bodySize: -1,
        postData: {
          text: 'lorem ipsum',
        },
      };
      // @ts-ignore
      const result = element[computeEntrySizeInfo](info);
      assert.equal(result.body, '11 Bytes', 'body size is set');
      assert.isTrue(result.bodyComputed, 'bodyComputed is true');
    });

    it('returns sum for both defined values', () => {
      const info = {
        headersSize: 101,
        bodySize: 102,
      };
      // @ts-ignore
      const result = element[computeEntrySizeInfo](info);
      assert.equal(result.sum, '203 Bytes', 'sum size is set');
      assert.isFalse(result.sumComputed, 'sumComputed is false');
    });

    it('returns sum for both computed values', () => {
      const info = {
        headersSize: -1,
        headers: 'lorem ipsum',
        bodySize: -1,
        content: {
          text: 'lorem ipsum',
        },
      };
      // @ts-ignore
      const result = element[computeEntrySizeInfo](info);
      assert.equal(result.sum, '22 Bytes', 'sum size is set');
      assert.isTrue(result.sumComputed, 'sumComputed is true');
    });

    it('returns zeros when not defined', () => {
      const info = {
        headersSize: -1,
        bodySize: -1,
      };
      // @ts-ignore
      const result = element[computeEntrySizeInfo](info);
      assert.equal(result.body, '0 Bytes', 'body size is set');
      assert.equal(result.headers, '0 Bytes', 'headers size is set');
      assert.equal(result.sum, '0 Bytes', 'sum size is set');
    });
  });

  describe('[computeStatusClasses]', () => {
    let element = /** @type HarViewerElement */ (null);
    beforeEach(async () => { element = await basicFixture(); });

    it('has status-code class', () => {
      const result = element[computeStatusClasses](100);
      assert.isTrue(result['status-code']);
    });

    it('sets error class for 5xx', () => {
      const result = element[computeStatusClasses](500);
      assert.isTrue(result['status-code'], 'status code is set');
      assert.isTrue(result.error, 'error is set');
      assert.isFalse(result.warning, 'warning is not set');
      assert.isFalse(result.info, 'info is not set');
    });

    it('sets error class for 0', () => {
      const result = element[computeStatusClasses](0);
      assert.isTrue(result['status-code'], 'status code is set');
      assert.isTrue(result.error, 'error is set');
      assert.isFalse(result.warning, 'warning is not set');
      assert.isFalse(result.info, 'info is not set');
    });

    it('sets warning class for 4xx', () => {
      const result = element[computeStatusClasses](400);
      assert.isTrue(result['status-code'], 'status code is set');
      assert.isFalse(result.error, 'error is not set');
      assert.isTrue(result.warning, 'warning is set');
      assert.isFalse(result.info, 'info is not set');
    });

    it('sets info class for 4xx', () => {
      const result = element[computeStatusClasses](300);
      assert.isTrue(result['status-code'], 'status code is set');
      assert.isFalse(result.error, 'error is not set');
      assert.isFalse(result.warning, 'warning is not set');
      assert.isTrue(result.info, 'info is set');
    });
  });

  describe('[computeTotalTime]', () => {
    let model = /** @type Har */ (null);

    before(async () => { model = await readHarFile(demo1file) });

    let element = /** @type HarViewerElement */ (null);
    beforeEach(async () => { 
      element = await basicFixture(); 
    });

    it('computes time for two entries', () => {
      const [first, second] = model.log.entries;
      const result = element[computeTotalTime](first, second);
      assert.approximately(result, 1115.52, 0.01);
    });

    it('computes time for a single entry', () => {
      const [first] = model.log.entries;
      const result = element[computeTotalTime](first, first);
      assert.approximately(result, 1048.83, 0.01);
    });
  });

  describe('[computeVisualTimes]', () => {
    let model = /** @type Har */ (null);
    const total = 1000;

    before(async () => { model = await readHarFile(demo1file) });

    let element = /** @type HarViewerElement */ (null);
    beforeEach(async () => { 
      element = await basicFixture(); 
    });

    it('computes the total property', () => {
      const [entry] = model.log.entries;
      const result = element[computeVisualTimes](entry.timings, 0, total);
      assert.approximately(result.total, 104.88, 0.01);
    });

    it('computes the totalValue property', () => {
      const [entry] = model.log.entries;
      const result = element[computeVisualTimes](entry.timings, 0, total);
      assert.approximately(result.totalValue, 1048.83, 0.01);
    });

    it('has no delay when zero', () => {
      const [entry] = model.log.entries;
      const result = element[computeVisualTimes](entry.timings, 0, total);
      assert.isUndefined(result.delay);
    });

    it('computes the delay property', () => {
      const [entry] = model.log.entries;
      const result = element[computeVisualTimes](entry.timings, 100, total);
      assert.equal(result.delay, 10);
    });

    it('computes the blocked property', () => {
      const [entry] = model.log.entries;
      const result = element[computeVisualTimes](entry.timings, 100, total);
      assert.approximately(result.blocked, 0.456, 0.01);
    });

    it('computes the connect property', () => {
      const [entry] = model.log.entries;
      const t = {
        ...entry.timings,
        connect: 123,
      }
      const result = element[computeVisualTimes](t, 100, total);
      assert.approximately(result.connect, 10.49, 0.01);
    });

    it('computes the dns property', () => {
      const [entry] = model.log.entries;
      const t = {
        ...entry.timings,
        dns: 123,
      }
      const result = element[computeVisualTimes](t, 100, total);
      assert.approximately(result.dns, 10.49, 0.01);
    });

    it('computes the receive property', () => {
      const [entry] = model.log.entries;
      const result = element[computeVisualTimes](entry.timings, 100, total);
      assert.approximately(result.receive, 17.24, 0.01);
    });

    it('computes the send property', () => {
      const [entry] = model.log.entries;
      const result = element[computeVisualTimes](entry.timings, 100, total);
      assert.approximately(result.send, 0.01, 0.01);
    });

    it('computes the ssl property', () => {
      const [entry] = model.log.entries;
      const t = {
        ...entry.timings,
        ssl: 123,
      }
      const result = element[computeVisualTimes](t, 100, total);
      assert.approximately(result.ssl, 10.49, 0.01);
    });

    it('computes the wait property', () => {
      const [entry] = model.log.entries;
      const result = element[computeVisualTimes](entry.timings, 100, total);
      assert.approximately(result.wait, 82.29, 0.01);
    });
  });

  describe('Data rendering', () => {
    let model = /** @type Har */ (null);
    
    before(async () => { 
      model = await readHarFile(demo1file);
    });

    let element = /** @type HarViewerElement */ (null);
    beforeEach(async () => { 
      element = await basicFixture(model); 
    });

    it('renders a page', () => {
      const nodes = element.shadowRoot.querySelectorAll('section.page');
      assert.lengthOf(nodes, 1);
    });

    it('renders page header', () => {
      const header = /** @type HTMLElement */ (element.shadowRoot.querySelector('.page-header'));
      assert.ok(header, 'has the header');
      assert.equal(header.dataset.page, 'page_1', 'has the data-page attribute');
      const url = header.querySelector('.label').textContent.trim();
      assert.equal(url, 'http://www.softwareishard.com/blog/har-12-spec/');
      const time = header.querySelector('.loading-time-label').textContent.trim();
      assert.equal(time, 'Time: 1965 ms');
    });

    it('entires are rendered by default', () => {
      const list = /** @type AnypointCollapseElement */ (element.shadowRoot.querySelector('anypoint-collapse'));
      assert.isTrue(list.opened);
    });

    it('closes the page on the label click', async () => {
      const label = /** @type HTMLElement */ (element.shadowRoot.querySelector('.page-header .label'));
      label.click();
      await nextFrame();
      const list = /** @type AnypointCollapseElement */ (element.shadowRoot.querySelector('anypoint-collapse'));
      assert.isFalse(list.opened);
    });

    it('closes the page on space key down', async () => {
      const header = /** @type HTMLElement */ (element.shadowRoot.querySelector('.page-header'));
      header.dispatchEvent(new KeyboardEvent('keydown', {
        code: 'Space',
      }));
      await nextFrame();
      const list = /** @type AnypointCollapseElement */ (element.shadowRoot.querySelector('anypoint-collapse'));
      assert.isFalse(list.opened);
    });

    it('does not close the page on other key down', async () => {
      const header = /** @type HTMLElement */ (element.shadowRoot.querySelector('.page-header'));
      header.dispatchEvent(new KeyboardEvent('keydown', {
        code: 'Enter',
      }));
      await nextFrame();
      const list = /** @type AnypointCollapseElement */ (element.shadowRoot.querySelector('anypoint-collapse'));
      assert.isTrue(list.opened);
    });

    it('opens entry details on item click', async () => {
      const item = /** @type HTMLElement */ (element.shadowRoot.querySelector('.entry-item'));
      const id = item.dataset.entry;
      item.click();
      await nextFrame();
      assert.deepEqual(element[openedEntriesValue], [id], 'entry id added to the [openedEntriesValue]');
      const details = item.nextElementSibling;
      assert.equal(details.localName, 'section', 'has the details element');
    });
  });

  describe('Entry details rendering', () => {
    let model = /** @type Har */ (null);
    let details = /** @type HTMLElement */ (null);
    
    before(async () => { 
      model = await readHarFile(demo1file);
    });

    let element = /** @type HarViewerElement */ (null);
    beforeEach(async () => { 
      element = await basicFixture(model);
      const item = /** @type HTMLElement */ (element.shadowRoot.querySelector('.entry-item'));
      item.click();
      await nextFrame();
      details = element.shadowRoot.querySelector('.entry-details');
    });

    it('renders the request info tab by default', () => {
      const tabs = details.querySelector('anypoint-tabs');
      assert.equal(tabs.selected, 0, 'has the selected tab');
      const title = details.querySelector('.entry-details-title').textContent.trim();
      // assert.equal(title, 'Request on 15 Mar 2021, 13:04:59');
      assert.isNotEmpty(title);
    });

    it('renders the response info tab', async () => {
      const tab = /** @type HTMLElement */ (details.querySelectorAll('anypoint-tabs anypoint-tab')[1]);
      tab.click();
      await nextFrame();
      const tabs = details.querySelector('anypoint-tabs');
      assert.equal(tabs.selected, 1, 'has the selected tab');
    });

    it('renders the response content tab', async () => {
      const tab = /** @type HTMLElement */ (details.querySelectorAll('anypoint-tabs anypoint-tab')[3]);
      tab.click();
      await nextFrame();
      const tabs = details.querySelector('anypoint-tabs');
      assert.equal(tabs.selected, 3, 'has the selected tab');
      const content = /** @type HTMLElement */ (details.querySelector('.details-content pre'));
      assert.ok(content, 'has the content element');
    });

    it('renders the cookies tab', async () => {
      const tab = /** @type HTMLElement */ (details.querySelectorAll('anypoint-tabs anypoint-tab')[4]);
      tab.click();
      await nextFrame();
      const tabs = details.querySelector('anypoint-tabs');
      assert.equal(tabs.selected, 4, 'has the selected tab');
      const content = /** @type HTMLElement */ (details.querySelector('.details-content .details-list'));
      assert.ok(content, 'has the content element');
    });
  });

  describe('a11y', () => {
    let model = /** @type Har */ (null);
    
    before(async () => { 
      model = await readHarFile(demo1file);
    });

    let element = /** @type HarViewerElement */ (null);
    beforeEach(async () => { 
      element = await basicFixture(model);
    });

    it('is accessible for page results', async () => {
      await assert.isAccessible(element);
    });

    it('is accessible for details page', async () => {
      const item = /** @type HTMLElement */ (element.shadowRoot.querySelector('.entry-item'));
      item.click();
      await nextFrame();
      await assert.isAccessible(element, {
        ignoredRules: ['color-contrast'],
      });
    });
  });
});
