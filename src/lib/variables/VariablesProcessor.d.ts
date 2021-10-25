import { Variable } from '@advanced-rest-client/events';
import { EvaluateOptions, VariablesMap } from '../../types';

/**
 * function that tests whether a passed variable contains a variable.
 * @param item The variable to test its value for variables.
 * @returns True when the variable has another variable in the value.
 */
export declare function filterToEval(item: Variable.ARCVariable): boolean;

export declare const functionRegex: RegExp;
export declare const varValueRe: RegExp;

export declare class VariablesProcessor {
  jexl: any;
  variables: Variable.ARCVariable[];
  /**
   * @param jexl A reference to the the Jexl instance.
   * @param variables List of application variables
   */
  constructor(jexl: any, variables: Variable.ARCVariable[]);

  /**
   * Requests for a variables list from the variables manager
   * and creates a context for Jexl.
   *
   * If the `variables-manager` is not present it returns empty object.
   *
   * @param override Optional map of variables to use to override the built context.
   * @returns Promise resolved to the context to be passed to Jexl.
   */
  buildContext(override?: VariablesMap): Promise<VariablesMap>;

  /**
   * Overrides variables with passed values.
   * @param variables Variables to
   * @param override Values to override the variables with
   * @returns A copy the `variables` object
   */
  overrideContext(variables: Variable.ARCVariable[], override: VariablesMap): Variable.ARCVariable[];

  /**
   * Clears cached groups.
   */
  clearCache(): void;

  /**
   * Evaluates a value against the variables in the current environment
   *
   * @param value A value to evaluate
   * @param options Execution options
   * @returns Promise that resolves to the evaluated value.
   */
  evaluateVariable(value: string, options?: EvaluateOptions): Promise<string>;

  /**
   * Recursively evaluate variables on an object.
   *
   * @param obj The map containing variables
   * @param options Execution options
   * @returns Promise resolved to evaluated object.
   */
  evaluateVariables<T>(obj: T, options?: EvaluateOptions): Promise<T>;

  /**
   * Evaluates a value with context passed to Jexl.
   * 
   * @param context Jexl's context
   * @param value Value to evaluate
   */
  evaluateWithContext(context: VariablesMap, value: string): Promise<string>;

  /**
   * Processes variables in the context recursively.
   *
   * @param result A result to where put the values.
   * @param variables A list of current variables
   * @param requireEvaluation A list of variables that require evaluation
   * @param runCount Current run count in the recursive function. It stops executing after second run.
   * @returns Evaluated `result` value.
   */
  _processContextVariables(result: VariablesMap, variables: Variable.ARCVariable[], requireEvaluation?: Variable.ARCVariable[], runCount?: number): Promise<VariablesMap>;

  /**
   * Upgrades old syntax of magic variables to new one.
   * It replaces `${now}` and `${random}` to function calls: `now()` and
   * `random()`. It also keeps grouping.
   *
   * @param value Currently evaluated value
   * @returns Parsed value without old syntax.
   */
  _upgradeLegacy(value: string): string;

  /**
   * Evaluates functions.
   *
   * @param value A value to evaluate
   * @returns Evaluated value with removed functions.
   * @throws Error if a function is not supported.
   */
  _evalFunctions(value: string): string;

  /**
   * Calls one of the predefined functions and returns its value.
   *
   * @param fnName A function name to call.
   * @param args Arguments find in the expression.
   * @returns Result of calling a function. Always a string.
   */
  _callFn(fnName: string, args?: (string|number)[]): string|number;

  /**
   * Calls JavaScript native function.
   * Currently only `Math`, 'JSON', and `String` namespaces are supported.
   *
   * @param namespace The namespace of the function to call
   * @param fn Name of the function to call
   * @param args A list of arguments to call
   * @returns Processed value.
   */
  _callNamespaceFunction(namespace: string, fn: string, args?: (string|number|object)[]): string|number;

  /**
   * Calls the `now()` function. Returns current timestamp.
   * If argument is passed is will try to retrieve existing cached value
   * or create new one.
   *
   * @param args Arguments passed to the function
   * @returns Current timestamp
   */
  __evalFnNow(args: string[]): number;

  /**
   * Generates random integer value. If a group is passed in the `args` then
   * it looks for the value in the cache and prefers it if available.
   *
   * @param args Arguments passed to the function
   * @returns Current timestamp
   */
  __evalFnRandom(args: string[]): number;

  /**
   * Returns a random `int` between 0 (inclusive) and
   * `Number.MAX_SAFE_INTEGER` (exclusive) with roughly equal probability of
   * returning any particular `int` in this range.
   */
  __randomInt(): number;

  /**
   * Prepares variables to be evaluated where a value is a multiline value.
   * @param lines Lines in the expression
   * @returns Processed lines
   */
  _prepareMultilineValue(lines: string[]): string[];

  _applyArgumentsContext(arg?: string, context?: object): string;

  /**
   * Replaces strings with quoted string and variables notation into
   * variables that Jexl understands.
   *
   * @param value Value to evaluate
   * @returns Proper syntax for Jexl
   */
  _prepareValue(value: string): string;

  /**
   * Wraps a passed value with `'{'` and `'}'` to be properly processed by Jexl.
   * @param value The value to wrap.
   * @param isJson Whether the passed string originally was a JSON string.
   * @returns Valid for Jexl JSON string.
   */
  _wrapJsonValue(value: string, isJson: boolean): string;

  /**
   * Checks whether passed value is a valid variable name.
   * @param name Variable name
   * @returns true if the passed name can be used as variable value.
   */
  isValidName(name: string): boolean;
}
