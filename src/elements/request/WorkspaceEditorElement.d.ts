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
import { ResizableMixin } from '@anypoint-web-components/awc';
import { DomainWorkspace } from '@advanced-rest-client/events/src/domain/Workspace';
import { editor } from 'monaco-editor';
import {
  descriptionTemplate,
  submitHandler,
  cancelHandler,
  saveHandler,
  versionTemplate,
  publishedTemplate,
  additionalTemplate,
  actionsTemplate,
  providerNameTemplate,
  providerUrlTemplate,
  providerEmailTemplate,
} from './internals.js';

export const toggleOptions: unique symbol;
export const generateEditorConfig: unique symbol;
export const monacoValueChanged: unique symbol;
export const monacoInstance: unique symbol;

/** @typedef {import('lit-element').TemplateResult} TemplateResult */
/** @typedef {import('@advanced-rest-client/events').Workspace.DomainWorkspace} DomainWorkspace */
/** @typedef {import('monaco-editor').editor.IStandaloneEditorConstructionOptions} IStandaloneEditorConstructionOptions */

/* global  monaco */

/**
 * @event store
 * @event close
 */
export default class WorkspaceEditorElement extends ResizableMixin(LitElement) {

  /**
   * The workspace object being rendered
   */
  workspace: DomainWorkspace;
  /**
   * Enables Anypoint theme
   * @attribute
   */
  anypoint: boolean;
  /**
   * Enables material's outlined theme for inputs.
   * @attribute
   */
  outlined: boolean;

  constructor();

  firstUpdated(args: Map<string | number | symbol, unknown>): void;

  [toggleOptions](): void;

  /**
   * Sends the `cancel` custom event to cancel the edit.
   */
  [cancelHandler](): void;

  /**
   * Dispatches the save event with updated workspace.
   */
  [saveHandler](): void;

  /**
   * Serializes values into a form.
   * @returns {DomainWorkspace} [description]
   */
  serializeForm(): DomainWorkspace;

  [generateEditorConfig](): editor.IStandaloneEditorConstructionOptions;

  /**
   * Sends the `save` custom event with computed detail object.
   *
   * @param {CustomEvent} e
   */
  [submitHandler](e): void;

  /**
   * Validates and submits the form.
   */
  send(): void;

  render(): TemplateResult;

  /**
   * @returns {TemplateResult} The template for the description input.
   */
  [descriptionTemplate](): TemplateResult;

  /**
   * @returns {TemplateResult} The template for the version input.
   */
  [versionTemplate](): TemplateResult;

  /**
   * @returns {TemplateResult} The template for the published time input.
   */
  [publishedTemplate](): TemplateResult;

  /**
   * @returns {TemplateResult} The template for the workspace additional meta
   */
  [additionalTemplate](): TemplateResult;

  /**
   * @returns {TemplateResult} The template for the provider name value.
   */
  [providerNameTemplate](): TemplateResult;

  /**
   * @returns {TemplateResult} The template for the provider URL value.
   */
  [providerUrlTemplate](): TemplateResult;

  /**
   * @returns {TemplateResult} The template for the provider email value.
   */
  [providerEmailTemplate](): TemplateResult;

  /**
   * @returns {TemplateResult} The template for the action buttons
   */
  [actionsTemplate](): TemplateResult;
}
