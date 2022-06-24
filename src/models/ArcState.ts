/**
 * Description of the Advanced REST Client configuration.
 */
export declare interface ARCState {
  kind: 'ARC#AppState';
  /**
   * Settings for the application environment
   */
  environment?: ARCStateEnvironment;
  /**
   * Settings for the application navigation
   */
  navigation?: ARCStateNavigation;
}

export declare interface ARCStateEnvironment {
  /**
   * The name of the environment to be restored when the application window finish loading.
   */
  variablesEnvironment?: string;
}

export declare interface ARCStateNavigation {
  /**
   * The index of currently selected navigation rail.
   */
  selected?: number;
}
