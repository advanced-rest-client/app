# Request UI

The ARC requests list module contains an UI and logic to render requests list in various contexts (saved list. history list, project list).

## Usage

### History panel

```javascript
import '@advanced-rest-client/requests-list/history-panel.js';


html`
<history-panel 
  draggableEnabled
  @details="${this.historyItemDetailsHandler}"
></history-panel>`;
```

### Saved panel

```javascript
import '@advanced-rest-client/requests-list/saved-panel.js';


html`
<saved-panel 
  draggableEnabled
  @details="${this.savedItemDetailsHandler}"
></saved-panel>`;
```

### SavedListMixin

A mixin to create an element that renders list of saved items.

```javascript
import { LitElement, html } from 'lit';
import { SavedListMixin, listTemplate, ListStyles } from '@advanced-rest-client/requests-list';

class ArcSavedMenuElement extends SavedListMixin(LitElement) {
  static get styles() {
    return ListStyles;
  }

  render() {
    const { requests } = this;
    if (!requests || !requests.length) {
      return html`<p>No requests on the list</p>`;
    }
    return this[listTemplate]();
  }
}

window.customElements.define('saved-menu', ArcSavedMenuElement);
```

### HistoryListMixin

A mixin to create an element that renders list of history items.

```javascript
import { LitElement, html } from 'lit';
import { HistoryListMixin, listTemplate, ListStyles } from '@advanced-rest-client/requests-list';

class ArcHistoryMenuElement extends HistoryListMixin(LitElement) {
  static get styles() {
    return ListStyles;
  }

  render() {
    const { requests } = this;
    if (!requests || !requests.length) {
      return html`<p>No requests on the list</p>`;
    }
    return this[listTemplate]();
  }
}

window.customElements.define('history-menu', ArcHistoryMenuElement);
```
