import { EventTypes } from "./EventTypes.js";

export const RequestActions = {
  open: 'open',
  edit: 'edit',
  detail: 'detail',
};
Object.freeze(RequestActions);

export const ProjectActions = {
  /** 
   * Opens project screen
   */
  open: 'open',
  /** 
   * Edits project meta
   */
  edit: 'edit',
  /** 
   * Clears the workspace and adds project requests to it
   */
  replaceWorkspace: 'replaceWorkspace',
  /** 
   * Adds project requests to the current workspace
   */
  addWorkspace: 'addWorkspace',
};
Object.freeze(ProjectActions);

export interface ExternalNavigationOptions {
  /**
   * The purpose of the navigation. This can be used
   * to differentiate different kind of requests.
   */
  purpose?: string;
}

export declare type RequestActionType = 'open' | 'detail' | 'edit';
export declare type ProjectActionType = 'open' | 'edit' | 'replaceWorkspace' | 'addWorkspace';

export class NavigationEvents {
  /**
   * Dispatches an event to trigger a navigation in Advanced REST Client.
   * Use other events matching the navigation type before using this event.
   * This mean to be a general purpose event to limit number of event definitions
   * if unnecessary.
   *
   * @param route The base route to navigate to.
   * @param opts Additional route parameters
   * @param target A node on which to dispatch the event.
   */
  static navigate(route: string, opts?: unknown, target: EventTarget = window): void {
    const e = new CustomEvent(EventTypes.Navigation.navigate, {
      bubbles: true,
      composed: true,
      cancelable: true,
      detail: {
        route, opts,
      }
    });
    target.dispatchEvent(e);
  }

  /**
   * Dispatches an event to inform the application to open a browser window.
   * This is a general purpose action. It has the `detail` object with optional
   * `purpose` property which can be used to support different kind of external navigation.
   * 
   * @param url The URL to open
   * @param opts  Additional request parameters
   * @param target A node on which to dispatch the event.
   */
  static navigateExternal(url: string, opts?: ExternalNavigationOptions, target: EventTarget = window): void {
    const e = new CustomEvent(EventTypes.Navigation.navigateExternal, {
      bubbles: true,
      composed: true,
      cancelable: true,
      detail: {
        url, opts,
      }
    });
    target.dispatchEvent(e);
  }

  /**
   * An event to be dispatched to trigger a navigation in Advanced REST Client
   * for an ARCRequest entity (a request data stored in the data store)
   *
   * @param requestId The id of the ARCRequest entity
   * @param requestType The type of the request
   * @param action Optional navigation action. Default to "open" action.
   * @param target A node on which to dispatch the event.
   */
  static navigateRequest(requestId: string, requestType: string, action?: RequestActionType, target: EventTarget = window): void {
    const e = new CustomEvent(EventTypes.Navigation.navigateRequest, {
      bubbles: true,
      composed: true,
      cancelable: true,
      detail: {
        requestId,
        requestType,
        action,
      }
    });
    target.dispatchEvent(e);
  }

  /**
   * An event to be dispatched to trigger a navigation in Advanced REST Client
   * for an ARCRestApiIndex entity (a REST API data stored in the data store)
   *
   * @param api The id of the ARCRestApiIndex entity
   * @param version The requested API version
   * @param action The action type: detail, documentation
   * @param target A node on which to dispatch the event.
   */
  static navigateRestApi(api: string, version: string, action: string, target: EventTarget = window): void {
    const e = new CustomEvent(EventTypes.Navigation.navigateRestApi, {
      bubbles: true,
      composed: true,
      cancelable: true,
      detail: {
        api,
        version,
        action,
      }
    });
    target.dispatchEvent(e);
  }

  /**
   * An event to be dispatched to trigger a navigation in Advanced REST Client
   * for an ARCRestApiIndex entity (a REST API data stored in the data store)
   *
   * @param id The id of the ARCProject entity
   * @param action The action type: `open`, `edit`. Default to `open`.
   * @param target A node on which to dispatch the event.
   */
  static navigateProject(id: string, action?: ProjectActionType, target: EventTarget = window): void {
    const e = new CustomEvent(EventTypes.Navigation.navigateProject, {
      bubbles: true,
      composed: true,
      cancelable: true,
      detail: {
        id,
        action,
      }
    });
    target.dispatchEvent(e);
  }

  /**
   * Dispatches the navigate help event
   *
   * @param topic The help topic name
   * @param target A node on which to dispatch the event.
   */
  static helpTopic(topic: string, target: EventTarget = window): void {
    const e = new CustomEvent(EventTypes.Navigation.helpTopic, {
      bubbles: true,
      composed: true,
      cancelable: true,
      detail: {
        topic,
      }
    });
    target.dispatchEvent(e);
  }

  /**
   * Opens an URL withing ARC's session management area.
   *
   * @param url The URL to open
   * @param purpose The purpose of the URL.
   * @param target A node on which to dispatch the event.
   */
  static openWebUrl(url: string, purpose: string, target: EventTarget = window): void {
    const e = new CustomEvent(EventTypes.Navigation.openWebUrl, {
      bubbles: true,
      composed: true,
      cancelable: true,
      detail: {
        url, purpose,
      }
    });
    target.dispatchEvent(e);
  }
}
