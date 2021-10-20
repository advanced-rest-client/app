import { TemplateResult } from "lit-html";
import AuthUiBase from "./AuthUiBase";
import { AuthUiInit, CredentialsInfo, Oauth2Credentials } from '../types';
import { AllowedScope } from '../OAuth2ScopeSelectorElement';
import { OAuth2Authorization, OAuth2DeliveryMethod, TokenInfo } from "@advanced-rest-client/events/src/authorization/Authorization";
import { Authorization } from "@advanced-rest-client/events";

/**
 * List of OAuth 2.0 default response types.
 * This list can be extended by custom grants
 *
 * List of objects with `type` and `label` properties.
 */
export const oauth2GrantTypes: Authorization.Oauth2GrantType[];

export default class OAuth2 extends AuthUiBase {
  /**
   * @returns Computed value, true if the response type is a custom definition.
   */
  get isCustomGrantType(): boolean;

  /**
   * @returns true when the client id field is required.
   */
  get clientIdRequired(): boolean;
  /**
   * @returns true when the client id field is rendered.
   */
  get hasClientId(): boolean;

  /**
   * @returns true when the client secret field is rendered.
   */
  get hasClientSecret(): boolean;

  /**
   * @returns true when the client secret field is required.
   */
  get clientSecretRequired(): boolean;

  /**
   * @returns true when the authorization URI field is rendered.
   */
  get authorizationUriRendered(): boolean;

  /**
   * @returns true when the token URI field is rendered.
   */
  get accessTokenUriRendered(): boolean;

  /**
   * @returns true when the username and password fields are rendered.
   */
  get passwordRendered(): boolean;

  /**
   * @returns True when the current `grantType` can support redirect URI.
   */
  get hasRedirectUri(): boolean;

  /** 
   * Selected authorization grand type.
   */
  grantType: string;
  /** 
   * The client ID for the auth token.
   */
  clientId: string;
  /** 
   * The client secret. It to be used when selected server flow.
   */
  clientSecret: string;
  /**
   * List of user selected scopes.
   * It can be pre-populated with list of scopes (array of strings).
   */
  scopes: string[];
  /**
   * An URI of authentication endpoint where the user should be redirected
   * to authorize the app. This endpoint initialized OAuth flow.
   */
  authorizationUri: string;
  /**
   * Endpoint to authorize the token (OAuth 1) or exchange code for token (OAuth 2).
   */
  accessTokenUri: string;
  /**
   * Authorization redirect URI
   */
  redirectUri: string;
  /**
   * List of pre-defined scopes to choose from. It will be passed to the `oauth2-scope-selector`
   * element.
   */
  allowedScopes: string[] | AllowedScope[];
  /**
   * If true then the `oauth2-scope-selector` will disallow to add a scope that is not
   * in the `allowedScopes` list. Has no effect if the `allowedScopes` is not set.
   */
  preventCustomScopes: boolean;
  /**
   * When the user authorized the app it should be set to the token value.
   * This element do not perform authorization. Other elements must intercept
   * the token request event and perform the authorization.
   */
  accessToken: string;
  /**
   * By default it is "bearer" as the only one defined in OAuth 2.0 spec.
   * If the token response contains `tokenType` property then this value is updated.
   */
  tokenType?: string;
  /**
   * Currently available response types.
   */
  grantTypes?: Authorization.Oauth2GrantType[];
  /**
   * If set it renders authorization url, token url and scopes as advanced options
   * which are then invisible by default. User can oen setting using the UI.
   */
  advanced?: boolean;
  /**
   * If true then the advanced options are opened.
   */
  advancedOpened?: boolean;
  /**
   * If set, the response type selector is hidden from the UI.
   */
  noGrantType?: boolean;
  /**
   * Informs about what filed of the authenticated request the token property should be set.
   * By default the value is `header` which corresponds to the `authorization` by default,
   * but it is configured by the `deliveryName` property.
   * 
   * This can be used by the AMF model when the API spec defines where the access token should be
   * put in the authenticated request.
   * 
   * @default header
   */
  oauthDeliveryMethod?: OAuth2DeliveryMethod;
  /** 
   * The client credentials delivery method.
   * @default body
   */
  ccDeliveryMethod?: OAuth2DeliveryMethod;
  /**
   * The name of the authenticated request property that carries the token.
   * By default it is `authorization` which corresponds to `header` value of the `deliveryMethod` property.
   * 
   * By setting both `deliveryMethod` and `deliveryName` you instruct the application (assuming it reads this values)
   * where to put the authorization token.
   * 
   * @default authorization
   */
  oauthDeliveryName?: string;
  /**
   * The base URI to use to construct the correct URLs to the authorization endpoints.
   * 
   * When the paths are relative then base URI is added to the path.
   * Relative paths must start with '/'.
   * 
   * Note, URL processing is happening internally in the component. The produced authorize event
   * will have base URI already applied.
   */
  baseUri?: string;
  /**
   * The error message returned by the authorization library.
   * It renders error dialog when an error ocurred. 
   * It is automatically cleared when the user request the token again.
   */
  lastErrorMessage?: string;
  /** 
   * When this property is set then the PKCE option is not rendered for the 
   * `authorization_code`. This is mainly meant to be used by the `api-authorization-method`
   * to keep this control disabled and override generated settings when the API spec
   * says that the PKCE is supported.
   */
  noPkce?: boolean;
  /** 
   * Whether or not the PKCE extension is enabled for this authorization configuration.
   * Note, PKCE, per the spec, is only available for `authorization_code` grantType.
   */
  pkce: boolean;
  /**
   * The definition of client credentials to be rendered for a given grant type.
   * When set on the editor it renders a drop down where the user can choose from predefined
   * credentials (client id & secret).
   */
  credentialsSource: Oauth2Credentials[];
  /**
   * The currently selected source in the client credentials dropdown.
   */
  credentialSource: string;
  credentialsDisabled: boolean;
  /** 
   * When set it allows to edit the redirect URI by the user.
   */
  allowRedirectUriChange: boolean;
  /** 
   * The value of the username filed.
   */
  password: string;
  /** 
   * The value of the password filed.
   */
  username: string;
  /** 
   * The assertion parameter for the JWT token authorization.
   * 
   * @link https://datatracker.ietf.org/doc/html/rfc7523#section-2.1
   */
  assertion: string;
  /** 
   * The device_code parameter for the device code authorization.
   * 
   * @link https://datatracker.ietf.org/doc/html/rfc8628#section-3.4
   */
  deviceCode: string;
  /** 
   * A flag describing that the redirect URL editor is rendered.
   */
  editingRedirectUri: boolean;

