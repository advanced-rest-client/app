/* eslint-disable no-plusplus */
/* eslint-disable no-await-in-loop */
/* eslint-disable class-methods-use-this */
/* eslint-disable no-bitwise */
/* eslint-disable no-continue */

import { VariablesTokenizer } from './VariablesTokenizer.js';
import { EvalFunctions } from './EvalFunctions.js';
import { clear, find, store } from './Cache.js'; // these methods need to be there.

/** @typedef {import('@advanced-rest-client/events').Variable.ARCVariable} ARCVariable */
/** @typedef {import('jexl')} Jexl */
/** @typedef {import('../../types').VariablesMap} VariablesMap */
/** @typedef {import('../../types').EvaluateOptions} EvaluateOptions */

/**
 * function that tests whether a passed variable contains a variable.
 * @param {ARCVariable} item The variable to test its value for variables.
 * @returns {boolean} True when the variable has another variable in the value.
 */
export const filterToEval = (item) => {
  const { value } = item;
  const typedValue = String(value);
  const isJSLiteral = typedValue.includes('${');
  const isAPILiteral = !isJSLiteral && typedValue.includes('{');
  return isJSLiteral || isAPILiteral;
};

export const functionRegex = /(?:\$?{)?([.a-zA-Z0-9_-]+)\(([^)]*)?\)(?:})?/gm;
export const varValueRe = /^[a-zA-Z0-9_]+$/;

export class VariablesProcessor {
  /**
   * @param {Jexl} jexl A reference to the the Jexl instance.
   * @param {ARCVariable[]} variables List of application variables
   */
  constructor(jexl, variables) {
    this.jexl = jexl;
    this.variables = variables;
  }

  /**
   * Requests for a variables list from the variables manager
   * and creates a context for Jexl.
   *
   * If the `variables-manager` is not present it returns empty object.
   *
   * @param {VariablesMap=} override Optional map of variables to use to override the built context.
   * @return {Promise<VariablesMap>} Promise resolved to the context to be passed to Jexl.
   */
  async buildContext(override = {}) {
    const copy = { ...override };
    let { variables } = this;
    const result = /** @type VariablesMap */ ({});
    if (!variables || !variables.length) {
      return result;
    }
    // Filter out disabled items
    variables = variables.filter((item) => item.enabled);
    variables = this.overrideContext(variables, copy);
    return this._processContextVariables(result, variables);
  }

  /**
   * Overrides variables with passed values.
   * @param {ARCVariable[]} variables Variables to
   * @param {VariablesMap} override Values to override the variables with
   * @return {ARCVariable[]} A copy the `variables` object
   */
  overrideContext(variables, override) {
    const copy = { ...override };
    const result = variables.map((item) => {
      if (item.name in copy) {
        /* eslint-disable no-param-reassign */
        item.value = copy[item.name];
        delete copy[item.name];
      }
      return { ...item };
    });
    Object.keys(copy).forEach(key => {
      result.push({
        name: key,
        value: copy[key],
        enabled: true,
        environment: ''
      });
    });
    return result;
  }

  /**
   * Clears cached groups.
   */
  clearCache() {
    clear(this);
  }

  /**
   * Evaluates a value against the variables in the current environment
   *
   * @param {string} value A value to evaluate
   * @param {EvaluateOptions=} options Execution options
   * @return {Promise<string>} Promise that resolves to the evaluated value.
   */
  async evaluateVariable(value, options={}) {
    const typeOf = typeof value;
    // Non primitives + null
    if (typeOf === 'object') {
      return value;
    }
    if (typeOf !== 'string') {
      value = String(value);
    }
    const { context, override } = options;
    const ctx = context || await this.buildContext(override);
    return this.evaluateWithContext(ctx, value);
  }

  /**
   * Evaluates variables on the passed object.
   * 
   * Note, it only performs a shallow evaluation. Deep objects are not evaluated.
   *
   * @param {any} obj The object to evaluate.
   * @param {EvaluateOptions=} options Execution options
   * @return {Promise<any>} Promise resolved to the evaluated object.
   */
  async evaluateVariables(obj, options={}) {
    const init = { ...options };
    const names = [...(init.names || Object.keys(obj))];
    init.names = names
    if (!init.context) {
      // this should be done ony once, not each time it evaluates a variable.
      init.context = await this.buildContext(init.override);
    }
    const prop = names.shift();
    if (!prop) {
      return obj;
    }
    if (!obj[prop]) {
      return this.evaluateVariables(obj, init);
    }
    obj[prop] = await this.evaluateVariable(obj[prop], init);
    return this.evaluateVariables(obj, init);
  }

