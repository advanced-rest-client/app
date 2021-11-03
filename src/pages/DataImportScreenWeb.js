/* eslint-disable class-methods-use-this */
import { html } from 'lit-html';
import { DataImportScreen } from './DataImportScreen.js';

/** @typedef {import('lit-html').TemplateResult} TemplateResult */

export class DataImportScreenWeb extends DataImportScreen {
  async selectArcHandler() {
    const input = /** @type HTMLInputElement */ (document.querySelector('#arcImporter'));
    input.value = '';
    input.accept = '';
    input.click();
  }

  async selectPostmanHandler() {
    const input = /** @type HTMLInputElement */ (document.querySelector('#postmanImporter'));
    input.value = '';
    input.accept = '';
    input.click();
  }

  /**
   * @param {Event} e
   */
  arcFileChange(e) {
    const input = /** @type HTMLInputElement */ (e.target);
    const { files } = input;
    const file = files[0];
    input.value = '';
    if (file) {
      this.processArcData(file);
    }
  }

  /**
   * @param {Event} e
   */
  postmanFileChange(e) {
    const input = /** @type HTMLInputElement */ (e.target);
    const { files } = input;
    const file = files[0];
    input.value = '';
    if (file) {
      this.processPostmanData(file);
    }
  }

  /**
   * @param {string} route The current route
   * @returns {TemplateResult} The template for the page content
   */
  pageTemplate(route) {
    return html`
    ${super.pageTemplate(route)}
    <input type="file" hidden id="arcImporter" accept=".arc,.json" @change="${this.arcFileChange}"/>
    <input type="file" hidden id="postmanImporter" accept=".json" @change="${this.postmanFileChange}"/>
    `;
  }
}
