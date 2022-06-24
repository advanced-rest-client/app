export declare interface RequestEditorConfig {
  /** 
   * Automatically encodes and decodes values in the www-url-form-encoded body editor.
   * @default true
   */
  autoEncode?: boolean;
  /**
   * The editor to use with the body editor.
   * Due to dependency and memory management changing this options requires restart or
   * opening a new application window.
   * @default Monaco
   * @deprecated Since version 17 ARC supports Monaco editor only.
   */
  bodyEditor?: 'CodeMirror' | 'Monaco';
  /**
   * Whether to render the send button in the request editor.
   * @default true
   */
  sendButton?: boolean;
  /**
   * Whether to render the request progress status in the request panel.
   * This works with the events dispatched by the transport library. Custom libraries may not support this.
   * @default true
   */
  progressInfo?: boolean;
}

/**
 * Description of the Advanced REST Client configuration.
 */
export declare interface ARCConfig {
  /**
   * General view settings
   */
  view?: ARCViewConfig;
  /**
   * Default HTTP request configuration
   */
  request?: ARCRequestConfig;
  /**
   * Response view configuration
   */
  response?: ARCResponseConfig;
  /**
   * User privacy options.
   */
  privacy?: ARCPrivacyConfig;
  /**
   * ARC request history and "saved" settings.
   */
  history?: ARCHistoryConfig;
  /**
   * Configuration of the request editor.
   */
  requestEditor?: RequestEditorConfig;
  /**
   * The application updated configuration.
   */
  updater?: ARCUpdaterConfig;
  /**
   * Application proxy settings.
   */
  proxy?: ARCProxyConfig;
}

/**
 * Description of the Advanced REST Client configuration.
 */
export declare interface ARCViewConfig {
  /**
   * The type of the lists (history list, saved list etc).
   */
  listType?: 'default' | 'comfortable' | 'compact';
  /**
   * Enables detachable menu.
   */
  popupMenu?: boolean;
  /**
   * Enables drag and drop in the application.
   */
  draggableEnabled?: boolean;
  /**
   * The font size used by the application. In pixels.
   * @default 15
   */
  fontSize?: number;
}

export declare interface ARCRequestConfig {
  /**
   * The request default timeout setting.
   */
  timeout?: number;

  /**
   * Global option to follow redirects
   * @default true
   */
  followRedirects?: boolean;
  /**
   * Collects information about system variables when evaluating the request.
   * @default true if the environment allows to do so
   */
  useSystemVariables?: boolean;
  /**
   * Uses ARC variables to evaluate the request before processing it.
   * @default true
   */
  useAppVariables?: boolean;
  /**
   * The default OAuth 2 redirect URI.
   */
  oauth2redirectUri?: string;
  /**
   * Ignore `content-*` headers when making a GET request
   * @default false
   */
  ignoreContentOnGet?: boolean;
  /**
   * Creates default headers for user-agent and accept when missing in the request editor.
   * @default true
   */
  defaultHeaders?: boolean;
  /**
   * Ignores automatic set of cookies from a cookie storage.
   * @default false
   */
  ignoreSessionCookies?: boolean;
  /**
   * Setting to validate certificates when making a request.
   * @default false
   */
  validateCertificates?: boolean;
  /**
   * Enables platform's native HTTP transport.
   * Instead of using ARC's engine it uses native APIs for the given platform to make HTTP requests.
   */
  nativeTransport?: boolean;
  /**
   * When set it reads the operating system's hosts file and passes it to the request engine.
   * This is happening in parallel to app's own hosts definition and the resulting list of
   * hosts is a combination of both, where app's definition takes precedence over system's hosts.
   */
  readOsHosts?: boolean;
}

export declare interface ARCPrivacyConfig {
  /**
   * Whether the limited analytics data are collected.
   * When the application first starts it asks the user to allow for data analytics. 
   * The user must implicitly allow for analytics tracking therefore it is default to `false`.
   * 
   * @default false
   */
  telemetry?: boolean;
  /**
   * The tracking client ID used by the analytics to maintain the session.
   */
  clientId?: string;
  /**
   * When `telemetry` equals `false` and this is `true` then it will allow to send 
   * information about exceptions only to google analytics.
   * @default false
   */
  exceptionsOnly?: boolean;
}

export declare interface ARCHistoryConfig {
  /**
   * Whether the HTTP requests history is enabled
   * @default true
   */
  enabled?: boolean;
  /**
   * When set it performs the "fast search" in the requests store
   */
  fastSearch?: boolean;
}

export declare interface ARCResponseConfig {
  /**
   * The size of a response that triggers "raw" view by default.
   * @default 4096
   */
  forceRawSize?: number;
  /**
   * The size of a response, in KB, that triggers warning message instead of showing the response.
   * @default 2048
   */
  warningResponseMaxSize?: number;
}

export declare interface ARCUpdaterConfig {
  /**
   * The release channel to use.
   * @default stable
   * @deprecated Since version 17 ARC drops support for channels. Use `allowPreRelease` instead.
   */
  channel?: string;
  /**
   * Whether to automatically update the application when a new version is available.
   * @default true
   */
  auto?: boolean;
  /**
   * When set the application instructs the auto updater library to install pre-release version.
   */
  allowPreRelease?: boolean;
}

export declare interface BaseProxyConfig {
  /**
   * The URL of the proxy server to use. It can be an IP address (192.168.10.20), a FQDN (my.proxy.com) or a full URL (https://my.proxy.com).
   * By default it uses the 80 port unless otherwise specified in the URL or in the protocol.
   */
  url?: string;
  /**
   * The optional proxy username for Basic authentication.
   */
  username?: string;
  /**
   * The optional proxy password for Basic authentication.
   */
  password?: string;
}

export declare interface ARCProxyConfig extends BaseProxyConfig {
  /**
   * When set, the configuration is also applied to the application requests (analytics, updates, etc.)
   */
  applyToApp?: boolean;
  /**
   * When set the application tries to read system setting for proxy and applies them instead the `url` configuration.
   * @ignore This is for a future use.
   * @summary Do not use this property.
   */
  useSystemSettings?: boolean;
  /**
   * Whether the proxy settings are enabled or ignored.
   * Note, CLI parameters always override the config values.
   */
  enabled?: boolean;
}
