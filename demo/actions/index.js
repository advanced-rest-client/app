import { html } from 'lit-html';
import { DemoPage } from '@advanced-rest-client/arc-demo-helper';
import '@advanced-rest-client/arc-demo-helper/arc-interactive-demo.js';
import '../../define/arc-actions.js';

const cacheKeys = Object.freeze({
  request: 'cache.actions.request',
  response: 'cache.actions.response',
  selected: 'cache.actions.selected',
});

class ComponentDemo extends DemoPage {
  constructor() {
    super();
    this.initObservableProperties(['outlined', 'request', 'response', 'selected']);
    this.componentName = 'arc-actions';
    this.demoStates = ['Filled', 'Outlined', 'Anypoint'];
    this._actionsChange = this._actionsChange.bind(this);
    this._selectionChange = this._selectionChange.bind(this);
    this.request = null;
    this.response = null;
    this.selected = 0;
    this.renderViewControls = true;
    this._restoreCache();
  }

  _demoStateHandler(e) {
    const state = e.detail.value;
    this.outlined = state === 1;
    this.anypoint = state === 2;
    this._updateAnypoint();
  }

  _actionsChange(e) {
    const { type } = e.detail;
    const { target } = e;
    const list = type === 'request' ? target.request : target.response;
    this[type] = list;
    console.log(`${type} actions:`, list);
    this._cacheActions(type, list);
  }

  _selectionChange(e) {
    const { selected } = e.target;
    localStorage.setItem(cacheKeys.selected, String(selected));
  }

  _cacheActions(type, list) {
    let data = '';
    if (Array.isArray(list) && list.length) {
      data = JSON.stringify(list);
    }
    const key = cacheKeys[type];
    localStorage.setItem(key, data);
  }

  _restoreCache() {
    this._restoreCacheValue('request', localStorage.getItem(cacheKeys.request));
    this._restoreCacheValue('response', localStorage.getItem(cacheKeys.response));
    const selectionRaw = localStorage.getItem(cacheKeys.selected);
    const typedSelection = Number(selectionRaw);
    if (selectionRaw && !Number.isNaN(typedSelection)) {
      this.selected = typedSelection;
    }
  }

  _restoreCacheValue(type, value) {
    if (!value) {
      return;
    }
    let list;
    try {
      list = JSON.parse(value);
    } catch (_) {
      return;
    }
    if (!list) {
      return;
    }
    this[type] = list;
  }

  _demoTemplate() {
    const { demoStates, darkThemeActive, anypoint, outlined, request, response, selected } = this;
    return html`
      <section class="documentation-section">
        <h3>Interactive demo</h3>
        <p>
          This demo lets you preview the request actions panel element with various configuration options.
        </p>
        <arc-interactive-demo
          .states="${demoStates}"
          @state-changed="${this._demoStateHandler}"
          ?dark="${darkThemeActive}"
        >
          <arc-actions
            .request="${request}"
            .response="${response}"
            .selected="${selected||0}"
            ?anypoint="${anypoint}"
            ?outlined="${outlined}"
            slot="content"
            @change="${this._actionsChange}"
            @selectedchange="${this._selectionChange}"
          ></arc-actions>
        </arc-interactive-demo>
      </section>
    `;
  }

  contentTemplate() {
    return html`
      <h2>HTTP request actions</h2>
      ${this._demoTemplate()}
    `;
  }
}

const instance = new ComponentDemo();
instance.render();
