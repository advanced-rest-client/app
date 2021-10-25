import { HistoryListMixin } from './HistoryListMixin';
import RequestsPanelElement from './RequestsPanelElement';
import { requestChanged } from './internals';
import { ArcRequest } from '@advanced-rest-client/events';
import { HistoryGroup } from '../../types';

/**
 * @fires details When the request details were requested
 * @fires select When selection change
 * @fires arcnavigaterequest When a request is being navigated
 * @fires queryingchange
 */
export default class HistoryPanelElement extends HistoryListMixin(RequestsPanelElement) {
  /**
   * Toggles selection of all items on the list.
   */
  toggleSelection(): void;
  requests: HistoryGroup[];
  /**
   * Handles request model change when the type is history.
   * This assumes that this mixin is used with the combination with the `RequestsListMixin`.
   * If not then register an event listener for the request change handler.
   * 
   * @param request Changed request object.
   */
  [requestChanged](request: ArcRequest.ARCHistoryRequest): void;
}
