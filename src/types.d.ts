export interface ThemeManagerInit {
  /**
   * The protocol to use to load themes
   * @example themes:
   */
  protocol: string;
  /**
   * The base URI to use to load themes.
   * @example localhost:8080/path
   */
  baseUri: string;
  /**
   * The target for the DOM events.
   */
  eventsTarget?: EventTarget;
}

export declare interface ArcAppInitOptions {
  /**
   * The backend id of the workspace file.
   */
  workspaceId?: string;
  proxy?: string;
  proxyUsername?: string;
  proxyPassword?: string;
}
