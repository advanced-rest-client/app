/* eslint-disable no-param-reassign */
import { TemplateResult } from 'lit-element';
import { SavedListMixin } from './SavedListMixin.js';
import { default as RequestsPanelElement } from './RequestsPanelElement.js';
import {  customActionsTemplate,  contentActionHandler, projectSelectorTemplate, notifyProject, projectChangeHandler } from './internals.js';
import { ProjectsListConsumerMixin } from './ProjectsListConsumerMixin.js';
import { ARCProjectUpdatedEvent, ArcRequest } from '@advanced-rest-client/events';

export const projectsSuggestionsValue: unique symbol;
export const projectAddKeydown: unique symbol;
export const addSelectedProject: unique symbol;
export const cancelAddProject: unique symbol;
export const projectSelectorOpenedValue: unique symbol;
export const projectOverlayClosed: unique symbol;

/**
 * @fires details When the request details were requested
 * @fires select When selection change
 */
export default class SavedPanelElement extends ProjectsListConsumerMixin(SavedListMixin(RequestsPanelElement)) {
  requests: ArcRequest.ARCSavedRequest[];
  
  [notifyProject](): Promise<void>;

  [contentActionHandler](e: PointerEvent): void;

  /**
   * Listens for Enter + cmd/ctrl button to accept project selection.
   */
  [projectAddKeydown](e: KeyboardEvent): void;

  /**
   * Updates projects for requests when confirming the change action.
   */
  [addSelectedProject](): Promise<void>;

  [cancelAddProject](): void;

  [projectOverlayClosed](): void;

  render(): TemplateResult;

  [customActionsTemplate](): TemplateResult;

  [projectSelectorTemplate](): TemplateResult;

  [projectChangeHandler](e: ARCProjectUpdatedEvent): Promise<void>;
}
