import { html } from 'lit-html';
import { DemoPage } from '@advanced-rest-client/arc-demo-helper';
import '@advanced-rest-client/arc-demo-helper/arc-interactive-demo.js';
import { ArcMock } from '@advanced-rest-client/arc-mock';
import '../../define/headers-list.js';

class ComponentPage extends DemoPage {
  constructor() {
    super();
    this.initObservableProperties([
      'value',
    ]);
    this.componentName = 'headers-list';
    this.renderViewControls = true;
    this.value = '';
    this.generator = new ArcMock();
    this.generateHeaders();
  }

  generateHeaders() {
    const value = this.generator.http.headers.headers('response');
    this.value = `${value}\nLink: <https://api.github.com/organizations/19393150/repos?page=6>, rel="next";`;
  }

  _demoTemplate() {
    const {
      demoStates,
      darkThemeActive,
      value,
    } = this;
    return html`
      <section class="documentation-section">
        <arc-interactive-demo
          .states="${demoStates}"
          @state-changed="${this._demoStateHandler}"
          ?dark="${darkThemeActive}"
        >
          <headers-list
            .headers="${value}"
            slot="content"
          ></headers-list>
        </arc-interactive-demo>
      </section>
    `;
  }

  contentTemplate() {
    return html`
      <h2>ARC headers list</h2>
      ${this._demoTemplate()}
    `;
  }
}

const instance = new ComponentPage();
instance.render();