  /**
   * Evaluates a value with context passed to Jexl.
   * 
   * @param {VariablesMap} context Jexl's context
   * @param {string} value Value to evaluate
   * @return {Promise<string>}
   */
  async evaluateWithContext(context, value) {
    value = this._upgradeLegacy(value);
    value = this._evalFunctions(value);
    if (!value) {
      return value;
    }
    const typedValue = String(value);
    const isJSLiteral = typedValue.includes('${');
    const isAPILiteral = !isJSLiteral && typedValue.includes('{');
    if (!isJSLiteral && !isAPILiteral) {
      return value;
    }
    let result;
    const parts = value.split('\n');
    if (parts.length > 1) {
      result = this._prepareMultilineValue(parts);
    } else {
      result = this._prepareValue(value);
    }
    const { jexl } = this;
    if (Array.isArray(result)) {
      const items = [];
      for (let i = 0, len = result.length; i < len; i++) {
        const item = result[i];
        if (['{', '}'].includes(item.trim())) {
          items[items.length] = item;
        } else {
          try {
            items[items.length] = await jexl.eval(item, context);
          } catch (e) {
            items[items.length] = item;
          }
        }
      }
      return items.join('\n');
    }
    let returnValue = value;
    try {
      returnValue = await jexl.eval(result, context);
    } catch (e) {
      // ...
    }
    return returnValue;
  }

  /**
   * Processes variables in the context recursively.
   *
   * @param {VariablesMap} result A result to where put the values.
   * @param {ARCVariable[]} variables A list of current variables
   * @param {ARCVariable[]=} requireEvaluation A list of variables that require evaluation
   * @param {number=} runCount Current run count in the recursive function. It stops executing
   * after second run.
   * @return {Promise<VariablesMap>} Evaluated `result` value.
   */
  async _processContextVariables(result, variables, requireEvaluation, runCount) {
    if (!requireEvaluation) {
      requireEvaluation = variables.filter(filterToEval);
    }
    variables.forEach((item) => {
      result[item.name] = item.value;
    });
    if (requireEvaluation.length === 0) {
      return result;
    }
    // this array should be sorted so items that should be evaluated first
    // because are a dependencies of other expressions.
    for (let i = 0, len = requireEvaluation.length; i < len; i++) {
      const item = requireEvaluation[i];
      const value = await this.evaluateVariable(item.value, {
        context: result,
      });
      result[item.name] = value;
      item.value = value;
    }

    requireEvaluation = requireEvaluation.filter(filterToEval);
    runCount = runCount || 1;
    if (requireEvaluation.length === 0 || runCount >= 2) {
      this.context = result;
      return result;
    }
    runCount += 1;
    return this._processContextVariables(result, variables, requireEvaluation, runCount);
  }

  /**
   * Upgrades old syntax of magic variables to new one.
   * It replaces `${now}` and `${random}` to function calls: `now()` and
   * `random()`. It also keeps grouping.
   *
   * @param {string} value Currently evaluated value
   * @return {string} Parsed value without old syntax.
   */
  _upgradeLegacy(value) {
    const reg = /\$?{(random|now):?([0-9]+)?}/gm;
    const test = reg.test(value);
    if (!test) {
      return value;
    }
    reg.lastIndex = 0;
    const loopTest = true;
    while (loopTest) {
      const matches = reg.exec(value);
      if (!matches) {
        break;
      }
      const variable = matches[0];
      const word = matches[1];
      const group = matches[2];
      let replacement = `\${${word}(`;
      if (group) {
        replacement += group;
      }
      replacement += ')}';
      value = value.replace(variable, replacement);
      reg.lastIndex -= 2; // replacement word is shorter by 2 characters
    }
    return value;
  }

