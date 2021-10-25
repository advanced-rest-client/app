import { html } from 'lit-element';
import { DemoPage } from '@advanced-rest-client/arc-demo-helper';
import '@advanced-rest-client/arc-demo-helper/arc-interactive-demo.js';
import '@anypoint-web-components/awc/anypoint-checkbox.js';
import { VariablesModel } from '@advanced-rest-client/idb-store';
import '../../define/variables-overlay.js';
import variables from './system-variables.js';

class ComponentDemoPage extends DemoPage {
  constructor() {
    super();
    this.initObservableProperties([
      'withSystemVariables',
    ]);
    this.componentName = 'Environment overlay';
    this.demoStates = ['Filled', 'Outlined', 'Anypoint'];
    this.demoState = 0;
    this.withSystemVariables = false;

    this.model = new VariablesModel();
    this.model.listen(window);
    this.model.systemVariables = variables;
  }

  _demoStateHandler(e) {
    const state = e.detail.value;
    this.demoState = state;
    this.outlined = state === 1;
    this.anypoint = state === 2;
    this._updateAnypoint();
  }

  _varsOpenHandler(e) {
    const overlay = document.querySelector('variables-overlay');
    overlay.positionTarget = e.target;
    overlay.opened = true;
  }

  _demoTemplate() {
    const {
      demoStates,
      darkThemeActive,
      anypoint,
      outlined,
      demoState,
      withSystemVariables,
    } = this;
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
          <anypoint-button
            slot="content"
            @click="${this._varsOpenHandler}"
          >Open overlay</anypoint-button>

          <label slot="options" id="mainOptionsLabel">Options</label>
          <anypoint-checkbox
            aria-describedby="mainOptionsLabel"
            slot="options"
            name="withSystemVariables"
            @change="${this._toggleMainOption}"
          >System variables</anypoint-checkbox>
        </arc-interactive-demo>

        <variables-overlay 
          id="overlay" 
          verticalAlign="top" 
          withBackdrop 
          horizontalAlign="right"
          noCancelOnOutsideClick
          ?anypoint="${anypoint}"
          ?outlined="${outlined}"
          .systemVariablesEnabled="${withSystemVariables}"
        ></variables-overlay>
      </section>
    `;
  }

  contentTemplate() {
    return html`
      <h2>Environment overlay</h2>
      ${this._demoTemplate()}
    `;
  }
}

const instance = new ComponentDemoPage();
instance.render();
