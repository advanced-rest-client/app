/**
@license
Copyright 2021 The Advanced REST client authors <arc@mulesoft.com>
Licensed under the Apache License, Version 2.0 (the "License"); you may not
use this file except in compliance with the License. You may obtain a copy of
the License at
http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
License for the specific language governing permissions and limitations under
the License.
*/
import { LitElement, TemplateResult } from 'lit-element';
import * as internals from '../request/internals.js';
import { RequestsListMixin } from '../request/RequestsListMixin.js';
import { SavedListMixin } from '../request/SavedListMixin.js';

export declare const projectIdValue: unique symbol;
export declare const projectIdChanged: unique symbol;
export declare const projectHeaderTemplate: unique symbol;
export declare const headerContextMenuTemplate: unique symbol;
export declare const descriptionTemplate: unique symbol;
export declare const confirmDeleteProjectTemplate: unique symbol;
export declare const deleteProjectDialogValue: unique symbol;
export declare const deleteProjectHandler: unique symbol;
export declare const metaEditorTemplate: unique symbol;
export declare const editorHandler: unique symbol;
export declare const metaEditorClose: unique symbol;
export declare const sheetClosedHandler: unique symbol;

export default class ProjectScreenElement extends SavedListMixin(RequestsListMixin(LitElement)) {

  /**
   * When true the project meta editor is opened.
   * @attribute;
   */
  editor: boolean;

  projectId: string;

  constructor();

  /**
   * @param {} arg
   */
  firstUpdated(arg: Map<string | number | symbol, unknown>): void;

  /**
   * Updates project info when `projectId` changed.
   * @param {string} id Project data store id.
   * @returns {}
   */
  [projectIdChanged](id: string): Promise<void>;

  /**
   * Queries for the request data,
   *
   * @return Resolved promise when the query ends.
   */
  [internals.loadPage](): Promise<void>;

  /**
   * A handler for the content action click. Calls a function depending on the click icon.
   */
  [internals.contentActionHandler](e: PointerEvent): void;

  /**
   * Toggles selection of all items on the list.
   */
  toggleSelection(): void;

  [internals.deleteAction](): Promise<void>;

  [internals.deleteUndoAction](): Promise<void>;

  [internals.snackbarClosedHandler](): void;

  [deleteProjectHandler](): void;

  [internals.deleteCancel](): void;

  [internals.deleteConfirm](): Promise<void>;

  [internals.exportAction](): void;

  [internals.exportOverlayClosed](): void;

  [internals.exportAccept](e: CustomEvent): Promise<void>;

  [internals.exportCancel](): void;

  [editorHandler](): void;

  [metaEditorClose](): void;

  [sheetClosedHandler](e: Event): void;

  render(): TemplateResult;

  /**
   * @returns Project header template
   */
  [projectHeaderTemplate](): TemplateResult|string;

  [headerContextMenuTemplate](): TemplateResult;

  /**
   * @returns Project description template
   */
  [descriptionTemplate](): TemplateResult|string;

  [internals.contentActionsTemplate](): TemplateResult|string;

  /**
   * @returns A template for the undo delete data toast
   */
  [internals.deleteUndoTemplate](): TemplateResult;

  /**
   * @returns A template for the export options panel in the bottom-sheet element
   */
  [internals.exportOptionsTemplate](): TemplateResult;

  /**
   * @returns A template for the Google Drive export confirmation dialog.
   */
  [internals.driveExportedTemplate](): TemplateResult;

  /**
   * @returns The template for the delete all data dialog
   */
  [confirmDeleteProjectTemplate](): TemplateResult|string;

  /**
   * @returns The template for the project details editor.
   */
  [metaEditorTemplate](): TemplateResult|string;
}
