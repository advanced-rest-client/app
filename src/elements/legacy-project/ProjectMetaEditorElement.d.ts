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
import { Project } from '@advanced-rest-client/events';
import { editor } from 'monaco-editor';

export declare const inputHandler: unique symbol;
export declare const generateEditorConfig: unique symbol;
export declare const monacoValueChanged: unique symbol;
export declare const monacoInstance: unique symbol;
export declare const descriptionTemplate: unique symbol;
export declare const saveActionTemplate: unique symbol;
export declare const cancelActionTemplate: unique symbol;
export declare const savingValue: unique symbol;
export declare const nameInputTemplate: unique symbol;
export declare const projectValue: unique symbol;
export declare const processProjectValue: unique symbol;
export declare const saveHandler: unique symbol;

/**
 * @fires close
 */
export default class ProjectMetaEditorElement extends LitElement {
  /**
   * The project to edit.
   */
  project: Project.ARCProject;
  /**
   * The name of the project.
   * @attribute
   */
  name: string;
  /**
   * Project's description.
   * @attribute
   */
  description: string;
  /**
   * Enables Anypoint theme
   * @attribute
   */
  anypoint: boolean;
  /**
   * Enables Material Design outlined style for inputs.
   * @attribute
   */
  outlined: boolean;

  [monacoInstance]: editor.IEditor;
  [savingValue]: boolean;

  constructor();

  firstUpdated(args: Map<string | number | symbol, unknown>): void;

  [processProjectValue](value: Project.ARCProject): void;

  [generateEditorConfig](): editor.IStandaloneEditorConstructionOptions;

  [monacoValueChanged](): void;

  /**
   * Sends the `cancel-edit` custom event to the parent element.
   */
  cancel(): void;

  [saveHandler](): Promise<void>;

  /**
   * @param {Event} e 
   */
  [inputHandler](e: Event): void;

  render(): TemplateResult;

  [nameInputTemplate](): TemplateResult;

  [descriptionTemplate](): TemplateResult;

  [saveActionTemplate](): TemplateResult;

  [cancelActionTemplate](): TemplateResult;
}
