/**
@license
Copyright 2018 The Advanced REST client authors <arc@mulesoft.com>
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
import { Project } from '@advanced-rest-client/events'
import { SavedListMixin } from '../request/SavedListMixin.js';
import { ProjectsListConsumerMixin } from '../request/ProjectsListConsumerMixin.js';
import * as internals from '../request/internals.js';

export declare const projectsListTemplate: unique symbol;
export declare const projectItemTemplate: unique symbol;
export declare const addProjectTemplate: unique symbol;
export declare const addProjectHandler: unique symbol;
export declare const projectMouseOverOut: unique symbol;
export declare const hoveredProjectValue: unique symbol;
export declare const listOptionsTemplate: unique symbol;
export declare const openAllRequestsHandler: unique symbol;
export declare const replaceAllRequestsHandler: unique symbol;
export declare const deleteHandler: unique symbol;
export declare const projectDragStartHandler: unique symbol;
export declare const projectDropHandler: unique symbol;
export declare const projectDragLeaveHandler: unique symbol;
export declare const projectDragOverHandler: unique symbol;
export declare const toggleOpen: unique symbol;
export declare const openedProjectsValue: unique symbol;
export declare const projectRequestsTemplate: unique symbol;
export declare const projectRequestTemplate: unique symbol;
export declare const readProjectRequests: unique symbol;
export declare const deleteInvalidRequestsHandler: unique symbol;
export declare const openRequestHandler: unique symbol;
export declare const openProjectHandler: unique symbol;
export declare const listDragOverHandler: unique symbol;
export declare const listDragLeaveHandler: unique symbol;
export declare const listDropHandler: unique symbol;
export declare const dropPointerReference: unique symbol;
export declare const dropPointer: unique symbol;
export declare const openingProjectTimeout: unique symbol;
export declare const openProject: unique symbol;

/**
 * A list of projects in the ARC main menu.
 */
export default class ProjectsMenuElement extends ProjectsListConsumerMixin(SavedListMixin(LitElement)) {

  /**
   * A timeout after which the project item is opened when dragging a
   * request over.
   *
   * @default 700
   * @attribute
   */
  dragOpenTimeout: number;

  constructor();

  refresh(): void;

  [addProjectHandler](): Promise<void>;

  [projectMouseOverOut](e: MouseEvent): Promise<void>;

  /**
   * Dispatches an event to open project requests in workspace
   */
  [openAllRequestsHandler](e: PointerEvent): void;

  /**
   * Dispatches an event to open project requests in workspace and close existing ones.
   */
  [replaceAllRequestsHandler](e: PointerEvent): void;

  /**
   * Deletes a project and its requests.
   */
  [deleteHandler](e: PointerEvent): Promise<void>;

  /**
   * Initializes project list item drag operation.
   */
  [projectDragStartHandler](e: DragEvent): void;

  /**
   * Handles a drag item being dragged over a project item.
   * This is to add support to drop a request into a project.
   *  
   * Both history and saved requests can be dropped here.
   */
  [projectDragOverHandler](e: DragEvent): void;

  /**
   * Handles an item leaving a drag.
   * This is to add support for drop a request into a project.
   */
  [projectDragLeaveHandler](e: DragEvent): void;

  /**
   * Handles a request item drop on a project.
   * This adds the request to the project
   */
  [projectDropHandler](e: DragEvent): Promise<void>;

  /**
   * Toggles project open state.
   */
  [toggleOpen](e: PointerEvent): Promise<void>;

  /**
   * Opens a project and reads its requests
   * @param id Project id to open
   */
  [openProject](id: string): Promise<void>;

  /**
   * Reads project requests from the data store and loads them into the requests list
   * while taking care of duplicates.
   * @param pid Project id
   */
  [readProjectRequests](pid: string): Promise<void>;

  /**
   * Deletes a project and its requests.
   */
  [deleteInvalidRequestsHandler](e: PointerEvent): Promise<void>;

  /**
   * Dispatches request navigation event
   */
  [openRequestHandler](e: PointerEvent): void;

  /**
   * Dispatches project navigation event
   */
  [openProjectHandler](e: PointerEvent): void;

  /**
   * Handler for `dragover` event on the list element. If the dragged item is compatible
   * it renders the drop message.
   */
  [listDragOverHandler](e: DragEvent): void;

  /**
   * Handler for `dragleave` event on the list element. 
   */
  [listDragLeaveHandler](e: DragEvent): void;

  /**
   * Overrides parent's dropHandler function to prohibit adding to saved requests
   */
  [internals.dropHandler](): Promise<void>;

  /**
   * Overrides parent's dropHandler function to prohibit adding to saved requests
   */
  [internals.dragOverHandler](): Promise<void>;

  /**
   * Handler for `drop` event on the list element. 
   * It rearranges the order if the item is already in the project or adds
   * the request at the position.
   */
  [listDropHandler](e: DragEvent): Promise<void>;
  [internals.dragStartHandler](e: DragEvent): void;
  
  render(): TemplateResult;

  /**
   * @returns Template for the list items.
   */
  [projectsListTemplate](): TemplateResult|string;

  /**
   * 
   * @param project A project to render
   * @param index An index of the project in the projects array
   */
  [projectItemTemplate](project: Project.ARCProject, index: number): TemplateResult;

  [internals.unavailableTemplate](): TemplateResult|string;

  [addProjectTemplate](): TemplateResult;

  /**
   * 
   * @param index 
   * @returns A template for the project list item options
   */
  [listOptionsTemplate](index: number): TemplateResult;

  /**
   * 
   * @param project Parent project id
   * @param items The list of requests on the project
   * @return A template for the list of requests
   */
  [projectRequestsTemplate](project: string, items: string[]): TemplateResult;

  /**
   * 
   * @param project Parent project id
   * @param id Request id to render
   * @param index The index of the request in the project requests list
   * @returns A template for the request item
   */
  [projectRequestTemplate](project: string, id: string, index: number): TemplateResult;
}