  /**
   * Evaluates functions.
   *
   * @param {string} value A value to evaluate
   * @returns {string} Evaluated value with removed functions.
   * @throws Error if a function is not supported.
   */
  _evalFunctions(value) {
    if (!value) {
      return '';
    }
    functionRegex.lastIndex = 0;
    const cnd = true;
    while (cnd) {
      const matches = functionRegex.exec(value);
      if (!matches) {
        break;
      }
      const fnName = matches[1];
      const argsStr = matches[2];
      let args;
      if (argsStr) {
        args = argsStr.split(',').map(item => item.trim());
      }
      const _value = this._callFn(fnName, args);
      value = value.replace(matches[0], String(_value));
      functionRegex.lastIndex -= matches[0].length - String(_value).length;
    }
    return value;
  }

  /**
   * Calls one of the predefined functions and returns its value.
   *
   * @param {string} fnName A function name to call.
   * @param {string[]=} args Arguments find in the expression.
   * @return {string|number} Result of calling a function. Always a string.
   */
  _callFn(fnName, args) {
    const dotIndex = fnName.indexOf('.');
    if (dotIndex !== -1) {
      const namespace = fnName.substr(0, dotIndex);
      const name = fnName.substr(dotIndex + 1);
      if (['Math', 'String'].indexOf(namespace) !== -1) {
        try {
          return this._callNamespaceFunction(namespace, name, args);
        } catch (e) {
          throw new Error(`Unsupported function ${fnName}`);
        }
      }
    } else {
      fnName = fnName[0].toUpperCase() + fnName.substr(1);
      if (fnName in EvalFunctions) {
        return EvalFunctions[fnName](args);
      }
      const localFnName = `__evalFn${fnName}`;
      if (typeof this[localFnName] === 'function') {
        return this[localFnName](args);
      }
    }
    throw new Error(`Unsupported function ${fnName}`);
  }

  /**
   * Calls JavaScript native function.
   * Currently only `Math`, 'JSON', and `String` namespaces are supported.
   *
   * @param {string} namespace The namespace of the function to call
   * @param {string} fn Name of the function to call
   * @param {string[]=} args A list of arguments to call
   * @return {string|number} Processed value.
   */
  _callNamespaceFunction(namespace, fn, args) {
    const { context } = this;
    if (context) {
      args = args.map(arg => this._applyArgumentsContext(arg, context));
    }
    if (namespace === 'Math' || namespace === 'JSON') {
      return window[namespace][fn].apply(window, args);
    }
    if (namespace === 'String') {
      if (!args || !args.length) {
        throw new Error('String functions need an argument');
      }
      const str = args.shift();
      return String.prototype[fn].apply(str, args);
    }
    return '';
  }

  /**
   * Calls the `now()` function. Returns current timestamp.
   * If argument is passed is will try to retrieve existing cached value
   * or create new one.
   *
   * @param {string[]} args Arguments passed to the function
   * @return {Number} Current timestamp
   */
  __evalFnNow(args) {
    const key = '__evalFnNow';
    const hasGroup = !!(args && args[0]);
    let value;
    if (hasGroup) {
      value = find(this, key, args[0]);
    }
    if (!value) {
      value = Date.now();
    }
    if (hasGroup) {
      store(this, key, args[0], value);
    }
    return /** @type Number */ (value);
  }

  /**
   * Generates random integer value. If a group is passed in the `args` then
   * it looks for the value in the cache and prefers it if available.
   *
   * @param {string[]} args Arguments passed to the function
   * @return {number} Current timestamp
   */
  __evalFnRandom(args) {
    const key = '__evalFnRandom';
    const hasGroup = !!(args && args[0]);
    let value;
    if (hasGroup) {
      value = find(this, key, args[0]);
    }
    if (!value) {
      value = this.__randomInt();
    }
    if (hasGroup) {
      store(this, key, args[0], value);
    }
    return /** @type Number */ (value);
  }

  /**
   * Returns a random `int` between 0 (inclusive) and
   * `Number.MAX_SAFE_INTEGER` (exclusive) with roughly equal probability of
   * returning any particular `int` in this range.
   *
   * @return {Number}
   */
  __randomInt() {
    // "|0" forces the value to a 32 bit integer.
    // Number.MAX_SAFE_INTEGER
    return Math.abs(Math.floor(Math.random() * 9007199254740991) | 0);
  }

