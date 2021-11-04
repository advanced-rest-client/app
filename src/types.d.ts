import { OAuth2Authorization } from '@advanced-rest-client/oauth';

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

export interface SaveDriveFileOptions {
  /**
   * Optional name of the parent folder
   */
  parent?: string;
  /**
   * Google Drive file id to update. Used when updating a file.
   */
  id?: string;
  /**
   * Google Drive file resource values. See Google Drive API documentation for details.
   */
  meta?: FileResource;
  /**
   * Authorization configuration to use when authorizing the request.
   * If the `accessToken` property is set it skips authorization and uses this token instead.
   * By default it expects `oauth2` configuration in the `package.json` file.
   */
  auth?: OAuth2Authorization;
}

export declare interface FileMedia {
  mimeType: string;
  body: string;
}

export declare interface FileResource {
  description?: string;
  parents?: string[];
  /**
   * The name of the file
   */
  name: string;
  /**
   * File content type. Defaults to `application/json`
   */
  mimeType?: string;
}

export declare interface AppFolderListResponse {
  kind: 'drive#fileList';
  incompleteSearch: boolean;
  files: FolderListItem[];
}

export declare interface FolderListItem {
  kind: 'drive#file';
  id: string;
  name: string;
  mimeType: string;
}

export declare interface FileCreateItem {
  kind: 'drive#file',
  id: string;
  name: string;
  mimeType: string;
  parents?: FolderListItem[];
}