  constructor(init: AuthUiInit);

  /**
   * Restores previously serialized values.
   * @param state Previously serialized values
   */
  restore(state: OAuth2Authorization): void;

  /**
   * Serialized input values
   * @returns An object with user input
   */
  serialize(): OAuth2Authorization;

  defaults(): void;

  reset(): void;

  /**
   * Performs the authorization.
   * 
   * @returns The auth token or null if couldn't be requested.
   * @throws When authorization error
   */
  authorize(): Promise<TokenInfo | null>;

  /**
   * This function hides all non-crucial fields that has been pre-filled when element has been
   * initialize (values not provided by the user). Hidden fields will be available under
   * "advanced" options.
   *
   * To prevent this behavior set `no-auto` attribute on this element.
   */
  autoHide(): void;

  autoHideOnce(): void;

  /**
   * A handler for `focus` event on a label that contains text and
   * should be copied to clipboard when user is interacting with it.
   */
  _clickCopyAction(e: MouseEvent): void;

  _copyKeydownHandler(e: KeyboardEvent): void;

  /**
   * Copies the content of the node to clipboard.
   */
  _copyFromNode(node: HTMLElement): void;

  /**
   * Event handler for the scopes element changed state
   */
  _scopesChanged(e: CustomEvent): void;

  _advHandler(e: Event): void;

  /**
   * The handler for the change event coming from the PKCE input checkbox
   */
  _pkceChangeHandler(e: Event): void;

  /**
   * A handler for the edit redirect URI button click.
   * Sets the editing flag and requests the update.
   */
  _editRedirectUriHandler(): Promise<void>;

  /**
   * Commits the redirect URI editor value on enter key or cancels on escape.
   */
  _redirectInputKeydown(e: KeyboardEvent): void;

  /**
   * Commits the redirect URI editor value on input blur.
   */
  _redirectInputBlur(e: Event): void;

