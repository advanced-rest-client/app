/**
@license
Copyright 2020 The Advanced REST client authors <arc@mulesoft.com>
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
import { LitElement } from 'lit-element';
import {
  ProcessEvents,
  ImportEvents,
  RestApiEvents,
} from '@advanced-rest-client/events';

export const dragEnterHandler = Symbol('dragEnterHandler');
export const dragLeaveHandler = Symbol('dragLeaveHandler');
export const dragOverHandler = Symbol('dragOverHandler');
export const dropHandler = Symbol('dropHandler');
export const processEntries = Symbol('processEntries');
export const notifyApiParser = Symbol('notifyApiParser');

/**
 * @param {Event} e 
 */
function cancelEvent(e) {
  e.stopPropagation();
  e.preventDefault();
}

/**
 * @param {typeof LitElement} base
 */
const mxFunction = base => {
  class FileDropMixinImpl extends base {
    static get properties() {
      return {
        /**
         * True when file is dragged over the element.
         * @attribute
         */
        dragging: { type: Boolean, reflect: true }
      };
    }

    constructor() {
      super();
      this[dragEnterHandler] = this[dragEnterHandler].bind(this);
      this[dragLeaveHandler] = this[dragLeaveHandler].bind(this);
      this[dragOverHandler] = this[dragOverHandler].bind(this);
      this[dropHandler] = this[dropHandler].bind(this);
    }
  
    connectedCallback() {
      super.connectedCallback();
      this.addEventListener('dragenter', this[dragEnterHandler]);
      this.addEventListener('dragleave', this[dragLeaveHandler]);
      this.addEventListener('dragover', this[dragOverHandler]);
      this.addEventListener('drop', this[dropHandler]);
    }

    disconnectedCallback() {
      super.disconnectedCallback();
      this.removeEventListener('dragenter', this[dragEnterHandler]);
      this.removeEventListener('dragleave', this[dragLeaveHandler]);
      this.removeEventListener('dragover', this[dragOverHandler]);
      this.removeEventListener('drop', this[dropHandler]);
    }

    /**
     * @param {DragEvent} e 
     */
    [dragEnterHandler](e) {
      const types = [...e.dataTransfer.types];
      if (!types.includes('Files')) {
        return;
      }
      cancelEvent(e);
      this.dragging = true;
    }
    
    /**
     * @param {DragEvent} e 
     */
    [dragLeaveHandler](e) {
      const types = [...e.dataTransfer.types];
      if (!types.includes('Files')) {
        return;
      }
      cancelEvent(e);
      this.dragging = false;
    }
    
    /**
     * @param {DragEvent} e 
     */
    [dragOverHandler](e) {
      const types = [...e.dataTransfer.types];
      if (!types.includes('Files')) {
        return;
      }
      cancelEvent(e);
      this.dragging = true;
    }
    
    /**
     * @param {DragEvent} e 
     */
    async [dropHandler](e) {
      const types = [...e.dataTransfer.types];
      if (!types.includes('Files')) {
        return;
      }
      cancelEvent(e);
      this.dragging = false;
      const { files } = e.dataTransfer;
      if (!files || !files.length) {
        return;
      }
      await this[processEntries](files);
    }
  
    /**
     * Dispatches `api-process-file` if the file is of a type of
     * `application/zip` or `application/yaml`. Dispatches `import-process-file`
     * event in other cases.
     *
     * When handling json file it reads the file and checks if file is
     * OAS/swagger file.
     *
     * @param {FileList} files Dropped files list
     * @return {Promise}
     */
    async [processEntries](files) {
      const file = files[0];
      const apiTypes = [
        'application/zip',
        'application/yaml',
        'application/x-yaml',
        'application/raml',
        'application/x-raml',
        'application/x-zip-compressed',
      ];
      if (apiTypes.includes(file.type)) {
        // probably an API file
        this[notifyApiParser](file);
        return;
      }
      const name = String(file.name);
      // RAML files
      if (name && name.includes('.raml') || name.includes('.yaml') || name.includes('.zip')) {
        this[notifyApiParser](file);
        return;
      }
      const id = new Date().toISOString();
      ProcessEvents.loadingstart(this, id, 'Processing file data');
      try {
        await ImportEvents.processFile(this, file);
      } catch (cause) {
        ProcessEvents.loadingerror(this, id, cause);
      }
    }

    /**
     * Dispatches `api-process-file` to parse API data with a separate module.
     * In ARC electron it is `@advanced-rest-client/electron-amf-service`
     * node module. In other it might be other component.
     * @param {File} file User file.
     */
    [notifyApiParser](file) {
      RestApiEvents.processFile(this, file);
    }
  }
  return FileDropMixinImpl;
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
export const FileDropMixin = dedupeMixin(mxFunction);
