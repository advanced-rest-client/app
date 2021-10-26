import { html } from 'lit-element';
import '@anypoint-web-components/awc/anypoint-menu-button.js';
import '@anypoint-web-components/awc/anypoint-icon-button.js';
import '@anypoint-web-components/awc/anypoint-listbox.js';
import '@anypoint-web-components/awc/anypoint-icon-item.js';

/** @typedef {import('lit-element').TemplateResult} TemplateResult */

function menuClosed(e) {
  const menu = e.target;
  setTimeout(() => {
    const listbox = menu.querySelector('anypoint-listbox');
    listbox.selected = undefined;
  });
}

/**
 * @param {Function} handler The menu selection handler
 * @param {boolean} isStored Whether the current request is stored in the data store
 * @param {boolean=} anypoint 
 * @returns {TemplateResult} The template for the drop down options next to the URL editor
 */
export default function requestMenuTemplate(handler, isStored, anypoint=false) {
  return html`
  <anypoint-menu-button
    class="request-menu"
    closeOnActivate
    horizontalAlign="right"
    ?anypoint="${anypoint}"
    @dropdownclose="${menuClosed}"
  >
    <anypoint-icon-button
      aria-label="Activate to open request's context menu"
      slot="dropdown-trigger"
      ?anypoint="${anypoint}"
    >
      <arc-icon icon="moreVert"></arc-icon>
    </anypoint-icon-button>
    <anypoint-listbox
      slot="dropdown-content"
      class="options-menu"
      ?anypoint="${anypoint}"
      selectable="anypoint-icon-item"
      @selected="${handler}"
    >
      <anypoint-icon-item
        class="menu-item"
        title="Clear the request editor"
        data-action="clear"
        tabindex="-1"
        ?anypoint="${anypoint}"
      >
        <arc-icon slot="item-icon" class="context-menu-icon" icon="close"></arc-icon>
        Clear editor
      </anypoint-icon-item>

      <div class="separator"></div>

      <anypoint-icon-item
        class="menu-item"
        title="Save the current request in the application"
        tabindex="-1"
        data-action="save"
        ?anypoint="${anypoint}"
      >
        <arc-icon slot="item-icon" class="context-menu-icon" icon="save"></arc-icon>
        Save
      </anypoint-icon-item>

      <anypoint-icon-item
        class="menu-item"
        title="Save the current request as new request"
        tabindex="-1"
        data-action="saveas"
        ?anypoint="${anypoint}"
        ?disabled="${!isStored}"
      >
        <arc-icon slot="item-icon" class="context-menu-icon" icon="save"></arc-icon>
        Save as...
      </anypoint-icon-item>
      <anypoint-icon-item
        class="menu-item"
        title="Show request details"
        tabindex="-1"
        data-action="details"
        ?anypoint="${anypoint}"
      >
        <arc-icon slot="item-icon" class="context-menu-icon" icon="infoOutline"></arc-icon>
        Details
      </anypoint-icon-item>

      <div class="separator"></div>

      <anypoint-icon-item
        class="menu-item"
        title="Export this request"
        tabindex="-1"
        data-action="export"
        ?anypoint="${anypoint}"
      >
        <arc-icon slot="item-icon" class="context-menu-icon" icon="exportVariant"></arc-icon>
        Export
      </anypoint-icon-item>

      <anypoint-icon-item
        class="menu-item"
        title="Saved as HAR object"
        tabindex="-1"
        data-action="savehar"
        ?anypoint="${anypoint}"
      >
        Save as HAR
      </anypoint-icon-item>

      <anypoint-icon-item
        class="menu-item"
        title="Export this request"
        tabindex="-1"
        data-action="import-curl"
        ?anypoint="${anypoint}"
      >
        Import cURL command
      </anypoint-icon-item>

      <div class="separator"></div>

      <anypoint-icon-item
        class="menu-item"
        title="Close this request"
        tabindex="-1"
        data-action="close"
        ?anypoint="${anypoint}"
      >
        <arc-icon slot="item-icon" class="context-menu-icon" icon="close"></arc-icon>
        Close
      </anypoint-icon-item>
      
      <anypoint-icon-item
        class="menu-item"
        title="Duplicate this request in another tab"
        tabindex="-1"
        data-action="duplicate"
        ?anypoint="${anypoint}"
      >
        <arc-icon slot="item-icon" class="context-menu-icon" icon="contentCopy"></arc-icon>
        Duplicate
      </anypoint-icon-item>
    </anypoint-listbox>
  </anypoint-menu-button>
  `;
}