  /**
   * Sets the new redirect URI if the value passes validation.
   * This closes the editor.
   * @param value The new value to set.
   */
  commitRedirectUri(value: string): void;

  /**
   * Resets the redirect URI edit flag and requests an update.
   */
  cancelRedirectUri(): void;

  /**
   * @returns The list of client credentials to render in the credentials selector.
   */
  listCredentials(): CredentialsInfo[];

  /**
   * Sets the client credentials after updating them from the credentials source selector.
   * @param clientId The client id to set on the editor.
   * @param clientSecret The client secret to set on the editor.
   * @param {boolean} disabled Whether the credentials input is disabled.
   */
  updateCredentials(clientId: string, clientSecret: string, disabled: boolean): void;

  /**
   * This triggers change in the client id & secret of the editor after selecting 
   * a credentials source by the user.
   * 
   * @param selectedSource The name of the selected credentials source to select.
   */
  updateClientCredentials(selectedSource: string): void;

  _grantTypeSelectionHandler(e: Event): void;

  _credentialSourceHandler(e: Event): void;

  /**
   * @returns true when a credentials source is being selected.
   */
  isSourceSelected(): boolean;

  render(): TemplateResult;
  /**
   * @returns The template for the <form> content.
   */
  formContentTemplate(): (TemplateResult | string)[];

  /**
   * @returns The template for API custom properties (annotations)
   */
  oauth2CustomPropertiesTemplate(): TemplateResult | string;

  /**
   * @returns The template for the OAuth 2 response type selector
   */
  oauth2GrantTypeTemplate(): TemplateResult | string;

  /**
   * @returns The template for the client credentials source.
   */
  credentialsSourceTemplate(): TemplateResult | string;

  /**
   * @returns The template for the OAuth 2 client id input.
   */
  clientIdTemplate(): TemplateResult | string;

  /**
   * @returns The template for the OAuth 2 client secret input.
   */
  clientSecretTemplate(): TemplateResult | string;

  /**
   * @returns The template for the toggle advanced view switch
   */
  toggleAdvViewSwitchTemplate(): TemplateResult | string;

  /**
   * @returns The template for the OAuth 2 advanced options.
   */
  oauth2AdvancedTemplate(): TemplateResult | string;

  /**
   * @returns The template for the OAuth 2 redirect URI label
   */
  oauth2RedirectTemplate(): TemplateResult | string;

  /**
   * @returns The template for the OAuth 2 token value
   */
  oauth2TokenTemplate(): TemplateResult | string;

  /**
   * @returns The template for the "authorize" button.
   */
  oath2AuthorizeTemplate(): TemplateResult | string;

  /**
   * @param urlType The input type to render
   * @returns The template for the authorization URI input
   */
  authorizationUriTemplate(urlType: string): TemplateResult | string;

  /**
   * @param urlType The input type to render
   * @returns The template for the access token URI input
   */
  accessTokenUriTemplate(urlType: string): TemplateResult | string;

  /**
   * @returns The template for the user name input
   */
  usernameTemplate(): TemplateResult | string;

  /**
   * @returns The template for the user password input
   */
  passwordTemplateLocal(): TemplateResult | string;

  /**
   * @returns The template for the OAuth 2 scopes input
   */
  scopesTemplate(): TemplateResult | string;

  /**
   * For client_credentials grant this renders the dropdown with an option to select
   * where the credentials should be used. Current values: 
   * - authorization header
   * - message body
   * @returns 
   */
  paramsLocationTemplate(): TemplateResult | string;

  /**
   * @returns The template for the PKCE option of the OAuth 2 extension.
   */
  pkceTemplate(): TemplateResult | string;

  /**
   * @returns The template for the OAuth 2 redirect URI input
   */
  redirectUriInputTemplate(): TemplateResult | string;

  /**
   * @returns The template for the OAuth 2 redirect URI content
   */
  redirectUriContentTemplate(): TemplateResult | string;

  /**
   * @returns The template for the edit redirect URI button, when enabled.
   */
  editRedirectUriTemplate(): TemplateResult | string;

  /**
   * @returns The template for the assertion (JWT) input, when needed.
   */
  assertionTemplate(): TemplateResult | string;
  /**
   * @returns The template for the device code input, when needed.
   */
  deviceCodeTemplate(): TemplateResult | string;
}
