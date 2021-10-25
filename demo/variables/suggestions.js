import { html } from 'lit-element';
import { styleMap } from 'lit-html/directives/style-map.js'
import { DemoPage } from '@advanced-rest-client/arc-demo-helper';
import { ContextMenu } from '@api-client/context-menu';
import { ArcModelEvents, ImportEvents } from '@advanced-rest-client/events';
import { VariablesModel, MockedStore } from '@advanced-rest-client/idb-store';
import '@advanced-rest-client/arc-demo-helper/arc-interactive-demo.js';
import '@anypoint-web-components/awc/anypoint-checkbox.js';
import '@anypoint-web-components/awc/anypoint-input.js';
import '../../define/variables-suggestions.js';
import sourceSystemVariables from './system-variables.js';
import { VariablesProcessor } from '../../index.js';

/** @typedef {import('@advanced-rest-client/events').Variable.ARCVariable} ARCVariable */

const ContextMenuCommands = [
  {
    target: "anypoint-input.main-input",
    label: "Insert a variable",
    title: 'Inserts a variable in the current position',
    id: 'insert-var',
  },
];

class ComponentDemoPage extends DemoPage {
  constructor() {
    super();
    this.initObservableProperties([
      'withSystemVariables',
      'listX', 'listY', 'listTarget', 'listOpened',
      'mainOutput'
    ]);
    this.componentName = 'Variables suggestions';
    this.demoState = 0;
    this.withSystemVariables = false;
    /**
     * @type {HTMLInputElement}
     */
    this.listTarget = undefined;
    this.listX = 0;
    this.listY = 0;
    this.listOpened = false;
    this.mainOutput = undefined;
    this.store = new MockedStore();
    this.model = new VariablesModel();
    this.model.listen(window);
    this.model.systemVariables = sourceSystemVariables;
  }

  firstRender() {
    super.firstRender();
    this.contextMenu = new ContextMenu(document.body.querySelector('.documentation-section'), { cancelNativeWhenHandled: true });
    this.contextMenu.connect();
    this.contextMenu.registerCommands(ContextMenuCommands);
    this.contextMenu.addEventListener('execute', this.contextHandler.bind(this));
    this.render();
  }

  async generateData() {
    await this.store.insertVariablesAndEnvironments(20, { defaultEnv: true });
    ImportEvents.dataImported(document.body);
  }

  async deleteData() {
    await this.store.destroyVariables();
    ArcModelEvents.destroyed(document.body, 'all');
  }

  /**
   * @param {CustomEvent} e 
   */
  contextHandler(e) {
    const { id, clickPoint, target } = e.detail;
    if (id !== 'insert-var' || target.localName !== 'anypoint-input') {
      return;
    }
    this.listX = clickPoint.x;
    this.listY = clickPoint.y;
    this.listTarget = target.inputElement;
    this.listOpened = true;
  }

  listClosedHandler() {
    this.listTarget = undefined;
    this.listOpened = false;
  }

  /**
   * @param {Event} e 
   */
  async evaluateHandler(e) {
    const record = await ArcModelEvents.Environment.current(document.body);
    const { variables=[], systemVariables } = record;
    if (this.withSystemVariables) {
      Object.keys(systemVariables).forEach((key) => {
        const item = /** @type ARCVariable */ ({
          name: key,
          value: systemVariables[key],
          enabled: true,
          environment: 'any',
        });
        variables.push(item);
      });
    }

    const input = /** @type HTMLInputElement */ (e.target);
    // @ts-ignore
    const jexl = window.Jexl;
    const instance = new VariablesProcessor(jexl, variables);
    instance.clearCache();
    try {
      const result = await instance.evaluateVariable(input.value);
      this.mainOutput = result;
    } catch (cause) {
      this.mainOutput = cause.message;
      console.error(cause);
    }
  }

  _demoTemplate() {
    const {
      demoStates,
      darkThemeActive,
      anypoint,
      demoState,
      withSystemVariables,
      listTarget,
      listX,
      listY,
      listOpened,
      mainOutput,
    } = this;
    const listStyles = {
      left: `${listX}px`,
      top: `${listY}px`,
    };
    return html`
      <section class="documentation-section">
        <h3>Interactive demo</h3>
        <p>
          This demo lets you preview the environment overlay element with various
          configuration options.
        </p>
        <arc-interactive-demo
          .states="${demoStates}"
          .selectedState="${demoState}"
          @state-changed="${this._demoStateHandler}"
          ?dark="${darkThemeActive}"
        >
          <div class="demo-content" slot="content">
            <anypoint-input 
              type="text" 
              name="variableValue" 
              class="main-input"
              @change="${this.evaluateHandler}"
            >
              <label slot="label">Input</label>
            </anypoint-input>
            <variables-suggestions
              style="${styleMap(listStyles)}"
              ?anypoint="${anypoint}"
              .systemVariablesEnabled="${withSystemVariables}"
              .input="${listTarget}"
              .opened="${listOpened}"
              @closed="${this.listClosedHandler}"
            ></variables-suggestions>
          </div>

          <label slot="options" id="mainOptionsLabel">Options</label>
          <anypoint-checkbox
            aria-describedby="mainOptionsLabel"
            slot="options"
            name="withSystemVariables"
            @change="${this._toggleMainOption}"
          >System variables</anypoint-checkbox>
        </arc-interactive-demo>

        ${mainOutput ? html`
        <div>
          <label>Processed input</label>
          <output>${mainOutput}</output>
        </div>
        ` : ''}
      </section>
    `;
  }

  _dataControlsTemplate() {
    return html`
    <section class="documentation-section">
      <h3>Data control</h3>
      <p>
        This section allows you to control demo data
      </p>
      <anypoint-button @click="${this.generateData}">Generate data</anypoint-button>
      <anypoint-button @click="${this.deleteData}">Clear list</anypoint-button>
    </section>`;
  }


  contentTemplate() {
    return html`
      <h2>Environment overlay</h2>
      ${this._demoTemplate()}
      ${this._dataControlsTemplate()}
    `;
  }
}

const instance = new ComponentDemoPage();
instance.render();
