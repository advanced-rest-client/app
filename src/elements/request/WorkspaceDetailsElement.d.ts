import { LitElement, TemplateResult } from 'lit-element';
import { ResizableMixin } from '@anypoint-web-components/awc';
import { DomainWorkspace } from '@advanced-rest-client/events/src/domain/Workspace';
import {
  editHandler,
  descriptionTemplate,
} from './internals.js';

export const noDataTemplate: unique symbol;
export const valueTemplate: unique symbol;

/**
 * @fires edit
 */
export default class WorkspaceDetailsElement extends ResizableMixin(LitElement) {
  /**
   * The workspace object being rendered
   */
  workspace: DomainWorkspace;
  /**
   * Enables Anypoint theme
   * @attribute
   */
  anypoint: boolean;

  constructor();

  /**
   * Sends non-bubbling `edit` event to the parent element to perform
   * edit action.
   */
  [editHandler](): void;

  render(): TemplateResult;

  /**
   * The template for the workspace description 
   */
  [descriptionTemplate](): TemplateResult|string;

  [noDataTemplate](): TemplateResult;

  [valueTemplate](value: string): TemplateResult;
}
