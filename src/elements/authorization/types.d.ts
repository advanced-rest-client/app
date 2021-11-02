import AuthorizationMethodElement from "./AuthorizationMethodElement";

export interface AuthUiInit {
  /**
   * A callback called when the UI should be re-rendered.
   */
  renderCallback: () => Promise<void>;
  /**
   * A callback called when the UI state change. This should be used to call the serialize() function
   * and store the UI state,
   */
  changeCallback: () => void;
  /**
   * The element that renders this method.
   */
  target: AuthorizationMethodElement;
  /**
   * Enables the outlined theme of material design
   */
  outlined?: boolean;
  /**
   * Enables the Anypoint platform theme
   */
  anypoint?: boolean;
  /**
   * Renders the UI in the read only state
   */
  readOnly?: boolean;
  /**
   * Renders the UI in the disabled state
   */
  disabled?: boolean;
  /**
   * Informs the UI that the element is in the `authorizing` state.
   */
  authorizing?: boolean;
}



/**
 * The definition of client credentials to be rendered for a given grant type.
 * When set on the editor it renders a drop down where the user can choose from predefined
 * credentials (client id & secret).
 */
declare interface Oauth2Credentials {
  /**
   * The grant type to apply these credentials to.
   */
  grantType: string;
  /**
   * The list of pre-defined credentials to set on the credentials selector.
   */
  credentials: CredentialsInfo[];
}

/**
 * A credentials source definition.
 */
declare interface CredentialsInfo {
  /**
   * The label to render in the drop down list.
   */
  name: string;
  /**
   * The client id to set on the input when selected.
   */
  clientId?: string;
  /**
   * The client secret to set on the input when selected.
   */
  clientSecret?: string;
}
