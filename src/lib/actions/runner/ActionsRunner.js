/* eslint-disable class-methods-use-this */
import { ArcModelEvents } from '@advanced-rest-client/events';
import { VariablesProcessor } from '../../variables/VariablesProcessor.js';
import { mapRunnables } from '../ActionCondition.js';
import { mapActions, sortActions } from '../ArcAction.js';
import { ActionRunner } from './ActionRunner.js';

/* eslint-disable no-await-in-loop */
/* eslint-disable no-plusplus */
/* eslint-disable no-continue */
/* eslint-disable no-param-reassign */

/** @typedef {import('../ArcAction').ArcAction} ArcAction */
/** @typedef {import('../../../types').ActionsRunnerInit} ActionsRunnerInit */
/** @typedef {import('../../../types').RequestProcessOptions} RequestProcessOptions */
/** @typedef {import('../../../types').ResponseProcessOptions} ResponseProcessOptions */
/** @typedef {import('@advanced-rest-client/events').ArcRequest.ArcEditorRequest} ArcEditorRequest */
/** @typedef {import('@advanced-rest-client/events').ArcRequest.TransportRequest} TransportRequest */
/** @typedef {import('@advanced-rest-client/events').ArcResponse.Response} Response */
/** @typedef {import('@advanced-rest-client/events').ArcResponse.ErrorResponse} ErrorResponse */
/** @typedef {import('@advanced-rest-client/events').Actions.RunnableAction} RunnableAction */
/** @typedef {import('@advanced-rest-client/events').Variable.SystemVariables} SystemVariables */
/** @typedef {import('@advanced-rest-client/events').Variable.ARCVariable} ARCVariable */

/**
 * The main class that executes actions for a request and a response in Advanced REST Client.
 */
export class ActionsRunner {
  /**
   * @param {ActionsRunnerInit} config Configuration options
   */
  constructor(config) {
    const { jexl, eventsTarget } = config;
    this.jexl = jexl;
    this.eventsTarget = eventsTarget;
  }

  /**
   * Takes the ARC editor request object and runs the request actions added to it.
   * 
   * Note, actions are executed one-by-one in order defined by the `priority` property. The final request object may be changed.
   * 
   * @param {ArcEditorRequest} request ARC request object generated by the request editor.
   * @param {RequestProcessOptions=} [config={}] Optional configuration
   * @return {Promise<ArcEditorRequest>} Promise resolved to the passed request object. It may be a copy.
   * @throws {Error} When required arguments are not set.
   */
  async processRequestActions(request, config={}) {
    if (!request) {
      throw new Error('Expected an argument.');
    }
    const { actions } = request.request;
    if (!actions) {
      return request;
    }
    const requestActions = actions.request;
    if (!Array.isArray(requestActions)) {
      return request;
    }
    const enabled = requestActions.filter((item) => !!item.enabled && !!item.actions && !!item.actions.length);
    if (!enabled.length) {
      return request;
    }
    const runnables = mapRunnables(enabled);

    let processor = /** @type VariablesProcessor|null */ (null);
    let systemVariables;
    if (config.evaluateVariables !== false) {
      const env = await ArcModelEvents.Environment.current(this.eventsTarget);
      if (config.evaluateSystemVariables !== false) {
        systemVariables = env.systemVariables;
      }
      processor = new VariablesProcessor(this.jexl, env.variables);
    }
    for (let i = 0, len = runnables.length; i < len; i++) {
      const runnable = runnables[i];
      if (!runnable.satisfied(request.request)) {
        continue;
      }
      const execs = mapActions(runnable.actions).filter((item) => !!item.enabled);
      execs.sort(sortActions);
      for (let j = 0, eLen = execs.length; j < eLen; j++) {
        const action = await this.evaluateAction(execs[j], processor, systemVariables);
        const runner = new ActionRunner(action, this.eventsTarget, {
          request: request.request,
        });
        if (action.sync === false) {
          this.runAsynchronousAction(runner);
          continue;
        }
        try {
          await runner.run();
        } catch (e) {
          if (action.failOnError) {
            throw e;
          }
        }
      }
    }
    return request;
  }

  /**
   * Runs asynchronous action
   * @param {ActionRunner} runner 
   */
  async runAsynchronousAction(runner) {
    try {
      await runner.run();
    } catch (e) {
      // eslint-disable-next-line no-console
      console.info(`Asynchronous action resulted in error`, e);
    }
  }

  /**
   * Processes actions when response object is ready.
   * 
   * @param {ArcEditorRequest} request ARC request object generated by the request editor.
   * @param {TransportRequest} executed The request reported by the transport library
   * @param {Response|ErrorResponse} response ARC response object.
   * @param {ResponseProcessOptions=} [config={}] Optional configuration
   * @returns {Promise<void>} A promise resolved when actions were performed.
   */
  async processResponseActions(request, executed, response, config={}) {
    if (!request || !executed || !response) {
      throw new Error('Expected 3 arguments.');
    }
    const { actions } = request.request;
    if (!actions) {
      return;
    }
    const responseActions = actions.response;
    if (!Array.isArray(responseActions)) {
      return;
    }
    const enabled = responseActions.filter((item) => !!item.enabled && !!item.actions && !!item.actions.length);
    if (!enabled.length) {
      return;
    }
    const runnables = mapRunnables(enabled);
    let processor = /** @type VariablesProcessor|null */ (null);
    let systemVariables;
    if (config.evaluateVariables !== false) {
      const env = await ArcModelEvents.Environment.current(this.eventsTarget);
      if (config.evaluateSystemVariables !== false) {
        systemVariables = env.systemVariables;
      }
      processor = new VariablesProcessor(this.jexl, env.variables);
    }
    for (let i = 0, len = runnables.length; i < len; i++) {
      const runnable = runnables[i];
      if (!runnable.satisfied(request.request, executed, response)) {
        continue;
      }
      const execs = mapActions(runnable.actions).filter((item) => !!item.enabled);
      execs.sort(sortActions);
      for (let j = 0, eLen = execs.length; j < eLen; j++) {
        const action = await this.evaluateAction(execs[j], processor, systemVariables);
        const runner = new ActionRunner(action, this.eventsTarget, {
          request: request.request,
          executedRequest: executed,
          response,
        });
        if (action.sync === false) {
          this.runAsynchronousAction(runner);
          continue;
        }
        try {
          await runner.run();
        } catch (e) {
          if (action.failOnError) {
            throw e;
          }
        }
      }
    }
  }

  /**
   * Evaluates variables in the action.
   * @param {ArcAction} action An action to evaluate.
   * @param {VariablesProcessor=} processor Initialized variables processor with the current environment
   * @param {SystemVariables=} systemVariables System variables to use with the variables processor.
   * @return {Promise<ArcAction>} Resolved to an action without variables.
   */
  async evaluateAction(action, processor, systemVariables) {
    const copy = action.clone();
    if (!processor) {
      return copy;
    }
    const { config } = copy;
    const evalOptions = {}
    if (systemVariables) {
      evalOptions.override = systemVariables;
    }

    await processor.evaluateVariables(config, evalOptions);
    const { source } = /** @type any */ (config);
    if (source) {
      await processor.evaluateVariables(source, evalOptions);
    }
    if (source && source.iterator) {
      await processor.evaluateVariables(source.iterator, evalOptions);
    }
    return copy;
  }
}
