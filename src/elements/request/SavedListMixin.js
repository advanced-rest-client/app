/* eslint-disable class-methods-use-this */
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

import { dedupeMixin } from '@open-wc/dedupe-mixin';
// eslint-disable-next-line no-unused-vars
import { LitElement, html } from 'lit-element';
import {classMap} from 'lit-html/directives/class-map.js';
import { ArcModelEvents } from '@advanced-rest-client/events';
import {
  appendItems,
  listTemplate,
  requestItemTemplate,
  requestItemBodyTemplate,
  selectedItemsValue,
  itemClickHandler,
  requestItemSelectionTemplate,
  requestItemLabelTemplate,
  requestItemActionsTemplate,
  dragStartHandler,
  draggableEnabledValue,
  draggableChanged,
  addDraggableEvents,
  removeDraggableEvents,
  hasDraggableEventsValue,
  dragOverHandler,
  dragLeaveHandler,
  dropHandler,
  isValidDragTarget,
  unavailableTemplate,
  exportKindValue,
  readType,
} from './internals.js';
import { savedSort, computeA11yCommand } from '../../lib/Utils.js';
import { RequestsListMixin } from './RequestsListMixin.js';

/** @typedef {import('@advanced-rest-client/events').ArcRequest.ARCSavedRequest} ARCSavedRequest */
/** @typedef {import('lit-element').TemplateResult} TemplateResult */

/**
 * @param {typeof LitElement} base
 */
