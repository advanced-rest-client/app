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
import { hasTwoLines } from '../../lib/Utils.js';
import { listTypeValue, hasTwoLinesValue, updateListStyles, applyListStyles, queryingValue, queryingProperty } from './internals.js';

/**
 * @param {typeof LitElement} base
 */
const mxFunction = base => {
  class ListMixinImpl extends base {
    static get properties() {
      return {
        /**
         * Changes information density of list items.
         * By default it uses material's list item with two lines (72px height)
         * Possible values are:
         *
         * - `default` or empty - regular list view
         * - `comfortable` - enables MD single line list item vie (52px height)
         * - `compact` - enables list that has 40px height (touch recommended)
         * @attribute
         */
        listType: { type: String, reflect: true },
        /**
         * When set it adds action buttons into the list elements.
         * @attribute
         */
        listActions: { type: Boolean },
        /**
         * Single page query limit.
         * @attribute
         */
        pageLimit: { type: Number },
        /**
         * Enables Anypoint theme
         * @attribute
         */
        anypoint: { type: Boolean },
      };
    }

    get listType() {
      return this[listTypeValue];
    }

    set listType(value) {
      const old = this[listTypeValue];
      /* istanbul ignore if */
      if (old === value) {
        return;
      }
      this[listTypeValue] = value;
      this.requestUpdate('listType', old);
      this[hasTwoLinesValue] = hasTwoLines(value);
      this[updateListStyles](value);
    }

    /**
     * @returns {boolean} True if the list item should be consisted of two lines of description.
     */
    get hasTwoLines() {
      return this[hasTwoLinesValue];
    }

    /**
     * @return {boolean} True when the element is querying the database for the data.
     */
    get querying() {
      return this[queryingValue];
    }
    
  
    get [queryingProperty]() {
      return this.querying;
    }
  
    set [queryingProperty](value) {
      const old = this[queryingValue];
      /* istanbul ignore if */
      if (old === value) {
        return;
      }
      this[queryingValue] = value;
      this.requestUpdate();
      this.dispatchEvent(new CustomEvent('queryingchange'));
    }

    constructor() {
      super();
      this.pageLimit = 150;
      this.anypoint = false;
      this.listActions = false;
      this[hasTwoLinesValue] = true;
    }

    /**
     * Updates icon size CSS variable and notifies resize on the list when
     * list type changes.
     * 
     * @param {string} type
     */
    [updateListStyles](type) {
      let size;
      switch (type) {
        case 'comfortable':
          size = 48;
          break;
        case 'compact':
          size = 36;
          break;
        default:
          size = 72;
          break;
      }
      this[applyListStyles](size);
    }

    /**
     * Applies `--anypoint-item-icon-width` CSS variable.
     * 
     * @param {number} size Icon width in pixels.
     * @param {HTMLElement=} target The target to apply styling. Default to this.
     */
    [applyListStyles](size, target=this) {
      const value = `${size}px`;
      target.style.setProperty('--anypoint-item-icon-width', value);
      // @ts-ignore
      if (typeof target.notifyResize === 'function') {
        // @ts-ignore
        target.notifyResize();
      }
    }
  }
  return ListMixinImpl;
}
/**
 * A mixin that has functions applicable for any kind of list in Advanced REST Client
 *
 * @mixin
 */
export const ListMixin = dedupeMixin(mxFunction);
