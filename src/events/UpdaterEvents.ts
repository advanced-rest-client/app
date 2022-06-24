/* eslint-disable max-classes-per-file */
import { ContextEvent } from "@api-client/core/build/browser.js";
import { EventTypes } from "./EventTypes.js";

export class UpdaterEvents {
  /** 
   * Checks for an application update.
   * @param target The node on which to dispatch the event.
   * @returns The update information object. This depends on the platform.
   */
  static async checkForUpdate(target: EventTarget = window): Promise<unknown> {
    const e = new ContextEvent(EventTypes.Updater.checkForUpdate, {});
    target.dispatchEvent(e);
    return e.detail.result;
  }

  /** 
   * Quits the application and installs the update.
   * @param {EventTarget} target The node on which to dispatch the event.
   */
  static async installUpdate(target: EventTarget = window): Promise<void> {
    const e = new ContextEvent(EventTypes.Updater.installUpdate, {});
    target.dispatchEvent(e);
    await e.detail.result;
  }

  static State = class {
    static checkingForUpdate(target: EventTarget = window): void {
      const e = new Event(EventTypes.Updater.State.checkingForUpdate, {
        bubbles: true,
        composed: true,
      });
      target.dispatchEvent(e);
    }

    /**
     * @param info The update information object. This depends on the platform.
     */
    static updateAvailable(info: unknown, target: EventTarget = window): void {
      const e = new CustomEvent(EventTypes.Updater.State.updateAvailable, {
        bubbles: true,
        composed: true,
        detail: info,
      });
      target.dispatchEvent(e);
    }

    static updateNotAvailable(target: EventTarget = window): void {
      const e = new Event(EventTypes.Updater.State.updateNotAvailable, {
        bubbles: true,
        composed: true,
      });
      target.dispatchEvent(e);
    }

    /**
     * @param info The error information object. This depends on the platform.
     */
    static autoUpdateError(info: unknown, target: EventTarget = window): void {
      const e = new CustomEvent(EventTypes.Updater.State.autoUpdateError, {
        bubbles: true,
        composed: true,
        detail: info,
      });
      target.dispatchEvent(e);
    }

    /**
     * @param info The download information object. This depends on the platform.
     */
    static downloadProgress(info: unknown, target: EventTarget = window): void {
      const e = new CustomEvent(EventTypes.Updater.State.downloadProgress, {
        bubbles: true,
        composed: true,
        detail: info,
      });
      target.dispatchEvent(e);
    }

    /**
     * @param info The update information object. This depends on the platform.
     */
    static updateDownloaded(info: unknown, target: EventTarget = window): void {
      const e = new CustomEvent(EventTypes.Updater.State.updateDownloaded, {
        bubbles: true,
        composed: true,
        detail: info,
      });
      target.dispatchEvent(e);
    }
  }
}
