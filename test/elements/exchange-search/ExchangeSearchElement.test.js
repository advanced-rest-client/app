import { fixture, assert, html, nextFrame } from '@open-wc/testing';
import sinon from 'sinon';
import { AuthorizationEventTypes } from '@advanced-rest-client/events';
import '../../../define/exchange-search.js';
import { 
  queryingValue, enableList, enableGrid, exchangeResponse, typeChanged, 
  columnsValue, oauthCallback, setupAuthHeaders, listenOauth, unlistenOauth,
  authHeaderValue, exchangeResponseError,
} from '../../../src/elements/exchange-search/ExchangeSearchElement.js';
import { AnypointMock } from '../../AnypointMock.mjs';
import env from '../../env.js';

/** @typedef {import('../../../').ExchangeSearchElement} ExchangeSearchElement */

describe('ExchangeSearchElement', () => {
  const baseUri = `http://localhost:${env.exchangeApiPort}/`;
  const partialBaseUri = `http://localhost:${env.exchangeApiPort}/partial/`;
  const mock = new AnypointMock();

  /**
   * @returns {Promise<ExchangeSearchElement>} 
   */
  async function basicFixture() {
    return fixture(html`<exchange-search .apiBase="${baseUri}"></exchange-search>`);
  }

  /**
   * @returns {Promise<ExchangeSearchElement>} 
   */
  async function partialFixture() {
    return fixture(html`<exchange-search .apiBase="${partialBaseUri}"></exchange-search>`);
  }

  /**
   * @returns {Promise<ExchangeSearchElement>} 
   */
  async function authFixture() {
    return fixture(html`<exchange-search
      anypointAuth
      exchangeRedirectUri="https://domain.com"
      exchangeClientId="test1234"
      forceOauthEvents
      .apiBase="${baseUri}"
    ></exchange-search>`);
  }

  /**
   * @returns {Promise<ExchangeSearchElement>} 
   */
  async function noAutoFixture() {
    return fixture(html`
    <exchange-search
      .apiBase="${baseUri}"
      noAuto
    ></exchange-search>`);
  }

  async function untilLoaded(element) {
    return new Promise((resolve) => {
      element.addEventListener('queryingchange', function clb(e) {
        if (e.target.querying === false) {
          element.removeEventListener('queryingchange', clb);
          resolve();
        }
      });
    });
  }

  describe('basic with auto opened', () => {
    describe('basic when auto querying', () => {
      /** @type ExchangeSearchElement */
      let element;
      beforeEach(async () => {
        element = await basicFixture();
      });

      it('dataUnavailable is computed', () => {
        assert.isFalse(element.dataUnavailable);
      });

      it('hasItems is false', () => {
        assert.isFalse(element.hasItems);
      });

      it('query is undefined', () => {
        assert.isUndefined(element.query, '');
      });

      it('noMoreResults is false by default', () => {
        assert.isFalse(element.noMoreResults);
      });

      it('queryParams is computed', () => {
        const p = element.queryParams;
        assert.typeOf(p, 'object');
        assert.deepEqual(p.types, ['rest-api'], 'types is set');
        assert.equal(p.limit, element.exchangeLimit, 'limit is set');
        assert.equal(p.offset, element.exchangeOffset, 'offset is set');
        assert.isUndefined(p.search, 'search is undefined');
      });

      it('queryParams is computed with search', () => {
        element.query = 'test';
        const p = element.queryParams;
        assert.typeOf(p, 'object');
        assert.deepEqual(p.types, ['rest-api'], 'type is set');
        assert.equal(p.limit, element.exchangeLimit, 'limit is set');
        assert.equal(p.offset, element.exchangeOffset, 'offset is set');
        assert.equal(p.search, element.query, 'search is set');
      });

      it('renderLoadMore is false', () => {
        assert.isFalse(element.renderLoadMore);
      });
    });

    describe('basic with data loaded', () => {
      it('querying is false', async () => {
        const element = await basicFixture();
        await untilLoaded(element);
        assert.isFalse(element.querying);
      });

      it('dataUnavailable is computed', async () => {
        const element = await basicFixture();
        await untilLoaded(element);
        assert.isFalse(element.dataUnavailable);
      });

      it('items is set', async () => {
        const element = await basicFixture();
        await untilLoaded(element);
        assert.typeOf(element.items, 'array', 'items is an array');
        assert.lengthOf(element.items, 30, 'items contains one page of results');
      });

      it('exchangeOffset is moved by number of items on the list', async () => {
        const element = await basicFixture();
        await untilLoaded(element);
        assert.equal(element.exchangeOffset, 30);
      });

      it('noMoreResults is true when less than offset', async () => {
        const element = await partialFixture();
        await untilLoaded(element);
        assert.isTrue(element.noMoreResults);
      });

      it('renderLoadMore is false when not querying and no more results', async () => {
        const element = await partialFixture();
        await untilLoaded(element);
        assert.isFalse(element.renderLoadMore);
      });
    });

    describe('reset()', () => {
      /** @type ExchangeSearchElement */
      let element;
      beforeEach(async () => {
        element = await basicFixture();
        // @ts-ignore
        element.items = [{ name: 'test' }];
        element.exchangeOffset = 20;
        element.noMoreResults = true;
        element[queryingValue] = true;
        element.reset();
      });

      it('Resets the items', () => {
        assert.typeOf(element.items, 'array', 'items is an array');
        assert.lengthOf(element.items, 0, 'items is empty');
      });

      it('Resets exchangeOffset', () => {
        assert.equal(element.exchangeOffset, 0);
      });

      it('Resets noMoreResults', () => {
        assert.isFalse(element.noMoreResults);
      });

      it('Resets querying', () => {
        assert.isFalse(element.querying);
      });
    });

    describe('[enableList]()', () => {
      /** @type ExchangeSearchElement */
      let element;
      beforeEach(async () => {
        element = await basicFixture();
        await untilLoaded(element);
      });

      it('Sets listView to true', () => {
        element[enableList]();
        assert.isTrue(element.listView);
      });

      it('Renders list items', async () => {
        element[enableList]();
        await nextFrame();
        const item = element.shadowRoot.querySelector('.list-item');
        assert.isOk(item);
      });
    });

    describe('[enableGrid]()', () => {
      /** @type ExchangeSearchElement */
      let element;
      beforeEach(async () => {
        element = await basicFixture();
        element.listView = true;
        await untilLoaded(element);
      });

      it('Sets listView to false', () => {
        element[enableGrid]();
        assert.isFalse(element.listView);
      });

      it('Renders grid items', async () => {
        element[enableGrid]();
        await nextFrame();
        const item = element.shadowRoot.querySelector('.grid-item');
        assert.isOk(item);
      });
    });

    describe('updateSearch()', () => {
      /** @type ExchangeSearchElement */
      let element;
      beforeEach(async () => {
        element = await basicFixture();
      });

      it('Calls reset function', () => {
        const stub = sinon.stub(element, 'reset');
        element.updateSearch();
        assert.isTrue(stub.called);
        stub.restore();
      });

      it('Calls query function', async () => {
        const stub = sinon.stub(element, 'queryCurrent');
        await element.updateSearch();
        stub.restore();
        assert.isTrue(stub.called);
      });
    });

    describe('#dataUnavailable', () => {
      /** @type ExchangeSearchElement */
      let element;
      beforeEach(async () => {
        element = await basicFixture();
      });

      it('Returns true when both arguments are falsy', () => {
        element[queryingValue] = false;
        assert.isTrue(element.dataUnavailable);
      });

      it('Returns false when querying', () => {
        element[queryingValue] = true;
        assert.isFalse(element.dataUnavailable);
      });

      it('Returns false when has items', () => {
        // @ts-ignore
        element.items = [{}];
        element[queryingValue] = false;
        assert.isFalse(element.dataUnavailable);
      });
    });

    describe('queryCurrent()', () => {
      let element = /** @type ExchangeSearchElement */ (null);
      beforeEach(async () => {
        element = await basicFixture();
      });

      it('Sets querying to true', () => {
        element.queryCurrent();
        assert.isTrue(element.querying);
      });
    });

    describe('[exchangeResponse]()', () => {
      let element = /** @type ExchangeSearchElement */ (null);
      let emptyResponse;
      let dataResponse;
      beforeEach(async () => {
        element = await basicFixture();
        emptyResponse = [];
        dataResponse = mock.exchangeAssetsList(env.exchangeApiPort, 4);
      });

      it('Sets noMoreResults when no data', () => {
        element[exchangeResponse](emptyResponse);
        assert.isTrue(element.noMoreResults);
      });

      it('Sets querying to false when no data', () => {
        element[queryingValue] = true;
        element[exchangeResponse](emptyResponse);
        assert.isFalse(element.querying);
      });

      it('Sets noMoreResults when data size is less than exchangeLimit', () => {
        element[exchangeResponse](dataResponse);
        assert.isTrue(element.noMoreResults);
      });

      it('does not set noMoreResults when within exchangeLimit', () => {
        element.exchangeLimit = 4;
        element[exchangeResponse](dataResponse);
        assert.isFalse(element.noMoreResults);
      });

      it('Sets items property', () => {
        element[exchangeResponse](dataResponse);
        assert.typeOf(element.items, 'array');
        assert.lengthOf(element.items, 4);
      });

      it('Sets exchangeOffset to size of array', () => {
        assert.equal(element.exchangeOffset, 0);
        element[exchangeResponse](dataResponse);
        assert.equal(element.exchangeOffset, 4);
        element[exchangeResponse](dataResponse);
        assert.equal(element.exchangeOffset, 8);
      });

      it('Sets querying to false', () => {
        element[queryingValue] = true;
        element[exchangeResponse](dataResponse);
        assert.isFalse(element.querying);
      });
    });

    describe('#queryParams', () => {
      let element = /** @type ExchangeSearchElement */ (null);
      beforeEach(async () => {
        element = await basicFixture();
      });

      it('Sets required properties', () => {
        element.type = 'a';
        element.exchangeLimit = 1;
        element.exchangeOffset = 2;

        const result = element.queryParams;
        assert.equal(result.types, 'a');
        assert.equal(result.limit, 1);
        assert.equal(result.offset, 2);
        assert.isUndefined(result.search);
      });

      it('Sets search if not empty', () => {
        element.type = 'a';
        element.exchangeLimit = 1;
        element.exchangeOffset = 2;
        element.query = 'd';

        const result = element.queryParams;
        assert.equal(result.search, 'd');
      });
    });

    describe('#types()', () => {
      let element = /** @type ExchangeSearchElement */ (null);
      beforeEach(async () => {
        element = await basicFixture();
      });

      it('returns empty array when no type', () => {
        element.type = '';
        const result = element.types;
        assert.typeOf(result, 'array');
        assert.lengthOf(result, 0);
      });

      it('returns a single type', () => {
        element.type = 'test';
        const result = element.types;
        assert.lengthOf(result, 1);
        assert.equal(result[0], 'test');
      });

      it('Returns multiple types', () => {
        element.type = 'rest-api,template';
        const result = element.types;
        assert.lengthOf(result, 2);
        assert.equal(result[0], 'rest-api');
        assert.equal(result[1], 'template');
      });

      it('Trim types', () => {
        element.type = ' rest-api , template , connector ';
        const result = element.types;
        assert.lengthOf(result, 3);
        assert.equal(result[0], 'rest-api');
        assert.equal(result[1], 'template');
        assert.equal(result[2], 'connector');
      });
    });

    describe('[itemActionHandler]()', () => {
      let element = /** @type ExchangeSearchElement */ (null);
      beforeEach(async () => {
        element = await basicFixture();
        await untilLoaded(element);
      });

      it('dispatches the selected event', () => {
        const spy = sinon.spy();
        element.addEventListener('selected', spy);
        const item = /** @type HTMLElement */ (element.shadowRoot.querySelector('.open-button'));
        item.click();
        assert.isTrue(spy.called, 'dispatches selected event');
      });

      it('has the asset item on the event', () => {
        const spy = sinon.spy();
        element.addEventListener('selected', spy);
        const item = /** @type HTMLElement */ (element.shadowRoot.querySelector('.open-button'));
        item.click();
        const model = element.items[0];
        assert.deepEqual(spy.args[0][0].detail, model);
      });
    });

    describe('Authorization properties', () => {
      let element = /** @type ExchangeSearchElement */ (null);
      beforeEach(async () => {
        element = await authFixture();
      });

      let handler;
      before(() => {
        handler = (e) => {
          e.detail.result = Promise.resolve({
            accessToken: 'test-token',
          });
        };
        window.addEventListener(AuthorizationEventTypes.OAuth2.authorize, handler)
      });

      after(() => {
        window.removeEventListener(AuthorizationEventTypes.OAuth2.authorize, handler)
      });

      it('renders the authorization button', () => {
        const button = element.shadowRoot.querySelector('.auth-button');
        assert.ok(button, 'Button is in the DOM');
        const { display } = getComputedStyle(button);
        assert.notEqual(display, 'none');
      });

      it('sets up auth headers', async () => {
        element.accessToken = 'test';
        await nextFrame();
        const result = element[authHeaderValue];
        assert.equal(result, 'Bearer test');
      });
    });

    describe('#effectivePanelTitle', () => {
      let element = /** @type ExchangeSearchElement */ (null);
      beforeEach(async () => {
        element = await basicFixture();
      });

      it('Returns predefined title', () => {
        element.panelTitle = 'test-title';
        assert.equal(element.effectivePanelTitle, 'test-title');
      });

      [
        ['rest-api', 'Explore REST APIs'],
        ['connector', 'Explore connectors'],
        ['template', 'Explore templates'],
        ['example', 'Explore examples'],
        ['soap-api', 'Explore SOAP APIs'],
        ['raml-fragment', 'Explore API fragments'],
        ['custom', 'Explore custom assets'],
        ['template,custom', 'Explore Exchange assets']
      ].forEach(([type, title]) => {
        it(`Returns title for ${type}`, () => {
          element.type = type;
          assert.equal(element.effectivePanelTitle, title);
        });
      });
    });

    describe('[typeChanged]()', () => {
      let element = /** @type ExchangeSearchElement */ (null);
      beforeEach(async () => {
        element = await basicFixture();
      });

      it('calls the API endpoint when type change', () => {
        let called = false;
        element.updateSearch = async () => { called = true };
        element[typeChanged]('rest-api');
        assert.isTrue(called);
      });
    });

    describe('[computeColumns]()', () => {
      const auto = 'auto';
      let element = /** @type ExchangeSearchElement */ (null);
      beforeEach(async () => {
        element = await basicFixture();
        element.columns = auto;
      });

      it('sets [columnsValue] from the columns property', () => {
        element.columns = 100;
        assert.equal(element[columnsValue], 100);
      });

      it('sets [columnsValue] without setting the column property', () => {
        assert.typeOf(element[columnsValue], 'number');
      });
    });

    describe('[oauthCallback]()', () => {
      let element = /** @type ExchangeSearchElement */ (null);
      beforeEach(async () => {
        element = await noAutoFixture();
      });

      it('Sets authInitialized to true', () => {
        element.authInitialized = false;
        element[oauthCallback]();
        assert.isTrue(element.authInitialized);
      });

      it('Calls updateSearch() when no no-auto', () => {
        const spy = sinon.spy(element, 'updateSearch');
        element.noAuto = false;
        element.authInitialized = true;
        element[oauthCallback]();
        assert.isTrue(spy.called);
      });

      it('does not call updateSearch() when no-auto', () => {
        const spy = sinon.spy(element, 'updateSearch');
        element[oauthCallback]();
        assert.isFalse(spy.called);
      });
    });
  });

  describe('[setupAuthHeaders]()', () => {
    let element = /** @type ExchangeSearchElement */ (null);
    beforeEach(async () => {
      element = await noAutoFixture();
    });

    it('Headers are empty when no token', async () => {
      element[setupAuthHeaders]();
      await nextFrame();
      const result = element[authHeaderValue];
      assert.notOk(result);
    });

    it('headers are set when token', async () => {
      element[setupAuthHeaders]('test-token');
      await nextFrame();
      const result = element[authHeaderValue];
      assert.equal(result, 'Bearer test-token');
    });
  });

  describe('[anypointAuthChanged]()', () => {
    let element = /** @type ExchangeSearchElement */ (null);
    beforeEach(async () => {
      element = await noAutoFixture();
    });

    it('Calls [listenOauth]() when state is "true"', () => {
      const spy = sinon.spy(element, listenOauth);
      element.anypointAuth = true;
      assert.isTrue(spy.called);
    });

    it('Calls [unlistenOauth]() when state is "false"', () => {
      element.anypointAuth = true;
      const spy = sinon.spy(element, unlistenOauth);
      element.anypointAuth = false;
      assert.isTrue(spy.called);
    });
  });

  describe('[querySearchHandler]()', () => {
    let element = /** @type ExchangeSearchElement */ (null);
    beforeEach(async () => {
      element = await noAutoFixture();
    });

    it('calls updateSearch() when no value', () => {
      const input = element.shadowRoot.querySelector('anypoint-input');
      input.value = 'value';
      const spy = sinon.spy(element, 'updateSearch');
      input.dispatchEvent(new Event('search'));
      assert.isFalse(spy.called);
    });

    it('Won\'t call updateSearch() when input has value', () => {
      const input = element.shadowRoot.querySelector('anypoint-input');
      const spy = sinon.spy(element, 'updateSearch');
      input.dispatchEvent(new Event('search'));
      assert.isTrue(spy.called);
    });
  });

  describe('[queryKeydownHandler]()', () => {
    let element = /** @type ExchangeSearchElement */ (null);
    beforeEach(async () => {
      element = await noAutoFixture();
    });

    it('does not call updateSearch() when no key is not Enter', () => {
      const spy = sinon.spy(element, 'updateSearch');
      const input = element.shadowRoot.querySelector('anypoint-input');
      input.dispatchEvent(new KeyboardEvent('keydown', {
        key: 'Escape',
      }));
      assert.isFalse(spy.called);
    });

    it('calls updateSearch() when key is Enter', () => {
      const spy = sinon.spy(element, 'updateSearch');
      const input = element.shadowRoot.querySelector('anypoint-input');
      input.dispatchEvent(new KeyboardEvent('keydown', {
        key: 'Enter',
      }));
      assert.isTrue(spy.called);
    });
  });

  describe('[exchangeResponseError]()', () => {
    let element = /** @type ExchangeSearchElement */ (null);
    beforeEach(async () => {
      element = await noAutoFixture();
      await nextFrame();
    });

    it('resets querying', () => {
      const e = new Error('test')
      element[exchangeResponseError](e);
      assert.isFalse(element.querying);
    });

    it('clears authorization state when response status is 401', async () => {
      element.signedIn = true;
      element.accessToken = 'expired';
      await element.queryCurrent();
      assert.isUndefined(element.accessToken, 'accessToken is cleared');
      assert.isFalse(element.signedIn, 'signedIn is false');
    });

    it('dispatches tokenexpired when status is 401', async () => {
      element.signedIn = true;
      element.accessToken = 'expired';
      const spy = sinon.spy();
      element.addEventListener('tokenexpired', spy);
      await element.queryCurrent();
      assert.isTrue(spy.called);
    });
  });

  describe('[enableGrid]()', () => {
    let element = /** @type ExchangeSearchElement */ (null);
    beforeEach(async () => {
      element = await noAutoFixture();
      await nextFrame();
    });

    it('Sets listView false', () => {
      element.listView = true;
      element[enableGrid]();
      assert.isFalse(element.listView);
    });

    it('deactivates list button', () => {
      const toggle = element.shadowRoot.querySelector('[data-action="list-enable"]');
      element.listView = false;
      // @ts-ignore
      toggle.active = true;
      element[enableGrid]();
      // @ts-ignore
      assert.isFalse(toggle.active);
    });
  });

  describe('[enableList]()', () => {
    let element = /** @type ExchangeSearchElement */ (null);
    beforeEach(async () => {
      element = await noAutoFixture();
      await nextFrame();
    });

    it('Sets listView true', () => {
      element.listView = false;
      element[enableList]();
      assert.isTrue(element.listView);
    });

    it('Activates grid toggle button', () => {
      const toggle = element.shadowRoot.querySelector('[data-action="grid-enable"]');
      element.listView = true;
      // @ts-ignore
      toggle.active = true;
      element[enableList]();
      // @ts-ignore
      assert.isFalse(toggle.active);
    });
  });
});
