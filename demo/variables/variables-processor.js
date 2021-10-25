/* eslint-disable no-param-reassign */
/* eslint-disable no-template-curly-in-string */
import { html } from 'lit-html';
import { DemoPage } from '@advanced-rest-client/arc-demo-helper';
import '@anypoint-web-components/awc/anypoint-button.js';
import { VariablesProcessor } from '../../index.js';

/** @typedef {import('@advanced-rest-client/events').Variable.ARCVariable} ARCVariable */

/* global ArcVariables */

class ComponentDemo extends DemoPage {
  constructor() {
    super();
    this.initObservableProperties([
      'vars', 'oVars', 'val', 'evalResult'
    ]);
    this.componentName = 'variables-evaluator';
    let vars = 'variable: my test value\notherVariable: other value\n';
    vars += 'urlParam: query\nurlParamValue: my+query\n';
    vars += 'token: my-access-token\nterm: PUT\n';
    vars += 'complex: ?${urlParam}=${urlParamValue}\n';
    vars += 'doubleComplex: ${complex}&limit=100';
    this.vars = vars;
    this.oVars = 'otherVariable: updated value';
    let val = '{\n';
    val += '  "hello-world": "${variable} ${otherVariable}",\n';
    val += '  "regex1": "^([\\\\w][\\\\w\\\\s\\\\-]*[\\\\w]|[\\\\w])$",\n';
    val += '  "function": "now()",\n';
    val += '  "random": "random()",\n';
    val += '  "group1": "${random(1)}",\n';
    val += '  "group2": "${random(2)}",\n';
    val += '  "group1again": "${random(1)}",\n';
    val += '  "inner": {\n';
    val += '    "complex": true\n';
    val += '  }\n';
    val += '}';
    this.val = val;

    this._varsInput = this._inputHandler.bind(this, 'vars');
    this._oVarsHandler = this._inputHandler.bind(this, 'oVars');
    this._valHandler = this._inputHandler.bind(this, 'val');
    this._evalHandler = this._evalHandler.bind(this);
  }

  _inputHandler(property, e) {
    this[property] = e.target.value;
  }

  _evalHandler() {
    this._evalImperative();
  }

  async _evalImperative() {
    // @ts-ignore
    const jexl = ArcVariables.JexlDev;
    const variables = this.processVarString(this.vars);
    const instance = new VariablesProcessor(jexl, variables);
    instance.clearCache();
    try {
      const result = await instance.evaluateVariable(this.val, this.processOverrideString(this.oVars));
      console.log(result);
      this.evalResult = result;
    } catch (cause) {
      this.evalResult = cause.message;
      console.error(cause);
    }
  }

  processVarString(str) {
    const result = [];
    str.split('\n').forEach((line) => {
      line = line.trim();
      if (!line) {
        return;
      }
      const parts = line.split(':');
      const data = /** @type ARCVariable */ ({
        name: parts[0].trim(),
        enabled: true,
        value: ''
      });
      if (parts[1]) {
        data.value = parts[1].trim();
      }
      result.push(data);
    });
    return result;
  }

  /**
   * @param {string} str
   * @returns {Readonly<object>}
   */
  processOverrideString(str) {
    const result = {};
    str.split('\n').forEach((line) => {
      line = line.trim();
      if (!line) {
        return;
      }
      const parts = line.split(':');
      const name = parts[0].trim();
      const value = parts[1] ? parts[1].trim() : '';
      result[name] = value;
    });
    return Object.freeze(result);
  }

  contentTemplate() {
    const { evalResult, val, vars, oVars } = this;
    return html`
    <fieldset class="card">
      <legend>Input data</legend>
      <div>
        <label for="vars" id="varsLabel">Variables</label>
        <p class="desc" id="varsDesc">
          Add variables in each line using ":" as a delimiter between name and the value.
          This variables are going to be used in events API (environment-current event)
        </p>
        <textarea
          name="variables"
          id="vars"
          rows="8"
          cols="60"
          aria-labelledby="varsLabel"
          aria-describedby="varsDesc"
          .value="${vars}"
          @input="${this._varsInput}"></textarea>
      </div>

      <div>
        <label for="oVars" id="overrideLabel">Override variables</label>
        <p class="desc" id="oVarsDesc">
          Variables defined here will be passed to eval function to override variables from previous input
        </p>
        <textarea
          name="variables"
          id="oVars"
          rows="8"
          cols="60"
          aria-labelledby="overrideLabel"
          aria-describedby="oVarsDesc"
          .value="${oVars}"
          @input="${this._oVarsHandler}"></textarea>
      </div>

      <div>
        <label for="vars" id="varsLabel">Value</label>
        <p class="desc" id="varsDesc">Enter a text to be evaluated for variables</p>
        <textarea
          name="textvalue"
          id="val"
          rows="8"
          cols="60"
          aria-labelledby="valLabel"
          aria-describedby="valDesc"
          .value="${val}"
          @input="${this._valHandler}"></textarea>
      </div>
      <anypoint-button emphasis="high" @click="${this._evalHandler}">Evaluate</anypoint-button>
    </fieldset>

    <div class="card">
      <h2>Eval result</h2>
      ${evalResult ?
        html`<output>${evalResult}</output>` :
        html`<p class="empty-info">Evaluate the value to see the result.</p>`}
    </div>
    `;
  }
}
const instance = new ComponentDemo();
instance.render();
