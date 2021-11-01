/* eslint-disable class-methods-use-this */
/* eslint-disable import/no-extraneous-dependencies */
import { Events } from '@advanced-rest-client/events';
import { v4 } from '@advanced-rest-client/uuid';
import { get, set } from 'idb-keyval';
import { WorkspaceBindings } from '../base/WorkspaceBindings.js'

/** @typedef {import('@advanced-rest-client/events').Workspace.DomainWorkspace} DomainWorkspace */
/** @typedef {import('@advanced-rest-client/events').Workspace.LegacyWorkspace} LegacyWorkspace */

const contentsKey = 'ArcWorkspaceBindings.content';
const customContentsPrefix = 'Workspace.';
const lastWorkspaceKey = 'Workspace.Id';

/**
 * @param {any} fileHandle 
 * @param {boolean} readWrite 
 * @returns {Promise<boolean>}
 */
async function verifyPermission(fileHandle, readWrite) {
  const options = {};
  if (readWrite) {
    options.mode = 'readwrite';
  }
  // Check if permission was already granted. If so, return true.
  if ((await fileHandle.queryPermission(options)) === 'granted') {
    return true;
  }
  // Request permission. If the user grants permission, return true.
  if ((await fileHandle.requestPermission(options)) === 'granted') {
    return true;
  }
  // The user didn't grant permission, so return false.
  return false;
}

/**
 * Web platform bindings for the request workspace related logic.
 */
export class WorkspaceBindingsWeb extends WorkspaceBindings {
  /** @type {string} */
  #id = undefined;

  /**
   * @param {DomainWorkspace} contents The workspace to store.
   */
  async store(contents) {
    if (this.#id) {
      await this.#storeId(this.#id, contents);
    } else {
      await this.#storeDefault(contents);
    }
    Events.Workspace.State.write(window);
  }

  /**
   * @param {string} id The workspace id to use.
   * @param {DomainWorkspace} contents The workspace to store.
   */
  async #storeId(id, contents) {
    const key = `${customContentsPrefix}${id}`;
    const fileRef = await get(key);
    if (!fileRef) {
      await this.#storeDefault(contents);
      return;
    }
    const granted = await verifyPermission(fileRef, true);
    if (!granted) {
      throw new Error(`No permission to write to the file.`);
    }
    const writable = await fileRef.createWritable();
    await writable.write(JSON.stringify(contents, null, 2));
    await writable.close();
  }

  /**
   * @param {DomainWorkspace} contents The workspace to store.
   */
  async #storeDefault(contents) {
    await set(contentsKey, contents);
  }

  /**
   * Executes the logic to change the workspace id.
   * @param {string} id The new workspace ID.
   */
  setId(id) {
    this.#id = id;
  }

  /**
   * Selects a user directory and triggers the save action in the workspace.
   * @returns {Promise<void>}
   */
  async exportWorkspace() {
    const id = await this.pickFile();
    if (!id) {
      return;
    }
    this.#id = id;
    localStorage.setItem(lastWorkspaceKey, id);
    Events.Workspace.triggerWrite(window);
  }

  /**
   * Requests to pick a file for saving.
   * @returns {Promise<string|undefined>} The id of the picked file or undefined when cancelled.
   */
  async pickFile() {
    const options = {
      types: [
        {
          description: 'ARC Workspace',
          accept: {
            'application/arc+workspace': ['.arcworkspace'],
          },
        },
      ],
    };
    // @ts-ignore
    const handle = await window.showSaveFilePicker(options);
    if (!handle) {
      // action cancelled
      return undefined;
    }
    const id = v4();
    const key = `${customContentsPrefix}${id}`;
    await set(key, handle);
    return id;
  }

  /**
   * Reads the current state of the workspace.
   * @returns {Promise<DomainWorkspace>}
   */
  async restore() {
    if (this.#id) {
      return this.#restoreId(this.#id);
    }
    return this.#restoreDefault();
  }

  /**
   * @param {string} id 
   * @returns {Promise<DomainWorkspace>}
   */
  async #restoreId(id) {
    const key = `${customContentsPrefix}${id}`;
    const fileRef = await get(key);
    if (!fileRef) {
      return this.#restoreDefault();
    }
    const granted = await verifyPermission(fileRef, false);
    if (!granted) {
      throw new Error(`No permission to write to the file.`);
    }
    const file = await fileRef.getFile();
    const contents = await file.text();
    const data = JSON.parse(contents);
    return this.processWorkspaceInput(data);
  }

  async #restoreDefault() {
    return this.processWorkspaceInput(await get(contentsKey));
  }
}