const mxFunction = base => {
  class SavedListMixinImpl extends RequestsListMixin(base) {
    get draggableEnabled() {
      return this[draggableEnabledValue];
    }
  
    set draggableEnabled(value) {
      const old = this[draggableEnabledValue];
      /* istanbul ignore if */
      if (old === value) {
        return;
      }
      this[draggableEnabledValue] = value;
      this[draggableChanged](value);
      this.requestUpdate();
    }
  
    constructor() {
      super();
      this[dragOverHandler] = this[dragOverHandler].bind(this);
      this[dragLeaveHandler] = this[dragLeaveHandler].bind(this);
      this[dropHandler] = this[dropHandler].bind(this);
      /**
       * @type {ARCSavedRequest[]}
      */  
      this.requests = undefined;
      this[exportKindValue] = 'ARC#SavedExport';
    }

    connectedCallback() {
      super.connectedCallback();
      if (!this.type) {
        this.type = 'saved';
      }
      if (this.draggableEnabled) {
        this[addDraggableEvents]();
      }
    }

    disconnectedCallback() {
      super.disconnectedCallback();
      this[removeDraggableEvents]();
    }
  
    [draggableChanged](value) {
      if (value) {
        this[addDraggableEvents]();
      } else {
        this[removeDraggableEvents]();
      }
    }
  
    [addDraggableEvents]() {
      if (this[hasDraggableEventsValue]) {
        return;
      }
      this[hasDraggableEventsValue] = true;
      this.addEventListener('dragover', this[dragOverHandler]);
      this.addEventListener('dragleave', this[dragLeaveHandler]);
      this.addEventListener('drop', this[dropHandler]);
    }
  
    [removeDraggableEvents]() {
      if (!this[hasDraggableEventsValue]) {
        return;
      }
      this[hasDraggableEventsValue] = false;
      this.removeEventListener('dragover', this[dragOverHandler]);
      this.removeEventListener('dragleave', this[dragLeaveHandler]);
      this.removeEventListener('drop', this[dropHandler]);
    }
  
    /**
     * Checks whether the dragged target is a valid candidate for the drop.
     * @param {DragEvent} e
     * @returns {boolean} True when dragged element can be dropped here.
     */
    [isValidDragTarget](e) {
      const dt = e.dataTransfer;
      const types = [...dt.types];
      const supported = ['arc/history'];
      return types.some((type) => supported.includes(type));
    }

    /**
     * Handler for `dragover` event on this element. If the dragged item is compatible
     * it renders drop message.
     * 
     * @param {DragEvent} e
     */
    [dragOverHandler](e) {
      if (!this.draggableEnabled || !this[isValidDragTarget](e) || e.defaultPrevented) {
        return;
      }
      const dt = e.dataTransfer;
      e.preventDefault();
      dt.dropEffect = 'copy';
      if (!this.classList.contains('drop-target')) {
        /* eslint-disable wc/no-self-class */
        this.classList.add('drop-target');
      }
    }

    /**
     * Handler for `dragleave` event on this element. If the dragged item is compatible
     * it hides drop message.
     * 
     * @param {DragEvent} e
     */
    [dragLeaveHandler](e) {
      if (!this.draggableEnabled || !this[isValidDragTarget](e) || e.defaultPrevented) {
        return;
      }
      e.preventDefault();
      if (this.classList.contains('drop-target')) {
        this.classList.remove('drop-target');
      }
    }

    /**
     * Handler for `drag` event on this element. If the dragged item is compatible
     * it adds request to saved requests.
     * 
     * @param {DragEvent} e
     */
    async [dropHandler](e) {
      if (!this.draggableEnabled || !this[isValidDragTarget](e) || e.defaultPrevented) {
        return;
      }
      e.preventDefault();
      if (this.classList.contains('drop-target')) {
        this.classList.remove('drop-target');
      }
      const id = e.dataTransfer.getData('arc/id');
      const type = e.dataTransfer.getData('arc/type');
      if (!id || !type) {
        return;
      }
      const request = /** @type ARCSavedRequest */ (await ArcModelEvents.Request.read(this, type, id));
      delete request._id;
      delete request._rev;
      request.type = 'saved';
      if (!request.name) {
        request.name = 'Unnamed request';
      }
      const requestType = this[readType]();
      await ArcModelEvents.Request.store(this, requestType, request)
    }

    /**
     * Overrides the RequestListMixin's drag start function to add `arc/saved` property
     * @param {DragEvent} e
     */
    [dragStartHandler](e) {
      if (!this.draggableEnabled) {
        return;
      }
      super[dragStartHandler](e);
      const dt = e.dataTransfer;
      dt.setData('arc/saved', '1');
      dt.effectAllowed = 'copyMove';
    }

    /**
     * Appends a list of requests to the history list.
     * 
     * @param {ARCSavedRequest[]} requests
     */
    async [appendItems](requests) {
      if (!Array.isArray(requests) || !requests.length) {
        return;
      }
      if (!this.requests) {
        this.requests = [];
      }
      const current = this.requests;
      requests.forEach((item) => {
        if (item._id.startsWith('_design')) {
          return;
        }
        current.push(item);
      });
      current.sort(savedSort);
      await this.requestUpdate();
      // @ts-ignore
      if (this.notifyResize) {
        // @ts-ignore
        this.notifyResize();
      }
    }

    /**
     * @returns {TemplateResult|string} Template for the list items.
     */
    [listTemplate]() {
      const { requests } = this;
      if (!requests || !requests.length) {
        return '';
      }
      return html`
      ${requests.map((item, index) => this[requestItemTemplate](item, index))}
      `;
    }

    /**
     * @param {ARCSavedRequest} request The request to render
     * @param {number} index Index of the history group
     * @returns {TemplateResult} Template for a single request object
     */
    [requestItemTemplate](request, index) {
      const { anypoint, draggableEnabled } = this;
      const allSelected = /** @type string[] */ (this[selectedItemsValue] || []);
      const selected = allSelected.includes(request._id);
      const classes = { 
        selected,
        'request-list-item': true,
      };
      return html`
      <anypoint-icon-item
        data-index="${index}"
        data-id="${request._id}"
        class=${classMap(classes)}
        title="${request.url}"
        role="menuitem"
        ?anypoint="${anypoint}"
        @click="${this[itemClickHandler]}"
        draggable="${draggableEnabled ? 'true' : 'false'}"
        @dragstart="${this[dragStartHandler]}"
      >
        ${this[requestItemSelectionTemplate](request._id)}
        ${this[requestItemLabelTemplate](request.method)}
        ${this[requestItemBodyTemplate](request)}
        ${this[requestItemActionsTemplate](request._id)}
      </anypoint-icon-item>
      `;
    }

    /**
     * @param {ARCSavedRequest} request The request to render
     * @returns {TemplateResult} Template for a request's content
     */
    [requestItemBodyTemplate](request) {
      const { anypoint, hasTwoLines } = this;
      return html`
      <anypoint-item-body
        ?twoline="${hasTwoLines}"
        ?anypoint="${anypoint}"
      >
        <div class="url">${request.url}</div>
        <div data-secondary>${request.name}</div>
      </anypoint-item-body>
      `;
    }

    [unavailableTemplate]() {
      const { dataUnavailable } = this;
      if (!dataUnavailable) {
        return '';
      }
      const cmd = computeA11yCommand('s');
      return html`
      <div class="list-empty">
        <p class="empty-info"><b>The requests list is empty.</b></p>
        <p>
          Save a request using the
          <code class="command">${cmd}</code> keys on the request editor screen.
        </p>
      </div>
      `;
    }
  }
  return SavedListMixinImpl;
}
/**
 * A mixin to be applied to a list that renders history requests.
 * It contains methods to query for history list and to search history.
 * 
 * History list is an immutable list of requests that happened in the past.
 * 
 * Each element on the list is a group containing list requests made the same day.
 *
 * @mixin
 */
export const SavedListMixin = dedupeMixin(mxFunction);
