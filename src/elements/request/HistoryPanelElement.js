import { HistoryListMixin } from './HistoryListMixin.js';
import RequestsPanelElement from './RequestsPanelElement.js';
import {
  toggleSelectAllValue,
  selectedItemsValue,
  notifySelection,
} from './internals.js';

export default class HistoryPanelElement extends HistoryListMixin(RequestsPanelElement) {
  /**
   * Toggles selection of all items on the list.
   */
  toggleSelection() {
    this[toggleSelectAllValue] = !this[toggleSelectAllValue];
    this[selectedItemsValue] = /** @type string[] */ ([]);
    if (this[toggleSelectAllValue]) {
      (this.requests || []).forEach((item) => {
        item.requests.forEach((requestItem) => {
          this[selectedItemsValue].push(requestItem.item._id);
        });
      });
    }
    this[notifySelection]();
    this.requestUpdate();
  }
}
