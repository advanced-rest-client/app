/**
@license
Copyright 2018 The Advanced REST client authors <arc@mulesoft.com>
Licensed under the Apache License, Version 2.0 (the "License"); you may not
use this file except in compliance with the License. You may obtain a copy of
the License at
http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
License for the specific language governing permissions and limitations under
the License.
*/
import { LitElement, html } from 'lit-element';
import { SavedListMixin } from '../request/SavedListMixin.js';
import ListStyles from '../request/ListStyles.js';
import * as internals from '../request/internals.js';

/**
 * Advanced REST Client's history menu element.
 */
export default class SavedMenuElement extends SavedListMixin(LitElement) {
  static get styles() {
    return ListStyles;
  }

  render() {
    return html`
    ${this[internals.busyTemplate]()}
    ${this[internals.unavailableTemplate]()}
    ${this[internals.dropTargetTemplate]()}
    <div class="list" @scroll="${this[internals.listScrollHandler]}">
    ${this[internals.listTemplate]()}
    </div>
    `;
  }
}
