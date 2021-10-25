/* eslint-disable class-methods-use-this */
import { SessionCookieEvents } from '@advanced-rest-client/events';
import { ArcExecutable } from './ArcExecutable.js';

/** @typedef {import('../ArcAction').ArcAction} ArcAction */
/** @typedef {import('../../../types').ArcExecutableInit} ArcExecutableInit */
/** @typedef {import('@advanced-rest-client/events').Actions.DeleteCookieConfig} DeleteCookieConfig */

/**
 * Executes the `delete-cookie` action.
 */
export class DeleteCookieAction extends ArcExecutable {
  async execute() {
    const cnf = /** @type DeleteCookieConfig */ (this.action.config);
    let url;
    if (cnf.useRequestUrl) {
      url = this.init.request.url;
    } else {
      url = cnf.url;
    }
    const name = cnf.removeAll ? undefined : cnf.name;
    await SessionCookieEvents.deleteUrl(this.eventTarget, url, name);
  }
}
