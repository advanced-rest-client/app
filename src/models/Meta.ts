/**
 * An interface describing a base metadata of a thing.
 */
export declare interface ThingMeta {
  /**
   * The data kind. The application ignores the input with an unknown `kind`, unless it can be determined from the context.
   */
  kind?: 'ARC#ThingMeta';
  /**
   * The name of the thing.
   */
  name?: string;
  /**
   * The description of the thing.
   */
  description?: string;
  /**
   * The version number of the thing.
   */
  version?: string;
  /**
   * The string describing when the thing was last published. It has to be parsable date string in JavaScript.
   */
  published?: string;
  /**
   * The string describing when the thing was last updated. It has to be parsable date string in JavaScript.
   */
  updated?: string;
}

/**
 * An interface describing a provider of a thing.
 */
export declare interface Provider {
  /**
   * The data kind. The application ignores the input with an unknown `kind`, unless it can be determined from the context.
   */
  kind?: 'ARC#Provider';
  /**
   * The URL to the provider
   */
  url?: string;
  /**
   * The name to the provider
   */
  name?: string;
  /**
   * The email to the provider
   */
  email?: string;
}
