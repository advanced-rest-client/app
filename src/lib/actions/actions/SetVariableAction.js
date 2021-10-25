/* eslint-disable class-methods-use-this */
import { ArcModelEvents } from '@advanced-rest-client/events';
import { RequestDataExtractor } from '../runner/RequestDataExtractor.js';
import { ArcExecutable } from './ArcExecutable.js';

/** @typedef {import('../ArcAction').ArcAction} ArcAction */
/** @typedef {import('../../../types').ArcExecutableInit} ArcExecutableInit */
/** @typedef {import('@advanced-rest-client/events').Actions.SetVariableConfig} SetVariableConfig */
/** @typedef {import('@advanced-rest-client/events').Actions.DataSourceConfiguration} DataSourceConfiguration */
/** @typedef {import('@advanced-rest-client/events').ArcRequest.ArcBaseRequest} ArcBaseRequest */
/** @typedef {import('@advanced-rest-client/events').ArcRequest.ARCSavedRequest} ARCSavedRequest */
/** @typedef {import('@advanced-rest-client/events').ArcRequest.ARCHistoryRequest} ARCHistoryRequest */
/** @typedef {import('@advanced-rest-client/events').ArcRequest.TransportRequest} TransportRequest */
/** @typedef {import('@advanced-rest-client/events').ArcResponse.Response} Response */
/** @typedef {import('@advanced-rest-client/events').ArcResponse.ErrorResponse} ErrorResponse */

/**
 * Executes the `set-cookie` action.
 */
export class SetVariableAction extends ArcExecutable {
  async execute() {
    const cnf = /** @type SetVariableConfig */ (this.action.config);
    const value = this.readValue(cnf.source);
    if (!value && this.action.failOnError) {
      throw new Error(`Cannot read value for the action "${this.action.name}"`);
    }
    await this.setVariable(cnf, String(value));
  }

  /**
   * @param {DataSourceConfiguration} source 
   * @returns {string | number | URLSearchParams | Headers | undefined}
   */
  readValue(source) {
    let value;
    if (source.source === 'value') {
      value = source.value;
    } else {
      const extractor = new RequestDataExtractor({
        request: this.init.request,
        response: this.init.response,
        executedRequest: this.init.executedRequest,
      });
      value = extractor.extract(source);
    }
    return value;
  }

  /**
   * 
   * @param {SetVariableConfig} config 
   * @param {string} value 
   */
  async setVariable(config, value) {
    const { name } = config;
    await ArcModelEvents.Variable.set(this.eventTarget, name, value);
  }
}