  /**
   * Prepares variables to be evaluated where a value is a multiline value.
   * @param {string[]} lines Lines in the expression
   * @return {string[]} Processed lines
   */
  _prepareMultilineValue(lines) {
    return lines.map(line => {
      if (['{', '}'].includes(line.trim())) {
        return line;
      }
      let _res = this._prepareValue(line);
      if (_res === line) {
        _res = _res.replace(/'/g, "\\'");
        _res = _res.replace(/\\\\/, '\\\\\\');
        _res = `'${_res}'`;
      }
      return _res;
    });
  }

  _applyArgumentsContext(arg, context) {
    const typedValue = String(arg);
    const jSLiteralIndex = typedValue.indexOf('${');
    const apiLiteralIndex = typedValue.indexOf('{');
    if (jSLiteralIndex === 0 || apiLiteralIndex === 0) {
      const index = jSLiteralIndex === 0 ? 2 : 1;
      const postIndex = jSLiteralIndex === 0 ? 3 : 2;
      const varName = arg.substr(index, arg.length - postIndex);
      if (this.isValidName(varName) && context[varName]) {
        return context[varName];
      }
    }
    return arg;
  }

  /**
   * Replaces strings with quoted string and variables notation into
   * variables that Jexl understands.
   *
   * @param {string} value Value to evaluate
   * @return {string} Proper syntax for Jexl
   */
  _prepareValue(value) {
    if (!value) {
      return value;
    }
    let typedValue = String(value);
    let isJsonValue = typedValue[0] === '{' && typedValue[typedValue.length - 1] === '}';
    if (isJsonValue) {
      try {
        // to handle `{x} something {y}`
        JSON.parse(typedValue);
        typedValue = typedValue.substr(1, typedValue.length - 2);
      } catch (e) {
        isJsonValue = false;
      }
    }
    const isJSLiteral = typedValue.includes('${');
    let isAPILiteral = !isJSLiteral && typedValue.includes('{');
    if (!isJSLiteral && !isAPILiteral && isJsonValue) {
      // this handles the case when the value contains a single variable in
      // the URL variables syntax.
      isAPILiteral = true;
      isJsonValue = false;
      typedValue = `{${typedValue}}`;
    }
    if (!isJSLiteral && !isAPILiteral) {
      return value;
    }
    typedValue = typedValue.replace(/'/g, "\\'");
    const tokenizer = new VariablesTokenizer(typedValue);
    let parsed = '';
    const loopTest = true;
    const prefix = isJSLiteral ? '$' : '{';
    while (loopTest) {
      const _startIndex = tokenizer.index;
      const left = tokenizer.nextUntil(prefix);
      if (left === null) {
        // no more variables
        if (!parsed) {
          return this._wrapJsonValue(typedValue, isJsonValue);
        }
        tokenizer.index = _startIndex;
        parsed += `'${tokenizer.eof()}'`;
        return this._wrapJsonValue(parsed, isJsonValue);
      }
      let variable = tokenizer.nextUntil('}');
      if (variable === '') {
        // let this pass.
        continue;
      }
      if (!variable) {
        // https://github.com/advanced-rest-client/arc-environment/issues/2
        // This may not be error, even if so, don't throw it in here, just ignore the expression
        return value;
      }
      if (!isAPILiteral) {
        variable = variable.substr(1);
      }
      if (!this.isValidName(variable)) {
        continue;
      }
      const replacement = ` + ${variable} + `;
      let newValue = '';
      newValue += `'${left}'`;
      newValue += replacement;
      parsed += newValue;
    }
    return this._wrapJsonValue(typedValue, isJsonValue);
  }

  /**
   * Wraps a passed value with `'{'` and `'}'` to be properly processed by Jexl.
   * @param {string} value The value to wrap.
   * @param {boolean} isJson Whether the passed string originally was a JSON string.
   * @return {string} Valid for Jexl JSON string.
   */
  _wrapJsonValue(value, isJson) {
    return isJson ? `'{' + ${value} + '}'` : value;
  }

  /**
   * Checks whether passed value is a valid variable name.
   * @param {string} name Variable name
   * @return {boolean} true if the passed name can be used as variable value.
   */
  isValidName(name) {
    return varValueRe.test(name);
  }
}
