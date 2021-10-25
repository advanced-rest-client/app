import { ConfigStateUpdateEvent, Variable, ARCEnvironmentDeletedEvent, ARCEnvironmentStateSelectEvent, ARCEnvironmentUpdatedEvent, ARCModelStateDeleteEvent, ARCVariableDeletedEvent, ARCVariableUpdatedEvent } from '@advanced-rest-client/events';

export declare const environmentValue: unique symbol;
export declare const environmentDeleteHandler: unique symbol;
export declare const environmentUpdateHandler: unique symbol;
export declare const environmentSelectHandler: unique symbol;
export declare const variableDeleteHandler: unique symbol;
export declare const variableUpdateHandler: unique symbol;
export declare const datastoreDestroyedHandler: unique symbol;
export declare const systemVariablesValue: unique symbol;
export declare const systemVariablesModel: unique symbol;
export declare const processSystemVariables: unique symbol;
export declare const configChangeHandler: unique symbol;

export declare const defaultEnvironmentLabel: string;


declare function VariablesConsumerMixin<T extends new (...args: any[]) => {}>(base: T): T & VariablesConsumerMixinConstructor;
export interface VariablesConsumerMixinConstructor {
  new(...args: any[]): VariablesConsumerMixin;
}

export interface VariablesConsumerMixin {
  /**
   * The label to be used as the environment name.
   */
  readonly environmentLabel: string;
  /**
   * The value to be used in a variable environment
   */
  readonly environmentNameValue: string;
  /**
   * The currently selected environment. When `null` the default environment is selected.
   * Note, changing this value programmatically has no global effect.
   */
  environment: Variable.ARCEnvironment;
  /**
   * List of available variables for the current environment.
   * It may be `undefined` when no environment information has been read.
   */
  variables: Variable.ARCVariable[];

  /**
   * List of available variables for the current environment.
   * It may be `undefined` when no environment information has been read.
   */
  environments: Variable.ARCEnvironment[];

  /** 
   * Whether or not the system variables are enabled in the application configuration.
   * @attribute
   */
  systemVariablesEnabled: boolean;
  /** 
   * The list of system variables to process. This is a regular key-value map of variables.
   */
  systemVariables: Variable.SystemVariables;
  [systemVariablesValue]: Variable.SystemVariables;
  [systemVariablesModel]: Variable.ARCVariable[];

  connectedCallback(): void;

  disconnectedCallback(): void;

  /**
   * Refreshes information about the current environment.
   * 
   * @returns Resolved when the environment information is refreshed and update is complete.
   */
  refreshEnvironment(): Promise<void>;

  /**
   * Refreshes information about all environments.
   * 
   * @returns Resolved when the environments are refreshed and update is complete.
   */
  refreshEnvironments(): Promise<void>;

  /**
   * @param id THe id of the environment to select. `null` for the default environment
   */
  selectEnvironment(id?: string|null): void;

  /**
   * @param name Adds a new environment to the system
   */
  addEnvironment(name: string): Promise<void>;

  /**
   * @param id The id of the environment to be removed.
   */
  removeEnvironment(id: string): Promise<void>;

  /**
   * Toggles the use of the system variables in this component and globally in the application
   * @param force When set it forces this value.
   */
  toggleSystemVariables(force?: boolean): Promise<void>;

  /**
   * @param vars THe variables to process
   * @returns Processed variables model
   */
  [processSystemVariables](vars: Variable.SystemVariables): Variable.ARCVariable[];

  [environmentDeleteHandler](e: ARCEnvironmentDeletedEvent): Promise<void>;

  [environmentUpdateHandler](e: ARCEnvironmentUpdatedEvent): void;

  [environmentSelectHandler](e: ARCEnvironmentStateSelectEvent): void;

  [variableDeleteHandler](e: ARCVariableDeletedEvent): void;

  [variableUpdateHandler](e: ARCVariableUpdatedEvent): void;
  
  [datastoreDestroyedHandler](e: ARCModelStateDeleteEvent): void;

  [configChangeHandler](e: ConfigStateUpdateEvent): void;
}
